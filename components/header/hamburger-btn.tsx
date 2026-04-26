"use client";
import { useHeader } from "@/contexts/header";
import { Button } from "../ui/button";
import { X, Menu } from "lucide-react";

const HamburgerBtn = () => {
  const { mobileMenuOpen, toggleMobileMenu } = useHeader();
  return (
    <Button
      variant="ghost"
      onClick={() => toggleMobileMenu()}
      className="lg:hidden p-2 rounded-md text-neutral-dark hover:bg-neutral-light transition-colors"
      aria-label="Toggle menu"
    >
      {mobileMenuOpen ? (
        <X className="w-5 h-5" />
      ) : (
        <Menu className="w-5 h-5" />
      )}
    </Button>
  );
};

export default HamburgerBtn;
