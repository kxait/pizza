import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.create({
    data: {
      email: "client",
      passwordHash: await bcrypt.hash("client", 10),
      phoneNumber: "0",
      role: "CLIENT",
    },
  });
  await prisma.user.create({
    data: {
      email: "cook",
      passwordHash: await bcrypt.hash("cook", 10),
      phoneNumber: "0",
      role: "COOK",
    },
  });
  await prisma.user.create({
    data: {
      email: "manager",
      passwordHash: await bcrypt.hash("manager", 10),
      phoneNumber: "0",
      role: "MANAGER",
    },
  });
  await prisma.user.create({
    data: {
      email: "delivery",
      passwordHash: await bcrypt.hash("manager", 10),
      phoneNumber: "0",
      role: "DELIVERY",
    },
  });
  const ciasto = await prisma.inventory.create({
    data: {
      name: "ciasto",
      qty: 10,
      unit: "kg",
    },
  });
  const sos = await prisma.inventory.create({
    data: {
      name: "sos",
      qty: 10,
      unit: "kg",
    },
  });
  const ser = await prisma.inventory.create({
    data: {
      name: "ser",
      qty: 10,
      unit: "kg",
    },
  });
  const szynka = await prisma.inventory.create({
    data: {
      name: "szynka",
      qty: 10,
      unit: "kg",
    },
  });
  const pieczarki = await prisma.inventory.create({
    data: {
      name: "pieczarki",
      qty: 1,
      unit: "kg",
    },
  });
  const margherita = await prisma.product.create({
    data: {
      name: "margherita",
      description: "najzwyklejsza pizza",
      price: 29.99,
      pictureUrl:
        "https://kitchenatics.com/wp-content/uploads/2020/09/Cheese-pizza-1.jpg",
    },
  });
  const capriciosa = await prisma.product.create({
    data: {
      name: "capriciosa",
      description: "z pieczarkami",
      price: 29.99,
      pictureUrl:
        "https://kitchenatics.com/wp-content/uploads/2020/09/Cheese-pizza-1.jpg",
    },
  });
  const naBogato = await prisma.product.create({
    data: {
      name: "na bogato",
      description: "z ze wszystkim",
      price: 29.99,
      pictureUrl:
        "https://kitchenatics.com/wp-content/uploads/2020/09/Cheese-pizza-1.jpg",
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: margherita.id,
      inventoryId: ciasto.id,
      inventoryQtyRequired: 0.3,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: margherita.id,
      inventoryId: sos.id,
      inventoryQtyRequired: 0.1,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: margherita.id,
      inventoryId: ser.id,
      inventoryQtyRequired: 0.1,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: capriciosa.id,
      inventoryId: ciasto.id,
      inventoryQtyRequired: 0.3,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: capriciosa.id,
      inventoryId: sos.id,
      inventoryQtyRequired: 0.1,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: capriciosa.id,
      inventoryId: ser.id,
      inventoryQtyRequired: 0.1,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: capriciosa.id,
      inventoryId: pieczarki.id,
      inventoryQtyRequired: 0.1,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: naBogato.id,
      inventoryId: ciasto.id,
      inventoryQtyRequired: 0.3,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: naBogato.id,
      inventoryId: sos.id,
      inventoryQtyRequired: 0.1,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: naBogato.id,
      inventoryId: ser.id,
      inventoryQtyRequired: 0.1,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: naBogato.id,
      inventoryId: pieczarki.id,
      inventoryQtyRequired: 0.1,
    },
  });
  await prisma.productInventory.create({
    data: {
      productId: naBogato.id,
      inventoryId: szynka.id,
      inventoryQtyRequired: 0.1,
    },
  });

  console.log(`dodano dane :)`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
