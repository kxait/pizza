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

function dateDiffToString(a: Date, b: Date) {
  // make checks to make sure a and b are not null
  // and that they are date | integers types

  let diff = a.getTime() - b.getTime();

  if (diff < 0) return { error: true, h: 0, m: 0, s: 0 };
  const ms = diff % 1000;
  diff = (diff - ms) / 1000;
  const ss = diff % 60;
  diff = (diff - ss) / 60;
  const mm = diff % 60;
  diff = (diff - mm) / 60;
  const hh = diff % 24;

  return { error: false, h: hh, m: mm, s: ss };
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

  const getOrderTimeDifference = () =>
    dateDiffToString(new Date(order?.estArrivalDateTime as string), new Date());

  const [timeLeftHms, setTimeLeftHms] = React.useState(
    getOrderTimeDifference()
  );

  React.useEffect(() => {
    const interval = setInterval(
      () => setTimeLeftHms(getOrderTimeDifference()),
      1000
    );

    return () => clearInterval(interval);
  });

  React.useEffect(() => {
    const refreshIfStale = async () => {
      const { stale } = await (
        await fetch(`/pull/clientOrder/${order?.id}`, {
          method: "POST",
          body: JSON.stringify({
            orderStatus: order?.status as string,
            expectedDateTime: order?.estArrivalDateTime,
            paymentStatus: order?.paymentStatus,
          }),
        })
      ).json();
      if (stale) location.reload();
    };

    setInterval(refreshIfStale, 1000);
  }, []);

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
            <tbody>
              {sus?.map((item, key) => {
                return (
                  <tr key={key}>
                    <td>{key + 1}</td>
                    <td>{item.product.name}</td>
                    <td>{item.qty}</td>
                    <td>{item.product.price} zł</td>
                    <td>
                      {Number(item.qty * item.product.price).toFixed(2)} zł
                    </td>
                  </tr>
                );
              })}
            </tbody>
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
        {[OrderStatus.DELIVERY, OrderStatus.IN_PROGRESS].includes(
          order.status as OrderStatus
        ) && (
          <>
            <div className="m-auto w-fit text-4xl">Oczekiwany czas dostawy</div>
            <div className="m-auto w-fit text-6xl text-primary-content">
              <span className="countdown font-mono">
                <span
                  style={{ "--value": timeLeftHms.h } as React.CSSProperties}
                ></span>
                :
                <span
                  style={{ "--value": timeLeftHms.m } as React.CSSProperties}
                ></span>
                :
                <span
                  style={{ "--value": timeLeftHms.s } as React.CSSProperties}
                ></span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
