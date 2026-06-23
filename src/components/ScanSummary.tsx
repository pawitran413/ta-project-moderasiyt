import { TKomentarML } from "@/actions/scanActions";

const ScanSummary = ({ hasilPrediksi }: { hasilPrediksi: TKomentarML[] }) => {
	if (hasilPrediksi.length === 0) return null;

	const totalSpam = hasilPrediksi.filter(
		(item) => item.prediksi_svm_utama.label === "Spam",
	).length;
	const totalNormal = hasilPrediksi.length - totalSpam;

	const summary = [
		{ label: "Komentar dipindai", value: hasilPrediksi.length },
		{ label: "Terdeteksi spam", value: totalSpam, accent: "text-red-400" },
		{ label: "Normal", value: totalNormal, accent: "text-green-400" },
	];

	return (
		<div className="w-full max-w-160 grid grid-cols-3 gap-3">
			{summary.map((item) => (
				<div
					key={item.label}
					className="border border-white/15 rounded-lg px-4 py-3 text-center"
				>
					<p className={`text-2xl font-semibold ${item.accent ?? ""}`}>
						{item.value}
					</p>
					<p className="text-xs text-white/60 mt-1">{item.label}</p>
				</div>
			))}
		</div>
	);
};

export default ScanSummary;
