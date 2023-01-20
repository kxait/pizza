import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import React from "react";
import { getOrder } from "~/models/order.server";
import type { Action } from "~/shared/context/CartStateContext";
import {
  CartDispatchContext,
  clearCart,
} from "~/shared/context/CartStateContext";
import { OrderStatus } from "~/shared/enum/enum";
import { getOrderStatusLocalized } from "~/utils";

export async function loader({ params, request }: LoaderArgs) {
  const url = new URL(request.url as string);
  const reset = url.searchParams.get("resetCart");
  const shouldReset = reset === "true";
  console.log(url, reset, url.searchParams, reset === "true");

  const id = Number(params.orderId);

  if (Number.isNaN(id)) return json({ order: null, shouldReset });

  const order = await getOrder(id);

  return json({ order, shouldReset });
}

export default function OrderView() {
  const params = useLoaderData<typeof loader>();
  const order = params.order;
  const reset = params.shouldReset;

  const dispatch = React.useContext(CartDispatchContext);

  React.useEffect(() => {
    if (reset) clearCart(dispatch as React.Dispatch<Action>);
  }, [reset]);

  const sus = order?.orderProduct;

  const subtotal = sus
    ?.map((x) => x.qty * x.product.price)
    .reduce((sum, cur) => sum + cur, 0);

  const orderStatus = getOrderStatusLocalized(order?.status as OrderStatus);

  return order == undefined ? (
    <div>błąd!</div>
  ) : (
    <div className="container m-auto mt-4 max-w-4xl">
      <div>
        <div>
          <div className="text-3xl">
            Status:{" "}
            <span className={`badge badge-lg ${orderStatus.class}`}>
              {orderStatus.status}
            </span>
          </div>
          {[OrderStatus.DELIVERY, OrderStatus.IN_PROGRESS].includes(
            order.status as OrderStatus
          ) && (
            <div className="text-3xl">
              Oczekiwany czas dostawy:{" "}
              <span className="text-primary-content">
                {new Date(order.estArrivalDateTime).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
        <div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Lp.</th>
                <th>Produkt</th>
                <th>Ilość</th>
                <th>Cena za sztukę</th>
                <th>Cena</th>
              </tr>
            </thead>
            {sus?.map((item, key) => {
              return (
                <tr key={key}>
                  <td>{key + 1}</td>
                  <td>{item.product.name}</td>
                  <td>{item.qty}</td>
                  <td>{item.product.price} zł</td>
                  <td>{Number(item.qty * item.product.price).toFixed(2)} zł</td>
                </tr>
              );
            })}
          </table>
          <div className="text-lg">
            Cena produktów:&nbsp;
            <span className="text-xl text-primary-content">
              {Number(subtotal).toFixed(2)} zł
            </span>
          </div>
          <div className="text-lg">
            Opłata za obsługę:&nbsp;
            <span className="text-xl text-primary-content">9.99 zł</span>
          </div>
          <div className="text-lg">
            Suma:&nbsp;
            <span className="text-xl text-primary-content">
              {Number((subtotal ?? 0) + 9.99).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
