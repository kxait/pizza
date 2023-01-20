import type { ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { isClientOrderInformationStale } from "~/models/order.server";
import type { OrderStatus, PaymentStatus } from "~/shared/enum/enum";

export async function action({ params, request }: ActionArgs) {
  const orderId = Number(params.orderId);
  const body = await request.json();
  const status = body["orderStatus"] as OrderStatus;
  const expectedDateTime = new Date(body["expectedDateTime"] as string);
  const paymentStatus = body["paymentStatus"] as PaymentStatus;

  const result = await isClientOrderInformationStale(
    orderId,
    status,
    expectedDateTime,
    paymentStatus
  );

  return json({ stale: result });
}
