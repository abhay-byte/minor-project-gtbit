# 📘 Clinico - The Healing Hand Initiative  
**Software Design Documentation**  

Welcome to the official repository for the **Clinico - The Healing Hand Initiative: Software Design Document (SDD)**.  
This document consolidates **all architectural, low-level, and data design decisions** into a single blueprint that will guide the development and testing of the system.  

---

## 📑 Table of Contents  

1. [Project Overview](#project-overview)  
2. [Document Structure](#document-structure)  
3. [Diagram Gallery](#diagram-gallery)  
4. [Links to Full Documentation](#links-to-full-documentation)  
5. [How to Use](#how-to-use)  
6. [Status](#status)  
7. [Author & Contributors](#author--contributors)  

---

## 🚀 Project Overview  

**Clinico - The Healing Hand Initiative** is a telehealth platform designed to:  
- Connect patients with professionals and NGOs.  
- Support **virtual and in-person consultations**.  
- Provide an **AI Care Companion** for triage and assistance.  
- Offer a **hyperlocal discovery system** for finding nearby clinics and doctors.  
- Ensure secure storage of medical data, feedback systems, and AI-driven personalization.  

The **Software Design Document (SDD)** is the primary technical blueprint for this project. It defines **architecture, workflows, and database schema**, bridging the gap between the **Software Requirements Specification (SRS)** and implementation.  

---

## 🏗️ Document Structure  

The SDD is structured into the following key sections:  

1. **Introduction** → Purpose of the document, reference to the SRS.  
2. **System Architecture** → Component & Deployment Diagrams.  
3. **Low-Level Design (LLD)** → Class, Object, Sequence, Activity, and State-chart Diagrams.  
4. **Data Design** → ER Diagram, PostgreSQL schema, data dictionary.  
5. **Conclusion** → Summarizes design decisions and next steps.  

👉 Read the full **[SDD.md](./SDD.md)** for details.  

---

## 📊 Diagram Gallery  

### 🏗️ System Architecture  

**Component Diagram**  
![Component Diagram](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/architecture/component_diagram.png)  
*Shows modular system components (Frontend, Backend Services, AI Agents, Databases) and their interfaces.*  

**Deployment Diagram**  
![Deployment Diagram](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/architecture/deployment_diagram.png)  
*Illustrates the physical/cloud deployment strategy across user devices, cloud services, databases, and APIs.*  

---

### ⚙️ Low-Level Design (LLD)  

**Class Diagram**  
![Class Diagram](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/low-level-design/class_diagram.png)  
*Models the static structure of the system: classes, attributes, methods, and their relationships.*  

**Object Diagram**  
![Object Diagram](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/low-level-design/object_diagram_snapshot.png)  
*Snapshot of real-world instances (e.g., Abhay booking with Dr. Bhumika) validating the class model.*  

**Sequence Diagram – Booking**  
![Sequence Diagram Booking](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/low-level-design/sequence_diagram_booking.png)  
*Shows the booking flow with AI-powered intent recognition, database updates, and confirmation.*  

**Sequence Diagram – Consultation**  
![Sequence Diagram Consultation](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/low-level-design/sequence_diagram_consultation.png)  
*Depicts a doctor finalizing notes and prescriptions after a consultation.*  

**Activity Diagram**  
![Activity Diagram](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/low-level-design/activity_diagram_ai_triage.png)  
*Represents the AI triage workflow, handling queries, crisis detection, and appointment suggestions.*  

**State-chart Diagram**  
![State-chart Diagram](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/low-level-design/statechart_diagram_appointment.png)  
*Captures the full lifecycle of an appointment (Scheduled → In_Progress → Completed/Cancelled).*  

---

### 🗄️ Data Design  

**ER Diagram**  
![ER Diagram](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/err/er.svg)  
*Defines the relational schema for users, appointments, consultations, records, clinics, and AI logs.*  

---

## 🔗 Links to Full Documentation  

- 📄 [Software Design Document (SDD.md)](./SDD.md)  
- 📂 [All Diagrams (GitHub Folder)](https://github.com/abhay-byte/minor-project-gtbit/tree/main/documentation/diagrams)  
<!-- - 📘 [Software Requirements Specification (SRS)](link-to-srs-if-available)   -->

---

## ✅ How to Use  

- **Developers** → Use the SDD as the **primary technical blueprint** for implementation.  
- **Testers** → Refer to **LLD and Data Design** to validate workflows and data consistency.  
- **Stakeholders** → Review the **diagrams and explanations** to ensure business alignment.  

---

## 🏁 Status  

- **SDD v1.0** completed on *23-09-2025*.  
- Living document: Future updates will refine diagrams, definitions, and AI integration details.  

---

## 👩‍💻 Author & Contributors  

- **Author:** Bhumika Choudhary  
- **Reviewed By:** Clinico Team Members  
- **Approved By:** Clinico Team Members  

---
