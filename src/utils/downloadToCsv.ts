import { TKomentarML } from "@/actions/scanActions";

const downloadToCsv = (hasilPrediksi: TKomentarML[]) => {
	const headers = [
		"Komentar ID",
		"Username",
		"Teks Komentar",
		"Label SVM",
		"Labek NB",
	];

	const rows = hasilPrediksi.map((c) => [
		`"${c.komentar_id}"`,
		`"${c.username_pengirim}"`,
		`"${c.teks_komentar}"`,
		`"${c.prediksi_svm_utama.label}"`,
		`"${c.prediksi_nb_pembanding.label}"`,
	]);

	const csvContent =
		"\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = "hasil-prediksi.csv";

	document.body.appendChild(link);
	link.click();

	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export default downloadToCsv;
