import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";

const UserDropdown = () => {
  const user = { role: "patient" };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hidden lg:flex text-neutral-dark hover:bg-neutral-light hover:text-primary font-medium"
        >
          Ruentgen
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {user?.role === "patient" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/patient/appointments">My Appointments</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/patient/medical-record">Medical Record</Link>
            </DropdownMenuItem>
          </>
        )}
        {user?.role === "admin" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">Admin Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/doctors">Manage Doctors</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/appointments">Manage Appointments</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem
        // onClick={logout}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
