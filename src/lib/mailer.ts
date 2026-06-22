import nodemailer from "nodemailer";

const SMTP_HOST = process.env.EMAIL_SMTP_HOST || "";
const SMTP_PORT = Number(process.env.EMAIL_SMTP_PORT || 587);
const SMTP_SECURE = process.env.EMAIL_SMTP_SECURE === "true";
const SMTP_USER = process.env.EMAIL_SMTP_USER || "";
const SMTP_PASSWORD = process.env.EMAIL_SMTP_PASS || "";
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const APP_URL = process.env.NEXTAUTH_URL || "";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
		throw new Error("Konfigurasi SMTP belum lengkap");
	}

	if (!transporter) {
		transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			secure: SMTP_SECURE,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASSWORD,
			},
		});
	}

	return transporter;
}

export async function sendVerificationEmail(email: string, token: string) {
	const verifyUrl = `${APP_URL}/verify-email/${token}`;

	await getTransporter().sendMail({
		from: MAIL_FROM,
		to: email,
		subject: "Verifikasi alamat email Anda",
		html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
				<h2>Verifikasi Email</h2>
				<p>Terima kasih telah mendaftar. Klik tombol di bawah untuk memverifikasi alamat email Anda. Tautan ini berlaku selama 1 jam.</p>
				<p style="margin: 24px 0;">
					<a href="${verifyUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
						Verifikasi Email
					</a>
				</p>
				<p>Atau salin tautan berikut ke browser Anda:</p>
				<p style="word-break: break-all;">${verifyUrl}</p>
				<p>Jika Anda tidak mendaftar di layanan ini, abaikan email ini.</p>
			</div>
    `,
	});
}
