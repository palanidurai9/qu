# Quantum Machine Learning (QML) Binary Classification Platform

A production-ready full-stack web application for performing Binary Classification using a Variational Quantum Classifier (VQC). This project provides a scalable foundation for deploying hybrid classical-quantum machine learning models using Qiskit, FastAPI, and React.

## 📁 Project Structure

```text
/Qu
├── docker-compose.yml       # Production/Local orchestration
├── README.md                # Documentation and scaling guide
├── backend/
│   ├── main.py              # FastAPI application entrypoint
│   ├── requirements.txt     # Python dependencies (Qiskit, FastAPI, etc.)
│   ├── Dockerfile           # Backend container definition
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py        # REST Controllers (upload, train-quantum, train-classical)
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic validation schemas
│   └── services/
│       ├── __init__.py
│       ├── data_service.py      # Preprocessing, normalization, and splits
│       ├── qml_service.py       # Qiskit VQC implementation (Aer Simulator)
│       └── classical_service.py # Baseline Logistic Regression comparison
└── frontend/
    ├── index.html           # Vite HTML entry
    ├── package.json         # Node definitions
    ├── vite.config.js       # Vite configuration
    ├── tailwind.config.js   # Tailwind aesthetic theming
    ├── postcss.config.js
    ├── Dockerfile           # Frontend container definition
    └── src/
        ├── main.jsx         # React root
        ├── App.jsx          # Main application and state management
        ├── index.css        # Global CSS / Tailwind directives
        ├── components/
        │   ├── UploadForm.jsx    # CSV parsing, UI selection
        │   └── Visualization.jsx # Recharts comparison logic
        └── services/
            └── api.js       # Axios handlers bridging to FastAPI
```

## 🚀 Setup Instructions (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Docker & Docker Compose (optional but recommended)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API runs on `http://localhost:8000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard runs on `http://localhost:3000`

---

## 🐳 Docker Setup

To spin up the entire application stack:

```bash
cd Qu
docker-compose up --build
```
This isolates the Qiskit environment logically and runs the frontend dynamically. 

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

---

## ☁️ Deployment Guide (AWS / GCP)

This stack is fundamentally designed around containerization, making deployment straightforward using native cloud services.

### Option A: Fully Managed (Recommended: Google Cloud Run / AWS AppRunner)
1. **Push Images**: Map the `backend` and `frontend` Dockerfiles to Google Artifact Registry or AWS ECR.
2. **Deploy Backend**: 
   - Deploy image to **Cloud Run** or **AppRunner**.
   - Ensure the allocated memory is at least **2GB-4GB** to prevent out-of-memory errors when generating complex Qiskit simulator circuits.
3. **Deploy Frontend**:
   - For Cloud Run/App Runner: Deploy the frontend Docker image. Override the `VITE_API_URL` environment variable to point to the backend's public URL.
   - For Serverless Edge: Run `npm run build` locally or in CI/CD and deploy the `/dist` folder to AWS S3/Cloudfront or Vercel.

### Option B: Virtual Machine (EC2 / Compute Engine)
1. Provision a VM (e.g., Ubuntu 22.04) and map port `80` and `443` internally.
2. Install `docker` and `docker-compose`.
3. Clone the repository and run `docker-compose up -d`.
4. *Scale note*: Setup **NGINX** as a reverse proxy over the backend and frontend to handle domain routing and SSL (Let's Encrypt).

---

## ⚠️ Real-World Quantum Limitations (Crucial Context)

- **Qubits Constraint**: Currently limited to max **8 features** via the UI. Simulating more than 20 qubits exponentially consumes RAM on classical hardware (Aer Simulator). 
- **Training Times**: Parameterized quantum circuits (VQC) using classical optimizers (like COBYLA) require evaluating the circuit hundreds of times. Expect longer iteration times compared to standard scikit-learn algorithms.
- **Quantum Advantage**: Aer Simulation merely visualizes and replicates theoretical quantum math. We are not utilizing real QPU hardware (like IBM Quantum) in this baseline. Production implementations seeking quantum advantage would eventually route via IBM Quantum Runtime APIs while awaiting Fault-Tolerant Quantum Computing. 
