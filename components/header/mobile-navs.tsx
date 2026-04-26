"use client";
import { useHeader } from "@/contexts/header";
import Link from "next/link";
import React from "react";

interface Props {
  links: Array<{
    href: string;
    label: string;
  }>;
}
const MobileNavs: React.FC<Props> = ({ links }) => {
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useHeader();

  if (!mobileMenuOpen) return null;
  return (
    <nav className="lg:hidden pb-4 border-t border-neutral-100 pt-4 space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-3 py-2 text-neutral-dark hover:text-primary hover:bg-neutral-light rounded-md text-sm font-medium transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default MobileNavs;
