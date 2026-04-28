import { Activity } from "lucide-react";
import Link from "next/link";

const Logo = ({ isCollapsed }: { isCollapsed: boolean }) => {
  return (
    <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-xl tracking-tight text-slate-800">
            WeCare
          </span>
        )}
      </Link>
    </div>
  );
};

export default Logo;
