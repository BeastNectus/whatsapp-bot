import Order from "../db/models/Order";
import Inventory from "../db/models/Inventory";
import { suggestAvailableItems } from "../utils/inventory";

export const processOrder = async (
  userId: string,
  itemName: string,
  quantity: number
) => {
  console.log(`Processing order for ${quantity} ${itemName}(s)...`);

  const item = await Inventory.findOne({ item: itemName });

  if (!item) {
    console.log(`Item "${itemName}" not found.`);
    return {
      success: false,
      message: `⚠️ Oops! Item "${itemName}" not found. Please check the name and try again.`,
    };
  }

  // Ensure the stock field exists and is a valid number
  if (typeof item.stock !== "number" || item.stock < 0) {
    console.log(`Invalid stock value for ${itemName}: ${item.stock}`);
    return {
      success: false,
      message: `❌ Invalid stock value for ${itemName}. Please contact support.`,
    };
  }

  console.log(`Current stock for ${itemName}: ${item.stock}`);

  if (item.stock < quantity) {
    console.log(`Not enough stock for ${itemName}. Only ${item.stock} left.`);
    return {
      success: false,
      message: `❌ Sorry! We don’t have enough stock for ${itemName}. Only ${item.stock} left.\n\n${await suggestAvailableItems()}`,
    };
  }

  // Calculate the total amount
  const totalAmount = item.price * quantity;

  // Save the order to the database
  const order = new Order({
    userId: userId,
    item: itemName,
    quantity,
    price: item.price,
    totalAmount,
  });

  await order.save();
  console.log(`Order saved for ${quantity} ${itemName}(s).`);

  // Update the inventory stock
  item.stock -= quantity;
  console.log(`Updated stock for ${itemName}: ${item.stock}`);

  await item.save();
  console.log(`Stock updated for ${itemName}. Remaining stock: ${item.stock}`);

  return {
    success: true,
    message: `✅ Order placed successfully! 🎉 You ordered ${quantity} ${itemName}(s). \n💰 Total amount: $${totalAmount}. Thank you for shopping! 🛍️`,
  };
};
