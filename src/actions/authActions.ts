"use server";

import User from "@/models/User";
import connectDB from "@/lib/mongodb";
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

		await User.create({
			name: validatedData.name,
			email: validatedData.email,
			password: validatedData.password,
			provider: "credentials",
			emailVerified: new Date(),
			// youtubeChannelId: null,
			botVerified: false,
		});

		return { success: true, message: "Registrasi berhasil" };
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error(error)
			return { success: false, message: error.issues[0].message };
		}

		console.error(error)
		return { success: false, message: "Terjadi kesalahan pada server" };
	}
}
