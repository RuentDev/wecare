import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
        <span className="text-white font-bold text-sm">W</span>
      </div>
      <span className="font-bold text-lg text-neutral-dark hidden sm:inline group-hover:text-primary transition-colors">
        WeCare
      </span>
    </Link>
  );
};

export default Logo;
