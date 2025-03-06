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

## 📸 Screenshots  

![System Preview](https://github.com/user-attachments/assets/bfb4fbf4-8814-4996-ad4d-7032c6d982c1)  

📄 **Postman API Documentation:** [View Here](https://documenter.getpostman.com/view/40519609/2sAYdmknjb)  

---

## 🔧 Environment Setup  

### **1️⃣ Create a `.env` File**  

Before running the project, create a `.env` file in the root directory and add the following:  

```plaintext
# OpenAI API Key
OPENAI_API_KEY="your-openai-api-key"

# MongoDB Connection
MONGODB_URI="your-mongodb-connection-string"

# WhatsApp API Credentials
WHATSAPP_PHONE_NUMBER="your-whatsapp-phone-number"
WHATSAPP_TOKEN="your-whatsapp-api-token"

# Pinecone Vector Database Credentials
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="your-pinecone-index-name"
PINECONE_ENVIRONMENT="your-pinecone-environment"
