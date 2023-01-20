import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Link } from "react-router-dom";
import { UserRole } from "~/models/role";
import { requireUser } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  const canSeeInventory = [UserRole.MANAGER].includes(user.role as UserRole);
  const canSeeOrdersList = [
    UserRole.COOK,
    UserRole.DELIVERY,
    UserRole.MANAGER,
  ].includes(user.role as UserRole);

  return json({ user, canSeeInventory, canSeeOrdersList });
}

export default function Index() {
  const { user, canSeeInventory, canSeeOrdersList } =
    useLoaderData<typeof loader>();

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
        </ul>
      </div>
    </div>
  );
}
