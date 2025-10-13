
# 🚀 Clinico Server

This directory contains the **backend server** for the Clinico platform.

---

## 🧩 Folder Structure

```

server/
├── database/        # Database configuration and Docker files
├── sql/             # SQL scripts and migrations
├── src/             # Application source code (routes, controllers, models)
├── run_server.bat   # Windows startup script
└── run_server.sh    # Linux/macOS startup script

````

---

## ⚙️ Requirements

Before running the server, ensure that the following are installed:

- **Node.js** (v18 or higher)  
- **Docker**

---

## ▶️ How to Run

### On Windows
```bash
run_server.bat
````

### On Linux / macOS

```bash
./run_server.sh
```

The server will start automatically after building the Docker container and initializing the database.

---

## 📘 Related Documentation

* [Database Setup Guide](./database/README.md)
* [SQL Scripts Overview](./sql/README.md)
* [Source Code Guide](./src/README.md)

