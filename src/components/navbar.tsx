"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        if (active) setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (active) setIsAdmin(Boolean(data?.is_admin));
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href);

  return (
    <header className="w-full sticky top-0 z-50 bg-gcBackground/80 backdrop-blur border-b border-white/20">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-gc.png"
            alt="Girls Collective"
            width={160}
            height={30}
            priority
          />
          <span className="sr-only">Girls Collective</span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center gap-6 font-montserrat">
          <li>
            <Link href="/#about" className="hover:opacity-80 transition">
              Sobre nosotras
            </Link>
          </li>
          <li>
            <Link
              href="/find-your-city"
              className={`hover:opacity-80 transition ${
                isActive("/find-your-city") ? "underline underline-offset-4" : ""
              }`}
            >
              Ciudades
            </Link>
          </li>
          <li>
            <Link href="/#contact" className="hover:opacity-80 transition">
              Contacto
            </Link>
          </li>

          {/* Admin chip */}
          {isAdmin && (
            <li>
              <Link
                href="/admin/groups"
                className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-5 py-2 shadow-md hover:opacity-90"
              >
                Admin
              </Link>
            </li>
          )}

          <li>
            <Link
              href={user ? "/profile" : "/auth"}
              className="rounded-full bg-gcText text-[#fef8f4] font-dmserif px-5 py-2 shadow-md hover:opacity-90"
            >
              {user ? "Mi cuenta" : "¡Únete!"}
            </Link>
          </li>
        </ul>

        {/* Mobile CTA */}
        <div className="md:hidden">
          <Link
            href={user ? "/profile" : "/auth"}
            className="rounded-full bg-gcText text-[#fef8f4] font-dmserif px-4 py-2 shadow-md hover:opacity-90"
          >
            {user ? "Cuenta" : "Únete"}
          </Link>
        </div>
      </nav>
    </header>
  );
}


