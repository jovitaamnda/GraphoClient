"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const hideOn = ["/auth/login", "/auth/register"];

  if (hideOn.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
