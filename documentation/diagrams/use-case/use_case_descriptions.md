## Usecase Diagram ##

A Use Case Diagram is a type of diagram in Unified Modeling Language (UML) that shows how users (called actors) interact with a system to achieve specific goals (use cases).

It’s a high-level view of system functionality that focuses on what the system should do rather than how it does it.

Key Elements of a Use Case Diagram

Actors – external entities (users, other systems, or devices) that interact with the system.

Use Cases – functionalities or services the system provides (written as ovals).

System Boundary – defines the scope of the system (shown as a rectangle).

Relationships – links between actors and use cases (associations, include, extend, generalization).

Why Use Case Diagrams Are Used

✅ Requirements Gathering – helps identify what the users want from the system.
✅ System Understanding – provides a simple, visual overview of system behavior.
✅ Communication Tool – makes it easy for developers, stakeholders, and clients to discuss requirements.
✅ Project Planning – helps define the scope and prioritize functionalities.
✅ Basis for Design & Testing – ensures that all user interactions are covered during implementation and testing.

🔹 Example:
In an online shopping system:

Actors: Customer, Admin, Payment Gateway.

Use Cases: Browse Products, Add to Cart, Make Payment, Manage Inventory.

This diagram would show how each actor interacts with these use cases.

 ## Use Case Diagram Statement for Clinico Platform ##

The Use Case Diagram of the Clinico platform illustrates the interaction between external actors (patients, doctors, administrators, and external systems) and the major functionalities offered by the system.

Patients can register, book appointments, access medical records, make payments, and receive notifications.

Doctors can manage patient profiles, view medical histories, update prescriptions, and conduct virtual consultations.

Administrators oversee user management, maintain the system, manage schedules, and generate reports.

External Systems such as payment gateways or third-party healthcare services are integrated to facilitate secure transactions and interoperability.

This diagram highlights the functional boundaries of the Clinico system, ensuring that all user requirements are captured. It also serves as a communication tool between stakeholders, clarifying what the system will do without detailing how it will be implemented.



## Actors ##
● Patient
● Doctor
● Counsellor
●  Admin


## Primary Use Cases ##
1. Identity, Registration & Consent Management
Actors: Patient, Admin
Use Cases:
● Register/Login (via OTP)
● Consent Management (give/withdraw consent)
● Role-based Access


2. Intake, Triage & Risk Management

Actors: Patient, CHW, Doctor, Counsellor, Triage Engine
Use Cases:
● Symptom Intake (physical/mental)
● AI-Assisted Triage (Human approval required)
● Crisis Workflow (suicidal/self-harm escalation)

3. Scheduling & Teleconsultation Management
Actors: Patient, Doctor, Counsellor

Use Cases:
● Appointment Booking (book, reschedule, cancel)
● Virtual Consult (video/audio/IVR fallback)
● E-Prescription & Care Plan


4. Records, Messaging & Follow-ups Management
Actors: Patient, Doctor, Counsellor, CHW

Use Cases:
● EHR-lite Records (timeline of visits, screenings, prescriptions)
● Secure Messaging (encrypted chat)
● Reminders & Adherence (medication/therapy reminders)

5. Volunteer & Workforce Management
Actors: Admin, Volunteer Doctor, Counsellor

Use Cases:
● Volunteer Onboarding (license verification, availability)
● Quality & Supervision (case review, feedback, escalation)


6. Admin, Audit & Analytics Management
Actors: Admin, Partner (read-only)

Use Cases:
● Admin Console (manage users, roles, content)
● Metrics & Dashboards (utilization, referral outcomes)
● Audit Trails (tamper-proof logs, compliance reporting)
 