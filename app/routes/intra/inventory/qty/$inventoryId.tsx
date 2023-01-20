import type { ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { addInventoryQty } from "~/models/inventory.server";

export async function action({ params, request }: ActionArgs) {
  const body = await request.json();
  const id = Number(params.inventoryId);
  const qty = Number(body["qty"] as string);

  const result = await addInventoryQty(id, qty);

  return json(result);
}
