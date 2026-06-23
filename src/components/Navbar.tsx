"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileIcon from "./icons/ProfileIcon";
import { useState } from "react";
import { signOut } from "next-auth/react";

const NAV_LINKS = [
	{ href: "/dashboard", label: "Dashboard" },
	{ href: "/history", label: "History" },
];

const Navbar = () => {
	const pathname = usePathname();
	const [isProfileOpen, setIsProfileOpen] = useState(false);

	return (
		<div className="flex w-full justify-center items-center bg-black">
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
			<button
				className="cursor-pointer bg-amber-300"
				onClick={() => setIsProfileOpen((prev) => !prev)}
			>
				<ProfileIcon />
			</button>
			{isProfileOpen && (
				<button
					onClick={(e) => {
						if (e.target !== e.currentTarget) {
							setIsProfileOpen((prev) => !prev);
						}
						signOut();
					}}
					className="absolute top-22 right-10 px-4 py-2 border border-white/20 text-sm text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
				>
					Sign Out
				</button>
			)}
		</div>
	);
};

export default Navbar;
