# 🌐 Loka — Radar-based Social Discovery App

Loka is a real-time, location-based social networking app inspired by Snap Map. Users appear as avatars on a radar UI, making it easy to discover people nearby based on distance, shared interests, and live status tags.

<p align="center">
  <img src="demo/screenshot_radar.png" alt="Loka Radar Screenshot" width="400"/>
</p>

---

## 🚀 Features

- 📍 **Live Location Tracking** – See nearby users on a smooth, concentric radar map.
- 🧭 **Radar UI** – Animated concentric circles with pulsing waves to enhance spatial awareness.
- 🧑‍🤝‍🧑 **Proximity-Based Avatars** – Non-overlapping, distance-accurate avatar placements.
- 🏷️ **Status Tags** – Users can set short tags like "at a concert" or "down to hang" visible on radar.
- 💬 **Chat Button** – Initiate a chat with anyone nearby (future full chat system pending).
- ⚙️ **Backend API** – Built with Node.js and PostgreSQL using RESTful principles.

---

## 🧱 Tech Stack

### 🖥️ Frontend
- React Native (Expo)
- React Navigation
- Context API

### 🛠️ Backend
- Node.js + Express
- PostgreSQL + PostGIS
- Sequelize ORM

### 🌐 Other
- Geolocation API
- JWT Auth (future)
- Socket.IO (planned for real-time chat)

---

## 🧪 Running the App Locally

### 🔧 Prerequisites
- Node.js (v18+)
- Expo CLI
- PostgreSQL (with PostGIS enabled)

---

### 📲 Frontend Setup (React Native)

```bash
git clone https://github.com/yourusername/loka-app.git
cd loka-app/frontend
npm install
npx expo start
