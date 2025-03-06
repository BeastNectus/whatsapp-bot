// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";
// import Conversation from "../../../models/conversation";
// import Inventory from "../../../models/inventory";
// import { sendMessage } from "../../../services/whatsapp";
// import { processOrder } from "../../../services/order";
// import { normalizeItemName } from "../../../utils/normalize";
// import { initInventory } from "../../../utils/initInventory";
// import { Pinecone } from "@pinecone-database/pinecone";
// import OpenAI from "openai";
// import { franc } from "franc";

// // Environment variables
// const mongoDB = process.env.MONGODB_URI!;
// const VERIFY_TOKEN = "my-verify-token"; // Your verification token
// const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

// // In-memory context storage
// const userContext: Record<string, string> = {};

// // Connect to MongoDB
// const connectDB = async () => {
//   if (mongoose.connection.readyState >= 1) return;
//   await mongoose.connect(mongoDB);
// };

// // Initialize Pinecone
// const pinecone = new Pinecone({
//   apiKey: PINECONE_API_KEY,
// });
// const index = pinecone.Index("whatsapp-bot"); // Ensure this matches your Pinecone index name

// // Initialize OpenAI
// const openai = new OpenAI({
//   apiKey: OPENAI_API_KEY,
// });

// // Generate embeddings for a message
// async function generateEmbedding(text: string) {
//   const response = await openai.embeddings.create({
//     model: "text-embedding-ada-002",
//     input: text,
//   });
//   return response.data[0].embedding;
// }

// // Store conversation in Pinecone
// async function storeConversation(userId: string, message: string, embedding: number[]) {
//   try {
//     await index.upsert([
//       {
//         id: `${userId}-${Date.now()}`, // Unique ID for the conversation
//         values: embedding,
//         metadata: {
//           userId,
//           message,
//           timestamp: new Date().toISOString(),
//         },
//       },
//     ]);
//   } catch (error) {
//     console.error("Failed to store conversation in Pinecone:", error);
//     throw error;
//   }
// }

// // Retrieve relevant past conversations
// async function retrieveConversations(userId: string, embedding: number[], topK = 3) {
//   try {
//     const queryResponse = await index.query({
//       vector: embedding,
//       topK,
//       includeMetadata: true,
//       filter: { userId },
//     });
//     return queryResponse.matches?.map((match) => match.metadata?.message) || [];
//   } catch (error) {
//     console.error("Failed to retrieve conversations from Pinecone:", error);
//     throw error;
//   }
// }

// // Detect language of the message
// function detectLanguage(text: string) {
//   const languageCode = franc(text);
//   return languageCode === "und" ? "en" : languageCode; // Default to English if detection fails
// }

// // Get GPT response with language support
// async function getGPTResponse(prompt: string, language: string) {
//   const response = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: [
//       {
//         role: "system",
//         content: `You are a helpful assistant. Respond in ${language}.`,
//       },
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//   });
//   return { message: response.choices[0].message.content };
// }

// // Find item in inventory
// async function findInventoryItem(userInput: string) {
//   const normalized = normalizeItemName(userInput);
//   return await Inventory.findOne({
//     item: { $regex: new RegExp(normalized, "i") },
//   });
// }

// // List all available products
// async function listProducts() {
//   const products = await Inventory.find({ stock: { $gt: 0 } });
//   if (products.length === 0) {
//     return "😔 Sorry, there are no products available at the moment.";
//   }

//   let productList = "🛍️ *Here are the available products:*\n\n";
//   products.forEach((product, index) => {
//     productList += `👉 *${index + 1}. ${product.item}* - 💵 $${product.price} (📦 Stock: ${product.stock})\n`;
//   });
//   productList += "\n✨ Feel free to place an order or ask for more details! 😊";
//   return productList;
// }

// // Determine the response based on the message
// async function determineResponse(messages: any): Promise<string> {
//   const lowerCaseMessage = messages.text.body.toLowerCase();
//   const userId = messages.from;
//   const userMessage = messages.text.body;

//   const language = detectLanguage(userMessage);

//   try {
//     const embedding = await generateEmbedding(userMessage);
//     const pastConversations = await retrieveConversations(userId, embedding);
//     await storeConversation(userId, userMessage, embedding);

//     const context = pastConversations.join("\n");
//     const prompt = `Previous conversations:\n${context}\n\nCurrent message: ${userMessage}`;

//     if (lowerCaseMessage.includes("list products") || lowerCaseMessage.includes("show products")) {
//       return await listProducts();
//     }

//     if (lowerCaseMessage.includes("do you have")) {
//       const itemQuery = lowerCaseMessage.match(/do you have (.+)/);
//       const itemName = itemQuery ? itemQuery[1].trim() : "";
//       const requestedItem = await findInventoryItem(itemName);

//       if (requestedItem) {
//         userContext[userId] = requestedItem.item;
//         return requestedItem.stock > 0
//           ? `Yes, we have ${requestedItem.stock} ${requestedItem.item} in stock. Would you like to place an order?`
//           : `Sorry, the ${requestedItem.item} is out of stock.`;
//       } else {
//         return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
//       }
//     }

