import Link from "next/link";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function Home() {
	return (
		<div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex w-full flex-col items-center justify-center py-32 px-16 gap-10 bg-white dark:bg-black">
				<p className="font-mono bg-white/10 px-4 py-1 rounded-full">
					Commet SmartMod
				</p>
				<div className="flex flex-col items-center gap-6 text-center sm:text-left">
					<h1 className="max-w-3xl text-center text-5xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
						Bersihkan Kolom Komentar YouTube dari Spam Judi Online
					</h1>
					<p className="max-w-xl text-center text-lg leading-8 text-zinc-600 dark:text-zinc-400">
						Sistem mendeteksi spam{" "}
						<span className="font-medium text-zinc-950 dark:text-zinc-50">
							judi online
						</span>{" "}
						termasuk yang disamarkan dengan{" "}
						<span className="font-medium text-zinc-950 dark:text-zinc-50">
							karakter homoglyph
						</span>
						, yang lolos dari filter bawaan YouTube
					</p>
				</div>
				<div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
					<Link
						className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5"
						href="/dashboard"
						rel="noopener noreferrer"
					>
						Mulai sekarang
					</Link>
				</div>
				<p className="text-sm text-center text-zinc-500 dark:text-zinc-500">
					Tautkan channel YouTube Anda dalam kurang dari satu menit
				</p>
			</main>
			<HowItWorks />
			<Footer />
		</div>
	);
}
