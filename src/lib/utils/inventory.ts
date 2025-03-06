import Inventory from "../db/models/Inventory";
import { normalizeItemName } from "./normalize";

export const findInventoryItem = async (userInput: string) => {
  const normalized = normalizeItemName(userInput);
  return await Inventory.findOne({ item: { $regex: new RegExp(`^${normalized}$`, "i") } }) || 
         await Inventory.findOne({ item: { $regex: new RegExp(normalized, "i") } });
};

export const listProducts = async () => {
  const products = await Inventory.find({ stock: { $gt: 0 } });
  if (!products.length) return "😔 No products available.";

  return "🛍️ *Available Products:*\n\n" + products.map((p, i) => `👉 ${i + 1}. ${p.item} - 💵 $${p.price} (📦 ${p.stock} left)`).join("\n");
};

export const suggestAvailableItems = async () => {
  const availableItems = await Inventory.find({ stock: { $gt: 0 } }).limit(5);
  return availableItems.length ? 
    "✨ Here are some available items:\n\n" + availableItems.map((item, i) => `👉 ${i + 1}. ${item.item} - 💵 $${item.price} (📦 ${item.stock} left)`).join("\n") :
    "😔 No products available.";
};
