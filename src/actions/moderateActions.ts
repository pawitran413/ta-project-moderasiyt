"use server";

const hideComment = async (spamCommentId: string[]) => {
	try {
		const response = await fetch(`${process.env.BACKEND_ML_URL}/moderate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				comment_ids: spamCommentId,
				moderation_status: "heldForReview",
				ban_author: false,
			}),
		});

		if (!response.ok) {
			return { success: false, message: "Gagal terhubung ke backend ML" };
		}

		const data = await response.json();
		return { success: true, message: "Komentar berhasil disembunyikan", data };
	} catch (error) {
		console.error("Gagal hide comment: ", error);
		return { success: false, message: "Terjadi kesalahan pada server ML" };
	}
};

export default hideComment;
