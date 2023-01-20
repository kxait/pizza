import { Product } from "@prisma/client";
import React from "react";
import useLocalStorage from "~/hooks/useLocalStorage";

export interface CartState {
  items: Product[];
}

export const CartStateContext = React.createContext<CartState>({ items: [] });
export const CartDispatchContext =
  React.createContext<React.Dispatch<Action> | null>(null);

export type Action =
  | { type: "addToCart"; product: Product }
  | { type: "clearCart" }
  | { type: "removeFromCart"; id: number };

export function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "addToCart": {
      return {
        ...state,
        items: [...state.items, action.product],
      };
    }
    case "removeFromCart": {
      return {
        ...state,
        items: state.items.filter((_, idx) => idx !== action.id),
      };
    }
    case "clearCart": {
      console.log("cleared cart");
      return {
        ...state,
        items: [],
      };
    }
  }
}

export function addToCart(dispatch: React.Dispatch<Action>, product: Product) {
  return dispatch({
    type: "addToCart",
    product,
  });
}

export function removeFromCart(dispatch: React.Dispatch<Action>, id: number) {
  return dispatch({
    type: "removeFromCart",
    id,
  });
}

export function clearCart(dispatch: React.Dispatch<Action>) {
  return dispatch({
    type: "clearCart",
  });
}

const ShoppingCartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useLocalStorage<CartState>("cart", {
    items: [],
  });

  const [state, dispatch] = React.useReducer(reducer, cartItems);

  React.useEffect(() => {
    setCartItems(state);
  }, [state]);

  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
};

export { ShoppingCartProvider };

//const x = React.useReducer()
