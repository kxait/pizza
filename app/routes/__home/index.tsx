import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div>
      <div className="hero mt-10 h-full">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Pizza</h1>
            <p className="py-6">Tu sprzedajemy pyszne pizze</p>
            <Link to="products">
              <div className="btn btn-primary">Menu</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
