import Badge from "@/components/Badge";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ModerationHistory from "@/models/ModerationHistory";
import { getServerSession } from "next-auth";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

const HistoryPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) => {
	const session = await getServerSession(authOptions);
	const { page } = await searchParams;

	const currentPage = Math.max(1, parseInt(page ?? "1") || 1);
	const skip = (currentPage - 1) * ITEMS_PER_PAGE;

	await connectDB();

	const [history, totalItems] = await Promise.all([
		ModerationHistory.find({ user_id: session?.user.id })
			.sort({ waktu_diproses: -1 })
			.skip(skip)
			.limit(ITEMS_PER_PAGE)
			.lean(),
		ModerationHistory.countDocuments({ user_id: session?.user.id }),
	]);

	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
	const rangeStart = totalItems === 0 ? 0 : skip + 1;
	const rangeEnd = Math.min(skip + ITEMS_PER_PAGE, totalItems);

	return (
		<div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-4 py-10">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Riwayat Moderasi</h1>
				{totalItems > 0 && (
					<p className="text-sm text-white/50">
						{rangeStart}–{rangeEnd} dari {totalItems} komentar
					</p>
				)}
			</div>

			{history.length === 0 ? (
				<div className="flex flex-col items-center gap-2 border border-dashed border-white/15 rounded-lg px-6 py-14 text-center">
					<p className="text-white/70">Belum ada riwayat moderasi</p>
					<p className="text-sm text-white/40">
						Mulai pindai video di halaman{" "}
						<Link href="/dashboard" className="underline hover:text-white">
							Dashboard
						</Link>
					</p>
				</div>
			) : (
				<div className="border border-white/15 rounded-lg overflow-hidden overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-white/5 text-left text-white/60">
								<th className="whitespace-nowrap px-4 py-2.5 font-medium">
									Username
								</th>
								<th className="px-4 py-2.5 font-medium">Komentar</th>
								<th className="whitespace-nowrap px-4 py-2.5 font-medium">
									Label
								</th>
								<th className="whitespace-nowrap px-4 py-2.5 font-medium">
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							{history.map((item, index) => {
								const isSpam =
									item.hasil_analisis_ml.prediksi_svm_utama.label === "Spam";
								return (
									<tr
										key={index}
										className="border-t border-white/10 hover:bg-white/3 transition-colors"
									>
										<td className="whitespace-nowrap px-4 py-2.5 text-white/80 max-w-50 truncate">
											{item.data_komentar.username_pengirim}
										</td>
										<td className="px-4 py-2.5 text-white/80 max-w-100 truncate">
											{item.data_komentar.teks_komentar}
										</td>
										<td className="px-4 py-2.5">
											<Badge variant={isSpam ? "danger" : "success"}>
												{item.hasil_analisis_ml.prediksi_svm_utama.label}
											</Badge>
										</td>
										<td className="whitespace-nowrap px-4 py-2.5 text-white/60">
											{item.status_tindakan.tindakan_diambil}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-4 text-sm">
					{currentPage > 1 ? (
						<Link
							href={`?page=${currentPage - 1}`}
							className="px-4 py-1.5 border border-white/15 rounded-full hover:bg-white/5 transition-colors"
						>
							Sebelumnya
						</Link>
					) : (
						<span className="px-4 py-1.5 border border-white/5 text-white/30 rounded-full cursor-not-allowed">
							Sebelumnya
						</span>
					)}
					<span className="text-white/50">
						Halaman {currentPage} dari {totalPages}
					</span>
					{currentPage < totalPages ? (
						<Link
							href={`?page=${currentPage + 1}`}
							className="px-4 py-1.5 border border-white/15 rounded-full hover:bg-white/5 transition-colors"
						>
							Selanjutnya
						</Link>
					) : (
						<span className="px-4 py-1.5 border border-white/5 text-white/30 rounded-full cursor-not-allowed">
							Selanjutnya
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default HistoryPage;
