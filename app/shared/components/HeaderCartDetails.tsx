import { Link } from "@remix-run/react";
import React from "react";
import { Action, clearCart } from "~/shared/context/CartStateContext";
import {
  CartDispatchContext,
  CartStateContext,
  removeFromCart,
} from "~/shared/context/CartStateContext";

export default function HeaderCartDetails() {
  const cartState = React.useContext(CartStateContext);

  const cartLength = React.useMemo(() => cartState.items.length, [cartState]);
  const cartSubtotal = React.useMemo(
    () =>
      cartState.items
        .map((item) => item.price)
        .reduce((sum, cur) => sum + cur, 0),
    [cartState]
  );

  const cartDispatch = React.useContext(
    CartDispatchContext
  ) as React.Dispatch<Action>;

  const onClickClearCart = () => clearCart(cartDispatch);

  return (
    <div
      tabIndex={0}
      className="card dropdown-content card-compact mt-3 w-60 bg-base-100 shadow"
    >
      <div className="card-body">
        <span className="text-lg font-bold">{cartLength} produkty(ów)</span>
        <div>
          <ul>
            {cartState.items.map((product, idx) => (
              <li key={idx} className="m-1">
                <div className="flex items-center">
                  <div
                    className="btn btn-error btn-sm btn-circle mr-2 p-1"
                    onClick={(e) => {
                      removeFromCart(cartDispatch, idx);
                      e.stopPropagation();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <strong className="mr-2">{product.name}</strong>
                  {product.price} zł
                </div>
              </li>
            ))}
          </ul>
        </div>
        <span className="text-info">
          Suma: ${Number(cartSubtotal).toFixed(2)}
        </span>
        {cartSubtotal !== 0 && (
          <div className="card-actions">
            <Link to="/order">
              <div className="btn btn-primary btn-block">zamawiam</div>
            </Link>
            <div onClick={onClickClearCart}>
              <div className="btn btn-ghost btn-block">wyczyść</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
