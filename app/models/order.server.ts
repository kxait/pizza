import type { Order, Product } from "@prisma/client";
import { parseFormData, validateEmail } from "~/utils";
import { prisma } from "~/db.server";
import { OrderStatus, PaymentStatus } from "~/shared/enum/enum";

export type { Order, OrderProduct } from "@prisma/client";

export function getAllOrders() {
  return prisma.order.findMany({
    include: {
      orderProduct: {
        include: {
          product: {
            include: {
              productInventory: {
                include: {
                  inventory: true,
                },
              },
            },
          },
        },
      },
      user: true,
    },
    orderBy: { id: "desc" },
  });
}

export async function isClientOrderInformationStale(
  orderId: number,
  orderStatus: OrderStatus,
  estArrivalDateTime: Date,
  paymentStatus: PaymentStatus
) {
  const record = await prisma.order.findUnique({ where: { id: orderId } });
  return (
    record?.estArrivalDateTime.toISOString() !==
      estArrivalDateTime.toISOString() ||
    orderStatus !== record?.status ||
    paymentStatus !== record?.paymentStatus
  );
}

export async function isDeliveryScreenInformationStale(
  orderCount: number,
  lastOrder: number
) {
  const expectedOrderCount = await prisma.order.count({
    where: { status: OrderStatus.DELIVERY },
  });
  const expectedLastOrder =
    (
      await prisma.order.findFirst({
        take: 1,
        orderBy: { id: "desc" },
        where: { status: OrderStatus.DELIVERY },
        select: { id: true },
      })
    )?.id ?? 0;

  return orderCount !== expectedOrderCount || lastOrder !== expectedLastOrder;
}

export async function isCookScreenInformationStale(
  orderCount: number,
  lastOrder: number
) {
  const expectedOrderCount = await prisma.order.count({
    where: { status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.NEW] } },
  });
  const expectedLastOrder =
    (
      await prisma.order.findFirst({
        take: 1,
        orderBy: { id: "desc" },
        where: { status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.NEW] } },
        select: { id: true },
      })
    )?.id ?? 0;

  return orderCount !== expectedOrderCount || lastOrder !== expectedLastOrder;
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
    fieldErrors["email"] = "z??y email";
    hasFieldErrors = true;
  }
  if (!data["address"]) {
    fieldErrors["address"] = "brak adresu";
    hasFieldErrors = true;
  }
  if (!data["phone"]) {
    fieldErrors["phone"] = "z??y numer telefonu";
    hasFieldErrors = true;
  }
  if (!data["cart"]) {
    fieldErrors["cart"] = "brak produkt??w w koszyku";
    hasFieldErrors = true;
  }
  if (!data["payment"]) {
    fieldErrors["payment"] = "z??y typ p??atno??ci";
    hasFieldErrors = true;
  }

  const products = JSON.parse(data["cart"]) as Product[];

  if (hasFieldErrors)
    return { errors: [], fieldErrors, hasFieldErrors, result: null };

  let user = await prisma.user.findUnique({ where: { email: data["email"] } });

  const uniqueProducts = products.filter(
    (product, id) => products.findIndex((p) => p.id === product.id) === id
  );
  const productsWithCount = uniqueProducts.map((product) => ({
    product,
    count: products.filter((p) => p.id === product.id).length,
  }));

  const getProductCount = (productId: number) => {
    return (
      productsWithCount.find((x) => x.product.id === productId)?.count ?? 0
    );
  };

  let ingredientIdsWithRequiredQty: { [key: number]: number } = {};

  (
    await prisma.productInventory.findMany({
      select: { inventory: true, product: true, inventoryQtyRequired: true },
      where: {
        productId: {
          in: uniqueProducts.map((uniqueProduct) => uniqueProduct.id),
        },
      },
    })
  )
    .flatMap((x) => ({
      inventory: x.inventory,
      product: x.product,
      qtyRequired: x.inventoryQtyRequired,
    }))
    .map((x) => ({
      productId: x.product.id,
      inventoryId: x.inventory.id,
      qty: x.qtyRequired,
    }))
    .forEach(
      (x) =>
        (ingredientIdsWithRequiredQty[x.inventoryId] =
          (ingredientIdsWithRequiredQty[x.inventoryId] ?? 0) +
          x.qty * getProductCount(x.productId))
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
      errors: ["brak sk??adnik??w na magazynie!"],
      fieldErrors,
      hasFieldErrors,
      result: null,
    };

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