//     if (lowerCaseMessage.includes("what's the price") || lowerCaseMessage.includes("price of")) {
//       const itemQuery = lowerCaseMessage.match(/(?:what's the price|price of) (.+)/);
//       let itemName = itemQuery ? itemQuery[1].trim() : "";

//       if (!itemName && userContext[userId]) {
//         itemName = userContext[userId];
//       }

//       const requestedItem = await findInventoryItem(itemName);

//       if (requestedItem) {
//         return `The ${requestedItem.item} costs $${requestedItem.price}.`;
//       } else {
//         return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
//       }
//     }

//     if (lowerCaseMessage.includes("order")) {
//       const orderQuery = lowerCaseMessage.match(/order (\d+)?\s*(.+)/);
//       const quantity = orderQuery ? parseInt(orderQuery[1]) || 1 : 1;
//       const itemName = orderQuery ? orderQuery[2].trim() : "";

//       const requestedItem = await findInventoryItem(itemName);

//       if (requestedItem) {
//         const orderResult = await processOrder(userId, requestedItem.item, quantity);
//         return orderResult.message;
//       } else {
//         return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
//       }
//     }

//     const gptResponse = await getGPTResponse(prompt, language);
//     return gptResponse.message || "Sorry, I couldn't process your request. Please try again.";
//   } catch (error) {
//     console.error("Error in determineResponse:", error);
//     return "Sorry, I encountered an error while processing your request. Please try again.";
//   }
// }

// // ✅ **GET Request - Webhook Verification**
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const mode = searchParams.get("hub.mode");
//   const token = searchParams.get("hub.verify_token");
//   const challenge = searchParams.get("hub.challenge") || "";

//   if (mode === "subscribe" && token === VERIFY_TOKEN) {
//     return new Response(challenge, { status: 200 });
//   }
//   return new Response("Unauthorized", { status: 403 });
// }

// // ✅ **POST Request - Handle Incoming Messages**
// export async function POST(req: NextRequest) {
//   await connectDB();
//   await initInventory();

//   try {
//     const body = await req.json();
//     console.log("Webhook payload:", JSON.stringify(body, null, 2));

//     const entry = body.entry?.[0];
//     const changes = entry?.changes?.[0]?.value;

//     if (changes?.messages) {
//       const message = changes.messages[0];

//       if (message) {
//         const messageId = message.id;
//         const senderId = message.from;
//         const messageText = message.text.body;

//         console.log("Received message ID:", messageId);
//         console.log("Sender ID:", senderId);
//         console.log("Message text:", messageText);

//         // Start a MongoDB session for atomic operations
//         const session = await mongoose.startSession();
//         session.startTransaction();

//         try {
//           // Check if this message already exists in the database
//           const existingMessage = await Conversation.findOne({ messageId }).session(session).exec();
//           console.log("Query result for messageId:", messageId, "is:", existingMessage);

//           if (existingMessage) {
//             console.log("Duplicate message detected. Ignoring. Message ID:", messageId);
//             await session.abortTransaction();
//             return new Response("OK", { status: 200 });
//           }

//           // Save the new conversation
//           await new Conversation({
//             senderId,
//             message: messageText,
//             messageId,
//             timestamp: new Date(),
//           }).save({ session });

//           // Commit the transaction
//           await session.commitTransaction();

//           // Check if this is the first message from the user
//           const previousMessages = await Conversation.find({ senderId }).exec();
//           if (previousMessages.length === 1) {
//             // Send the first message to the user
//             const firstMessage = "Welcome! To get started, please type 'Get started'.";
//             await sendMessage(senderId, firstMessage);
//           } else if (messageText.toLowerCase() === "get started") {
//             // Send the welcome message and list of available commands
//             const welcomeMessage = 
//               `🎉 Welcome to our shop! 🛍️\n\n` +
//               `I'm here to assist you with your shopping. Here’s what you can do:\n\n` +
//               `📌 *Available Commands & Examples:*\n\n` +
//               `1️⃣ *List all products:* 🏷️\n` +
//               `   👉 Type: *List products*\n\n` +
//               `2️⃣ *Check if an item is in stock:* 🔎\n` +
//               `   👉 Type: *Do you have iPhone 15?*\n\n` +
//               `3️⃣ *Get the price of an item:* 💰\n` +
//               `   👉 Type: *What's the price of iPhone 15?*\n\n` +
//               `4️⃣ *Place an order:* 🛒\n` +
//               `   👉 Type: *Order 2 iPhone 15*\n\n` +
//               `✨ Feel free to ask anything! Happy shopping! 😊`;
//             await sendMessage(senderId, welcomeMessage);
//           } else {
//             // Process the user's message
//             const responseMessage = await determineResponse(message);
//             await sendMessage(senderId, responseMessage);
//           }
//         } catch (error) {
//           // Abort the transaction on error
//           if (session.inTransaction()) {
//             await session.abortTransaction();
//           }
//           console.error("Transaction error:", error);
//           throw error;
//         } finally {
//           // End the session
//           session.endSession();
//         }
//       }
//     }

//     return new Response("OK", { status: 200 });
//   } catch (error) {
//     console.error("Webhook error:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }