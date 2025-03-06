import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);