import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { getAllProducts } from "~/models/product.server";
import { useLoaderData } from "@remix-run/react";
import type { Product } from "@prisma/client";
import React from "react";
import type { Action } from "~/shared/context/CartStateContext";
import {
  addToCart,
  CartDispatchContext,
} from "~/shared/context/CartStateContext";
import ProductCard from "~/shared/components/ProductCard";

export async function loader({ request, params }: LoaderArgs) {
  const products = await getAllProducts();
  if (!products) {
    return json({ products: [] });
  }
  return json({ products });
}

export default function Index() {
  const { products } = useLoaderData<typeof loader>();

  const cartDispatch = React.useContext(CartDispatchContext);

  const onAddProductToCart = (product: Product) => {
    const dispatch = cartDispatch as React.Dispatch<Action>;
    addToCart(dispatch, product);
  };

  return (
    <div>
      <h1 className="m-4 text-3xl">Nasze pizze</h1>
      <div className="h-full w-full">
        <div className="flex flex-col justify-center md:flex-row">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              fullProduct={product}
              onAddProductToCart={onAddProductToCart}
            ></ProductCard>
          ))}
        </div>
      </div>
    </div>
  );
}
