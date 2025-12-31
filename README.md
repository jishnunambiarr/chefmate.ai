# ChefMate AI 🍳🤖

ChefMate AI is a voice-first cooking assistant powered by **ElevenLabs Conversational AI** and **Google Cloud**. It helps users discover recipes, plans meals, and guides them through cooking steps with a natural, hands-free voice interface.

### [📺 Watch the Demo Video](https://youtube.com/shorts/wFGzK78Jf48?feature=share)

## Features

-   **Voice-First Interface**: Interact entirely through speech to find and cook recipes.
-   **AI Recipe Discovery**: Ask for "Ketogenic Italian dinner" and get personalized suggestions.
-   **Step-by-Step Cooking**: The agent guides you through every step, waiting for you to finish chopping/cooking.
-   **Weekly Meal Planner (Beta)**: Plan your week's meals with AI assistance, save them to your profile, and modify them. *Currently in early beta/rudimentary stage.*
-   **Secure & Private**: Built with privacy in mind.

## Architecture

-   **Frontend**: React Native (Expo)
-   **Backend**: Python (FastAPI)
-   **AI Agents**: ElevenLabs (Conversational AI)
-   **Database**: Firebase / Google Cloud
-   **Authentication**: Firebase Auth

## 🚀 Getting Started

### Prerequisites

-   Node.js & npm/yarn
-   Python 3.8+
-   Expo Go app on your phone (or Android Simulator)
-   ElevenLabs Account (for Agent IDs)

### 1. Backend Setup

Navigate to the `backend` folder:

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**Configuration (.env)**
Create a `.env` file in the `backend/` directory:

```ini
# ElevenLabs Config
ELEVENLABS_API_KEY=your_xi_api_key_here
ELEVENLABS_DISCOVER_AGENT_ID=your_agent_id_here
ELEVENLABS_COOK_AGENT_ID=your_second_agent_id_here

# Firebase Admin Config (Path to your service account JSON)
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

Start the server:

```bash
python main.py
```

### 2. Frontend Setup

Navigate to the `frontend` folder:

```bash
cd frontend
npm install
```

Start the app:

```bash
npx expo start
```

## Security & Usage

-   **Authentication**: The backend endpoints are protected by Firebase Auth. Only authenticated users can initiate voice sessions.
-   **Cost Protection**: The frontend never exposes API keys. All calls go through the backend, which verifies the user's identity first.

## ElevenLabs Hackathon

This project was built for the **ElevenLabs x Google Cloud Hackathon**.
It demonstrates:
-   Native integration of ElevenLabs Agents via WebSocket.
-   Dynamic context injection (Recipe data passed to Agent).
-   Hybrid voice/UI interaction model.

## License

MIT

## Acknowledgements

Most of the code in this repository was generated with **Google Gemini 3 Pro**, using the **Antigravity** advanced agentic coding system.
