import nodemailer from "nodemailer";

const isSecure = process.env.EMAIL_SMTP_SECURE === "true";

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SMTP_HOST,
	port: Number(process.env.EMAIL_SMTP_PORT) || 465,
	secure: isSecure,
	auth: {
		user: process.env.EMAIL_SMTP_USER,
		pass: process.env.EMAIL_SMTP_PASS,
	},
});

export const sendVerificationEmail = async (email: string, token: string) => {
	const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

	const mailOptions = {
		from: `"Commet SmartMod" <${process.env.SMTP_USER}>`,
		to: email,
		subject: "Verifikasi Akun Email Anda",
		html: `
      <h1>Verifikasi Email Anda</h1>
      <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk memverifikasi akun Anda. Tautan ini berlaku selama 24 jam.</p>
      <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verifikasi Email</a>
      <p>Jika tombol tidak berfungsi, buka tautan berikut di browser Anda:</p>
      <p>${verificationUrl}</p>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
		return { success: true };
	} catch (error) {
		console.error("Gagal mengirim email: ", error);
		return { success: false };
	}
};
