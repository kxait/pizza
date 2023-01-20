import type { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

export type FullProduct = Prisma.ProductGetPayload<{
  include: {
    productInventory: {
      include: {
        inventory: true;
        product: true;
      };
    };
  };
}>;

export async function getAllProducts() {
  return prisma.product.findMany({
    include: {
      productInventory: { include: { inventory: true, product: true } },
    },
  });
}
