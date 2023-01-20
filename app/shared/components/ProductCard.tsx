import type { Product } from "@prisma/client";
import type { FullProduct } from "~/models/product.server";

interface ProductCardProps {
  fullProduct: FullProduct;
  onAddProductToCart: (product: Product) => void;
}

export default function ProductCard({
  fullProduct: product,
  onAddProductToCart,
}: ProductCardProps) {
  const isAvailable = (product: FullProduct) => {
    return product.productInventory.every(
      (productInventory) =>
        productInventory.inventory.qty > productInventory.inventoryQtyRequired
    );
  };

  return (
    <div
      className="card my-4 w-full bg-base-100 shadow-xl md:m-4 md:w-96"
      key={product.id}
    >
      <figure>
        <img src={product.pictureUrl} alt="product"></img>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p>{product.description}</p>
        <p>
          {product.productInventory.map((productInventory) => (
            <div
              key={`${productInventory.productId}-${productInventory.inventoryId}`}
            >{`- ${productInventory.inventory.name}`}</div>
          ))}
        </p>
        <div className="text-xl">{product.price} zł</div>
        {!isAvailable(product) && (
          <div className="badge-error badge gap-2">
            Produkt tymczasowo niedostępny
          </div>
        )}
        <div className="card-actions">
          <button
            onClick={() => onAddProductToCart(product)}
            className={`btn btn-primary ${
              !isAvailable(product) ? "btn-disabled" : ""
            }`}
          >
            dodaj do koszyka
          </button>
        </div>
      </div>
    </div>
  );
}
