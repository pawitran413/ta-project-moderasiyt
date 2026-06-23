import Link from "next/link";

const Footer = () => {
	return (
		<>
			<footer className="w-full border-t border-zinc-200 bg-zinc-50 px-6 py-10 dark:border-zinc-800 dark:bg-zinc-950 sm:px-16">
				<div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row">
					<p className="text-center">
						Riset Tugas Akhir — Teknik Elektro, Universitas Jenderal Soedirman
					</p>
					<div className="flex gap-5">
						<Link
							href="/dashboard"
							className="hover:text-zinc-950 dark:hover:text-zinc-50"
						>
							Dashboard
						</Link>
						<a
							href="mailto:amin.pawitran@mail.unsoed.ac.id"
							className="hover:text-zinc-950 dark:hover:text-zinc-50"
						>
							Kontak
						</a>
					</div>
				</div>
			</footer>
		</>
	);
};

export default Footer;
