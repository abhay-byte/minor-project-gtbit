# Clinico Project: Process Flowcharts

This directory contains the detailed process flowcharts for the Clinico application. These diagrams visually map the step-by-step logic of key user journeys and system workflows, as defined during the requirement analysis phase.

Each flowchart is presented below, first as a visual diagram and then with the Mermaid code used to generate it.

---

## 1. User Onboarding & Login Flow

This flowchart details the entire user journey from launching the app for the first time to successfully registering a new account or logging in. It covers all decision points and paths in the authentication process.

### Diagram
![User Onboarding Flowchart](user_onboarding_flow.svg)

### Mermaid Code
```mermaid
graph TD
    A(Start: User Launches App) --> B[Show Splash Screen];
    B --> C{First Time User?};
    C -- Yes --> D[Show Onboarding Screens];
    C -- No --> H[Show Login Screen];
    
    D --> E[User Clicks 'Get Started'];
    D -- User clicks 'Login' --> H;
    E --> F[Show Signup Screen];
    F -- User clicks 'Login' --> H;

    F --> G{User Enters Details & Submits};
    G -- Valid --> G1[Create Account in DB];
    G1 --> I[Navigate to Home Screen / Main Wrapper];
    G -- Invalid --> G2[Show Error Message];
    G2 --> F;
    
    H --> J{User Enters Credentials & Submits};
    J -- Valid --> K[Authenticate User];
    K --> I;
    J -- Invalid --> L[Show Error Message];
    L --> H;

    H -- User clicks 'Forgot Password' --> M[Show Forgot Password Screen];
    M --> N[User Enters Email & Submits];
    N --> O[Send Reset Link];
    O --> P[Show Confirmation Message];
    P --> H;
    
    H -- User clicks 'Signup' --> F;

    style I fill:#2ea44f,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 2. Appointment Booking Flow

This flowchart illustrates the complete workflow for booking an appointment. It covers the two main entry points for a user: starting from an AI suggestion or starting from a manual search on the "Find a Doctor" screen.

### Diagram
![Appointment Booking Flowchart](appointment_booking_flow.svg)

### Mermaid Code
```mermaid
graph TD
    subgraph Start: User is Logged In
        A(Home Screen - AI Chat)
        B(Find a Doctor Screen)
    end

    A --> A1[User Interacts with AI];
    A1 --> A2{AI Suggests Booking?};
    A2 -- Yes --> F[Navigate to Doctor Profile Screen];

    B --> C{User wants to filter?};
    C -- Yes --> D[Show Filters Screen];
    D --> E[User Applies Filters];
    E --> B;
    C -- No --> F1[User Selects Doctor from Map/List];
    F1 --> F;
    
    subgraph Booking Flow
        direction LR
        F --> G[User Reviews Doctor Details];
        G --> H[User Clicks 'Book Appointment'];
        H --> I[System Shows Available Time Slots];
        I --> J[User Selects a Slot];
        J --> K[Navigate to Booking Confirmation Screen];
        K --> L[User Clicks 'Confirm Booking'];
        L --> M{Process Booking in Backend};
        M -- Slot Available --> N[Booking Successful!];
        M -- Slot Taken --> O[Show 'Slot Unavailable' Error];
        O --> F;
        N --> P(End: View in 'Appointments' Screen);
    end

    style P fill:#2ea4f,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 3. Overall App Flow (Post-Login)

This high-level flowchart provides a complete overview of the application's user journey after a successful login. It shows how the user navigates between the four primary sections of the app: AI Chat, Find a Doctor, Appointments, and Profile.

### Diagram
![Overall App Flowchart](app_flow_chart.svg)

### Mermaid Code
```mermaid
graph TD
    A(Start: User Logged In at Main Wrapper) --> B[Default: Home Screen / AI Chat];
    
    subgraph AI Interaction Loop
        B -- User sends query --> B1[Get AI Guidance & Triage];
        B1 --> B2{Action Suggested?};
        B2 -- Book Doctor --> C;
        B2 -- View Records --> E;
        B2 -- General Info --> B;
    end

    subgraph Find & Book Loop
        A --> C[Navigate to 'Find a Doctor'];
        C --> C1[Search/Filter for Doctors];
        C1 --> C2[View Doctor Profile];
        C2 --> C3[Book Appointment];
        C3 --> D;
    end

    subgraph Appointment Management Loop
        A --> D[Navigate to 'Appointments'];
        D --> D1[View Upcoming Appointments];
        D1 --> D2[View Appointment Details];
        D2 --> D3{Time for Virtual Visit?};
        D3 -- Yes --> D4[Join Video Call];
        D4 --> D5[Conduct Consultation];
        D5 --> D6[View Consultation Summary in 'Past' tab];
        D3 -- No --> D;
    end

    subgraph Profile Management Loop
        A --> E[Navigate to 'Profile'];
        E --> E1[View/Manage Health Records];
        E --> E2[Edit Profile Details];
        E --> E3[Manage Settings];
        E1 --> E;
        E2 --> E;
        E3 --> E;
    end

    E --> F(End: User Logs Out);
```