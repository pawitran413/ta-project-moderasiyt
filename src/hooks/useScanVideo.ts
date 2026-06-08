"use client";

import { scanVideo, TKomentarML } from "@/actions/scanActions";
import { useState } from "react";

interface UseScanVideoReturn {
	hasilPrediksi: TKomentarML[];
	ownerCurrentVideo: string;
	isScanLoading: boolean;
	scanError: string;
	handleSubmit: (event: React.SubmitEvent) => Promise<void>;
}

export const useScanVideo = (): UseScanVideoReturn => {
	const [hasilPrediksi, setHasilPrediksi] = useState<TKomentarML[]>([]);
	const [ownerCurrentVideo, setOwnerCurrentVideo] = useState("");
	const [isScanLoading, setIsScanLoading] = useState(false);
	const [scanError, setScanError] = useState("");

	const handleSubmit = async (event: React.SubmitEvent) => {
		event.preventDefault();
		setIsScanLoading(true);
		setScanError("");

		const form = event.target;
		const videoUrl = (form.elements.namedItem("urlVideo") as HTMLInputElement)
			.value;

		const result = await scanVideo(videoUrl);

		if (!result.success) {
			setScanError(result.message ?? "Terjadi kesalahan saat scan");
			setIsScanLoading(false);
			return;
		}
		if (result.data.hasil_analisis_ml.length === 0) {
			setScanError("Video ini tidak memliki komentar");
			setIsScanLoading(false);
			return;
		}

		const sorted = result.data.hasil_analisis_ml.reduce(
			(acc, item) => {
				if (item.prediksi_svm_utama.label === "Spam") {
					acc.spam.push(item);
				} else {
					acc.normal.push(item);
				}
				return acc;
			},
			{ spam: [] as TKomentarML[], normal: [] as TKomentarML[] },
		);

		setHasilPrediksi([...sorted.spam, ...sorted.normal]);
		setOwnerCurrentVideo(result.data.channel_id);
		form.reset();
		setIsScanLoading(false);
	};

	return {
		hasilPrediksi,
		ownerCurrentVideo,
		isScanLoading,
		scanError,
		handleSubmit,
	};
};
