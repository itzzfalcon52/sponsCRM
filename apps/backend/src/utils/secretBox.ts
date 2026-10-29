import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

/* ============================================================
   Encrypts small secrets (like a Google refresh token) before they are
   stored. AES-256-GCM, so a changed value fails to decrypt instead of
   producing garbage. The key is derived from JWT_SECRET, so no extra
   environment variable is needed; changing JWT_SECRET only means stored
   tokens can no longer be read and the user connects again.
   Stored as  v1:<iv>.<tag>.<ciphertext>  (base64url).
   ============================================================ */

const VERSION = "v1";

const key = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return Buffer.from(hkdfSync("sha256", secret, "sponscrm", "secret-box-v1", 32));
};

export const encryptSecret = (plain: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);

  return [
    VERSION,
    [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join("."),
  ].join(":");
};

/** Throws if the value was changed, is malformed, or was made with another secret. */
export const decryptSecret = (box: string): string => {
  const [version, payload] = box.split(":");
  const parts = payload?.split(".");

  if (version !== VERSION || !parts || parts.length !== 3) {
    throw new Error("Unrecognised secret format");
  }

  const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, "base64url")) as [
    Buffer,
    Buffer,
    Buffer,
  ];
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
};
