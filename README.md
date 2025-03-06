# 📲 WhatsApp AI Order Processing System - Webhook Integration

## 🚀 Overview  

This project integrates **WhatsApp Cloud API**, **OpenAI**, **MongoDB**, and **Pinecone vector database** to automate order processing and customer interactions via WhatsApp.  

The webhook endpoint is used to **receive and process messages** sent to your WhatsApp Business Account, enabling seamless customer communication and automated responses.  

---

## ⚠️ Important Note  

**This project uses ngrok to expose the localhost server publicly for webhook communication.**  
Since WhatsApp Cloud API requires a **public URL** to receive webhook events, **ngrok is used to create a secure tunnel** to the local development environment.  

---

## ✨ Features  

- 📩 **Receive Incoming Messages** – Captures messages from WhatsApp Cloud API.  
- 🗄️ **Store Conversations** – Saves message history in MongoDB for reference and analysis.  
- 🤖 **AI-Powered Responses** – Uses OpenAI to generate intelligent replies.  
- 🛒 **Order & Inquiry Handling** – Manages product inquiries and order placements efficiently.  

---

## 🎥 Video Project Demonstration  

**Link:** [Watch Here](https://drive.google.com/file/d/1i1OxbHqiaC0RVuhrh1tcw2HYOWyoghWo/view?usp=sharing)  

---

## 📸 Screenshots  

![System Preview](https://github.com/user-attachments/assets/bfb4fbf4-8814-4996-ad4d-7032c6d982c1)  

📄 **Postman API Documentation:** [View Here](https://documenter.getpostman.com/view/40519609/2sAYdmknjb)  

---

## 🔧 Environment Setup  

### **1️⃣ Install Dependencies**  

Before running the project, navigate to the project directory and install dependencies using:  

```bash
npm install

### **1️2️⃣ Run this project**  

```bash
npm run dev
npm run ngrok
