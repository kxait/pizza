import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getAllOrders } from "~/models/order.server";
import { requireUserWithIntent } from "~/session.server";
import type { OrderStatus } from "~/shared/enum/enum";
import { Intent } from "~/shared/enum/enum";
import { getOrderStatusLocalized } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  requireUserWithIntent(request, Intent.ORDERS_LIST);

  const orders = await getAllOrders();

  return json({ orders });
}

export default function Index() {
  const { orders } = useLoaderData<typeof loader>();

  const getOrderPrice = (order: (typeof orders)[0]) => {
    return order.orderProduct
      .map((op) => op.qty * op.product.price)
      .reduce((sum, cur) => sum + cur, 0);
  };

  return (
    <div className="container m-auto mt-4 w-full  max-w-4xl">
      <div className="text-4xl">Lista zamówień</div>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Lp.</th>
            <th>Adres</th>
            <th>Status</th>
            <th>Kwota</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, id) => {
            const localized = getOrderStatusLocalized(
              order.status as OrderStatus
            );
            return (
              <tr key={id}>
                <td>{id + 1}</td>
                <td>{order.address}</td>
                <td>
                  <div className={`badge ${localized.class}`}>
                    {localized.status}
                  </div>
                </td>
                <td>{Number(getOrderPrice(order) + 9.99).toFixed(2)}</td>
                <td>{order.user.email}</td>
                <td>
                  <Link to={order.id + ""}>
                    <div className="btn">Szczegóły</div>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
