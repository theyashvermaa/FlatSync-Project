# 🏢 FlatSync — AI-Powered Flatmate & Housing Matcher

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **FlatSync** is a full-stack, AI-driven platform designed to connect students and working professionals with compatible flatmates and verified flat listings. By leveraging **Google Gemini AI** for lifestyle compatibility matching, interactive map exploration, and real-time chat with online status indicators, FlatSync revolutionizes the shared housing experience.

---

## 🌟 Key Features

### 🤖 1. AI-Powered Lifestyle Compatibility Matching
- **Gemini 1.5 Flash Integration**: Analyzes multi-dimensional user preferences—including cleanliness standards, sleep schedules, work routines, dietary habits, noise tolerance, smoking/drinking, and expense sharing.
- **Match Score Engine**: Generates a percentage score (0–100%), a concise summary breakdown, and key shared trait highlight badges.
- **Real-Time SSE Streaming**: Supports Server-Sent Events (SSE) to stream Gemini AI compatibility responses dynamically to the frontend.
- **Intelligent Fallback**: Algorithmic fallback matching ensures score availability even when profile details are sparse or API calls fail.

### 🗺️ 2. Flat Listings & Interactive Map Search
- **Visual Property Search**: Explore detailed property cards with budget filters, room types, gender preferences, location, and available amenities.
- **Google Maps & Leaflet Integration**: View property listings geographically with interactive markers and location highlights.
- **Listing Management**: Post, update, or remove flat listings complete with photo galleries and contact options.

### 💬 3. Real-Time WebSockets Chat
- **Instant Messaging**: Powered by **Socket.io** for real-time 1-on-1 conversations between flat seekers and listers.
- **Presence Indicators**: Live online/offline status badges updated across sessions.
- **Read Receipts & Deletion**: Real-time `seen` markers with timestamp updates and message deletion capabilities.
- **Instant Notifications**: Real-time notification banners for unread messages and incoming flatmate connection requests.

### ✨ 4. Interactive Onboarding & Apple-Grade UI/UX
- **Multi-Step Onboarding Quiz**: Interactive questionnaire guiding users to set up comprehensive lifestyle profiles.
- **Smooth GSAP Animations**: Engaging scroll-triggered animations and storytelling components powered by GreenSock (GSAP).
- **Profile Completion Nudge Banner**: Visual cues prompting users to complete missing preferences to unlock higher accuracy AI matches.

### 📸 5. Cloud Media Uploads & Secure Auth
- **Cloudinary Storage**: High-performance image upload pipeline for profile avatars and property listing photos.
- **JWT & Bcrypt Security**: Password hashing with `bcryptjs` and stateless JWT-driven API authentication.

---

## 📂 Project Architecture

```
FlatSync Project/
├── client/                     # Frontend Application (React 19 + Vite)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Brand logos & graphics
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Chat/           # Real-time chat windows & conversation lists
│   │   │   ├── AppleScrollStory.jsx   # Interactive GSAP presentation
│   │   │   ├── MatchScoreBadge.jsx    # AI score display & breakdown badge
│   │   │   ├── ListingModal.jsx       # Property preview modal
│   │   │   └── Navbar.jsx             # Responsive navigation bar
│   │   ├── context/            # AuthContext & global user state
│   │   ├── pages/              # App routes (Home, FindFlat, ListFlat, Onboarding, Profile, Chats)
│   │   ├── utils/              # Axios instance & helper functions
│   │   ├── App.jsx             # Main Router configuration
│   │   ├── index.css           # Design tokens & Tailwind CSS imports
│   │   └── main.jsx            # Application entry point
│   ├── .env                    # Client environment configuration
│   └── package.json            # Client dependencies & scripts
│
└── server/                     # Backend Application (Node.js + Express)
    ├── config/                 # Database configuration (MongoDB Mongoose connection)
    ├── controllers/            # Request handlers (auth, listings, match, messages, requests, users)
    ├── middlewares/            # JWT authentication & Multer file upload handlers
    ├── models/                 # Mongoose schemas (User, Listing, Request, Message, MatchScore)
    ├── routes/                 # Express API endpoint definitions
    ├── services/               # Gemini AI compatibility service logic
    ├── socket.js               # Socket.io server connection & event handlers
    ├── seedData.js             # Initial database seed script
    ├── server.js               # Main HTTP & WebSocket server entry point
    ├── .env                    # Server environment variables
    └── package.json            # Backend dependencies & scripts
```

---

## 🛠 Tech Stack

### **Frontend**
| Technology | Description |
| :--- | :--- |
| **React 19** | UI library for component-driven architecture |
| **Vite 8** | Next-generation frontend build tool |
| **Tailwind CSS v4** | Utility-first CSS framework for modern styling |
| **GSAP** | GreenSock Animation Platform for complex UI interactions |
| **Socket.io Client** | Real-time WebSocket communications |
| **Leaflet & Google Maps** | Interactive map rendering & location visualization |
| **Lucide React** | Clean, responsive UI icons |
| **React Router v7** | Client-side routing management |
| **React Hot Toast** | Premium toast notifications |

