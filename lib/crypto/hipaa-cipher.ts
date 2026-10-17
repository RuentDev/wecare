import crypto from "crypto";

export interface EncryptedPayload {
  readonly encryptedContent: string;
  readonly iv: string;
  readonly authTag: string;
  readonly keyVersion: number;
}

const ALGORITHM = "aes-256-gcm";
const CURRENT_KEY_VERSION = 1;
const IV_LENGTH_BYTES = 12; // Recommended standard 96-bit IV for AES-GCM
const AUTH_TAG_LENGTH_BYTES = 16;

/**
 * Derives a deterministic 32-byte AES-256 key from environment configuration.
 * Uses HKDF with SHA-256 for cryptographically secure pseudo-random key generation.
 */
function getDerivedKey(keyVersion = CURRENT_KEY_VERSION): Buffer {
  const masterSecret =
    process.env.CHAT_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET;

  if (!masterSecret && process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL_CONFIG_ERROR: CHAT_ENCRYPTION_KEY must be configured in environment variables for HIPAA AES-256 encryption."
    );
  }

  const effectiveSecret =
    masterSecret || "wecare-default-hipaa-secure-dev-master-key-32b-min";

  const salt = Buffer.from(`wecare-chat-salt-v${keyVersion}`, "utf-8");
  const info = Buffer.from(`wecare-aes-256-gcm-v${keyVersion}`, "utf-8");

  return Buffer.from(crypto.hkdfSync("sha256", effectiveSecret, salt, info, 32));
}

/**
 * Encrypts a plaintext string (ePHI) using AES-256-GCM with authenticated tags.
 * Satisfies HIPAA § 164.312(a)(2)(iv) and HITECH cryptographic requirements.
 */
export async function encryptPayload(
  plaintext: string,
  keyVersion = CURRENT_KEY_VERSION
): Promise<EncryptedPayload> {
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const key = getDerivedKey(keyVersion);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encryptedContent: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    keyVersion,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload, verifying authentication integrity.
 * Throws if the payload has been forged or modified (Tamper detection).
 */
export async function decryptPayload(payload: EncryptedPayload): Promise<string> {
  const key = getDerivedKey(payload.keyVersion);
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const encryptedBuffer = Buffer.from(payload.encryptedContent, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
