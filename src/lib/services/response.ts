import { detectLanguage } from "../utils/detectlanguage";
import { generateEmbedding } from "../ai/embeddings";
import {
  storeConversation,
  retrieveConversations,
  retrievePastOrders,
} from "../services/pinecone";
import {
  listProducts,
  suggestAvailableItems,
  findInventoryItem,
} from "../utils/inventory";
import { getGPTResponse } from "../ai/openai";
import { normalizeItemName } from "../utils/normalize";
import { processOrder } from "./order";

export const determineResponse = async (messages: any): Promise<string> => {
  try {
    const userId = messages.from;
    const userMessage = messages.text.body;

    // Detect language from the user's message
    const language = detectLanguage(userMessage);

    // Generate embedding for the user's message
    const embedding = await generateEmbedding(userMessage);

    // Retrieve past conversations for context
    let pastConversations: string[] = [];
    try {
      pastConversations = await retrieveConversations(userId, embedding);
      await storeConversation(userId, userMessage, embedding);
    } catch (error) {
      console.error("Pinecone error:", error);
    }

    // Combine past conversations and the current message into a prompt
    const context = pastConversations.join("\n");
    const prompt = `Previous conversations:\n${context}\n\nCurrent message: ${userMessage}`;

    // Pass the prompt and language to GPT for intent identification
    const gptResponse = await getGPTResponse(prompt, language);

    // Check if GPT response is null or undefined
    if (!gptResponse.message) {
      return "Sorry, I couldn't generate a response. Please try again.";
    }

    // Handle general questions (no intent tag)
    if (!gptResponse.message.startsWith("INTENT:")) {
      return gptResponse.message;
    }

    // Handle listing products
    if (gptResponse.message.includes("INTENT:LIST_PRODUCTS")) {
      return await listProducts();
    }

    // Handle price inquiry
    if (gptResponse.message.includes("INTENT:CHECK_PRICE")) {
      const itemName = gptResponse.message.match(/INTENT:CHECK_PRICE (.+)/)?.[1].trim() || "";

      // Query MongoDB for the item's price
      const requestedItem = await findInventoryItem(itemName);

      if (requestedItem) {
        // Generate a friendly response directly (bypass GPT)
        return `The ${requestedItem.item} costs $${requestedItem.price}. Would you like to place an order?`;
      } else {
        // If the item is not found, suggest available items
        const suggestionMessage = await suggestAvailableItems();
        return `Sorry, I couldn't find that item: "${itemName}".\n\n${suggestionMessage}`;
      }
    }

    // Handle other intents (e.g., ordering, checking stock, past orders)
    if (gptResponse.message.includes("INTENT:ORDER")) {
      const orderDetails = gptResponse.message.match(/INTENT:ORDER (\d+)?\s*(.+)/);
      const quantity = orderDetails ? parseInt(orderDetails[1]) || 1 : 1;
      const itemName = orderDetails ? orderDetails[2].trim() : "";

      const requestedItem = await findInventoryItem(itemName);
      if (requestedItem) {
        return (await processOrder(userId, requestedItem.item, quantity)).message;
      }
      return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
    }

    if (gptResponse.message.includes("INTENT:CHECK_STOCK")) {
      const itemName = gptResponse.message.match(/INTENT:CHECK_STOCK (.+)/)?.[1].trim() || "";
      const requestedItem = await findInventoryItem(itemName);

      if (requestedItem) {
        return requestedItem.stock > 0
          ? `Yes, we have ${requestedItem.stock} ${requestedItem.item} in stock. Would you like to place an order?`
          : `Sorry, the ${requestedItem.item} is out of stock.\n\n${await suggestAvailableItems()}`;
      }
      return `Sorry, I couldn't find that item: "${itemName}". Can you please check the name?`;
    }

    if (gptResponse.message.includes("INTENT:PAST_ORDERS")) {
      // Extract the item name from the user's query
      const itemName = gptResponse.message.match(/INTENT:PAST_ORDERS (.+)/)?.[1].trim() || "";

      // Retrieve past orders for the user
      const pastOrders = await retrievePastOrders(userId);

      // Filter past orders to find orders for the specified item
      const matchingOrders = pastOrders.filter((order) =>
        order.item.toLowerCase().includes(itemName.toLowerCase())
      );

      if (matchingOrders.length > 0) {
        // Get the most recent order for the specified item
        const mostRecentOrder = matchingOrders[0];

        // Format the date
        const orderDate = new Date(mostRecentOrder.timestamp).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return `Yes! You ordered ${mostRecentOrder.quantity} ${mostRecentOrder.item}(s) on ${orderDate}. Would you like to order again?`;
      } else {
        return `I couldn't find any past orders for "${itemName}". Would you like to place a new order?`;
      }
    }

    // Fallback for unrecognized intents
    return `Sorry, I didn't understand that. Here are the available commands:\n\n` +
      `📌 *Available Commands:*\n` +
      `1️⃣ *List products:* 🏷️ Type: *List products*\n` +
      `2️⃣ *Check stock:* 🔎 Type: *Do you have iPhone 15?*\n` +
      `3️⃣ *Check price:* 💰 Type: *What's the price of iPhone 15?*\n` +
      `4️⃣ *Order an item:* 🛒 Type: *Order 2 iPhone 15*\n\n` +
      `Happy shopping! 😊`;
  } catch (error) {
    console.error("Error in determineResponse:", error);
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
};