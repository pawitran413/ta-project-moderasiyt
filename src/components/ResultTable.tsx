import { TKomentarML } from "@/actions/scanActions";

const ResultTable = ({ hasilPrediksi }: { hasilPrediksi: TKomentarML[] }) => {
	if (hasilPrediksi.length === 0) return null;

	return (
		<table>
			<thead>
				<tr>
					<th className="whitespace-nowrap px-2">Label SVM</th>
					<th className="whitespace-nowrap px-2">Label NB</th>
					<th>Komentar</th>
				</tr>
			</thead>
			<tbody>
				{hasilPrediksi.map((data, index) => (
					<tr key={index} className="border-b border-white/15 last:border-none">
						<td
							className={`text-center ${data.prediksi_svm_utama.label == "Spam" && "text-red-600"}`}
						>
							{data.prediksi_svm_utama.label}
						</td>
						<td
							className={`text-center ${data.prediksi_nb_pembanding.label == "Spam" && "text-red-600"}`}
						>
							{data.prediksi_nb_pembanding.label}
						</td>
						<td className="pl-4 py-2">{data.teks_komentar}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default ResultTable;
