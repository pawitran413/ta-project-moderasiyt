const features = [
	{
		title: "Akses moderator, bukan akses channel",
		description:
			"Sistem bekerja sebagai moderator channel Anda, bukan lewat login penuh ke akun YouTube. Bisa menyembunyikan komentar, tapi tidak bisa mengunggah video atau mengubah pengaturan channel. Akses ini bisa dicabut kapan saja dari YouTube Studio.",
	},
	{
		title: "Scan per video",
		description:
			"Targetkan video tertentu, bukan seluruh channel sekaligus, jadi Anda tahu pasti komentar mana yang sedang dipantau.",
	},
	{
		title: "Sembunyikan otomatis",
		description:
			"Bukan sekadar memberi label. Komentar yang terdeteksi spam bisa langsung disembunyikan dari YouTube tanpa berpindah aplikasi.",
	},
	{
		title: "Riwayat tersimpan",
		description:
			"Setiap komentar yang sudah diproses tercatat dengan label dan status tindakan, bisa ditelusuri kapan saja.",
	},
	{
		title: "Ekspor ke CSV",
		description:
			"Unduh hasil prediksi untuk laporan, audit, atau analisis lebih lanjut di luar dashboard.",
	},
];

const Features = () => {
	return (
		<section className="w-full bg-zinc-50 py-24 px-6 dark:bg-black sm:px-16">
			<div className="mx-auto max-w-5xl">
				<div className="mb-14 text-center">
					<p className="mb-3 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
						Fitur
					</p>
					<h2 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
						Lebih dari sekadar deteksi
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					{features.map((feature, index) => (
						<div
							key={feature.title}
							className={`rounded-2xl border p-7 ${
								index === 0
									? "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-black sm:col-span-2"
									: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black"
							}`}
						>
							<h3 className="mb-2 text-lg font-medium text-zinc-950 dark:text-zinc-50">
								{feature.title}
							</h3>
							<p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;
