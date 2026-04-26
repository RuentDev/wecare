import Link from "next/link";
import { Button } from "@/components/ui/button";
import HamburgerBtn from "./hamburger-btn";

const RightButtons = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Auth Buttons - Desktop */}
      <div className="hidden sm:flex items-center gap-2">
        <Link href="/login">
          <Button
            variant="outline"
            size="sm"
            className="text-neutral-dark border-neutral-300 hover:bg-neutral-light"
          >
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button variant="default" size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
      <HamburgerBtn />
    </div>
  );
};

export default RightButtons;
