
# 🏥 Healthcare Data Scraper

This script collects data about **doctors**, **clinics**, and **hospitals** in **Delhi** and stores the information in a local database file.



## ⚙️ Setup

### 1. Install Required Packages

```bash
pip install -r requirements.txt
````



### 2. Add API Keys

Create a configuration file named **`config.ini`** in the project directory and add your **SERP API keys** in the following format:

```ini
[API_KEYS]
SERP_API_KEY_1 = your_first_api_key_without_quotes
SERP_API_KEY_2 = your_second_api_key_without_quotes
```



## ▶️ How to Use

### 1. Run the Script

```bash
python fetch_data.py
```

**Notes:**

* To **stop**, press `Ctrl + C`.
  The script automatically saves its progress.
* To **resume**, simply run the script again.
* To **start over**, delete the files:

  * `health_providers.db`
  * `progress.json`



## 💾 Output

All collected information is stored in a SQLite database file named:

```
health_providers.db
```

You can open this file with a free tool like **[DB Browser for SQLite](https://sqlitebrowser.org/)** to view and analyze the data.

