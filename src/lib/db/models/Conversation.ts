import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  senderId: String,
  message: String,
  messageId: String,
  timestamp: Date,
});

export default mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);