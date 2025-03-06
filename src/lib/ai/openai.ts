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
        content: `You are a helpful assistant. Respond in ${language}.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  return { message: response.choices[0].message.content };
};