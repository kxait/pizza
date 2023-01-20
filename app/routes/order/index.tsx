import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import React from "react";
import { createOrder } from "~/models/order.server";
import { CartStateContext } from "~/shared/context/CartStateContext";

export const action = async ({ request }: ActionArgs) => {
  const data = await request.formData();
  const { errors, fieldErrors, hasFieldErrors, result } = await createOrder(
    data
  );
  if (errors.length !== 0 || hasFieldErrors)
    return json({ errors, fieldErrors });

  return redirect(`/order/${result?.id}?resetCart=true`);
};

function FormField({
  label,
  name,
  error,
  submitting,
}: {
  label: string;
  name: string;
  error: string | undefined;
  submitting: boolean;
}) {
  const [errorCleared, setErrorCleared] = React.useState(false);

  React.useEffect(() => setErrorCleared(false), [error, submitting]);

  return (
    <>
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        name={name}
        type="text"
        onInput={() => setErrorCleared(true)}
        placeholder={label}
        className={`input-bordered input w-full max-w-xs ${
          error !== undefined && !errorCleared ? "input-error" : ""
        }`}
      />
      {error !== undefined && !errorCleared && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </>
  );
}

export default function Index() {
  const actionData = useActionData<typeof action>();

  const transition = useTransition();

  const cartState = React.useContext(CartStateContext);

  let [productQuantitiesGroupedByProduct, setProductQuantities] =
    React.useState<{ [key: string]: number }>({});

  React.useEffect(() => {
    let list: { [key: string]: number } = {};
    cartState.items.forEach((item) => {
      list[item.id] = (list[item.id] ?? 0) + 1;
    });
    setProductQuantities(list);
  }, [cartState]);

  const uniqueProducts = React.useMemo(
    () =>
      cartState.items.filter(
        (item, idx) =>
          cartState.items.findIndex((subItem) => subItem.id === item.id) === idx
      ),
    [cartState]
  );

  const subtotal = React.useMemo(
    () =>
      cartState.items
        .map((item) => item.price)
        .reduce((sum, cur) => sum + cur, 0),
    [cartState]
  );

  return (
    <div className="container m-auto mt-4 w-full  max-w-4xl">
      {subtotal === 0 ? (
        <>
          <div>Dodaj coś do koszyka!</div>
          <Link to="/products" className="btn btn-primary">
            Przejdź do menu
          </Link>
        </>
      ) : (
        <div>
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
                {uniqueProducts.map((item, key) => {
                  return (
                    <tr key={key}>
                      <td>{key + 1}</td>
                      <td>{item.name}</td>
                      <td>{productQuantitiesGroupedByProduct[item.id]}</td>
                      <td>{item.price} zł</td>
                      <td>
                        {Number(
                          productQuantitiesGroupedByProduct[item.id] *
                            item.price
                        ).toFixed(2)}{" "}
                        zł
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
                {Number(subtotal + 9.99).toFixed(2)}
              </span>
            </div>
          </div>
          <Form action="/order" method="post">
            <FormField
              label="E-mail"
              name="email"
              error={actionData?.fieldErrors["email"]}
              submitting={transition.state === "submitting"}
            />
            <FormField
              label="Pełny adres dostawy"
              name="address"
              error={actionData?.fieldErrors["address"]}
              submitting={transition.state === "submitting"}
            />
            <FormField
              label="Numer telefonu"
              name="phone"
              error={actionData?.fieldErrors["address"]}
              submitting={transition.state === "submitting"}
            />

            <div className="mt-4 text-lg">Typ płatności</div>
            <div className="btn-group">
              <input
                type="radio"
                name="payment"
                value="card"
                data-title="Kartą"
                className="btn"
                disabled
              />
              <input
                type="radio"
                name="payment"
                value="blik"
                data-title="BLIK"
                className="btn"
                disabled
              />
              <input
                type="radio"
                name="payment"
                value="cash"
                data-title="Gotówką przy odbiorze"
                className="btn"
                checked
              />
            </div>

            <input
              type="hidden"
              name="cart"
              value={JSON.stringify(cartState.items)}
            />

            <div>
              <button type="submit" className="btn btn-success btn-lg mt-4">
                Zamawiam!
              </button>
            </div>
            {actionData?.errors.length !== 0 && (
              <div>
                {actionData?.errors.map((error) => (
                  <p key={error} className="text-error">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </Form>
        </div>
      )}
    </div>
  );
}
