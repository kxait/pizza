import { useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import React from "react";
import { getAllInventory } from "~/models/inventory.server";
import { requireUser, requireUserWithIntent } from "~/session.server";
import { Intent } from "~/shared/enum/enum";

export async function loader({ request }: LoaderArgs) {
  requireUserWithIntent(request, Intent.INVENTORY);

  const inventory = await getAllInventory();

  return json({ inventory });
}

export default function Inventory() {
  const { inventory } = useLoaderData<typeof loader>();

  const [inputsMap, setInputsMap] = React.useState<{ [key: number]: number }>(
    {}
  );

  const onChangeInput = (key: number, value: number) => {
    setInputsMap({
      ...inputsMap,
      [key]: value,
    });
  };

  const onAddButtonClick = async (key: number) => {
    const input = inputsMap[key];
    if (input == undefined) return;

    await fetch(`inventory/qty/${key}`, {
      body: JSON.stringify({ qty: input }),
      method: "POST",
    });
    location.reload();
  };

  return (
    <div>
      <div className="container m-auto mt-4 max-w-4xl">
        <div className="mb-4 text-4xl">Stan magazynowy</div>
        <table className="table w-full">
          <thead>
            <tr>
              <th>Nazwa przedmiotu</th>
              <th>Ilość</th>
              <th>Jednostka</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((entry) => {
              return (
                <tr key={entry.id}>
                  <td>{entry.name}</td>
                  <td>{entry.qty}</td>
                  <td>{entry.unit}</td>
                  <td>
                    <div className="flex">
                      <label className="input-group">
                        <span>Ilość</span>
                        <input
                          onChange={(e) =>
                            onChangeInput(entry.id, Number(e.target.value))
                          }
                          type="number"
                          placeholder=""
                          className="input-bordered input"
                        />
                      </label>
                      <div
                        className="btn"
                        onClick={() => onAddButtonClick(entry.id)}
                      >
                        Dodaj
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
