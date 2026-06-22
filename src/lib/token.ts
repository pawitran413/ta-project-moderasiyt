import crypto from "crypto";

const TOKEN_BYTES = 32;
export const VERIFICATION_TOKEN_TTL_MS = 60 * 60 * 1000;
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function generateToken() {
	const raw = crypto.randomBytes(TOKEN_BYTES).toString("hex");
	const hash = hashToken(raw);
	return { raw, hash };
}

export function hashToken(raw: string) {
	return crypto.createHash("sha256").update(raw).digest("hex");
}
