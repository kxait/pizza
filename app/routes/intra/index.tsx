import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Link } from "react-router-dom";
import { UserRole } from "~/models/role";
import { hasIntent, requireUser } from "~/session.server";
import { Intent } from "~/shared/enum/enum";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  const canSeeInventory = await hasIntent(user, Intent.INVENTORY);
  const canSeeOrdersList = await hasIntent(user, Intent.ORDERS_LIST);
  const canSeeCookScreen = await hasIntent(user, Intent.COOK_SCREEN);
  const canSeeDeliveryScreen = await hasIntent(user, Intent.DELIVERY_SCREEN);

  return json({
    user,
    canSeeInventory,
    canSeeOrdersList,
    canSeeCookScreen,
    canSeeDeliveryScreen,
  });
}

export default function Index() {
  const {
    user,
    canSeeInventory,
    canSeeOrdersList,
    canSeeCookScreen,
    canSeeDeliveryScreen,
  } = useLoaderData<typeof loader>();

  return (
    <div className="container m-auto mt-4 w-full  max-w-4xl">
      <div className="text-4xl">Witaj {user.email}!</div>
      <div>
        <ul className="menu rounded-box mt-4 w-56 bg-base-100 p-2">
          {canSeeInventory && (
            <li>
              <Link to="inventory">Stan magazynowy</Link>
            </li>
          )}
          {canSeeOrdersList && (
            <li>
              <Link to="orders">Lista zamówień</Link>
            </li>
          )}
          {canSeeCookScreen && (
            <li>
              <Link to="cook">Ekran kucharza</Link>
            </li>
          )}
          {canSeeDeliveryScreen && (
            <li>
              <Link to="delivery">Ekran dostawcy</Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
