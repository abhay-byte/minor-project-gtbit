# 🧩 Clinico Platform - Database Setup

This directory contains all the necessary files to **create, migrate, and seed** the PostgreSQL database for the Clinico application using **Docker**.

---

## 🧱 Prerequisites

Before you begin, ensure that the following are installed on your system:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 📁 Directory Structure

```

/server
|
├── /migrations           # Contains numbered SQL scripts to build the database schema.
|   ├── 001_...sql
|   └── ...
|
├── /seeds                # Contains SQL scripts to populate the database with initial data.
|   └── seed.sql
|
├── docker-compose.yml    # Defines the PostgreSQL service.
├── db_start.bat          # (Windows) Starts the database container without deleting data.
├── db_stop.bat           # (Windows) Stops the database container.
├── db_reset.bat          # (Windows) Wipes all data and re-initializes the database.
├── db_start.sh           # (Linux/macOS) Starts the database container without deleting data.
├── db_stop.sh            # (Linux/macOS) Stops the database container.
└── db_reset.sh           # (Linux/macOS) Wipes all data and re-initializes the database.

```

---

## ⚙️ Development Workflow

This setup is designed for a **persistent development workflow** — you don’t need to reset the database every time you start working.

### 🧾 1. First-Time Setup (or Full Reset)

To create the database for the first time, or completely wipe it and start fresh, run the **reset script** for your operating system.

#### 🪟 Windows

Double-click:

```

db_reset.bat

````

#### 🐧 Linux / 🍎 macOS

```bash
# Make scripts executable (only once)
chmod +x *.sh

# Run the reset script
./db_reset.sh
````

This process will:

1. Stop and remove any old containers and volumes (deleting all data).
2. Start a fresh PostgreSQL container.
3. Execute all scripts in the `migrations` folder in order.
4. Execute the `seed.sql` script to populate the tables.

---

### 💻 2. Daily Workflow

For regular development, use the **start** and **stop** scripts.
These preserve your data and make it easy to resume work.

#### ▶️ Start the Database

**Windows:**

```
db_start.bat
```

**Linux / macOS:**

```bash
./db_start.sh
```

#### ⏹️ Stop the Database

**Windows:**

```
db_stop.bat
```

**Linux / macOS:**

```bash
./db_stop.sh
```

These scripts will start and stop the container **without deleting your data**, allowing you to pick up where you left off.

---

## 🗄️ Database Connection Details

Once the container is running, you can connect to the PostgreSQL database using the following credentials:

| Setting            | Value                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| **Host**           | `localhost`                                                            |
| **Port**           | `5432`                                                                 |
| **Database**       | `clinico_db`                                                           |
| **Username**       | `clinico_user`                                                         |
| **Password**       | `clinico_password`                                                     |
| **Connection URL** | `postgresql://clinico_user:clinico_password@localhost:5432/clinico_db` |

---

## ✅ Summary

* Use **`db_reset`** scripts for a clean rebuild.
* Use **`db_start`** and **`db_stop`** for everyday development.
* Your data persists between restarts thanks to Docker volumes.

---

**Clinico Platform — Database Setup Complete 🩺**
