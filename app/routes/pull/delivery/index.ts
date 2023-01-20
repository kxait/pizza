import type { ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { isDeliveryScreenInformationStale } from "~/models/order.server";

export async function action({ params, request }: ActionArgs) {
  const body = await request.json();
  const orderCount = Number(body["orderCount"]);
  const lastOrder = Number(body["lastOrder"]);

  const result = await isDeliveryScreenInformationStale(orderCount, lastOrder);

  return json({ stale: result });
}
