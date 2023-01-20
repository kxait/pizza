import type { Order, Product } from "@prisma/client";
import { parseFormData, validateEmail } from "~/utils";
import { prisma } from "~/db.server";
import { OrderStatus } from "~/shared/enum/enum";

export type { Order, OrderProduct } from "@prisma/client";

export function getAllOrders() {
  return prisma.order.findMany({
    include: {
      orderProduct: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });
}

export function getOrder(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      orderProduct: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });
}

export function setOrderStatusAndExpectedTime(
  orderId: number,
  status: OrderStatus,
  expected: Date
) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      estArrivalDateTime: expected.toJSON(),
    },
  });
}

export async function createOrder(formData: FormData): Promise<{
  errors: string[];
  fieldErrors: { [field: string]: string };
  hasFieldErrors: boolean;
  result: Order | null;
}> {
  const data = parseFormData(formData);

  let fieldErrors: { [field: string]: string } = {};
  let hasFieldErrors = false;

  if (!validateEmail(data["email"] ?? "")) {
    fieldErrors["email"] = "zły email";
    hasFieldErrors = true;
  }
  if (!data["address"]) {
    fieldErrors["address"] = "brak adresu";
    hasFieldErrors = true;
  }
  if (!data["phone"]) {
    fieldErrors["phone"] = "zły numer telefonu";
    hasFieldErrors = true;
  }
  if (!data["cart"]) {
    fieldErrors["cart"] = "brak produktów w koszyku";
    hasFieldErrors = true;
  }
  if (!data["payment"]) {
    fieldErrors["payment"] = "zły typ płatności";
    hasFieldErrors = true;
  }

  const products = JSON.parse(data["cart"]) as Product[];

  if (hasFieldErrors)
    return { errors: [], fieldErrors, hasFieldErrors, result: null };

  let user = await prisma.user.findUnique({ where: { email: data["email"] } });

  if (user === null) {
    user = await prisma.user.create({
      data: {
        email: data["email"] as string,
        passwordHash: "none",
        phoneNumber: data["phone"],
        role: "CLIENT",
      },
    });
  }

  const order = await prisma.order.create({
    data: {
      address: data["address"] as string,
      estArrivalDateTime: new Date(),
      paymentStatus: "PENDING",
      paymentType: data["payment"] as string,
      status: "NEW",
      userId: user.id,
    },
  });

  const uniqueProducts = products.filter(
    (product, id) => products.findIndex((p) => p.id === product.id) === id
  );
  const productsWithCount = uniqueProducts.map((product) => ({
    product,
    count: products.filter((p) => p.id === product.id).length,
  }));

  let ingredientIdsWithRequiredQty: { [key: number]: number } = {};

  (
    await prisma.productInventory.findMany({
      select: { inventory: true, product: true },
      where: {
        productId: {
          in: uniqueProducts.map((uniqueProduct) => uniqueProduct.id),
        },
      },
    })
  )
    .flatMap((x) => x.inventory)
    .map((x) => ({ id: x.id, qty: x.qty }))
    .forEach(
      (x) =>
        (ingredientIdsWithRequiredQty[x.id] =
          (ingredientIdsWithRequiredQty[x.id] ?? 0) + x.qty)
    );

  const requiredIngredients = Object.keys(ingredientIdsWithRequiredQty).map(
    (x) => Number(x)
  );

  const ingredientQtys = await prisma.inventory.findMany({
    where: { id: { in: requiredIngredients } },
  });

  const isBillOfMaterialsError = ingredientQtys.some(
    (x) => x.qty < ingredientIdsWithRequiredQty[x.id]
  );

  if (isBillOfMaterialsError)
    return {
      errors: ["brak składników na magazynie!"],
      fieldErrors,
      hasFieldErrors,
      result: null,
    };

  console.log(ingredientQtys, ingredientIdsWithRequiredQty);

  ingredientQtys.forEach(async (x) => {
    await prisma.inventory.update({
      data: { qty: { decrement: ingredientIdsWithRequiredQty[x.id] } },
      where: { id: x.id },
    });
  });

  await Promise.all(
    productsWithCount.map(({ product, count }) =>
      prisma.orderProduct.create({
        data: {
          productId: product.id,
          qty: count,
          orderId: order.id,
        },
      })
    )
  );

  return { errors: [], fieldErrors, hasFieldErrors, result: order };
}