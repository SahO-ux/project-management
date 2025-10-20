# 🧩 Project Management Dashboard with AI Assistance

A full-stack **Project Management Dashboard** built using **React (Vite)**, **Node.js**, **Express**, and **MongoDB**, featuring **AI-powered summarization** and task insights.  
The app allows users to create projects, manage tasks through Kanban boards, and get instant summaries using an integrated AI assistant.

---

## 🚀 Features

- **Kanban Board Interface:** Organize tasks by stages (To Do, In Progress, Done).  
- **AI-Powered Summarization:** Generate concise summaries of project tasks using OpenAI.  
- **Interactive Dashboard:** Modern UI with animations and responsive layout.  
- **Task & Project CRUD:** Add, update, delete, and view projects and tasks.  
- **Backend Caching (NodeCache):** Improves performance of frequent summarization requests.  

---

## 🧱 Tech Stack

**Frontend**
- React + Vite  
- TailwindCSS  
- Axios  
- React Bootstrap  
- React Hot Toast  

**Backend**
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- NodeCache  
- OpenAI API (for summarization)  

---

## ⚙️ Project Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SahO-ux/project-management.git
cd project-management
```

---

### 2️⃣ Setup the Backend

- Provided you are under root directory (project-management), run the following commands:-

```bash
cd backend
npm install
```

- Create .env file in backend/ directory:
  ```bash
  PORT=8081
  MONGODB_URL=<your_mongodb_connection_string>
  GENAI_API_KEY=<YOUR_GEMINI_API_KEY>
  GENAI_MODEL=gemini-2.5-pro
  ```

- Run backend in development mode:
  ```bash
  npm run dev
  ```

- Backend runs on: http://localhost:8081

---

### 3️⃣ Setup the Frontend

- Provided you are under root directory (project-management), run the following commands:-

  ```bash
  cd ../frontend
  npm install
  ```

- Create .env file in frontend/ directory:
  ```bash
  VITE_API_URL="http://localhost:8081"
  ```

- Run frontend in development mode:
  ```bash
  npm run dev
  ```

- Frontend runs on: http://localhost:5173

---

## 📦 Build for Production

### Frontend
```bash
npm run build
```
- This creates an optimized production build in the dist/ folder.

### Backend
```bash
npm start
```

---

## 🧠 API Endpoints

|   Method   | Endpoint                     | Description                             |
| :--------: | :----------------------------| :---------------------------------------|
|   **POST** | `/ai/summarize/:projectId`   | Get AI summary for project              |
|   **POST** | `/ai/question/:projectId`    | Get AI answer of any question           |
|   **GET**  | `/project`                   | Fetch all projects                      |
|  **POST**  | `/project`                   | Create a new project                    |
|   **GET**  | `/project/:id`               | Get single project                      |
|  **PATCH** | `/project/:id`               | Update project                          |
| **DELETE** | `/project/:id`               | Delete project                          |
|  **POST**  | `/task`                      | Create a new task                       |
|  **GET**   | `/task/:projectId`           | Fetch all tasks created under a project |
|  **PATCH** | `/task/:id`                  | Update task                             |
| **DELETE** | `/task/:id`                  | Delete task                             |

---

## 🤖 AI Summarization Flow

- User clicks “AI Assist” button on the project board.
- A modal opens and user can then either click “Summarize All Tasks” button to get summary of all tasks associated with that project or enter any question in text area and click "Ask" to get answer.
- The system sends project/task details to the backend /ai/summarize & /ai/question endpoints repectively.
- Backend requests GEMINI API for summarized insight or answer to the question asked by user.
- The AI-generated summary and answer is displayed instantly within the modal.

---

## 📂 Folder Structure

project-management/
│
├── backend/
│   ├── index.js
│   ├── routes/
│   ├── mongoDB/
│   ├── server/
│         ├── lib/
│         ├── modules/
│                ├── AI/
│                ├── Project/
│                ├── Task/
│         ├── modules-loader.js
│   ├── utils/
│   └── .env
│   └── .gitignore
│   └── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── public/
│   │   ├── lib/
│   │        ├── api.js
│   │        ├── toast.js
│   │   ├── pages/
│   │        ├── ProjectBoard/
│   │        ├── ProjectsList/
│   │   ├── ui/
│   │        ├── AIPanel.jsx
│   │   └── App.jsx
│   │   └── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│   └── postcss.config.js
│   └── tailwind.config.js
│
└── README.md

---

## 👨‍💻 Author

- Sahil Akbari
- 📧 sahilakbari1111@gmail.com
- 📞 +91 7041849886

---


