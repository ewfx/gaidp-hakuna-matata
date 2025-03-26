# 🚀 Gen-AI Powered Data Profiling and Validation System
   TEAM: Hakuna Matata

## 📌 Table of Contents
- [Introduction](#introduction)
- [Demo](#demo)
- [Inspiration](#inspiration)
- [What It Does](#what-it-does)
- [How We Built It](#how-we-built-it)
- [Challenges We Faced](#challenges-we-faced)
- [How to Run](#how-to-run)
- [Tech Stack](#tech-stack)
- [Team](#team)

---

## 🎯 Introduction
Regulatory reporting in the banking sector involves compiling vast amounts of data to meet compliance requirements. A critical aspect of this process is data profiling, which ensures that the reported data aligns with regulatory reporting instructions. Traditionally, this involves manually defining profiling rules based on the underlying data and regulatory requirements. This solution aims to automate data profiling using Generative AI (LLMs) and unsupervised machine learning techniques.

## 🎥 Demo
🔗 [Presentation](#)  
🖼️ Screenshots:

![Screenshot 1](link-to-image)

## 💡 Inspiration
In a nutshell, this solution is born from frustration with manual processes + inspired by AI’s potential to turn regulations into "living" validation systems.

## ⚙️ What It Does
1. **Document Processing & Rule Extraction** - 
2. **Auto-Generated Validation Code**
3. **Data Validation Engine**
4. **AI-Powered Remediation**
5. **User-Friendly Interface (React Frontend)**
6. **Scalable Backend (Flask API)**

## 🛠️ How We Built It
1. Started with Research (Googled Everything!)
- Read Hugging Face documentation to understand their free AI API
- Looked for resources to understand the flow of project
- Once we understood the flow, we broke into parts and started building them
  
2. Built the Backend First
- Created a simple Flask server with routes.
- Used SQLite because it's the easiest database (just one file!)
- Tested everything with Postman before touching the frontend

3. Added the AI Magic
- Signed up for Hugging Face's free tier
- Used their example code for Mistral-7B and modified it
- Prompt tuning after lots of trial-and-error with the model

4. Created the Frontend
   
5. Connected Both Parts
- Added Axios in React to call our Flask API
- Fixed CORS errors
- Made sure the backend and frontend could talk to each other

## 🚧 Challenges We Faced
1. **API & Model Limitations**
2. **Prompt Engineering & Output Accuracy**
3. **Backend-Frontend Integration**

## 🏃 How to Run
1. Clone the repository  
   ```sh
   git clone https://github.com/your-repo.git
   ```
2. Install dependencies (Frontend)
   ```sh
   cd gaidp-hakuna-matata/code/src/frontend
   npm install
   ```
3. Install dependencies (Backend)
   ```sh
   cd gaidp-hakuna-matata/code/src/backend
   pip install -r requirements.txt
   ```
4. Run the project (Frontend)  
   ```sh
   npm start
   ```
5. Run the project (Backend)
   ```sh
   python app.py
   ```

## 🏗️ Tech Stack
- 🔹 Frontend: React 
- 🔹 Backend: Flask
- 🔹 Database: Sqlite3
- 🔹 Other: Hugging Face API, Minstral-7B model

## 👥 Team
- **Teammate 1** - Neel Thakker [GitHub](#) | [LinkedIn](#)
- **Teammate 2** - Parva Patel [GitHub](#) | [LinkedIn](#)
- **Teammate 3** - Anshoo Rajput [GitHub](#) | [LinkedIn](#)
- **Teammate 4** - Mona Gupta [GitHub](#) | [LinkedIn](#)
