import { prisma } from "~/db.server";

export type { Inventory } from "@prisma/client";

export function getAllInventory() {
  return prisma.inventory.findMany();
}

export function addInventoryQty(id: number, qty: number) {
  return prisma.inventory.update({
    where: { id },
    data: { qty: { increment: qty } },
  });
}
