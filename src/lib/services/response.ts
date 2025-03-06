import { detectLanguage } from "../utils/detectlanguage";
import { generateEmbedding } from "../ai/embeddings";
import { storeConversation, retrieveConversations, retrievePastOrders } from "../services/pinecone";
import { listProducts, suggestAvailableItems, findInventoryItem } from "../utils/inventory";
import { getGPTResponse } from "../ai/openai";
import { normalizeItemName } from "../utils/normalize";
import { processOrder } from "./order";

export const determineResponse = async (messages: any): Promise<string> => {
    try {
        const lowerCaseMessage = messages.text.body.toLowerCase();
        const userId = messages.from;
        const userMessage = messages.text.body;
        const userContext: Record<string, string> = {};

        const language = detectLanguage(userMessage);
        const embedding = await generateEmbedding(userMessage);

        // Handle past orders query
        if (
          lowerCaseMessage.includes("ordered") &&
          (lowerCaseMessage.includes("before") || lowerCaseMessage.includes("last time"))
        ) {
          // Retrieve past orders
          const pastOrders = await retrievePastOrders(userId);
        
          if (pastOrders.length > 0) {
            // Get the most recent order
            const mostRecentOrder = pastOrders[0];

            const requestedItem = await findInventoryItem(mostRecentOrder.item);
        
            // Format the date
            const orderDate = new Date(mostRecentOrder.timestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
        
            if (requestedItem && requestedItem.stock > 0) {
              return `Yes! You ordered ${mostRecentOrder.quantity} ${mostRecentOrder.item}(s) on ${orderDate}. Would you like to order again?`;
            } else {
              const suggestionMessage = await suggestAvailableItems();
              return `Yes! You previously ordered ${mostRecentOrder.item}. However, it is currently out of stock. We will notify you when it's back in stock.\n\n${suggestionMessage}`;
            }
          } else {
            return "I couldn't find any past orders. Would you like to place a new order?";
          }
        }

        // Retrieve past conversations if available
        let pastConversations: string[] = [];
        try {
            pastConversations = await retrieveConversations(userId, embedding);
            await storeConversation(userId, userMessage, embedding);
        } catch (error) {
            console.error("Pinecone error:", error);
        }

        const context = pastConversations.join("\n");
        const prompt = `Previous conversations:\n${context}\n\nCurrent message: ${userMessage}`;

        // Handle product listing
        if (lowerCaseMessage.includes("list products") || lowerCaseMessage.includes("show products")) {
            return await listProducts();
        }

        // Handle item availability query
        if (lowerCaseMessage.includes("do you have")) {
            const itemQuery = lowerCaseMessage.match(/do you have (.+)/);
            const itemName = itemQuery ? itemQuery[1].trim() : "";
            const requestedItem = await findInventoryItem(itemName);
            
            if (requestedItem) {
                userContext[userId] = requestedItem.item;
                return requestedItem.stock > 0
                    ? `Yes, we have ${requestedItem.stock} ${requestedItem.item} in stock. Would you like to place an order?`
                    : `Sorry, the ${requestedItem.item} is out of stock.\n\n${await suggestAvailableItems()}`;
            }
            return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
        }

        // Handle price inquiry
        if (/price of|what's the price of|whats the price of/.test(lowerCaseMessage)) {
            const itemQuery = lowerCaseMessage.match(/(?:what's the price of|whats the price of|price of) (.+)/);
            let itemName = itemQuery ? itemQuery[1].trim() : userContext[userId];

            if (!itemName) return `Please specify an item to check the price.`;

            const requestedItem = await findInventoryItem(itemName);
            if (requestedItem) {
                return `The ${requestedItem.item} costs $${requestedItem.price}.`;
            }
            return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
        }

        // Handle placing an order
        if (lowerCaseMessage.includes("order") && !lowerCaseMessage.includes("before") && !lowerCaseMessage.includes("last time")) {
            const orderQuery = lowerCaseMessage.match(/order (\d+)?\s*(.+)/);
            const quantity = orderQuery ? parseInt(orderQuery[1]) || 1 : 1;
            const itemName = orderQuery ? orderQuery[2].trim() : "";

            const requestedItem = await findInventoryItem(itemName);
            if (requestedItem) {
                return (await processOrder(userId, requestedItem.item, quantity)).message;
            }
            return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
        }

        // Provide available commands if input is unclear
        return `Sorry, I didn't understand that. Please use one of these available commands:\n\n📌 *Available Commands:*\n` +
               `1️⃣ *List products:* 🏷️ Type: *List products*\n` +
               `2️⃣ *Check stock:* 🔎 Type: *Do you have iPhone 15?*\n` +
               `3️⃣ *Check price:* 💰 Type: *What's the price of iPhone 15?*\n` +
               `4️⃣ *Order an item:* 🛒 Type: *Order 2 iPhone 15*\n\nHappy shopping! 😊`;
    } catch (error) {
        console.error("Error in determineResponse:", error);
        return "Sorry, I encountered an error while processing your request. Please try again.";
    }
};
