import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const getGPTResponse = async (prompt: string, language: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant. Respond in ${language}. For general questions, provide a helpful response. For specific queries related to products, prices, stock, or orders, identify the intent and respond with one of the following intent tags:
- For listing products, use: INTENT:LIST_PRODUCTS
- For checking the price of an item, use: INTENT:CHECK_PRICE <item_name>
- For placing an order, use: INTENT:ORDER <quantity> <item_name>
- For checking stock, use: INTENT:CHECK_STOCK <item_name>
- For past orders, use: INTENT:PAST_ORDERS <item_name>
- For unrecognized queries, use: INTENT:UNRECOGNIZED

For general questions, do not use intent tags. Provide a helpful response directly.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Handle null or undefined response content
  const message = response.choices[0].message.content;
  if (!message) {
    throw new Error("Failed to generate a response from GPT.");
  }

  return { message };
};
