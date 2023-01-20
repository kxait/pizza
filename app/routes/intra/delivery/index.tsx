import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import React from "react";
import { getAllOrders } from "~/models/order.server";
import { requireUserWithIntent } from "~/session.server";
import { Intent, OrderStatus } from "~/shared/enum/enum";

/*
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣤⣤⣤⣤⣶⣦⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⡿⠛⠉⠙⠛⠛⠛⠛⠻⢿⣿⣷⣤⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⠋⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠈⢻⣿⣿⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣸⣿⡏⠀⠀⠀⣠⣶⣾⣿⣿⣿⠿⠿⠿⢿⣿⣿⣿⣄⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⣿⠁⠀⠀⢰⣿⣿⣯⠁⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣷⡄⠀
⠀⠀⣀⣤⣴⣶⣶⣿⡟⠀⠀⠀⢸⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣷⠀
⠀⢰⣿⡟⠋⠉⣹⣿⡇⠀⠀⠀⠘⣿⣿⣿⣿⣷⣦⣤⣤⣤⣶⣶⣶⣶⣿⣿⣿⠀
⠀⢸⣿⡇⠀⠀⣿⣿⡇⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃⠀
⠀⣸⣿⡇⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠉⠻⠿⣿⣿⣿⣿⡿⠿⠿⠛⢻⣿⡇⠀⠀
⠀⣿⣿⠁⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣧⠀⠀
⠀⣿⣿⠀⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⠀⠀
⠀⣿⣿⠀⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⠀⠀
⠀⢿⣿⡆⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀
⠀⠸⣿⣧⡀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠃⠀⠀
⠀⠀⠛⢿⣿⣿⣿⣿⣇⠀⠀⠀⠀⣰⣿⣿⣷⣶⣶⣶⣶⠶⠀⢠⣿⣿⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⣿⠀⠀⠀⠀⠀⣿⣿⡇⠀⣽⣿⡏⠁⠀⠀⢸⣿⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⣿⠀⠀⠀⠀⠀⣿⣿⡇⠀⢹⣿⡆⠀⠀⠀⣸⣿⠇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢿⣿⣦⣄⣀⣠⣴⣿⣿⠁⠀⠈⠻⣿⣿⣿⣿⡿⠏⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠛⠻⠿⠿⠿⠿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
*/

export async function loader({ request }: LoaderArgs) {
  await requireUserWithIntent(request, Intent.DELIVERY_SCREEN);

  const orders = await getAllOrders();

  const formatted = orders.map((order) => {
    return {
      made: order.madeDateTime,
      expected: order.estArrivalDateTime,
      status: order.status,
      id: order.id,
      address: order.address,
      products: order.orderProduct.map((op) => ({
        productName: op.product.name,
        qty: op.qty,
        ingredients: op.product.productInventory.map((pi) => ({
          ingredientName: pi.inventory.name,
          qty: pi.inventoryQtyRequired,
          unit: pi.inventory.unit,
        })),
      })),
    };
  });

  const formattedDeliveryOnly = formatted.filter(
    (order) => (order.status as OrderStatus) === OrderStatus.DELIVERY
  );

  return json(formattedDeliveryOnly);
}

export default function Index() {
  const sus = useLoaderData<typeof loader>();

  React.useEffect(() => {
    const refreshIfStale = async () => {
      const { stale } = await (
        await fetch(`/pull/delivery`, {
          method: "POST",
          body: JSON.stringify({
            orderCount: sus.length,
            lastOrder:
              sus.length === 0 ? 0 : Math.max(...sus.map((order) => order.id)),
          }),
        })
      ).json();
      if (stale) location.reload();
    };

    setInterval(refreshIfStale, 1000);
  }, []);

  return (
    <div className="container m-auto mt-4 w-full  max-w-4xl">
      <div className="my-4 text-4xl">Zamówienia w dostawie</div>
      <div>
        <table className="table w-full">
          <thead>
            <tr>
              <th>Id</th>
              <th>Czas przyjęcia</th>
              <th>Oczekiwany czas dostawy</th>
              <th>Adres</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sus.map((sussy) => (
              <tr key={sussy.id}>
                <td>{sussy.id}</td>
                <td>{new Date(sussy.made).toLocaleString()}</td>
                <td>{new Date(sussy.expected).toLocaleString()}</td>
                <td>{sussy.address}</td>
                <td>
                  <Link to={`/intra/orders/${sussy.id}`} className="btn">
                    szczegóły
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
