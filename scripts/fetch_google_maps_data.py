import sqlite3
import requests
import configparser
import math
from tqdm import tqdm
import time
import json
import os

# --- CONFIGURATION ---
DB_FILE = "health_providers.db"
PROGRESS_FILE = "progress.json"
DELHI_BBOX = (28.404, 76.840, 28.883, 77.348)
GRID_SIZE = 48

# --- PROGRESS MANAGEMENT ---
def save_progress(index):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump({"last_completed_index": index}, f)

def load_progress():
    if not os.path.exists(PROGRESS_FILE): return -1
    try:
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f).get("last_completed_index", -1)
    except (json.JSONDecodeError, IOError):
        return -1

# --- 🔽 DATABASE SETUP ---
def setup_database():
    """Initializes the SQLite database with the new, expanded schema."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS providers")
    
    # Create the new table with additional columns
    cursor.execute("""
    CREATE TABLE providers (
        google_place_id TEXT PRIMARY KEY,
        name TEXT,
        address TEXT,
        latitude REAL,
        longitude REAL,
        phone_number TEXT,
        google_rating REAL,
        google_reviews_count INTEGER,
        provider_type TEXT,
        website TEXT,
        operating_hours TEXT,
        description TEXT,
        thumbnail_url TEXT,
        source TEXT,
        raw_serp_data TEXT
    )
    """)
    conn.commit()
    conn.close()
    print("✅ Database setup complete with new expanded schema.")



# --- API & DATA FUNCTIONS ---

def fetch_from_overpass(bbox):
    print("\n🚀 Starting Phase 1: Fetching baseline data from OpenStreetMap...")
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
    [out:json][timeout:60];(
      node["amenity"~"clinic|doctors|hospital|dentist|pharmacy"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
      way["amenity"~"clinic|doctors|hospital|dentist|pharmacy"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
    );out body;>;out skel qt;"""
    try:
        response = requests.post(overpass_url, data=query)
        response.raise_for_status()
        print(f"Found {len(response.json()['elements'])} potential providers from OpenStreetMap.")
        return response.json()['elements']
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Overpass API: {e}")
        return []

def get_delhi_grid(bbox, size):

    min_lat, min_lon, max_lat, max_lon = bbox
    lat_steps = [min_lat + (max_lat - min_lat) * i / (size - 1) for i in range(size)]
    lon_steps = [min_lon + (max_lon - min_lon) * i / (size - 1) for i in range(size)]
    return [(lat, lon) for lat in lat_steps for lon in lon_steps]

def fetch_from_serp(lat, lon, api_key):

    params = { "api_key": api_key, "engine": "google_maps", "q": 
              "hospital OR clinic OR doctor OR dentist OR physiotherapist OR pharmacy OR chemist OR diagnostic center OR pathology lab OR eye hospital OR skin clinic OR dermatologist OR cardiologist OR gynecologist OR pediatrician OR orthopaedic OR psychiatrist OR therapy center", "ll": f"@{lat},{lon},15z", "type": "search" }
    try:
        response = requests.get("https://serpapi.com/search.json", params=params)
        response.raise_for_status()
        return response.json().get("local_results", [])
    except requests.exceptions.RequestException as e:
        print(f"\nError fetching from SERP API at ({lat},{lon}): {e}")
        return []


def process_serp_data(results):
    """Inserts or updates provider data into the expanded SQLite database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    new_records = 0
    for res in results:
        hours_json = json.dumps(res.get('operating_hours')) if res.get('operating_hours') else None
        
        raw_data_json = json.dumps(res)

        cursor.execute("""
        INSERT OR IGNORE INTO providers (
            google_place_id, name, address, latitude, longitude,
            phone_number, google_rating, google_reviews_count, provider_type,
            website, operating_hours, description, thumbnail_url,
            source, raw_serp_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            res.get("place_id"),
            res.get("title"),
            res.get("address"),
            res.get("gps_coordinates", {}).get("latitude"),
            res.get("gps_coordinates", {}).get("longitude"),
            res.get("phone"),
            res.get("rating"),
            res.get("reviews"),
            res.get("type"),
            res.get("website"),
            hours_json,
            res.get("description"),
            res.get("thumbnail"),
            'google_maps_serp',
            raw_data_json
        ))
        if cursor.rowcount > 0:
            new_records += 1
    conn.commit()
    conn.close()
    return new_records


# --- MAIN EXECUTION ---
def main():
    """Main function to run the data fetching pipeline."""
    config = configparser.ConfigParser()
    config.read('config.ini')
    serp_api_keys = [key for key in config['API_KEYS'].values()]
    if not serp_api_keys or "YOUR_" in serp_api_keys[0]:
        print("🛑 Please add your SERP API key(s) to config.ini before running.")
        return
    print(f"🔑 Found {len(serp_api_keys)} SERP API key(s) to use for rotation.")

    setup_database()

    fetch_from_overpass(DELHI_BBOX)
    
    print("\n🛰️ Starting Phase 2: Grid search over Delhi...")
    delhi_grid = get_delhi_grid(DELHI_BBOX, GRID_SIZE)
    
    last_completed_index = load_progress()
    start_index = last_completed_index + 1

    if start_index > 0:
        print(f"✅ Progress file found. Resuming from grid cell #{start_index}.")
    
    total_new_records = 0
    num_keys = len(serp_api_keys)

    try:
        with tqdm(total=len(delhi_grid), initial=start_index, desc="Querying Delhi Grid") as pbar:
            for i in range(start_index, len(delhi_grid)):
                lat, lon = delhi_grid[i]
                current_api_key = serp_api_keys[i % num_keys]
                
                serp_results = fetch_from_serp(lat, lon, current_api_key)
                if serp_results:
                    newly_added = process_serp_data(serp_results)
                    total_new_records += newly_added
                
                save_progress(i)
                time.sleep(1)
                pbar.update(1)

        print("\n🎉 Pipeline Finished Successfully! 🎉")
        print(f"Added {total_new_records} new, unique providers to '{DB_FILE}'.")
        if os.path.exists(PROGRESS_FILE):
            os.remove(PROGRESS_FILE)

    except KeyboardInterrupt:
        print("\n🛑 Pausing script. Run again to resume from the last completed step.")

if __name__ == "__main__":
    main()