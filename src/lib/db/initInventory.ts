import Inventory from "./models/Inventory";

export const initInventory = async () => {
  const items = [
    { item: "Sônghè Fragrant Rice", price: 55, stock: 100 },
    { item: "Sônghè New Crop Rice", price: 60, stock: 90 },
    { item: "Sônghè Jasmine Brown Rice", price: 65, stock: 80 },
    { item: "Sônghè Noble Brown Rice", price: 70, stock: 70 },
    { item: "Sônghè Noble Red Rice", price: 75, stock: 60 },
    { item: "Sônghè Noble Rice Berry", price: 80, stock: 50 },
    { item: "Sônghè 8020 Mixed Rice", price: 85, stock: 40 },
    { item: "Sônghè Glutinous Rice", price: 90, stock: 30 },
  ];

  for (const item of items) {
    const existingItem = await Inventory.findOne({ item: item.item });
    if (!existingItem) {
      await Inventory.create(item);
    }
  }
};
