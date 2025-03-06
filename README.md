# 📲 WhatsApp AI Order Processing System - Webhook Integration

## 🚀 Overview  

This project integrates **WhatsApp Cloud API**, **OpenAI**, **MongoDB**, and **Pinecone vector database** to automate order processing and customer interactions via WhatsApp.  

The webhook endpoint is used to **receive and process messages** sent to your WhatsApp Business Account, enabling seamless customer communication and automated responses.  

**Note:** I used ngrok to host my localhost project publicly.

## ✨ Features  

- 📩 **Receive Incoming Messages** – Captures messages from WhatsApp Cloud API.  
- 🗄️ **Store Conversations** – Saves message history in MongoDB for reference and analysis.  
- 🤖 **AI-Powered Responses** – Uses OpenAI to generate intelligent replies.  
- 🛒 **Order & Inquiry Handling** – Manages product inquiries and order placements efficiently.  

---

## 📸 Screenshots  

![System Preview](https://github.com/user-attachments/assets/bfb4fbf4-8814-4996-ad4d-7032c6d982c1)  

📄 **Postman API Documentation:** [View Here](https://documenter.getpostman.com/view/40519609/2sAYdmknjb)  

---

## 🔧 Webhook Setup  

### **1️⃣ Webhook URL**  

The webhook endpoint for handling WhatsApp messages:  

```plaintext
https://your-ngrok-url/api/admin/webhook