### **Backend**
| Technology | Description |
| :--- | :--- |
| **Node.js** | JavaScript runtime environment |
| **Express.js 5** | Web framework for REST APIs |
| **MongoDB Atlas** | Cloud NoSQL database |
| **Mongoose 9** | ODM for MongoDB schema modeling |
| **Google GenAI SDK** | `@google/genai` interface for Gemini 1.5 Flash AI |
| **Socket.io 4** | WebSocket engine for real-time messaging |
| **Cloudinary SDK** | Cloud storage & image optimization engine |
| **JWT & Bcrypt** | Security token signing & password hashing |

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have the following installed / configured:
- **Node.js** (`v18.0.0` or higher) & **npm** (`v9.0.0` or higher)
- **MongoDB Database** (Local MongoDB server or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- **Google Gemini API Key** (Obtain from [Google AI Studio](https://aistudio.google.com/))
- **Cloudinary Account** (Obtain Cloud Name, API Key, and API Secret from [Cloudinary Dashboard](https://cloudinary.com/))

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/theyashvermaa/FlatSync-Project.git
cd FlatSync-Project
```

---

### Step 2: Configure & Run the Backend (`server`)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file inside the `server/` directory:
   ```env
   # Server Port
   PORT=5000

   # MongoDB Connection String
   MONGO_URI=your_mongodb_connection_string

   # JSON Web Token Secret
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary Media Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key

   # Client URL for CORS
   CLIENT_URL=http://localhost:5173
   ```

4. *(Optional)* Seed sample data into MongoDB:
   ```bash
   node seedData.js
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

---

### Step 3: Configure & Run the Frontend (`client`)

1. Open a new terminal tab and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file inside the `client/` directory:
   ```env
   # Backend API URL
   VITE_API_URL=http://localhost:5000/api

   # Google Maps API Key (Optional for Google Maps rendering)
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The client application will run on `http://localhost:5173`.*

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch currently logged-in user profile |

### 👤 Users & Preferences (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Protected | Get detailed user profile |
| `PUT` | `/api/users/profile` | Protected | Update profile & lifestyle preferences |
| `POST` | `/api/users/avatar` | Protected | Upload profile photo to Cloudinary |

### 🏠 Flat Listings (`/api/listings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/listings` | Public | Search & list all flats with filter queries |
| `GET` | `/api/listings/:id` | Public | Get single flat listing details |
| `POST` | `/api/listings` | Protected | Create a new flat listing |
| `PUT` | `/api/listings/:id` | Protected | Update owned flat listing |
| `DELETE` | `/api/listings/:id` | Protected | Remove owned flat listing |

### 🤖 Gemini AI Match (`/api/match`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/match/calculate` | Protected | Compute AI compatibility score between two profiles |
| `GET` | `/api/match/stream/:targetId` | Protected | Stream AI match evaluation via Server-Sent Events (SSE) |

### 🤝 Connection Requests (`/api/requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests/send` | Protected | Send flatmate connection request |
| `GET` | `/api/requests` | Protected | List incoming & outgoing requests |
| `PUT` | `/api/requests/:id/respond` | Protected | Accept or reject connection request |

### 💬 Messaging (`/api/messages`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/messages/conversations` | Protected | Fetch active user chat conversations |
| `GET` | `/api/messages/:roomId` | Protected | Fetch chat message history for room |

---

## ⚡ WebSockets Protocol (Socket.io)

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join_room` | Client ➔ Server | `roomId` | Join a specific chat room session |
| `send_message` | Client ➔ Server | `{ roomId, senderId, receiverId, text }` | Send a chat message |
| `receive_message` | Server ➔ Client | `MessageObject` | Receive new message in active room |
| `mark_seen` | Client ➔ Server | `{ roomId, readerId }` | Update unread status to seen |
| `delete_message` | Client ➔ Server | `{ roomId, messageId }` | Delete a message permanently |
| `user_online` | Server ➔ Client | `userId` | Broadcast user online state |
| `user_offline` | Server ➔ Client | `userId` | Broadcast user offline state |

---

## 👥 Development Team

This project was built and engineered by **2 core team members**:

| Member | Role | Responsibilities |
| :--- | :--- | :--- |
| **Yash Verma** | Core Platform & Matching | Architect of AI matching algorithms, socket real-time engine, and core frontend layout. |
| **Tarang Kumar Srivastava** | Engagement & Location | Engineered location-based search, interactive maps integration, and user engagement features. |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by <strong>FlatSync Team (Yash Verma & Tarang Kumar Srivastava)</strong>
</p>
