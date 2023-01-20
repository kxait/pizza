import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getAllOrders } from "~/models/order.server";
import { requireUserWithIntent } from "~/session.server";
import { Intent, OrderStatus } from "~/shared/enum/enum";
import { getOrderStatusLocalized } from "~/utils";

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
  await requireUserWithIntent(request, Intent.COOK_SCREEN);

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

  return json(formatted);
}

export default function Index() {
  const sus = useLoaderData<typeof loader>();

  return (
    <div className="container m-auto mt-4 w-full  max-w-4xl">
      <div className="my-4 text-4xl">no dalej kuchciku</div>
      <div>
        {sus.map((sussy) => {
          const orderStatus = getOrderStatusLocalized(
            sussy.status as OrderStatus
          );
          return (
            <div key={"ඞ" + sussy.id}>
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Czas przyjęcia</th>
                    <th>Oczekiwany czas dostawy</th>
                    <th>Status</th>
                    <th>typ zamówienia</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{sussy.id}</td>
                    <td>{new Date(sussy.made).toLocaleString()}</td>
                    <td>{new Date(sussy.expected).toLocaleString()}</td>
                    <td>
                      <div className={`badge ${orderStatus.class}`}>
                        {orderStatus.status}
                      </div>
                    </td>
                    <td>
                      <div className="badge-success badge">dostawa</div>
                    </td>
                    <td>
                      <Link to={`/intra/orders/${sussy.id}`} className="btn">
                        szczegóły
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>produkt</th>
                    <th>ilosc</th>
                    <th>skladniki</th>
                  </tr>
                </thead>
                <tbody>
                  {sussy.products.map((product) => {
                    return (
                      <tr key={product.productName}>
                        <td>
                          <div className="badge">{product.productName}</div>
                        </td>
                        <td>{product.qty}</td>
                        <td>
                          <table className="table-compact table w-full shadow-lg">
                            <thead>
                              <tr>
                                <th>Skladnik</th>
                                <th>Ilosc</th>
                                <th>jednostka</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.ingredients.map((ingredient) => (
                                <tr key={ingredient.ingredientName}>
                                  <td>{ingredient.ingredientName}</td>
                                  <td>{ingredient.qty}</td>
                                  <td>{ingredient.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="divider divider-vertical"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
