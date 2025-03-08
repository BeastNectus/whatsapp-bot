import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/db/connectDB";
import { initInventory } from "../../../../lib/db/initInventory";
import Conversation from "../../../../lib/db/models/Conversation";
import { sendMessage } from "../../../../lib/services/whatsapp";
import { determineResponse } from "../../../../lib/services/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge") || "";

  if (mode === "subscribe" && token === "my-verify-token") {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Unauthorized", { status: 403 });
}

export async function POST(req: NextRequest) {
  await connectDB();
  await initInventory();

  try {
    const body = await req.json();
    console.log("Webhook payload:", JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;

    if (changes?.messages) {
      const message = changes.messages[0];

      if (message) {
        const messageId = message.id;
        const senderId = message.from;
        const messageText = message.text.body;

        console.log("Received message ID:", messageId);
        console.log("Sender ID:", senderId);
        console.log("Message text:", messageText);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const existingMessage = await Conversation.findOne({ messageId }).session(session).exec();
          if (existingMessage) {
            await session.abortTransaction();
            return new Response("OK", { status: 200 });
          }

          await new Conversation({
            senderId,
            message: messageText,
            messageId,
            timestamp: new Date(),
          }).save({ session });

          await session.commitTransaction();

          const previousMessages = await Conversation.find({ senderId }).exec();
          if (previousMessages.length === 1) {
            await sendMessage(senderId, "Welcome! To get started, please type 'Get started'.");
          } else if (messageText.toLowerCase() === "get started") {
            const welcomeMessage = 
            `🎉 Welcome to our shop! 🛍️\n\n` +
            `I'm here to assist you with your shopping. Here’s what you can do:\n\n` +
            `📌 *Available Commands & Examples:*\n\n` +
            `1️⃣ *List all products:* 🏷️\n` +
            `   👉 Type: *List products*\n\n` +
            `2️⃣ *Check if an item is in stock:* 🔎\n` +
            `   👉 Type: *Do you have Fragrant Rice?*\n\n` +
            `3️⃣ *Get the price of an item:* 💰\n` +
            `   👉 Type: *What's the price of Fragrant Rice?*\n\n` +
            `4️⃣ *Place an order:* 🛒\n` +
            `   👉 Type: *Order 2 Fragrant Rice*\n\n` +
            `✨ Feel free to ask anything! Happy shopping! 😊`;
            await sendMessage(senderId, welcomeMessage);
          } else {
            const responseMessage = await determineResponse(message);
            await sendMessage(senderId, responseMessage);
          }
        } catch (error) {
          if (session.inTransaction()) await session.abortTransaction();
          console.error("Transaction error:", error);
          throw error;
        } finally {
          session.endSession();
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}