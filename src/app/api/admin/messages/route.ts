import { NextResponse } from "next/server";
import Conversation from "@/lib/db/models/Conversation";
import mongoose from "mongoose";

export async function GET() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const messages = await Conversation.find().sort({ timestamp: -1 });
  return NextResponse.json(messages);
}
