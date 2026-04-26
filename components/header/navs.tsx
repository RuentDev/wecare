import Link from "next/link";

interface Props {
  links: Array<{
    href: string;
    label: string;
  }>;
}

const Navs: React.FC<Props> = ({ links }) => {
  return (
    <nav className="hidden lg:flex gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="px-3 py-2 text-neutral-dark hover:text-primary text-sm font-medium rounded-md transition-all duration-200 hover:bg-neutral-light"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default Navs;
