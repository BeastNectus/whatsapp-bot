import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  item: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
});

export default mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);