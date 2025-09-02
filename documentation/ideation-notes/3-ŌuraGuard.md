### **3. ŌuraGuard: The Proactive Elderly Care & Independent Living AI**

<p>
  <img src="https://img.shields.io/badge/Field-HealthTech-00B2A9?style=for-the-badge" alt="Field: HealthTech"/>
  <img src="https://img.shields.io/badge/Core_Tech-Behavioral_AI-D9006C?style=for-the-badge" alt="Core Tech: Behavioral AI"/>
  <img src="https://img.shields.io/badge/Application-Preventive_Care-8A2BE2?style=for-the-badge" alt="Application: Preventive Care"/>
</p>

#### **Problem Statement**

The world's population is aging rapidly, creating immense pressure on care systems. Elderly individuals wish to live independently in their own homes for as long as possible, but this creates significant anxiety for their families, who worry about falls, missed medications, and gradual health decline that goes unnoticed. Existing emergency alert systems are purely reactive—they only work *after* a fall has already happened and require the individual to be able to press a button.

#### **Solution**

ŌuraGuard is a non-invasive, privacy-preserving AI platform that uses a network of **ambient IoT sensors** to learn the unique daily patterns and routines of an elderly individual living alone. The AI's goal is not to spy, but to understand what "normal" looks like for that person. By detecting subtle deviations from these established patterns, it can predict health risks and proactively alert family members or caregivers *before* a crisis occurs, enabling a new model of preventative, dignified care.

#### **🛠️ Tech Stack**

*   **Artificial Intelligence & Machine Learning:** <br/>
    <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch"/> <img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow"/> <img src="https://img.shields.io/badge/Keras-D00000?style=for-the-badge&logo=Keras&logoColor=white" alt="Keras"/>
    *   **Anomaly Detection Models (e.g., Autoencoders)** to identify significant deviations from established routines.
    *   **Time-Series Analysis** to model daily behavioral patterns and long-term health trends.
    *   **Hierarchical Alert Engine** to classify the severity of an event and determine the appropriate response.
*   **Internet of Things (IoT):** <br/>
    <img src="https://img.shields.io/badge/ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white" alt="ESP32"/> <img src="https://img.shields.io/badge/Zigbee-EB0443?style=for-the-badge&logo=zigbee&logoColor=white" alt="Zigbee"/> <img src="https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white" alt="MQTT"/>
    *   **Ambient, Non-Visual Sensors:** Low-power radar (for presence/falls), smart plugs (for appliance usage), and magnetic contact sensors (for doors/cabinets) built on platforms like ESP32.
    *   **Low-Power Wireless Protocols (Zigbee/Z-Wave)** for robust, in-home device communication.
    *   **Secure MQTT Broker** for transmitting encrypted sensor data to the cloud.
*   **Backend & Mobile App:** <br/>
    <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Flutter"/> <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/> <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/> <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
    *   **Cross-Platform App (Flutter)** for the family/caregiver dashboard.
    *   **Real-time Database & Push Notifications (Firebase)** for instant alerts.
    *   **Secure Backend (Node.js)** to process data and manage user accounts.

#### **✨ Feature List**

*   **🕵️ Ambient, Privacy-First Sensing:**
    *   **No Cameras or Microphones:** The system ensures dignity and privacy by using only non-visual sensors to understand activity.
    *   **Fall & Immobility Detection:** Uses low-power radar to detect a sudden fall and subsequent lack of movement, triggering an immediate, high-priority alert.
    *   **Subtle Routine Monitoring:** Tracks patterns like kitchen activity, medication cabinet access, and sleep quality without any user input.
*   **🧠 The Behavioral AI Core:**
    *   **Personalized Baseline Learning:** The AI spends the first two weeks learning the individual's unique daily rhythms to create a personalized "normal."
    *   **Proactive Health Insights:** Detects gradual, negative trends (e.g., increasingly disturbed sleep, reduced daytime activity) that can be early indicators of health issues, and provides insights to family.
    *   **Hierarchical Alert System:** Distinguishes between a minor anomaly (a gentle nudge), a concerning trend (an insight for family), and a potential emergency (a critical alert).
*   **❤️ The Family & Caregiver Dashboard:**
    *   **Insight-Driven, Not Data-Driven:** The dashboard displays simple, actionable insights (e.g., "Sleep quality was lower than usual last night") instead of raw, intrusive sensor data.
    *   **Long-term Wellness Trends:** Visualizes key health indicators over weeks and months, making it easy to spot gradual changes.
    *   **Secure Communication Hub:** Allows family members and caregivers to share notes and coordinate care within the app.