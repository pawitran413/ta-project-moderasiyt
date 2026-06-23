import { TKomentarML } from "@/actions/scanActions";
import Badge from "@/components/Badge";

const ResultTable = ({ hasilPrediksi }: { hasilPrediksi: TKomentarML[] }) => {
	if (hasilPrediksi.length === 0) return null;

	return (
		<div className="w-full max-w-160 border border-white/15 rounded-lg overflow-auto lg:overflow-hidden">
			<table className="w-full text-sm">
				<thead>
					<tr className="bg-white/5 text-left text-white/60">
						<th className="whitespace-nowrap px-4 py-2.5 font-medium">
							Label SVM
						</th>
						<th className="whitespace-nowrap px-4 py-2.5 font-medium">
							Label NB
						</th>
						<th className="px-4 py-2.5 font-medium">Komentar</th>
					</tr>
				</thead>
				<tbody>
					{hasilPrediksi.map((data, index) => (
						<tr
							key={index}
							className="border-t border-white/10 hover:bg-white/3 transition-colors"
						>
							<td className="px-4 py-2.5">
								<Badge
									variant={
										data.prediksi_svm_utama.label === "Spam"
											? "danger"
											: "success"
									}
								>
									{data.prediksi_svm_utama.label}
								</Badge>
							</td>
							<td className="px-4 py-2.5">
								<Badge
									variant={
										data.prediksi_nb_pembanding.label === "Spam"
											? "danger"
											: "success"
									}
								>
									{data.prediksi_nb_pembanding.label}
								</Badge>
							</td>
							<td className="px-4 py-2.5 text-white/80">
								{data.teks_komentar}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ResultTable;
