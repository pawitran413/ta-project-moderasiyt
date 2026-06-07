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

	return (
		<div>
			<h1>History</h1>

			<table className="w-full">
				<thead>
					<tr>
						<th>Username</th>
						<th className="pl-5">Komentar</th>
						<th className="pl-5">Label</th>
						<th className="pl-5">Status</th>
					</tr>
				</thead>
				<tbody>
					{history.map((item, index) => (
						<tr key={index}>
							<td>{item.data_komentar.username_pengirim}</td>
							<td className="pl-5">{item.data_komentar.teks_komentar}</td>
							<td
								className={
									item.hasil_analisis_ml.prediksi_svm_utama.label == "Spam"
										? "text-red-600 pl-5"
										: "pl-5"
								}
							>
								{item.hasil_analisis_ml.prediksi_svm_utama.label}
							</td>
							<td className="pl-5">{item.status_tindakan.tindakan_diambil}</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className="flex gap-2 mt-5">
				{currentPage > 1 && <a href={`?page=${currentPage - 1}`}>Sebelumnya</a>}
				<span>{currentPage}</span>
				{currentPage < totalPages && (
					<Link href={`?page=${currentPage + 1}`}>Setelahnya</Link>
				)}
			</div>
		</div>
	);
};

export default HistoryPage;
