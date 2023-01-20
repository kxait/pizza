import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import React, { useState } from "react";
import { getOrder } from "~/models/order.server";
import * as sessionServer from "~/session.server";
import { Intent, OrderStatus } from "~/shared/enum/enum";
import { getOrderStatusLocalized } from "~/utils";

const timezoneIsoDateTimeString = (date: string | Date) => {
  const dt = date instanceof Date ? date : new Date(date);
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export async function loader({ params, request }: LoaderArgs) {
  const user = await sessionServer.requireUserWithIntent(
    request,
    Intent.ORDERS_LIST
  );
  const id = Number(params.orderId);

  const canChangeOrderStatus = await sessionServer.hasIntent(
    user,
    Intent.CHANGE_ORDER_STATUS
  );

  const order = await getOrder(id);

  return json({ order, canChangeOrderStatus });
}

export default function OrderView() {
  const { order, canChangeOrderStatus } = useLoaderData<typeof loader>();

  const sus = order?.orderProduct;

  const subtotal = sus
    ?.map((x) => x.qty * x.product.price)
    .reduce((sum, cur) => sum + cur, 0);

  const orderStatus = getOrderStatusLocalized(order?.status as OrderStatus);

  const allStatuses = Object.keys(OrderStatus).map((key) => ({
    status: key,
    localized: getOrderStatusLocalized(key as OrderStatus),
  }));

  const changeOrderStatus = async (status: OrderStatus) => {
    const orderStatusShouldHaveBeenChanged = [
      OrderStatus.NEW,
      OrderStatus.CONFIRMED,
    ].includes((order?.status as OrderStatus) ?? OrderStatus.NEW);
    const orderStatusWasChanged =
      timezoneIsoDateTimeString(order?.madeDateTime ?? new Date()) !==
        timezoneIsoDateTimeString(order?.estArrivalDateTime ?? new Date()) ||
      timezoneIsoDateTimeString(order?.estArrivalDateTime ?? new Date()) !==
        timezoneIsoDateTimeString(datePickerValue);

    console.log(orderStatusShouldHaveBeenChanged, orderStatusWasChanged, order);

    if (orderStatusShouldHaveBeenChanged && !orderStatusWasChanged) {
      setDatePickerError(true);
      return;
    }
    setDatePickerError(false);

    await fetch(`status/${order?.id}`, {
      body: JSON.stringify({
        status,
        expectedDateTime: new Date(datePickerValue),
      }),
      method: "POST",
    });
    location.reload();
  };

  const [datePickerError, setDatePickerError] = React.useState(false);

  const [datePickerValue, setDatePickerValue] = useState(
    new Date(order?.estArrivalDateTime ?? new Date().toJSON())
  );

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
        <div className="divider"></div>
        <div>
          Adres:&nbsp;
          <span className="text-primary-content">{order.address}</span>
          <br />
          Złożony:&nbsp;
          <span className="text-primary-content">
            {new Date(order.madeDateTime).toLocaleString()}
          </span>
          <br />
          Oczekiwany czas dostawy:&nbsp;
          <span className="text-primary-content">
            {new Date(order.estArrivalDateTime).toLocaleString()}
          </span>
          <br />
          Typ płatności:&nbsp;
          <span className="text-primary-content">{order.paymentType}</span>
          <br />
          Status płatności:&nbsp;
          <span className="text-primary-content">{order.paymentStatus}</span>
          <br />
          Email:&nbsp;
          <span className="text-primary-content">{order.user.email}</span>
          <br />
          Numer telefonu:&nbsp;
          <span className="text-primary-content">{order.user.phoneNumber}</span>
          <br />
        </div>
        <div className="divider"></div>
        {canChangeOrderStatus && (
          <div>
            <>
              <label className="label">
                <span className="label-text">Oczekiwany czas dostawy</span>
              </label>
              <input
                value={timezoneIsoDateTimeString(datePickerValue)}
                onChange={(e) => setDatePickerValue(new Date(e.target.value))}
                type="datetime-local"
                placeholder={"Czas dostawy"}
                className={`input-bordered input w-full max-w-xs`}
                disabled={
                  ![OrderStatus.NEW, OrderStatus.CONFIRMED].includes(
                    order.status as OrderStatus
                  )
                }
              />
              {datePickerError && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    zmień oczekiwaną datę zamówienia!
                  </span>
                </label>
              )}
            </>
            <div>Zmień status:</div>

            <div className="flex">
              {allStatuses.map((status) => (
                <div
                  onClick={() =>
                    changeOrderStatus(status.status as OrderStatus)
                  }
                  key={status.status}
                  className={`badge btn badge-lg ${status.localized.class.replace(
                    "badge-",
                    "btn-"
                  )} m-2`}
                >
                  {status.localized.status}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
