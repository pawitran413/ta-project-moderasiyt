"use server";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ModerationHistory from "@/models/ModerationHistory";
import { getServerSession } from "next-auth";

const hideComment = async (spamCommentId: string[]) => {
	const session = await getServerSession(authOptions);
	if (!session?.user.youtubeChannelId) {
		return {
			success: false,
			message: "Unauthorized: YouTube channel belum ditautkan",
		};
	}

	let data;
	let successHideCommentIds: string[];

	try {
		const response = await fetch(`${process.env.BACKEND_ML_URL}/moderate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": `${process.env.INTERNAL_API_KEY}`,
			},
			body: JSON.stringify({
				comment_ids: spamCommentId,
				moderation_status: "heldForReview",
				ban_author: false,
			}),
		});

		if (!response.ok) {
			return { success: false, message: "Gagal terhubung ke backend ML" };
		}

		data = await response.json();
		successHideCommentIds = data.results
			.filter(
				(c: { comment_id: string; status: string }) => c.status === "success",
			)
			.map((c: { comment_id: string; status: string }) => c.comment_id);
	} catch (error) {
		console.error("Gagal hide comment: ", error);
		return { success: false, message: "Terjadi kesalahan pada server ML" };
	}

	if (successHideCommentIds.length > 0) {
		try {
			await connectDB();
			const updateResult = await ModerationHistory.updateMany(
				{ "data_komentar.komentar_id": { $in: successHideCommentIds } },
				{ $set: { "status_tindakan.tindakan_diambil": "Disembunyikan" } },
			);
			console.log(updateResult);
		} catch (error) {
			console.error("Gagal update data di database:", error);
		}
	}

	if (data.failed > 0) {
		return {
			success: false,
			message: `Berhasil menyembunyikan ${data.success}. Gagal menyembunyikan ${data.failed} komentar`,
			data,
		};
	}

	return {
		success: true,
		message: "Seluruh komentar berhasil disembunyikan",
		data,
	};
};

export default hideComment;
