import User from "@/models/User";
import connectDB from "./mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions, DefaultSession } from "next-auth";
import bcrypt from "bcryptjs";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			youtubeChannelId: string | null;
		} & DefaultSession["user"];
	}
}
declare module "next-auth/jwt" {
	interface JWT {
		id?: string;
		youtubeChannelId: string | null;
	}
}

async function fetchYoutubeChannelId(
	accessToken: string | undefined,
): Promise<string | null> {
	if (!accessToken) return null;

	try {
		const ytRes = await fetch(
			"https://www.googleapis.com/youtube/v3/channels?part=id&mine=true",
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);
		const ytData = await ytRes.json();
		return ytData.items?.[0]?.id ?? null;
	} catch (error) {
		console.error("Gagal mengambil ID channel YouTube: ", error);
		return null;
	}
}

export const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},

			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email dan password wajib diisi");
				}

				await connectDB();

				const user = await User.findOne({
					email: credentials.email.toLowerCase(),
				}).select("+password");

				if (!user) {
					throw new Error("Email atau password salah");
				}

				if (!user.password) {
					throw new Error("Akun ini terdaftar menggunakan Google")
				}

				const isPasswordValid = await bcrypt.compare(
					credentials.password,
					user.password,
				);

				if (!isPasswordValid) {
					throw new Error("Email atau password salah");
				}

				if (!user.emailVerified) {
					throw new Error("EmailNotVerified");
				}

				return {
					id: user._id.toString(),
					email: user.email,
					name: user.name,
				};
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			authorization: {
				params: {
					scope:
						"openid email profile https://www.googleapis.com/auth/youtube.readonly",
					prompt: "select_account",
				},
			},
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === "credentials") return true;

			if (account?.provider === "google") {
				if (!user.email) return false;

				const googleEmailVerified =
					(profile as { email_verified?: boolean } | undefined)
						?.email_verified === true;

				if (!googleEmailVerified) {
					return "/error?error=GoogleEmailNotVerified";
				}

				await connectDB();

				const youtubeChannelId = await fetchYoutubeChannelId(
					account.access_token,
				);

				if (youtubeChannelId) {
					const channelOccupied = await User.findOne({ youtubeChannelId });
					if (channelOccupied && channelOccupied.email !== user.email) {
						return "/error?error=ChannelAlreadyLinked";
					}
				}

				const existingUser = await User.findOne({ email: user.email });

				if (existingUser) {
					existingUser.googleId = account.providerAccountId;
					if (youtubeChannelId) {
						existingUser.youtubeChannelId = youtubeChannelId;
					}
					if (!existingUser.emailVerified) {
						existingUser.emailVerified = new Date();
					}
					await existingUser.save();
					return true;
				}

				await User.create({
					name: user.name || profile?.name || "Pengguna Google",
					email: user.email,
					googleId: account.providerAccountId,
					youtubeChannelId,
					provider: "google",
					emailVerified: new Date(),
				});

				return true;
			}

			return true;
		},

		async jwt({ token, user, trigger, session }) {
			if (user) {
				await connectDB();
				const dbUser = await User.findOne({ email: token.email }).select(
					"_id youtubeChannelId",
				);

				if (dbUser) {
					token.id = dbUser._id.toString();
					token.youtubeChannelId = dbUser.youtubeChannelId ?? null;
				}
			}

			if (trigger === "update" && session?.youtubeChannelId !== undefined) {
				token.youtubeChannelId = session.youtubeChannelId;
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = String(token.id);
				session.user.youtubeChannelId = token.youtubeChannelId;
			}

			return session;
		},
	},
	pages: {
		signIn: "/login",
		error: "/error",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};
