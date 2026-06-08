"use client";

import hideComment from "@/actions/moderateActions";
import { TKomentarML } from "@/actions/scanActions";
import { useState } from "react";

interface UseHideCommentsProps {
	hasilPrediksi: TKomentarML[];
	ownerCurrentVideo: string;
	youtubeChannelId: string | null;
	onNotLinked: () => void;
}

interface UseHideCommentsReturn {
	spamCommentIds: string[];
	isHideLoading: boolean;
	hideError: string;
	hideSuccess: string;
	handleHideComments: () => Promise<void>;
}

export const useHideComments = ({
	hasilPrediksi,
	ownerCurrentVideo,
	youtubeChannelId,
	onNotLinked,
}: UseHideCommentsProps): UseHideCommentsReturn => {
	const [isHideLoading, setIsHideLoading] = useState(false);
	const [hideError, setHideError] = useState("");
	const [hideSuccess, setHideSuccess] = useState("");
	const [prevHasilPrediksi, setPrevHasilPrediksi] = useState(hasilPrediksi);

	if (hasilPrediksi !== prevHasilPrediksi) {
		setPrevHasilPrediksi(hasilPrediksi);
		setHideError("");
		setHideSuccess("");
	}

	const spamCommentIds = hasilPrediksi
		.filter((c) => c.prediksi_svm_utama.label === "Spam")
		.map((c) => String(c.komentar_id));

	const handleHideComments = async () => {
		if (spamCommentIds.length === 0) return;

		if (!youtubeChannelId) {
			onNotLinked();
			return;
		}

		if (ownerCurrentVideo !== youtubeChannelId) {
			setHideError(
				"Hanya pemilik video yang diizinkan menyembunyikan komentar spam",
			);
			return;
		}

		setIsHideLoading(true);
		setHideError("");
		setHideSuccess("");
		try {
			const result = await hideComment(spamCommentIds);
			if (!result.success) {
				setHideError(result.message ?? "Gagal menyembunyikan komentar");
				return;
			}
			setHideSuccess(
				`${result.data.success ?? spamCommentIds.length} komentar berhasil disembunyikan`,
			);
		} catch (error) {
			setHideError(`Terjadi kesalahan saat memproses permintaan: ${error}`);
		} finally {
			setIsHideLoading(false);
		}
	};

	return {
		spamCommentIds,
		isHideLoading,
		hideError,
		hideSuccess,
		handleHideComments,
	};
};
