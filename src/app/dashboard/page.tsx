"use client";

import { useState } from "react";

type THasilAnalisis = {
	komentar_id: string;
	username_pengirim: string;
	teks_komentar: string;
	timestamp_komentar: string;
	prediksi_svm_utama: {
		label: "Normal" | "Spam";
		confidence_score: number;
	};
}[];

const DashboardPage = () => {
	const [hasilPrediksi, setHasilPrediksi] = useState<THasilAnalisis>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.SubmitEvent) => {
		event.preventDefault();
		setIsLoading(true);
		const data = { video_url: event.target.urlVideo.value };

		const response = await fetch("http://127.0.0.1:8000/predict", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		const result = await response.json();
		setHasilPrediksi(result.hasil_analisis_ml);
		event.target.reset();
		setIsLoading(false);
	};

	return (
		<div className="m-10">
			<h1>Dashboard</h1>

			<form
				className="flex flex-col gap-3 w-100 mx-auto"
				onSubmit={handleSubmit}
			>
				<div className="flex flex-col">
					<label htmlFor="urlVideo">URL Video YouTube</label>
					<input
						type="text"
						name="urlVideo"
						id="urlVideo"
						className="p-1 rounded-sm border border-[#ccc]/10"
					/>
				</div>

				<button
					type="submit"
					className="p-2 bg-[#4f46e5] text-white rounded-sm cursor-pointer mt-3"
				>
					{isLoading ? "Memproses..." : "Mulai Scan"}
				</button>
			</form>

			<table>
				<thead>
					<tr>
						<th>Label</th>
						<th>Komentar</th>
					</tr>
				</thead>
				<tbody>
					{hasilPrediksi.map((data, index) => (
						<tr
							key={index}
							className={
								data.prediksi_svm_utama.label == "Spam" ? "text-red-600" : ""
							}
						>
							<td className="px-2">{data.prediksi_svm_utama.label}</td>
							<td className="px-2">{data.teks_komentar}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default DashboardPage;
