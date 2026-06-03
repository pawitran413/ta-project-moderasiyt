"use client";

import { scanVideo, TKomentarML } from "@/actions/scanActions";
import { Session } from "next-auth";
import { useState } from "react";

const DashboardClient = ({ session }: { session: Session }) => {
	const [hasilPrediksi, setHasilPrediksi] = useState<TKomentarML[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (event: React.SubmitEvent) => {
		event.preventDefault();
		setIsLoading(true);
		setError("");
		const videoUrl = event.target.urlVideo.value;

		const result = await scanVideo(videoUrl);
		console.log(result);

		if (!result.success) {
			console.error(result.message);
			setIsLoading(false);
			return;
		}

		if (result.data.hasil_analisis_ml.length == 0) {
			setError("No comments on this video");
			setIsLoading(false);
			return;
		}

		setHasilPrediksi(result.data.hasil_analisis_ml);
		event.target.reset();
		setIsLoading(false);
	};

	return (
		<div className="flex flex-col gap-7">
			<div>
				<p>Login as: {session.user.name}</p>
			</div>

			<form
				className="flex flex-col gap-3 w-100 mx-auto border border-white/25 p-5 rounded-lg"
				onSubmit={handleSubmit}
			>
				<div className="flex flex-col gap-1">
					<label htmlFor="urlVideo" className="px-4 text-center">
						URL Video YouTube
					</label>
					<input
						type="url"
						name="urlVideo"
						id="urlVideo"
						pattern="https:\/\/(www\.)?(youtube\.com|youtu\.be).*"
						placeholder="https://www.youtube.com/watch?v=tGv7CUutzqU"
						className="py-1.5 px-4 rounded-full border border-[#ccc]/25"
						required
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="p-1.5 bg-white text-black rounded-full cursor-pointer mt-3"
				>
					{isLoading ? "Processing..." : "Scan"}
				</button>
			</form>

			{error && <p className="text-center">{error}</p>}

			{hasilPrediksi.length > 0 && (
				<table>
					<thead>
						<tr>
							<th>Label SVM</th>
							<th>Label NB</th>
							<th>Komentar</th>
						</tr>
					</thead>
					<tbody>
						{hasilPrediksi.map((data, index) => (
							<tr key={index}>
								<td
									className={`px-2 ${data.prediksi_svm_utama.label == "Spam" && "text-red-600"}`}
								>
									{data.prediksi_svm_utama.label}
								</td>
								<td
									className={`px-2 ${data.prediksi_nb_pembanding.label == "Spam" && "text-red-600"}`}
								>
									{data.prediksi_nb_pembanding.label}
								</td>
								<td className="px-2">{data.teks_komentar}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default DashboardClient;
