import { HeaderProvider } from "@/contexts/header";

import MobileNavs from "./mobile-navs";
import RightButtons from "./right-buttons";
import Navs from "./navs";
import Logo from "./logo";

const navLinks = [
  { href: "/booking", label: "Make an Appointment" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/ask-a-doctor", label: "Ask a Doctor" },
  { href: "/clinics", label: "Clinics" },
];

export function Header() {
  return (
    <HeaderProvider>
      <header className="border-b border-neutral-100 sticky top-0 z-50 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            <Logo />

            {/* Desktop Navigation */}
            <Navs links={navLinks} />

            <RightButtons />
          </div>
          <MobileNavs links={navLinks} />
        </div>
      </header>
    </HeaderProvider>
  );
}
