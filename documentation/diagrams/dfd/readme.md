
### **Explanation of DFD Level 0 (Context Diagram)**

#### **What This Diagram Shows**

The Level 0, or Context Diagram, provides a "bird's-eye view" of the entire Clinico system. It is the simplest possible representation, treating the whole application as a single process (a "black box"). Its purpose is to define the system's boundary, showing who interacts with it and what information flows in and out, without getting into any internal details.

![DFD Level 0](https://raw.githubusercontent.com/abhay-byte/minor-project-gtbit/main/documentation/diagrams/dfd/dfd-l0.svg)

#### **Breakdown of Components**

1.  **The Central Process: `Clinico Healthcare Software`**
    *   This circle in the center represents the entire Clinico application. It is responsible for receiving all incoming data, processing it according to its business logic, and generating all outgoing information.

2.  **Input Entities (Sources of Data)**
    *   **`Patient`**: This represents any end-user of the mobile app. They are a primary source of data for the system.
    *   **`Doctor`**: This represents a verified healthcare professional using the web dashboard. They are another primary source of data.

3.  **Input Data Flows (Data Entering the System)**
    *   **`Submit patient data`**: When a user registers or updates their profile, this personal information flows into the system.
    *   **`Submit health request`**: This represents a user asking a question to the AI Companion or searching for a doctor.
    *   **`Submit professional data`**: When a doctor registers, their credentials and availability flow into the system.
    *   **`Submit consultation data`**: This is the information a doctor provides after a call, such as clinical notes and prescriptions.

4.  **Output Entities (Destinations of Data)**
    *   **`Personal Information`**: This represents the user's own profile page, where the system displays their data back to them.
    *   **`Doctor Directory`**: This is the search result page or map where the system displays information about available local doctors.
    *   **`Appointment Schedule`**: This represents the view where both patients and doctors can see their upcoming appointments.
    *   **`Consultation Result`**: This is the final output of a consultation, such as a digital prescription or summary, that is delivered to the patient.

**In summary, the Level 0 diagram tells us that Clinico is a system that takes in data from Patients and Doctors and, after processing it, produces informational displays, reports, and results for them.**

---

### **Explanation of DFD Level 1**

#### **What This Diagram Shows**

The Level 1 DFD "explodes" the single process from the Level 0 diagram into its major sub-processes. It opens the "black box" to reveal the main functional parts of the Clinico system, the data stores (databases) where information is kept, and how data moves *between* these internal components.

![DFD Level 1](https://raw.githubusercontent.com/abhay-byte/minor-project-gtbit/main/documentation/diagrams/dfd/dfd-l1.svg)

#### **Breakdown of Components**

1.  **External Entities**
    *   These are the same actors from the Level 0 diagram, now shown interacting with specific internal processes: `Patient/User`, `Healthcare Professional`, `NGO/Community Partner`, and `Platform Administrator`.

2.  **Main Processes (The Functional Cores)**
    *   **`1.0 User & Profile Management`**: The gatekeeper. It handles registration, login, and profile updates for all user types.
    *   **`2.0 AI Care Companion`**: The intelligent front door. It processes user health queries, interacts with the knowledge base, and provides guidance.
    *   **`3.0 Appointment & Scheduling`**: The logistics hub. It manages everything related to booking, viewing, and managing appointments, including doctor availability.
    *   **`4.0 Telehealth Service`**: The virtual clinic. It handles the live video consultation and the creation of post-consultation documents like notes and prescriptions.
    *   **`5.0 Hyperlocal Discovery`**: The map feature. It handles searches for local clinics and doctors.
    *   **`6.0 Analytics & Reporting`**: The insights engine. It gathers data to provide reports to admins and NGOs.

3.  **Data Stores (The System's Memory)**
    *   **`User Profiles`**: The database table storing all user account information.
    *   **`Health Records`**: The database where patient-specific data like chat history, uploaded documents, and consultation summaries are stored.
    *   **`Appointments`**: The database table that keeps track of all scheduled, completed, and cancelled appointments.
    *   **`Knowledge Base`**: The vetted medical information that the AI Companion uses to provide accurate answers (for the RAG model).
    *   **`Local Provider Directory`**: The database of all physical clinics and doctors available for in-person booking.

#### **Tracing a Key Data Flow: A Patient Books a Virtual Call**

To understand how it all works together, let's follow a typical user journey:

1.  A `Patient/User` sends a `Health Query` to the **`2.0 AI Care Companion`** process.
2.  The `AI Care Companion` reads from the **`Knowledge Base`** to find relevant information and reads from **`User Profiles`** to personalize the response. It sends `AI Guidance & Triage` back to the user.
3.  The AI determines the user needs a doctor and prompts them to book. The user agrees, sending a `Booking Request` to the **`3.0 Appointment & Scheduling`** process.
4.  The `Appointment & Scheduling` process reads the doctor's availability from the **`Appointments`** data store (or a related availability table) and the patient's info from **`User Profiles`**. It then writes a new record to the **`Appointments`** data store.
5.  Finally, it sends an `Appointment Confirmation` back to the `Patient/User` and an updated `Appointment Schedule` to the `Healthcare Professional`.

**In summary, the Level 1 diagram shows the internal machinery of Clinico, illustrating how different modules collaborate and use shared data stores to deliver the features promised in the Level 0 diagram.**