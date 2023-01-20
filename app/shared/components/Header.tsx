import type { User } from "@prisma/client";
import { Form, Link } from "@remix-run/react";
import React from "react";
import { CartStateContext } from "../context/CartStateContext";
import { UserRole } from "../enum/enum";
import HeaderCartDetails from "./HeaderCartDetails";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const cart = React.useContext(CartStateContext);

  const cartLength = React.useMemo(() => {
    return (cart ?? { items: [] }).items.length;
  }, [cart]);

  const isLoggedIn = user != undefined;
  const isAdmin = isLoggedIn && user?.role !== UserRole.CLIENT;

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl normal-case">
          pizza
        </Link>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            {isAdmin && (
              <li>
                <Link to="intra">Panel administracyjny</Link>
              </li>
            )}
            <li>
              <Link to="products">Menu</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-none">
        <Link to="/intra/login">
          <div className="btn btn-ghost">
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
                d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
              />
            </svg>
          </div>
        </Link>
        <div className="dropdown-end dropdown">
          <label
            tabIndex={0}
            className={`${cartLength > 0 ? "btn-primary" : ""} btn`}
          >
            <div className="indicator">
              Koszyk
              <span className="badge badge-sm ml-2">{cartLength}</span>
            </div>
          </label>

          <HeaderCartDetails />
        </div>
        {isLoggedIn && (
          <Form action="/intra/logout" method="post">
            <button type="submit" className="btn">
              wyloguj
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
