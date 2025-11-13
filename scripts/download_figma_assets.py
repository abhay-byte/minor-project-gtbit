"""
Download Figma images for Phase 7 into the Flutter project's assets folder.

Usage:
  export FIGMA_TOKEN=<your_figma_personal_access_token>
  python3 scripts/download_figma_assets.py

The script reads `scripts/figma_phase7_manifest.json` for nodeId -> filename mapping.
It calls the Figma REST API to get image URLs and then downloads the PNG files into
`frontend/clinico_mobile_app/assets/figma/phase7/`.

Note: You must provide a valid Figma Personal Access Token with access to the file.
"""

import os
import sys
import json
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / 'scripts' / 'figma_phase7_manifest.json'
OUTPUT_DIR = ROOT / 'frontend' / 'clinico_mobile_app' / 'assets' / 'figma' / 'phase7'
FILE_KEY = 'dFDrEe30gtdNb1QFVKWNv2'

FIGMA_IMAGES_ENDPOINT = f'https://api.figma.com/v1/images/{FILE_KEY}'


def load_manifest():
    if not MANIFEST_PATH.exists():
        print(f"Manifest not found: {MANIFEST_PATH}")
        sys.exit(1)
    with open(MANIFEST_PATH, 'r') as f:
        return json.load(f)


def download(url, out_path):
    r = requests.get(url, stream=True)
    r.raise_for_status()
    with open(out_path, 'wb') as f:
        for chunk in r.iter_content(1024):
            f.write(chunk)


def main():
    token = os.environ.get('FIGMA_TOKEN')
    if not token:
        print('Please set the FIGMA_TOKEN environment variable with your Figma PAT')
        sys.exit(1)

    manifest = load_manifest()
    node_ids = ','.join(manifest.keys())

    headers = {
        'Authorization': f'Bearer {token}'
    }
    params = {
        'ids': node_ids,
        'format': 'png',
        'scale': 2
    }

    print('Requesting image URLs from Figma...')
    r = requests.get(FIGMA_IMAGES_ENDPOINT, headers=headers, params=params)
    r.raise_for_status()
    data = r.json()

    images = data.get('images', {})
    if not images:
        print('No images returned by Figma. Check file permissions and node IDs.')
        print(data)
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for node_id, filename in manifest.items():
        url = images.get(node_id)
        if not url:
            print(f'No image URL for node {node_id}, skipping')
            continue
        out_path = OUTPUT_DIR / filename
        print(f'Downloading {node_id} -> {out_path}...')
        try:
            download(url, out_path)
        except Exception as e:
            print(f'Failed to download {node_id}: {e}')

    print('Done. Remember to run `flutter pub get` if you added new assets to pubspec.yaml.')


if __name__ == '__main__':
    main()
