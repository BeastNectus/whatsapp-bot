import { Pinecone } from "@pinecone-database/pinecone";
import { normalizeItemName } from "../utils/normalize";
import Order from "../db/models/Order";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index("whatsapp-bot");

export const storeConversation = async (
  userId: string,
  message: string,
  embedding: number[],
  metadata?: any
) => {
  try {
    await index.upsert([
      {
        id: `${userId}-${Date.now()}`,
        values: embedding,
        metadata: {
          userId,
          message,
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      },
    ]);
  } catch (error) {
    console.error("Failed to store conversation in Pinecone:", error);
    throw error;
  }
};

export const retrieveConversations = async (
  userId: string,
  embedding: number[],
  topK = 3
): Promise<string[]> => {
  try {
    const queryResponse = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter: { userId },
    });

    return queryResponse.matches
      .map((match) => match.metadata?.message)
      .filter((message): message is string => typeof message === "string");
  } catch (error) {
    console.error("Failed to retrieve conversations from Pinecone:", error);
    throw error;
  }
};

export const retrievePastOrders = async (
  userId: string,
  itemName?: string
) => {
  try {
    console.log(`Fetching past orders for user: ${userId}`);

    const pastOrders = await Order.find({ userId }).sort({ timestamp: -1 });

    console.log(`Found ${pastOrders.length} past orders.`);

    if (itemName) {
      const normalizedItemName = normalizeItemName(itemName);
      const matchingOrders = pastOrders.filter((order) =>
        normalizeItemName(order.item).includes(normalizedItemName)
      );

      console.log(`Found ${matchingOrders.length} matching orders for item: ${itemName}`);
      return matchingOrders;
    }

    return pastOrders;
  } catch (error) {
    console.error("Failed to retrieve past orders:", error);
    throw error;
  }
};
