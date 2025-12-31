# ChefMate AI - Mobile Frontend 📱

The mobile application for **ChefMate AI**, built with **React Native** and **Expo**. This app provides the voice-first interface for users to discover recipes, plan meals, and cook hands-free.

## Features

*   **🎙️ Voice Chat**: Real-time voice interaction with AI Agents (Discover, Cook, Planner).
*   **🍽️ Meal Planner**: Weekly meal planning interface to view and manage generated plans.
*   **🍳 Cook Mode**: Step-by-step cooking guidance with voice controls.

## Setup & Running

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configuration**:
    *   Open `src/shared/config/api.ts`.
    *   **CRITICAL**: Update `LOCAL_IP` to your computer's IP address (e.g., `192.168.1.x`).
    *   *Note: `localhost` will not work on physical Android/iOS devices.*

3.  **Start the App**:
    ```bash
    npx expo start
    ```
    *   Scan the QR code with the **Expo Go** app on your phone.
    *   Or press `a` to run on Android Emulator.

## Troubleshooting

*   **Connection Failed?**
    *   Ensure your phone and computer are on the **same Wi-Fi network**.
    *   Double-check the `LOCAL_IP` in `api.ts`.
    *   Ensure the backend is running (`python main.py` in the `backend/` folder).
