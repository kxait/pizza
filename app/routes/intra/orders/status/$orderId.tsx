import type { ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { setOrderStatusAndExpectedTime } from "~/models/order.server";
import type { OrderStatus } from "~/shared/enum/enum";

export async function action({ params, request }: ActionArgs) {
  const orderId = Number(params.orderId);
  const body = await request.json();
  const status = body["status"] as string;
  const expectedDateTime = new Date(body["expectedDateTime"] as string);

  const result = await setOrderStatusAndExpectedTime(
    orderId,
    status as OrderStatus,
    expectedDateTime
  );

  return json(result);
}
