# Software Design Document (SDD)

## Document Information
- **Project Name:** Clinico - The Healing Hand Initiative  
- **Document Title:** Software Design Document  
- **Version:** 1.1  
- **Date:** 23-09-2025  
- **Author(s):** Bhumika Choudhary  
- **Reviewed By:** Clinico Team Members  
- **Approved By:** Clinico Team Members  

---

## Version History

| Version | Date       | Author              | Description               | Approved By           |
|---------|------------|---------------------|---------------------------|-----------------------|
| 1.0     | 23-09-2025 | Bhumika Choudhary   | Initial draft             | Clinico Team Members  |
| 1.1     | 23/09/2025 | Clinico Team Members| Review comments addressed | Clinico Team Members  |
| 2.0     | --/--/---- | Clinico Team Members| Final version             | Clinico Team Members  |

---

## 📖 Description  
This is the final task of the Software Design phase. The objective is to consolidate all the architectural and low-level design decisions and diagrams into a single, formal Software Design Document (SDD). This document will serve as the primary technical blueprint for the development team, defining how the Clinico platform will be built and guiding the entire implementation process.

---

## 1. Introduction  

The purpose of this Software Design Document (SDD) is to provide a detailed and structured design specification for the **Clinico - The Healing Hand Initiative** platform. It builds upon the requirements captured in the **Software Requirements Specification (SRS)** and translates them into an actionable technical framework for developers, testers, and other stakeholders.  

This document aims to:  
- Define the overall architecture and system components of the Clinico platform.  
- Outline the interaction between different modules and external systems.  
- Specify data models, workflows, and design decisions to ensure consistency in development.  
- Serve as a reference point for implementation, testing, and future maintenance.  

This SDD is derived directly from the specifications outlined in the **Software Requirements Specification (SRS)**. The SRS defines the *functional and non-functional requirements* of the system, while this SDD expands upon them to describe the *technical blueprint and design decisions*. For detailed requirements, readers may refer to the SRS document, which serves as the foundation for this design.  

---

## 2. System Architecture

### 2.1 Architectural Pattern

The Clinico platform follows a **Microservices-style architecture** combined with **layered design principles**. This architectural choice provides modularity, scalability, maintainability, and ease of future extension.  

