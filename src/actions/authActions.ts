"use server";

import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import { sendVerificationEmail } from "@/lib/mailer";
import {
	generateToken,
	hashToken,
	VERIFICATION_TOKEN_TTL_MS,
} from "@/lib/token";
import z from "zod";

const RegisterSchema = z.object({
	name: z
		.string()
		.min(2, "Nama minimal 2 karakter")
		.max(50, "Nama maksimal 50 karakter")
		.trim(),
	email: z.string().email("Format email tidak valid").toLowerCase().trim(),
	password: z
		.string()
		.min(6, "Password minimal 6 karakter")
		.max(30, "Password maksimal 30 karakter"),
});

export async function registerUser(rawFormData: unknown) {
	try {
		const validatedData = RegisterSchema.parse(rawFormData);

		await connectDB();

		const existingUser = await User.findOne({ email: validatedData.email });
		if (existingUser) {
			return { success: false, message: "Email sudah terdaftar" };
		}

		const { raw, hash } = generateToken();

		await User.create({
			name: validatedData.name,
			email: validatedData.email,
			password: validatedData.password,
			provider: "credentials",
			emailVerified: null,
			emailVerificationTokenHash: hash,
			emailVerificationExpires: new Date(
				Date.now() + VERIFICATION_TOKEN_TTL_MS,
			),
			botVerified: false,
		});

		try {
			await sendVerificationEmail(validatedData.email, raw);
		} catch (mailError) {
			console.error("Gagal mengirim email verifikasi: ", mailError);
			return {
				success: true,
				message: "Registrasi berhasil, tetapi gagal megirim email verifikasi",
			};
		}

		return {
			success: true,
			message:
				"Registrasi berhasil. Silakan cek email Anda untuk verifikasi akun",
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error(error);
			return { success: false, message: error.issues[0].message };
		}

		console.error(error);
		return { success: false, message: "Terjadi kesalahan pada server" };
	}
}

export async function verifyEmail(token: string) {
	try {
		if (!token) {
			return { success: false, message: "Token tidak valid" };
		}

		await connectDB();

		const tokenHash = hashToken(token);

		const user = await User.findOne({
			emailVerificationTokenHash: tokenHash,
		}).select("+emailVerificationTokenHash +emailVerificationExpires");

		if (!user) {
			return { success: false, message: "Tautan verifikasi tidak valid" };
		}

		if (
			!user.emailVerificationExpires ||
			user.emailVerificationExpires.getTime() < Date.now()
		) {
			return { success: false, message: "Tautan verifikasi kedaluwarsa" };
		}

		user.emailVerified = new Date();
		user.emailVerificationTokenHash = null;
		user.emailVerificationExpires = null;
		await user.save();

		return {
			success: true,
			message: "Email berhasil diverifikasi",
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: "Terjadi kesalahan pada server" };
	}
}
