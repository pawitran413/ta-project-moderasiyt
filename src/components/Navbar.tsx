"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
	{ href: "/dashboard", label: "Dashboard" },
	{ href: "/history", label: "History" },
];

const Navbar = () => {
	const pathname = usePathname();

	return (
		<div className="flex w-full justify-center bg-black">
			<div className="flex border border-white/20 rounded-full p-1">
				{NAV_LINKS.map(({ href, label }) => (
					<Link
						key={href}
						href={href}
						className={`px-5 py-1 rounded-full ${pathname.startsWith(href) ? "bg-white text-black" : "hover:bg-white/10"}`}
					>
						{label}
					</Link>
				))}
			</div>
		</div>
	);
};

export default Navbar;
