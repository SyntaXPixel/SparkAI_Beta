
# SparkAI — Your Personalized AI Learning Companion

SparkAI is a holistic, AI-powered learning platform built to bridge the gap between academic theory, 
practical coding, real-world application, and emotional well-being. It adapts to individual student 
learning styles while keeping data privacy at the core through session-based deletion and a 
zero-training policy.

---

## Table of Contents

- [Overview](#overview)
- [Modules](#modules)
- [Privacy & Security](#privacy--security)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Clone the Repository](#1-clone-the-repository)
  - [Frontend Setup](#2-frontend-setup)
  - [Backend Setup](#3-backend-setup)
  - [Environment Variables](#4-environment-variables)
  - [Database Initialization](#5-database-initialization)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Pages & Navigation](#pages--navigation)
- [Future Scope](#future-scope)
- [License](#license)

---

## Overview

SparkAI is not just another AI chatbot. It is a four-module ecosystem designed around the real 
challenges students face — understanding theory, writing and debugging code, discovering where 
concepts apply in the industry, and managing stress and motivation. Each module is purpose-built, 
and together they form a complete academic companion.

---

## Modules

### SparkChat — Theory Assistant

Dedicated to making academic concepts easier to understand.

- **Concept Explanation** — Breaks down complex topics like control systems, circuits, or calculus into clear language.
- **Note Generation** — Produces concise summary notes and key revision points automatically.
- **Adaptive Learning** — Handles follow-up "why" and "how" questions to build deeper understanding.

---

### SparkCode — Coding Assistant

Focused on helping students write better code, currently supporting C++ and Python.

- **Smart Debugging** — Spots syntax and logic errors and explains what went wrong and why.
- **Concept Help** — Covers fundamentals like pointers, recursion, sorting algorithms, and data structures.
- **Code Improvement** — Suggests cleaner, more efficient approaches and highlights best practices.

---

### SparkExplore — Academic Trend Scout

Helps students connect what they learn in class to what actually happens in the industry.

- **Real-World Mapping** — Shows practical applications of academic topics across modern industries.
- **Career Connections** — Links concepts to relevant job roles such as Data Scientist or Embedded Engineer.
- **Future Trends** — Surfaces insights into emerging technologies like Quantum Algorithms and Edge AI.

---

### Sparky — Emotional Companion

A low-pressure, non-judgmental space for reflection and mental wellness.

- **Daily Check-ins** — Encourages reflection with simple prompts like "What went well today?".
- **Achievement Tracking** — Logs task completions and learning milestones.
- **Stress Management** — Provides encouragement during exam pressure and helps reframe setbacks constructively.

---

## Privacy & Security

SparkAI operates on a "Safe Haven" philosophy. Student privacy is non-negotiable.

| Principle | How it works |
|---|---|
| Session-Based Deletion | No chat history is stored. All conversational data is wiped once the session ends. |
| Zero-Training Policy | User data is never used to train or fine-tune any AI model. |
| SparkID System | Each user gets a unique anonymous ID (e.g., `SPK123456`) for collaboration without exposing personal details. |
| JWT Authentication | All protected routes use Bearer token authentication with a configurable expiry window. |
| OTP Verification | Email OTP is required for account registration and password reset — 6 digits, 5-minute expiry, max 3 attempts. |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.3.5 | Build tool and dev server |
| Tailwind CSS | Latest | Utility-first styling |
| Radix UI | Various | Accessible headless UI primitives |
| Lucide React | 0.487.0 | Icon library |
| react-markdown | 10.1.0 | Renders AI responses as formatted markdown |
| remark-gfm | 4.0.1 | GitHub Flavored Markdown support |
| React Hook Form | 7.55.0 | Form state and validation |
| Recharts | 2.15.2 | Data visualization |
| Sonner | 2.0.3 | Toast notifications |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| FastAPI | 0.104.1 | REST API framework |
| Uvicorn | 0.23.2 | ASGI server |
| PyMongo | 4.5.0 | MongoDB driver |
| python-jose | 3.3.0 | JWT encoding and decoding |
| passlib[bcrypt] | 1.7.4 | Password hashing |
| python-dotenv | 1.0.0 | Environment variable management |
| python-multipart | 0.0.6 | Form data parsing |

### Database

| Store | Purpose |
|---|---|
| MongoDB | Primary database for users, todos, messages, and friends |

---

## Project Structure

```
SparkAI_Beta/
│
├── src/                              # React frontend source
│   ├── components/
│   │   ├── pages/                    # All page-level components
│   │   │   ├── home.tsx              # Dashboard
│   │   │   ├── chat-bot.tsx          # AI chat interface (all four modules)
│   │   │   ├── todo.tsx              # Task manager
│   │   │   ├── profile.tsx           # User profile and settings
│   │   │   ├── inbox.tsx             # Shared messages from friends
│   │   │   ├── saves.tsx             # Saved AI responses
│   │   │   ├── about.tsx             # About page
│   │   │   ├── login.tsx             # Login
│   │   │   ├── signup.tsx            # Sign up with OTP verification
│   │   │   └── forgot-password.tsx   # Password reset flow
│   │   ├── ui/                       # Reusable UI components (Radix-based)
│   │   ├── app-sidebar.tsx           # Navigation sidebar
│   │   └── chat-message.tsx          # Individual chat message component
│   ├── App.tsx                       # Root component and routing logic
│   ├── main.tsx                      # Application entry point
│   └── styles/globals.css
│
├── backend/                          # Python FastAPI backend
│   ├── app/
│   │   ├── main.py                   # All API routes and app setup
│   │   ├── config.py                 # Email and OTP configuration
│   │   └── otp_service.py            # OTP generation, storage, and email delivery
│   ├── init_db.py                    # Database seeder script
│   └── requirements.txt              # Python dependencies
│
├── public/                           # Static assets
├── index.html                        # HTML entry point
├── vite.config.ts                    # Vite configuration
├── package.json                      # Node dependencies and scripts
└── tsconfig.json
```

---

## Prerequisites

Make sure you have the following installed before you start:

| Tool | Minimum Version |
|---|---|
| Node.js | v18 |
| npm | v9 |
| Python | v3.10 |
| pip | Latest |
| MongoDB | v6 (local) or a MongoDB Atlas connection string |

You can verify your setup with:
```bash
node -v
python --version
mongod --version
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SyntaXPixel/SparkAI_Beta.git
cd SparkAI_Beta
```

---

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open automatically at **http://localhost:3000**.

To create a production build:
```bash
npm run build
# Output is placed in the /build directory
```

---

### 3. Backend Setup

```bash
# Move into the backend folder
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload
```

The API will be running at **http://localhost:8000**.  
Interactive API documentation is available at **http://localhost:8000/docs**.

---

### 4. Environment Variables

Create a `.env` file inside the `backend/` folder with the following contents:

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DB_NAME=sparkai

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Email (Gmail SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# OTP
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
```

**Gmail App Password:** Do not use your regular Gmail password. Go to  
Google Account → Security → 2-Step Verification → App Passwords and generate one.

**MongoDB Atlas:** Replace `MONGODB_URL` with your Atlas connection string:  
`mongodb+srv://<user>:<password>@cluster.mongodb.net`

**No email setup?** Enable test mode in `backend/app/otp_service.py` by setting  
`self.test_mode = True`. OTPs will be printed directly to the terminal instead.

---

### 5. Database Initialization

To seed a test user for development:

```bash
cd backend
python init_db.py
```

This creates the following account:

| Field | Value |
|---|---|
| Email | test@example.com |
| Password | test123 |
| Username | testuser |

---

## Running the App

Run both servers at the same time (in separate terminals):

**Terminal 1 — Frontend**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 — Backend**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

---

## API Reference

All routes are prefixed with `/api`. Base URL: `http://localhost:8000`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user, triggers OTP email |
| POST | `/api/auth/login` | Login and receive a JWT token |
| POST | `/api/auth/verify-otp` | Verify email with the OTP code |
| POST | `/api/auth/resend-otp` | Resend OTP to the registered email |
| POST | `/api/auth/forgot-password` | Request a password reset OTP |
| POST | `/api/auth/verify-reset-otp` | Verify the password reset OTP |
| POST | `/api/auth/reset-password` | Set a new password |

### User — requires `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get the current user's profile |
| PUT | `/api/users/me` | Update profile fields (name, course, theme, etc.) |

### To-Do — requires `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/todos` | Retrieve all todos for the current user |
| POST | `/api/todos` | Create a new todo item |
| PUT | `/api/todos/{todo_id}` | Update todo completion status |
| DELETE | `/api/todos/{todo_id}` | Delete a todo item |

### Friends & Messaging — requires `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/friends` | Add a friend using their SparkID |
| GET | `/api/messages` | Retrieve inbox messages |
| POST | `/api/messages` | Share an AI response with a friend |

---

## Pages & Navigation

| Page | Description |
|---|---|
| Home | Dashboard overview |
| Chat Bot | Access SparkChat, SparkCode, SparkExplore, and Sparky |
| To-Do | Personal task manager |
| Profile | User settings, avatar, and theme preferences |
| Inbox | Messages shared by friends |
| Saves | Saved AI responses |
| About | About the project |
| Login | Email and password login |
| Sign Up | Register with email OTP verification |
| Forgot Password | Reset password via OTP |

---

## Future Scope

- **Voice Interaction** — Hands-free communication with Sparky and SparkExplore.
- **Mobile Apps** — Native Android and iOS applications.
- **LMS Integration** — Connecting college assignments directly to SparkAI recommendations.
- **Multi-Language Support** — Expanding accessibility through regional language support.

---

## License


This project is licensed under the **SyntaXPixel Non-Commercial Copyleft License (SNCL-C v1.0)**.
Copyright (c) 2025 AJ (SyntaXPixel). All Rights Reserved.

You are allowed to use, modify, and distribute this software for **personal, academic, or non-commercial purposes only**, provided you follow these conditions:

- Credit the original author clearly — **AJ (SyntaXPixel)**
- Source: https://github.com/SyntaXPixel/SparkAI_Beta
- Keep this license file included and unchanged in all distributed versions.
- Any modified version you distribute must remain open source under this same license and include a documented changelog of your changes.

**Commercial use is strictly prohibited** without explicit written permission from the author.  
To request commercial use: ajinkya.syntax404@gmail.com

The software is provided "as is" without any warranty. The author is not liable for any damages or misuse resulting from its use.

For the full license terms, see the [LICENSE](./LICENSE) file.

This project was submitted in partial fulfillment of the requirements for the  
Department of Artificial Intelligence and Machine Learning.

