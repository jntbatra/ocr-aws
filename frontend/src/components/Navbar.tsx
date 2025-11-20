"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Receipt, LayoutDashboard, Upload, List, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuth();

  // Don't show navbar on auth pages
  if (!isAuthenticated) {
    return null;
  }

  const links = [
    { href: "/", label: "Home", icon: Receipt },
    { href: "/upload", label: "Record Expense", icon: Upload },
    { href: "/expenses", label: "Expenses", icon: List },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Expense Tracker
          </Link>
          <div className="flex gap-1 items-center">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  pathname === href
                    ? "bg-white/20 font-semibold"
                    : "hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
