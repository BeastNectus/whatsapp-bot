// import { detectLanguage } from "../utils/detectlanguage";
// import { generateEmbedding } from "../ai/embeddings";
// import { storeConversation, retrieveConversations, retrievePastOrders } from "../services/pinecone";
// import { listProducts, suggestAvailableItems, findInventoryItem } from "../utils/inventory";
// import { getGPTResponse } from "../ai/openai";
// import { normalizeItemName } from "../utils/normalize";
// import { processOrder } from "./order";

// export const determineResponse = async (messages: any): Promise<string> => {
//     const lowerCaseMessage = messages.text.body.toLowerCase();
//     const userId = messages.from;
//     const userMessage = messages.text.body;
//     const userContext: Record<string, string> = {};
  
//     const language = detectLanguage(userMessage);
  
//     try {
//       const embedding = await generateEmbedding(userMessage);
  
//       // Check if the user is asking about a past order
//       if (
//         lowerCaseMessage.includes("ordered") &&
//         (lowerCaseMessage.includes("before") || lowerCaseMessage.includes("last time"))
//       ) {
//         // Retrieve past orders
//         const pastOrders = await retrievePastOrders(userId, embedding);
  
//         // Get the item from the context (e.g., "iPhone 15")
//         const itemInContext = userContext[userId];
  
//         if (itemInContext && pastOrders.length > 0) {
//           // Check if the item in context matches any past orders
//           const matchingOrder = pastOrders.find((order) => order.toLowerCase().includes(itemInContext.toLowerCase()));
        
//           if (matchingOrder) {
//             const requestedItem = await findInventoryItem(matchingOrder);
        
//             if (requestedItem) {
//               // Check if the item is in stock
//               if (requestedItem.stock > 0) {
//                 return `Yes! You previously ordered ${matchingOrder}. We have more in stock. Would you like to order again?`;
//               } else {
//                 const suggestionMessage = await suggestAvailableItems();
//                 return `Yes! You previously ordered ${matchingOrder}. However, it is currently out of stock. We will notify you when it's back in stock.\n\n${suggestionMessage}`;
//               }
//             } else {
//               const suggestionMessage = await suggestAvailableItems();
//               return `Sorry, the ${matchingOrder} is currently out of stock.\n\n${suggestionMessage}`;
//             }
//           } else {
//             return `I couldn't find any past orders for ${itemInContext}. Would you like to place a new order?`;
//           }
//         } else {
//           return "I couldn't find any past orders. Would you like to place a new order?";
//         }
//       }
  
//       // Fallback if Pinecone is unavailable
//       let pastConversations: string[] = [];
//       try {
//         pastConversations = await retrieveConversations(userId, embedding);
//         await storeConversation(userId, userMessage, embedding);
//       } catch (error) {
//         console.error("Pinecone error:", error);
//         // Continue without Pinecone data
//       }
  
//       const context = pastConversations.join("\n");
//       const prompt = `Previous conversations:\n${context}\n\nCurrent message: ${userMessage}`;
  
//       if (lowerCaseMessage.includes("list products") || lowerCaseMessage.includes("show products")) {
//         return await listProducts();
//       }
  
//       if (lowerCaseMessage.includes("do you have")) {
//         const itemQuery = lowerCaseMessage.match(/do you have (.+)/);
//         const itemName = itemQuery ? itemQuery[1].trim() : "";
//         const requestedItem = await findInventoryItem(itemName);
//         const suggestionMessage = await suggestAvailableItems();
//         if (requestedItem) {
//           // Store the item in context
//           userContext[userId] = requestedItem.item;
  
//           return requestedItem.stock > 0
//             ? `Yes, we have ${requestedItem.stock} ${requestedItem.item} in stock. Would you like to place an order?`
//             : `Sorry, the ${requestedItem.item} is out of stock.\n\n${suggestionMessage}`;
//         } else {
//           return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
//         }
//       }
  
//       if (lowerCaseMessage.includes("what's the price of") || lowerCaseMessage.includes("whats the price of") || lowerCaseMessage.includes("price of")) {
//         const itemQuery = lowerCaseMessage.match(/(?:what's the price of|whats the price of|price of) (.+)/);
//         let itemName = itemQuery ? itemQuery[1].trim() : "";
  
//         if (!itemName && userContext[userId]) {
//           itemName = userContext[userId];
//         }
  
//         const requestedItem = await findInventoryItem(itemName);
  
//         if (requestedItem) {
//           const normalizedRequestedItem = normalizeItemName(requestedItem.item);
//           const normalizedUserInput = normalizeItemName(itemName);
  
//           if (normalizedRequestedItem === normalizedUserInput) {
//             return `The ${requestedItem.item} costs $${requestedItem.price}.`;
//           } else {
//             return `I found a similar item: ${requestedItem.item}. It costs $${requestedItem.price}.`;
//           }
//         } else {
//           return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
//         }
//       }
  
//       if (lowerCaseMessage.includes("order") && !lowerCaseMessage.includes("before") && !lowerCaseMessage.includes("last time")) {
//         const orderQuery = lowerCaseMessage.match(/order (\d+)?\s*(.+)/);
//         const quantity = orderQuery ? parseInt(orderQuery[1]) || 1 : 1;
//         const itemName = orderQuery ? orderQuery[2].trim() : "";
  
//         const requestedItem = await findInventoryItem(itemName);
  
//         if (requestedItem) {
//           const orderResult = await processOrder(userId, requestedItem.item, quantity);
  
//           // Store the order in Pinecone
//           await storeConversation(userId, userMessage, embedding, { order: requestedItem.item });
  
//           return orderResult.message;
//         } else {
//           return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
//         }
//       }
  
//       // const gptResponse = await getGPTResponse(prompt, language);
//       // return gptResponse.message || "Sorry, I couldn't process your request. Please try again.";
  
//       const commandsMessage = 
//       `📌 *Available Commands & Examples:*\n\n` +
//       `1️⃣ *List all products:* 🏷️\n` +
//       `   👉 Type: *List products*\n\n` +
//       `2️⃣ *Check if an item is in stock:* 🔎\n` +
//       `   👉 Type: *Do you have iPhone 15?*\n\n` +
//       `3️⃣ *Get the price of an item:* 💰\n` +
//       `   👉 Type: *What's the price of iPhone 15?*\n\n` +
//       `4️⃣ *Place an order:* 🛒\n` +
//       `   👉 Type: *Order 2 iPhone 15*\n\n` +
//       `✨ Feel free to ask anything! Happy shopping! 😊`;
  
//       return `Sorry, I didn't understand that. Please use one of this available commands.\n\n${commandsMessage}`;
//     } catch (error) {
//       console.error("Error in determineResponse:", error);
//       return "Sorry, I encountered an error while processing your request. Please try again.";
//     }
// };