For all system architecture diagrams, see the [GitHub folder](https://github.com/abhay-byte/minor-project-gtbit/tree/main/documentation/diagrams/architecture).


**Key aspects of the architecture pattern:**

1. **Microservices Approach (Backend):**  
   - The backend is composed of multiple independent services, each handling a specific domain of the application:  
     - *AuthenticationService* for user management.  
     - *AppointmentService* for handling appointments.  
     - *ProfessionalService* for professional-specific operations.  
     - *DiscoveryService* for local clinic and doctor search.  
     - *AIGateway* and *AI_Agent_Service* for AI-related processing.  
   - Each service has its own responsibilities and communicates via well-defined interfaces, ensuring minimal coupling.  
   - Microservices can be deployed, scaled, and maintained independently, which improves the system’s reliability and resilience.  

2. **Client-Server Communication (Frontend ↔ Backend):**  
   - The frontend applications (ClinicoApp and ClinicoDashboard) communicate with the backend services using a **Client-Server model**.  
   - Mobile and web clients act as *clients*, sending requests to the backend *server(s)* for data, business logic processing, and AI services.  
   - Communication occurs over secure channels (HTTPS/WSS), ensuring safe and reliable interaction.  
   - This design separates the user interface from server logic, providing flexibility for frontend development and multi-platform support.  

3. **Layered Design:**  
   - The system separates concerns across layers:  
     - **Presentation Layer:** Frontend applications that interact with users.  
     - **Application Layer:** Backend services handling business logic.  
     - **Data Layer:** Databases (PostgreSQL and Pinecone) that manage structured and AI-related data.  
   - This separation simplifies debugging, testing, and future enhancements.  

4. **Interfaces and Contracts:**  
   - Communication between components is formalized via **interfaces** (e.g., I_Auth, I_Appointments, I_AI_Chat).  
   - This ensures components are loosely coupled, making it easier to replace or upgrade individual services without affecting the entire system.  

5. **Scalability and Extensibility:**  
   - Each microservice can be scaled independently based on demand.  
   - New services or features can be integrated without major changes to existing components.  

6. **Cloud-Native Deployment:**  
   - The architecture leverages cloud infrastructure for high availability and performance.  
   - Backend services, AI agents, and databases are deployed on cloud platforms (GCP/Render) ensuring secure, efficient, and scalable operation.  

**Rationale for the chosen architecture:**  
- **Modularity:** Facilitates independent development and easier maintenance.  
- **Scalability:** Services can scale based on load, e.g., AI services can be scaled separately.  
- **Resilience:** Failure of one service does not affect the entire platform.  
- **Flexibility:** Future features, new microservices, or external integrations can be added with minimal impact.  
- **Security:** Critical components like AI services and authentication are isolated, reducing the attack surface.  

> **Note:** The following Component and Deployment Diagrams illustrate the structure and deployment strategy of the Clinico platform. They are linked to the source files, so any updates made to these diagrams will automatically reflect here, ensuring the SDD always stays up-to-date.

## 2.2 Component Diagram (Detailed)

The Component Diagram provides a high-level view of the Clinico system, emphasizing modularity, separation of concerns, and interactions between components. It visually maps how frontend applications, backend services, AI agents, and databases interact to deliver system functionality. This design promotes a clean separation of concerns and a scalable, microservices-style architecture.

### 1. Frontend Applications

These are the client-facing components that interface directly with end-users:

- **ClinicoApp (Executable)**  
  Flutter-based mobile application for patients.  
  Features:
  - Register and log in (**I_Auth** interface)
  - Search for clinics and doctors (**I_Discovery** interface)
  - Book, view, or cancel appointments (**I_Appointments** interface)
  - Interact with AI chat for assistance (**I_AI_Chat** interface)

- **ClinicoDashboard (WebApp)**  
  React-based web application for professionals/clinics.  
  Features:
  - Manage availability (**I_ProfessionalTools** interface)
  - Submit consultations and handle appointments (**I_Appointments** & **I_ProfessionalTools** interfaces)

### 2. Backend Services

These components handle business logic and orchestrate communication between frontend and data layers:

- **AuthenticationService**  
  Handles user authentication and session management.  
  Implements **I_Auth** interface.  
  Used by both mobile and web clients.

- **AppointmentService**  
  Manages all appointment-related operations: booking, retrieving, and canceling appointments.  
  Implements **I_Appointments** interface.

- **ProfessionalService**  
  Manages professional tools and actions: updating availability, submitting consultations.  
  Implements **I_ProfessionalTools** interface.

- **DiscoveryService**  
  Provides search functionality for clinics and doctors.  
  Implements **I_Discovery** interface.

- **AIGateway**  
  Acts as a secure orchestrator for AI services. Routes requests from clients to **AI_Agent_Service**.

- **AI_Agent_Service**  
  Python-based service implementing AI functionality.  
  - Uses **I_Gemini_API** interface for integration with Gemini APIs.  
  - Performs chat responses, semantic searches, and recommendation generation.  

### 3. Data Infrastructure

These components store and manage all persistent data:

- **ClinicoDatabase**  
  PostgreSQL database storing structured data such as users, appointments, professionals, and clinic info.

- **VectorDatabase**  
  Pinecone database used for AI embeddings. Supports semantic search and AI-assisted features.

### 4. Interfaces

| Interface | Implemented By | Purpose |
|-----------|----------------|---------|
| I_Auth | AuthenticationService | User registration and login |
| I_Appointments | AppointmentService | Appointment management |
| I_ProfessionalTools | ProfessionalService | Professional actions & availability |
| I_Discovery | DiscoveryService | Clinic and professional search |
| I_AI_Chat | AI_Agent_Service | AI-powered chat |
| I_Gemini_API | AI_Agent_Service | External AI responses |
| I_DataAccess | All backend services | Database queries and executions |
| I_VectorSearch | VectorDatabase | Semantic search and vector operations |

### 5. Interactions

- Frontend applications use interfaces to interact with backend services.
- Backend services use **I_DataAccess** for database operations.
- AI functionality is encapsulated in **AI_Agent_Service** and accessed via **AIGateway**.
- **VectorDatabase** supports advanced AI-driven search through semantic embeddings.

### 6. Key Design Highlights

- Promotes modularity: Each service has a well-defined responsibility.
- Supports scalability: Microservice-like separation allows independent scaling.
- Encourages reusability: Interfaces provide a contract-driven design.
- Integrates AI capabilities seamlessly while keeping core business logic separate.
- Clear data separation: Structured vs. vector-based AI data.

### 7. Component Diagram

![Component Diagram](https://github.com/abhay-byte/minor-project-gtbit/raw/main/documentation/diagrams/architecture/component_diagram.png)

> *Note: Diagram is linked from the GitHub repo. Updates to the source file will automatically reflect here.*

## 2.3 Deployment Diagram

### Deployment Diagram

The Deployment Diagram provides a comprehensive view of the **system’s physical and cloud-based deployment architecture**. It not only specifies the **hardware and software environments** where different components of the system reside but also clarifies the **interactions between client-side devices, backend servers, databases, and third-party services**.

This diagram bridges the gap between the **logical design** (how the system is structured functionally) and the **physical infrastructure** (how it is actually deployed and operated). It captures:

1. **Nodes (Execution Environments):**
   - Physical devices such as user smartphones and professional computers.
   - Virtual/cloud nodes such as Google Cloud App Engine instances, managed databases, and external APIs.

2. **Artifacts (Deployed Software Units):**
   - Mobile application packages (APK), web application bundles, backend services, AI microservices, and database instances.

3. **Communication Paths:**
   - Secure channels (HTTPS/WSS) between user devices and cloud servers.
   - Internal API calls between backend services and AI agents.
   - Data exchange between application servers and databases.
   - Interactions with third-party APIs such as Firebase (for notifications) and Google Maps (for geolocation).

By visualizing these aspects, the Deployment Diagram highlights **how the system operates in real-world conditions**—which services run on which platforms, how they are distributed across devices and cloud infrastructure, and how they communicate securely and efficiently. This ensures that the design is not only functionally sound but also **deployable, scalable, and maintainable** in a production environment.

---

### Diagram
![Deployment Diagram](https://raw.githubusercontent.com/abhay-byte/minor-project-gtbit/main/documentation/diagrams/architecture/deployment_diagram.png)

---

### Deployment Strategy

#### **User Devices (Client-Side)**
- **ClinicoApp.apk** is deployed to a **User Mobile Device** (via Play Store/App Store).  
- **ClinicoDashboard.war** (or equivalent JavaScript bundle) is deployed to a **Web Browser** on a Professional's Computer.  
- All client devices communicate securely with the **Cloud Server** using **HTTPS/WSS**.

#### **Cloud Server (Server-Side on GCP/Render)**
- **App Engine (Clinico Backend)**  
  - Hosts the **Node.js Server**, which handles the core backend logic and acts as the central orchestrator.  
- **App Engine (Agent Services)**  
  - Hosts the **Flask Server**, which runs the AI logic.  
  - Communicates with the backend using **Internal API Calls**.  
- **Database Node**  
  - **Postgres SQL** → for structured data (users, appointments, consultations).  
  - **Pinecone** → vector database for AI knowledge base.  
  - **Firebase** → handles push notifications and messaging services.  
- **External Services**  
  - **Maps API** → provides geolocation and mapping data.  
  - Other APIs may be integrated as needed.

---

### Explanation of Nodes

#### **1. User Devices (Client-Side Environment)**

- **Node: User Mobile Device**
  - *Stereotype*: `<<device>>`  
  - *Description*: Represents a typical smartphone (Android/iOS) owned by a patient.  
  - *Nested Node*: Play Store (App Store) – source for app installation.  
  - *Deployed Artifact*: `ClinicoApp.apk` – Flutter mobile app file installed on the device.  

- **Node: Professional’s Computer**
  - *Stereotype*: `<<device>>`  
  - *Description*: Represents desktops/laptops used by doctors, NGOs, or administrators.  
  - *Nested Node*: `<<device>> Web Browser` – runs the React web app.  
  - *Deployed Artifact*: `ClinicoDashboard.war` – compiled React app files (JS, CSS, HTML).  

---

#### **2. Cloud Server (Backend Environment)**

- **Node: App Engine (Clinico Backend)**
  - *Stereotype*: `<<GCP>>`  
  - *Description*: Primary backend environment for business logic.  
  - *Deployed Artifact*: **Node.js Server** – API endpoints, user management, appointments.  

- **Node: App Engine (Agent Services)**
  - *Stereotype*: `<<GCP>>`  
  - *Description*: Dedicated service for AI logic (microservice).  
  - *Deployed Artifact*: **Flask Server** – Python-based AI services integrated with Gemini model.  

- **Node: Database**
  - *Stereotype*: `<<Postgres/Render>>`  
  - *Description*: Manages persistence and AI context.  
  - *Deployed Artifacts*:  
    - **Postgres SQL** – main relational DB.  
    - **Pinecone** – AI’s vector knowledge base (RAG).  
    - **Firebase** – push notifications/messaging.  

- **Node: External Services**
  - *Stereotype*: `<<API>>`  
  - *Description*: Third-party services used by backend.  
  - *Deployed Artifact*: **Maps API** – geolocation and mapping features.  

---

### Communication Paths

1. **User Devices → Cloud Server** (`<<HTTPS/WSS>>`)  
   - Secure communication for API requests, real-time chat, and video.  

2. **App Engine (Clinico Backend) → App Engine (Agent Services)** (`+Internal API Calls`)  
   - Secure, private internal communication between backend and AI service.  

3. **App Engine (Clinico Backend) → Database** (`+Read/Writes`)  
   - Stores/retrieves structured data and push notification messages.  

4. **App Engine (Agent Services) → Database** (`+Retrieves Context`)  
   - AI retrieves knowledge base data from Pinecone for RAG.  

5. **App Engine (Clinico Backend) → External Services** (`+Used For Maps`)  
   - Fetches location and mapping data for discovery features.  

---

### Summary

This deployment architecture ensures:  
- **Separation of concerns** (core backend vs. AI services).  
- **Scalability** (independent scaling of AI services).  
- **Security** (HTTPS/WSS encryption and private internal calls).  
- **Reliability** through managed cloud infrastructure (GCP/Render, Postgres, Firebase).  

---

# 3. Low-Level Design (LLD)

Low-Level Design (LLD) translates the **high-level architecture** into detailed, implementable components.  
It defines **class structures, interactions, workflows, and data flows** at a granular level so that developers can directly begin coding from these specifications.  

The LLD ensures:  
- Clarity in **system behavior** and **data flow**.  
- Defined **responsibilities of classes, methods, and attributes**.  
- Explicit mapping of **user actions to backend operations**.  
- Improved maintainability, scalability, and traceability of the system.  

---

## 3.1 Overview of Diagrams in LLD

The following diagrams are used in the LLD to represent different perspectives of the system:

- **Class Diagram** → Represents the static structure of the system, including classes, attributes, methods, and their relationships.  
- **Object Diagram** → Provides a snapshot of system instances at a specific point in time, showing real-world object relationships.  
- **Sequence Diagram** → Models the interaction between objects in time order, focusing on message passing during use cases.  
- **Activity Diagram** → Describes the flow of activities, decisions, and control paths in the AI-driven triage and other processes.  
- **Statechart Diagram** → Shows how an entity changes states in response to events, particularly useful for appointment or consultation flows.  
- **Deployment Diagram** → Illustrates the physical/cloud infrastructure, showing how software artifacts are deployed across hardware and cloud nodes.  

Together, these diagrams provide a **comprehensive view** of both the structural and behavioral aspects of the Clinico AI Care Companion.

---

## 3.1.1 Class Diagram

### Diagram
**System Class Diagram**  
![System Class Diagram](https://raw.githubusercontent.com/abhay-byte/minor-project-gtbit/main/documentation/diagrams/low-level-design/class_diagram.png)

---

### Explanation

The **Class Diagram** models the structural backbone of the Clinico AI Care Companion system, showing **core classes, attributes, methods, and their relationships**. It captures both **user-facing entities** (patients, professionals, doctors, clinics) and **supporting system components** (AI controllers, consultations, prescriptions, medical records).

---

#### 1. Core Classes and Responsibilities

- **User**  
  - Attributes: `userId`, `email`, `passwordHash`, `role`.  
  - Methods: Authentication (`registerUser`, `loginUser`), profile update.  

- **Patient (inherits User)**  
  - Attributes: `patientId`, `dob`, `gender`.  
  - Methods: Book appointments, view records, update medical files.  

- **Professional (inherits User)**  
  - Attributes: `professionalId`, `specialty`, `credentials`.  
  - Methods: Manage schedules, interact with patients, handle consultations.  

- **Appointment**  
  - Attributes: `appointmentId`, `dateTime`, `status`, `notes`.  
  - Methods: `schedule()`, `complete()`, `cancel()`.  

- **Consultation**  
  - Attributes: `consultationId`, `notes`, `referral`.  
  - Methods: Save notes, create prescriptions.  

- **Prescription**  
  - Attributes: `prescriptionId`, `medication`, `dosage`, `instructions`.  

- **MedicalRecord**  
  - Attributes: `recordId`, `documentName`, `documentUrl`.  

- **Review**  
  - Attributes: `reviewId`, `rating`, `comment`.  

- **ClinicDoctor**  
  - Attributes: `clinicDoctorId`, `fullName`, `specialty`, `consultationFee`.  

- **Clinic**  
  - Attributes: `clinicId`, `name`, `address`, `type`.  
  - Methods: Manage doctor directory.  

- **AvailabilitySlot**  
  - Attributes: `slotId`, `startTime`, `endTime`, `isBooked`.  
  - Methods: `book()`.  

- **AI_Agent_Controller**  
  - Attributes: `geminiModel`, `vectorDBClient`.  
  - Methods: Handle queries, generate doctor filtering, return AI responses.  

---

#### 2. Enumerations
- **UserRole** → Patient, Professional, NGO Admin.  
- **VerificationStatus** → Verified, Pending, Rejected.  
- **AppointmentStatus** → Scheduled, Completed, Cancelled, InProgress.  
- **AppointmentType** → Virtual, In-Person.  

---

#### 3. Relationships
- **Patient ↔ Appointment** (books).  
- **Professional ↔ Appointment** (conducts).  
- **Appointment ↔ Consultation** (produces).  
- **Consultation ↔ Prescription** (creates).  
- **Patient ↔ MedicalRecord** (has).  
- **Patient ↔ Review** (writes).  
- **Clinic ↔ ClinicDoctor** (employs).  
- **AI_Agent_Controller ↔ Professional / Patient** (uses, interacts).  

---

### Summary
The Class Diagram establishes a clear **domain model** ensuring:  
- Patient care journeys are represented end-to-end.  
- Professionals can manage availability and consultations.  
- AI assists with triage and smart doctor recommendation.  
- Extensible structure for clinics, reviews, and records. 

---

## 3.1.2 Object Diagram  

### Overview  
The **Object Diagram** provides a *snapshot* of the system at a specific moment in time. Unlike the Class Diagram, which shows abstract classes and their relationships, the Object Diagram illustrates actual **instances of objects** with their **attribute values** and **runtime links**.  

In this example, the Object Diagram demonstrates a real-world use case:  
- A patient named **Abhay Raj** books a **virtual appointment** with a professional psychiatrist, **Dr. Bhumika**.  
- The diagram captures the state of the system at that specific point in time, showing object attributes and the associations that connect them.  

This diagram is mainly used to:  
- **Validate the Class Diagram** by showing concrete examples.  
- **Visualize runtime data** and how classes are instantiated.  
- **Confirm relationships and constraints** in a practical scenario.  

---

### Diagram  

![Object Diagram](https://github.com/abhay-byte/minor-project-gtbit/blob/main/documentation/diagrams/low-level-design/object_diagram_snapshot.png)  

---

### Explanation  

### 1. **Objects (Instances)**  

The following objects are instantiated from the corresponding classes:  

1. **abhay_user: User**  
   - Attributes:  
     - `fullName = "Abhay Raj"`  
     - `role = Patient`  
   - Represents the general user information for the patient.  

2. **abhay_patient: Patient**  
   - Attributes:  
     - `patientId = 201`  
   - Specialization of the User class, representing patient-specific details.  

3. **bhumika_user: User**  
   - Attributes:  
     - `fullName = "Dr. Bhumika"`  
     - `role = Professional`  
   - Represents the general user information for the professional.  

4. **bhumika_prof: Professional**  
   - Attributes:  
     - `professionalId = 301`  
     - `specialty = "Psychiatrist"`  
   - Specialization of the User class, representing professional-specific details.  

5. **appointment_401: Appointment**  
   - Attributes:  
     - `status = Scheduled`  
     - `type = Virtual`  
     - `appointmentTime = "2025-11-15T14:00Z"`  
   - Represents a scheduled appointment between the patient and the professional.  

---

### 2. **Links (Relationships Between Objects)**  

The following associations connect the objects at runtime:  

- **Link 1:** `abhay_user → abhay_patient`  
  - Shows that the user object *Abhay Raj* is also represented as a patient with an ID.  

- **Link 2:** `bhumika_user → bhumika_prof`  
  - Shows that the user object *Dr. Bhumika* is also represented as a professional with a specialty.  

- **Link 3:** `abhay_patient → appointment_401`  
  - Labeled **+books**  
  - Indicates that the patient *Abhay* has booked the appointment.  

- **Link 4:** `bhumika_prof → appointment_401`  
  - Labeled **+conducts**  
  - Indicates that the professional *Dr. Bhumika* is conducting the appointment.  

---

### Key Insights  

- The diagram highlights the **runtime state** of the system for a booking event.  
- It validates the **Class Diagram logic** by demonstrating how:  
  - A User can be specialized into Patient or Professional.  
  - Patients can book appointments.  
  - Professionals can conduct appointments.  
- The **Object Diagram** makes the abstract model concrete by including real data values such as `"Abhay Raj"`, `"Dr. Bhumika"`, and the scheduled appointment time.  

---

### Importance in Low-Level Design  

- Ensures that the system design supports real-world use cases.  
- Provides a **bridge** between the high-level conceptual Class Diagram and actual system execution.  
- Useful for **testing, validation, and walkthroughs** with stakeholders, as it is easy to understand.  

---

# 3.1.3 Sequence Diagrams  

## Overview  
Sequence Diagrams model the **dynamic interactions** between objects or components in the system. They show how messages are passed between different actors, applications, services, and databases over time to complete a specific use case.  

In this project, two critical sequence diagrams are presented:  
- **3.1.3.1 Booking a Telehealth Appointment** – the patient’s flow to find a doctor and confirm an appointment.  
- **3.1.3.2 Completing a Consultation** – the doctor’s workflow to finalize clinical notes and prescriptions.  

These diagrams help validate the system’s runtime behavior and ensure all necessary components are correctly integrated.  

---

## 3.1.3.1 Booking a Telehealth Appointment  

### Diagram  
![Booking Sequence Diagram](https://github.com/abhay-byte/minor-project-gtbit/blob/main/documentation/diagrams/low-level-design/sequence_diagram_booking.png)  

---

### Explanation  

#### 3.1.3.1.1 Lifelines  
1. **Patient (Actor)** – Initiates the request to book an appointment.  
2. **ClinicoApp (Flutter App)** – Mobile frontend through which the patient interacts.  
3. **Backend (Node.js)** – Handles business logic and API orchestration.  
4. **AIService (Python/Gemini)** – Processes natural language queries and extracts intent.  
5. **Database (PostgreSQL)** – Stores doctors, appointments, and availability data.  

#### 3.1.3.1.2 Messages and Activations  
1. Patient → ClinicoApp: *sends chat message* ("I need a psychiatrist").  
2. ClinicoApp → Backend: `POST /api/ai/chat(message)`  
3. Backend → AIService: *forwardQuery(message)*  
4. AIService (self-call): *triageIntent()*  
   - *Note:* AI determines intent is "Book Appointment".  
5. AIService → Backend: *structuredResponse(intent)*  
6. Backend → ClinicoApp: *AI Response (JSON)*  
7. ClinicoApp → Patient: *display AI message & suggestion*  
8. Patient → ClinicoApp: *clicks "Find a Doctor"*  
9. ClinicoApp → Backend: `GET /api/professionals?specialty=psychiatrist`  
10. Backend → Database: `SELECT * FROM Professionals`  
11. Database → Backend: *doctorList*  
12. Backend → ClinicoApp: *Doctor List (JSON)*  
13. ClinicoApp → Patient: *display list of doctors*  
14. Patient → ClinicoApp: *selects doctor and time slot*  
15. ClinicoApp → Backend: `POST /api/appointments(bookingDetails)`  

#### 3.1.3.1.3 Combined Fragment (opt)  
- **Operator:** `opt` (optional)  
- **Guard:** [Slot is Available]  

Inside the fragment:  
- Backend → Database: *INSERT INTO Appointments*  
- Database → Backend: *Success*  
- Backend → Database: *UPDATE Availability_Slots*  
- Database → Backend: *Success*  

#### 3.1.3.1.4 Continue Messages  
- Backend → ClinicoApp: *201 Created (appointmentData)*  
- ClinicoApp → Patient: *show "Booking Confirmed"*  

#### 3.1.3.1.5 Insights  
- The booking sequence ensures **AI-powered intent recognition** for user-friendly interaction.  
- It validates correct **API orchestration** across frontend, backend, and AI services.  
- It enforces business logic like checking slot availability before confirming an appointment.  

---

## 3.1.3.2 Completing a Consultation  

### Diagram  
![Consultation Sequence Diagram](https://github.com/abhay-byte/minor-project-gtbit/blob/main/documentation/diagrams/low-level-design/sequence_diagram_consultation.png)  

---

### Explanation  

#### 3.1.3.2.1 Lifelines  
1. **Doctor (Actor)** – Finalizes notes and prescriptions after consultation.  
2. **ClinicoDashboard (React WebApp)** – Web interface used by doctors.  
3. **Backend (Node.js)** – Validates requests and processes consultation logic.  
4. **Database (PostgreSQL)** – Stores consultations, prescriptions, and appointment updates.  

#### 3.1.3.2.2 Messages and Activations  
1. Doctor (self-call): *enters notes & prescription details in UI form*  
   - *Note:* This is an action without a system response.  
2. Doctor → ClinicoDashboard: *clicks "Save & Finalize Notes"*  
3. ClinicoDashboard → Backend: `POST /api/consultations(consultationData)`  
4. Backend (self-call): *validate(appointmentId, doctorId)*  
   - *Note:* Ensures that the doctor is authorized to complete this appointment.  
5. Backend → Database: *INSERT INTO Consultations(notes, aiBriefing, ...)*  
6. Database → Backend: *newConsultationId*  

#### 3.1.3.2.3 Combined Fragment (loop)  
- **Operator:** `loop`  
- **Guard:** [for each prescription in consultationData]  

Inside the loop fragment:  
- Backend → Database: *INSERT INTO Prescriptions(consultationId, ...)*  
- Database → Backend: *Success*  

#### 3.1.3.2.4 Continue Messages  
- Backend → Database: *UPDATE Appointments SET status='Completed'*  
- Database → Backend: *Success*  
- Backend → ClinicoDashboard: *201 Created*  
- ClinicoDashboard → Doctor: *show "Consultation Saved" & Redirect*  

#### 3.1.3.2.5 Insights  
- This diagram demonstrates **doctor-driven workflows** in the system.  
- It validates rules such as:  
  - Only the **assigned doctor** can finalize an appointment.  
  - Prescriptions are tied to specific consultations.  
  - Appointments transition from *Scheduled* → *Completed*.  
- Ensures that clinical data is **persisted correctly in the database** and users are notified in real time.  

---

## 3.1.3.3 Importance of Sequence Diagrams in Low-Level Design  

- They capture **real-time execution flow** for core system processes.  
- They ensure **correct orchestration of APIs, services, and database transactions**.  
- They serve as **blueprints for developers** to implement backend and frontend logic.  
- They make system behavior clear to both **technical and non-technical stakeholders**.  

---


## 3.1.4 Activity Diagram

### Diagram
![Activity Diagram](https://raw.githubusercontent.com/abhay-byte/minor-project-gtbit/main/documentation/diagrams/low-level-design/activity_diagram_ai_triage.png)

---

### Explanation

The Activity Diagram models the intelligent triage process managed by the Clinico AI Care Companion. It highlights how a patient’s query is analyzed, processed through AI reasoning, and resolved with structured responses, ranging from general health answers to urgent crisis support or guided appointment booking.

---

#### 1. Swimlanes
The diagram is divided into three vertical swimlanes representing responsibility boundaries:
- Patient → Initiates queries and receives guidance.  
- Clinico AI System → Handles natural language understanding, reasoning, and routing of actions.  
- External Systems → Provides additional data such as knowledge base lookups.  

---

#### 2. Workflow Description

1. Patient Swimlane
   - Initial Node: Patient begins interaction.  
   - Sends Message to AI: User query submitted.  
   - Receives AI Response & Guidance: Patient receives a structured reply.  
   - Activity Final Node: Interaction ends.  

2. Clinico AI System Swimlane
   - Analyze User Intent → Determines purpose of query.  
   - Decision Node (Unclear Intent) → May ask clarifying questions.  
   - Retrieve Context from Knowledge Base (RAG) → Queries vector DB for relevant information.  
   - Generate Grounded, Informative Answer → AI crafts a structured reply.  
   - Decision Node (Mental Wellness Distress):  
     - Yes, Crisis Detected → Provide immediate helpline info.  
     - No Crisis → Generate empathetic response and suggest self-help/professional help.  
   - Decision Node (Request to Book Doctor):  
     - Virtual → Suggest telehealth professionals → Guide to appointment booking flow.  
     - In-Person → Suggest search on hyperlocal map.  

3. External Systems Swimlane
   - Knowledge Base (Vector DB) → Supplies context chunks for Retrieval-Augmented Generation (RAG).  

---

#### 3. Control & Object Flows

- [User Query] flows from Patient to Clinico AI System.  
- Context Chunks flow from Knowledge Base (Vector DB) into the RAG step.  
- Structured Response is generated and sent back to Patient.  

---

#### 4. Key Paths Illustrated
- General Health Question → AI fetches context and responds with informative guidance.  
- Mental Wellness Distress → Empathetic response with optional crisis helpline info.  
- Request to Book → AI suggests professionals and initiates booking workflow.  
- Unclear Intent → AI asks clarifying questions to refine understanding.  

---

### Summary

The AI Triage Activity Diagram ensures that the system can:  
- Handle ambiguous queries with clarifying questions.  
- Distinguish between routine queries and mental health crises.  
- Provide structured, reliable responses based on a knowledge base.  
- Guide patients seamlessly into the appointment booking flow.  

---

# 3.1.5 State-chart Diagram  

## 3.1.5.1 Overview  
The **State-chart Diagram** models the **complete lifecycle of a critical object** in the system. In this project, the focus is on the **Appointment** object, which is central to the telehealth platform.  

An appointment progresses through several states, starting from its creation (Scheduled) to its termination (Completed or Cancelled). During this lifecycle, different events (triggers) such as booking, cancellation, or doctor’s note submission cause transitions from one state to another.  

Key purposes of the State-chart Diagram are:  
- To **visualize how the system behaves over time** as appointments move through their lifecycle.  
- To **capture all possible states** an appointment can be in (Scheduled, In_Progress, Completed, Cancelled).  
- To **define the events and guards** that cause valid state transitions.  
- To **incorporate internal activities** such as sending notifications or generating summaries when entering certain states.  

This diagram ensures that the appointment lifecycle is **consistent, predictable, and complete**, leaving no ambiguity in system behavior.  

---

## 3.1.5.2 Diagram  
![Appointment State-chart Diagram](https://github.com/abhay-byte/minor-project-gtbit/blob/main/documentation/diagrams/low-level-design/statechart_diagram_appointment.png)  

---

## 3.1.5.3 Explanation  

### 3.1.5.3.1 States  
The **Appointment** object goes through the following states:  

1. **Initial State**  
   - Represents the starting point before the appointment is created.  

2. **Scheduled (Simple State)**  
   - Appointment has been successfully booked but not yet started.  
   - Entry Action: `sendConfirmationNotifications()` (patient and doctor are notified).  

3. **In_Progress (Composite State)**  
   - Represents the **ongoing process of a virtual consultation**.  
   - Contains multiple internal states (sub-states).  

4. **Completed (Simple State)**  
   - Appointment successfully finished.  
   - Entry Action: `generateConsultationSummary()` (system prepares a summary for records and patient view).  

5. **Cancelled (Simple State)**  
   - Appointment was cancelled either by patient or doctor.  
   - Entry Action: `sendCancellationNotifications()` (system notifies stakeholders).  

6. **Final State**  
   - Represents the termination of the lifecycle.  
   - Appointment can reach here either after **Completed** or **Cancelled**.  

---

### 3.1.5.3.2 The In_Progress Composite State  
The **In_Progress** state is not a single action; it represents a **process** broken down into steps. Inside this composite state:  

1. **Initial State (inside In_Progress)** – entry point when appointment time starts.  
2. **Waiting for Participants** – patient and doctor are waiting to join the consultation call.  
3. **Consultation Active** – both participants are present, and the telehealth consultation is ongoing.  
4. **Finalizing Notes** – the consultation has ended, and the doctor is finalizing notes and prescriptions.  
5. **Final State (internal)** – marks the completion of sub-activities inside In_Progress.  

---

### 3.1.5.3.3 Transitions and Triggers  

#### Main State Transitions  
1. **Initial → Scheduled**  
   - Trigger: `patient books appointment`  
   - Effect: `createRecord()`  

2. **Scheduled → In_Progress**  
   - Trigger: `appointment time starts`  

3. **Scheduled → Cancelled**  
   - Trigger: `patient cancels` OR `doctor cancels`  
   - Guard: `[before appointment time]`  

4. **In_Progress → Cancelled**  
   - Trigger: `patient is no-show`  
   - Guard: `[after grace period]`  
   - Effect: `logNoShow()`  

5. **In_Progress → Completed**  
   - Trigger: `doctor finalizes notes`  

6. **Cancelled → Final State**  
   - Automatic transition (no additional trigger).  

7. **Completed → Final State**  
   - Automatic transition (no additional trigger).  

---

#### Transitions inside In_Progress  
1. **Initial (inside In_Progress) → Waiting for Participants**  
   - Automatic transition.  

2. **Waiting for Participants → Consultation Active**  
   - Trigger: `all participants join call`  

3. **Consultation Active → Finalizing Notes**  
   - Trigger: `call ends`  

4. **Finalizing Notes → Final State (inside In_Progress)**  
   - Effect: `notifySystemOfCompletion()`  

*Note:* The **main external transition** from In_Progress → Completed happens when the doctor saves notes, while the **internal final state** only represents the end of sub-activities.  

---

### 3.1.5.3.4 Internal Activities (Entry/Exit)  
Each state can have **entry activities** that the system performs automatically when entering the state:  

- **Scheduled**:  
  - Entry: `sendConfirmationNotifications()`  

- **Completed**:  
  - Entry: `generateConsultationSummary()`  

- **Cancelled**:  
  - Entry: `sendCancellationNotifications()`  

---

## 3.1.5.4 Insights  

- The State-chart diagram captures **all possible states** of an appointment lifecycle.  
- It provides clarity on **how cancellations, no-shows, or completions are handled**.  
- Composite states like **In_Progress** allow detailed modeling of sub-activities (joining call, active consultation, finalizing notes).  
- Guards (`before appointment time`, `after grace period`) ensure that only **valid transitions** are allowed.  
- Entry actions guarantee **important system notifications and record updates** happen at the right time.  

---

## 3.1.5.5 Importance of State-chart Diagram  

- Ensures **robust lifecycle management** of appointments.  
- Prevents the system from entering **invalid or undefined states**.  
- Provides developers a **blueprint for implementing state management** in code.  
- Serves as a **validation tool** to check if all real-world scenarios (cancellation, no-show, successful completion) are supported.  
- Helps testers design **test cases for state transitions** and edge conditions.  

---
# 4. Data Design  

## 4.1 What is Data Design?  
Data Design is the process of **structuring, organizing, and modeling data** so that it can be efficiently stored, retrieved, and maintained in a database system. For a telehealth platform like **Clinico**, robust data design is critical because:  
- It ensures **data integrity** by defining relationships between patients, professionals, appointments, and consultations.  
- It provides **scalability** to handle large volumes of patients, appointments, and records.  
- It supports **security and compliance** for sensitive healthcare information.  
- It enables **efficient querying** for critical operations like booking, consultation tracking, and reporting.  

In this project, the data design is implemented using **PostgreSQL** and follows a **normalized relational schema**. This ensures data consistency while allowing flexibility for hybrid appointments, AI integration, and feedback systems.  

---

## 4.2 Overview of the Clinico Database Schema  
The **Entity-Relationship (ER) Diagram** defines the data structure for the Clinico platform. The schema includes:  
- **Core User & Role Management** – Handles patients, professionals, and NGO roles.  
- **Appointment & Consultation Core** – Manages scheduling, availability, consultations, and prescriptions.  
- **Patient Data** – Stores uploaded health records.  
- **Hyperlocal Discovery System** – Represents clinics and clinic doctors.  
- **Feedback & Interaction** – Handles patient reviews and AI chat logs.  

---

## 4.3 ER Diagram  

![Clinico ER Diagram](https://github.com/abhay-byte/minor-project-gtbit/blob/main/documentation/diagrams/err/er.svg)  

---

## 4.4 Choice of Database: PostgreSQL  

The Clinico platform uses **PostgreSQL** as its primary database due to the following reasons:  

1. **Reliability and ACID Compliance**  
   - PostgreSQL ensures atomicity, consistency, isolation, and durability, which is crucial for managing sensitive healthcare workflows like **appointments, prescriptions, and consultations**.  

2. **Rich Data Types**  
   - Provides advanced data types such as **JSONB, enums, arrays, and geospatial data**.  
   - Useful for storing **AI chat logs**, **appointment types**, and **location-based queries** for clinic discovery.  

3. **Scalability and Performance**  
   - Can handle **large datasets and concurrent transactions**, enabling smooth performance even as the number of patients and professionals grows.  

4. **Security**  
   - Features such as **role-based access control, row-level security, and SSL/TLS encryption** are critical to protect sensitive medical data and ensure compliance with healthcare standards.  

5. **Extensibility**  
   - Supports custom functions, triggers, and extensions that can be leveraged for **reporting, analytics, and AI-assisted decision-making**.  

---

## 4.4.2 Appointment & Consultation Core  

#### **appointments**  
- **Purpose**: Central record for all scheduled meetings.  
- **Attributes**:  
  - `appointment_id (PK)`  
  - `patient_id (FK → patients.patient_id)`  
  - `professional_id (FK → professionals.professional_id)` (nullable for in-person visits)  
  - `clinic_doctor_id (FK → clinic_doctors.clinic_doctor_id)` (nullable for telehealth)  
  - `appointment_time`  
  - `status` (Scheduled, Completed, Cancelled)  
  - `appointment_type` (Virtual/In-Person)  
  - `consultation_link`  

#### **availability_slots**  
- **Purpose**: Defines professionals’ available times for virtual consultations.  
- **Attributes**:  
  - `slot_id (PK)`  
  - `professional_id (FK → professionals.professional_id)`  
  - `start_time`  
  - `end_time`  
  - `is_booked`  

#### **consultations**  
- **Purpose**: Records details of completed appointments.  
- **Attributes**:  
  - `consultation_id (PK)`  
  - `appointment_id (FK → appointments.appointment_id)`  
  - `notes`  
  - `ai_briefing`  
  - `created_at`  

#### **prescriptions**  
- **Purpose**: Stores medication prescriptions linked to consultations.  
- **Attributes**:  
  - `prescription_id (PK)`  
  - `consultation_id (FK → consultations.consultation_id)`  
  - `medication_name`  
  - `dosage`  
  - `instructions`  

---

## 4.4.3 Patient-Specific Data  

#### **medical_records**  
- **Purpose**: Digital repository for patient health documents.  
- **Attributes**:  
  - `record_id (PK)`  
  - `patient_id (FK → patients.patient_id)`  
  - `document_name`  
  - `document_url` (link to cloud storage)  
  - `document_type`  
  - `uploaded_at`  

---

## 4.4.4 Hyperlocal Discovery System  

#### **clinics**  
- **Purpose**: Stores details of physical healthcare locations.  
- **Attributes**:  
  - `clinic_id (PK)`  
  - `name`  
  - `address`  
  - `latitude`  
  - `longitude`  
  - `phone_number`  
  - `type` (Clinic/Hospital)  

#### **clinic_doctors**  
- **Purpose**: Represents doctors working in physical clinics.  
- **Attributes**:  
  - `clinic_doctor_id (PK)`  
  - `clinic_id (FK → clinics.clinic_id)`  
  - `full_name`  
  - `specialty`  
  - `consultation_fee`  

---

## 4.4.5 Feedback & Interaction  

#### **reviews**  
- **Purpose**: Stores patient feedback and ratings.  
- **Attributes**:  
  - `review_id (PK)`  
  - `patient_id (FK → patients.patient_id)`  
  - `rating` (1–5)  
  - `comment`  
  - `target_type` (Appointment/Clinic_Doctor)  
  - `target_id` (Polymorphic FK → appointment_id OR clinic_doctor_id)  

#### **ai_chat_logs**  
- **Purpose**: Stores conversation history with the AI Care Companion.  
- **Attributes**:  
  - `log_id (PK)`  
  - `user_id (FK → users.user_id)`  
  - `message_content`  
  - `sender` (User/AI)  
  - `timestamp`  

---

## 4.5 Data Dictionary 


### 4.4.1 Core User & Role Management  

#### **users** (Core Identity Table)  
- **Purpose**: Stores identity and login credentials for every user.  
- **Attributes**:  
  - `user_id (PK)` – Unique ID for each user.  
  - `email (UK)` – Unique email for login.  
  - `password_hash` – Securely stored password hash.  
  - `full_name` – User’s full name.  
  - `phone_number` – Contact number.  
  - `role` – Defines user type (Patient, Professional, NGO).  
  - `created_at` – Timestamp of account creation.  
- **Relationships**: Connects to `patients`, `professionals`, or `ngo_users`.  

#### **patients**  
- **Purpose**: Stores patient-specific demographic details.  
- **Attributes**:  
  - `patient_id (PK)`  
  - `user_id (FK → users.user_id)`  
  - `date_of_birth`  
  - `gender`  
  - `address`  

#### **professionals**  
- **Purpose**: Represents healthcare professionals on the platform.  
- **Attributes**:  
  - `professional_id (PK)`  
  - `user_id (FK → users.user_id)`  
  - `specialty`  
  - `credentials`  
  - `years_of_experience`  
  - `verification_status`  

#### **ngo_users**  
- **Purpose**: Users representing NGOs partnered with the platform.  
- **Attributes**:  
  - `ngo_user_id (PK)`  
  - `user_id (FK → users.user_id)`  
  - `ngo_name`  
  - `verification_status` 

### Data Dictionary(Tabular Format)

| **Table**          | **Attribute**       | **Type**      | **Description** |
|---------------------|---------------------|---------------|-----------------|
| **users**          | user_id (PK)        | INT           | Unique ID for each user. |
|                     | email (UK)          | VARCHAR       | User’s email, unique for login. |
|                     | password_hash       | VARCHAR       | Secure password hash. |
|                     | full_name           | VARCHAR       | User’s full name. |
|                     | phone_number        | VARCHAR       | Contact number. |
|                     | role                | ENUM          | Role: Patient, Professional, NGO. |
|                     | created_at          | TIMESTAMP     | Account creation time. |
| **patients**       | patient_id (PK)     | INT           | Unique ID for patient record. |
|                     | user_id (FK)        | INT           | Links to `users`. |
|                     | date_of_birth       | DATE          | Patient’s date of birth. |
|                     | gender              | VARCHAR       | Patient’s gender. |
|                     | address             | TEXT          | Contact address. |
| **professionals**  | professional_id (PK)| INT           | Unique ID for professional. |
|                     | user_id (FK)        | INT           | Links to `users`. |
|                     | specialty           | VARCHAR       | Doctor’s specialty. |
|                     | credentials         | TEXT          | Professional’s certifications. |
|                     | years_of_experience | INT           | Work experience. |
|                     | verification_status | ENUM          | Credential verification status. |
| **ngo_users**      | ngo_user_id (PK)    | INT           | Unique ID for NGO user. |
|                     | user_id (FK)        | INT           | Links to `users`. |
|                     | ngo_name            | VARCHAR       | NGO organization name. |
|                     | verification_status | ENUM          | NGO verification status. |
| **appointments**   | appointment_id (PK) | INT           | Unique appointment ID. |
|                     | patient_id (FK)     | INT           | Links to `patients`. |
|                     | professional_id (FK)| INT           | Links to `professionals` (nullable). |
|                     | clinic_doctor_id (FK)| INT          | Links to `clinic_doctors` (nullable). |
|                     | appointment_time    | TIMESTAMP     | Scheduled time. |
|                     | status              | ENUM          | Scheduled, Completed, Cancelled. |
|                     | appointment_type    | ENUM          | Virtual or In-Person. |
|                     | consultation_link   | VARCHAR       | Video consultation link. |
| **availability_slots** | slot_id (PK)    | INT           | Unique slot ID. |
|                     | professional_id (FK)| INT           | Linked professional. |
|                     | start_time          | TIMESTAMP     | Start of slot. |
|                     | end_time            | TIMESTAMP     | End of slot. |
|                     | is_booked           | BOOLEAN       | True if slot is booked. |
| **consultations**  | consultation_id (PK)| INT           | Unique consultation record. |
|                     | appointment_id (FK) | INT           | Links to `appointments`. |
|                     | notes               | TEXT          | Doctor’s notes. |
|                     | ai_briefing         | TEXT          | AI-assisted summary. |
|                     | created_at          | TIMESTAMP     | Record creation time. |
| **prescriptions**  | prescription_id (PK)| INT           | Unique prescription ID. |
|                     | consultation_id (FK)| INT           | Links to `consultations`. |
|                     | medication_name     | VARCHAR       | Prescribed medication. |
|                     | dosage              | VARCHAR       | Dosage details. |
|                     | instructions        | TEXT          | Prescription instructions. |
| **medical_records**| record_id (PK)      | INT           | Unique health document ID. |
|                     | patient_id (FK)     | INT           | Links to `patients`. |
|                     | document_name       | VARCHAR       | File name. |
|                     | document_url        | TEXT          | Link to cloud storage. |
|                     | document_type       | VARCHAR       | Type of record (e.g., lab report). |
|                     | uploaded_at         | TIMESTAMP     | Upload timestamp. |
| **clinics**        | clinic_id (PK)      | INT           | Unique clinic ID. |
|                     | name                | VARCHAR       | Clinic name. |
|                     | address             | TEXT          | Clinic address. |
|                     | latitude            | FLOAT         | Geo-location (lat). |
|                     | longitude           | FLOAT         | Geo-location (long). |
|                     | phone_number        | VARCHAR       | Contact number. |
|                     | type                | ENUM          | Clinic or Hospital. |
| **clinic_doctors** | clinic_doctor_id (PK)| INT          | Unique doctor-in-clinic ID. |
|                     | clinic_id (FK)      | INT           | Links to `clinics`. |
|                     | full_name           | VARCHAR       | Doctor’s name. |
|                     | specialty           | VARCHAR       | Doctor’s specialty. |
|                     | consultation_fee    | DECIMAL       | Fee for consultation. |
| **reviews**        | review_id (PK)      | INT           | Unique review ID. |
|                     | patient_id (FK)     | INT           | Links to `patients`. |
|                     | rating              | INT           | Rating (1–5). |
|                     | comment             | TEXT          | Review comment. |
|                     | target_type         | ENUM          | Appointment or Clinic_Doctor. |
|                     | target_id           | INT           | ID of target entity. |
| **ai_chat_logs**   | log_id (PK)         | INT           | Unique chat log ID. |
|                     | user_id (FK)        | INT           | Links to `users`. |
|                     | message_content     | TEXT          | Chat message text. |
|                     | sender              | ENUM          | User or AI. |
|                     | timestamp           | TIMESTAMP     | Message time. |

---

## 4.6 Example SQL Schema Definitions  
  

### Core User & Role Management  
### Appointment & Consultation Core

Below are example **SQL `CREATE TABLE` definitions** for selected entities. 

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(50) CHECK (role IN ('Patient','Professional','NGO')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
  patient_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT
);

CREATE TABLE professionals (
  professional_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  specialty VARCHAR(100),
  credentials TEXT,
  years_of_experience INT,
  verification_status VARCHAR(50) CHECK (verification_status IN ('Pending','Verified'))
);

CREATE TABLE ngo_users (
    ngo_user_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    ngo_name VARCHAR(255),
    verification_status VARCHAR(50) CHECK (verification_status IN ('Pending','Verified')) DEFAULT 'Pending'
);

CREATE TABLE appointments (
  appointment_id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(patient_id),
  professional_id INT REFERENCES professionals(professional_id),
  clinic_doctor_id INT REFERENCES clinic_doctors(clinic_doctor_id),
  appointment_time TIMESTAMP NOT NULL,
  status VARCHAR(50) CHECK (status IN ('Scheduled','Completed','Cancelled')),
  appointment_type VARCHAR(50) CHECK (appointment_type IN ('Virtual','In-Person')),
  consultation_link VARCHAR(255)
);

CREATE TABLE availability_slots (
    slot_id SERIAL PRIMARY KEY,
    professional_id INT REFERENCES professionals(professional_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE
);

CREATE TABLE consultations (
  consultation_id SERIAL PRIMARY KEY,
  appointment_id INT REFERENCES appointments(appointment_id),
  notes TEXT,
  ai_briefing TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
  prescription_id SERIAL PRIMARY KEY,
  consultation_id INT REFERENCES consultations(consultation_id),
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  instructions TEXT
);
```

---

## 4.7 Key Insights  

- The **Appointments & Consultation Core** ensures seamless management of both **virtual and in-person consultations**.  
- The **Patient Data module** (`medical_records`) allows secure storage of documents, making Clinico a **digital health repository**.  
- The **Hyperlocal Discovery System** (`clinics` and `clinic_doctors`) powers the "Find a Doctor" feature with **location-based services**.  
- The **Feedback & Interaction** layer supports **patient engagement** through reviews and AI chat integration.  
- **Polymorphic relationships** (e.g., reviews) make the schema flexible and reduce redundancy.  
- PostgreSQL’s **scalability, security, and extensibility** make it a robust choice for healthcare-grade data management.  
- With **SQL-ready definitions**, the schema is **directly implementable** and future-proof for AI-driven enhancements.  

---

# 5. Conclusion  

This document marks the completion of the **Software Design phase** for the **Clinico Telehealth Platform**. It consolidates all architectural and low-level design decisions into a single, formal **Software Design Document (SDD)**, which now serves as the **primary technical blueprint** for the development team.  

Through the structured sections of this SDD, we have:  
- Defined the **system architecture**, including Component and Deployment Diagrams, to illustrate the overall structure and deployment environment.  
- Captured the **low-level design** with detailed Class, Object, Sequence, Activity, and State-chart diagrams, ensuring both structural clarity and behavioral accuracy.  
- Documented the **data design** by embedding the ER Diagram, justifying the choice of PostgreSQL, and creating a comprehensive data dictionary that secures data integrity, scalability, and compliance.  

Together, these artifacts bridge the gap between the **Software Requirements Specification (SRS)** and the **implementation phase**, ensuring:  
- Developers have a clear roadmap for building each module.  
- Testers can validate workflows, transitions, and data consistency.  
- Stakeholders can trust that business requirements have been translated into robust technical solutions.  

This SDD will remain a **living document** throughout development, guiding decisions, maintaining alignment with requirements, and supporting scalable enhancements in the future. With this foundation, the Clinico platform is prepared for successful implementation, testing, and real-world adoption.  

---









