const steps = [
	{
		number: "01",
		title: "Tempel link video",
		description:
			"Masukkan URL video YouTube yang ingin dipantau. Tidak perlu setup tambahan.",
	},
	{
		number: "02",
		title: "Sistem memindai komentar",
		description:
			"Setiap komentar dianalisis dan diberi label Spam atau Normal, termasuk yang disamarkan dengan karakter homoglyph.",
	},
	{
		number: "03",
		title: "Sembunyikan dalam satu klik",
		description:
			"Pilih komentar yang terdeteksi spam, lalu sembunyikan langsung dari YouTube tanpa membuka studio.",
	},
	{
		number: "04",
		title: "Telusuri & unduh riwayat",
		description:
			"Semua hasil tersimpan otomatis. Lihat riwayat kapan saja atau ekspor ke CSV untuk laporan.",
	},
];

const HowItWorks = () => {
	return (
		<section className="w-full bg-white py-24 px-6 dark:bg-black sm:px-16">
			<div className="mx-auto max-w-5xl">
				<div className="mb-14 text-center">
					<p className="mb-3 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
						Cara kerja
					</p>
					<h2 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
						Empat langkah mudah
					</h2>
				</div>

				<ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
					{steps.map((step, index) => (
						<li key={step.number} className="relative flex flex-col gap-3">
							<span className="text-sm font-medium text-zinc-400 dark:text-zinc-600">
								{step.number}
							</span>
							<h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
								{step.title}
							</h3>
							<p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
								{step.description}
							</p>
							{index < steps.length - 1 && (
								<span
									aria-hidden="true"
									className="absolute top-2 -right-5 hidden text-zinc-300 dark:text-zinc-700 lg:block"
								>
									→
								</span>
							)}
						</li>
					))}
				</ol>
			</div>
		</section>
	);
};

export default HowItWorks;
