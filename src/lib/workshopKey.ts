/**
 * The workshop model key, sealed: PBKDF2-SHA-256 (310 000 rounds) + AES-256-GCM. Only the ciphertext is in this repository; the password is spoken in the
 * room and never stored here, so nobody can open the key by reading the site's source.
 */
export interface SealedKey {
  readonly algorithm: "AES-GCM"
  readonly kdf: "PBKDF2-SHA256"
  readonly iterations: number
  readonly salt: string
  readonly iv: string
  readonly ciphertext: string
}

export const MODEL_KEY_SEALED: SealedKey = {
  algorithm: "AES-GCM",
  kdf: "PBKDF2-SHA256",
  iterations: 310000,
  salt: "xXLjbS5I2X+G98HB0cIhpw==",
  iv: "tGLGQljF8ZGsQA4B",
  ciphertext: "w0yiuS2LO34zsW3CwZ0WeldkfKL6jorRUI+hrF+VI+8HR5ek20ZOtJyUirlqhQy2T0DaBhbqUdmxCZork/753hjG2A==",
}

const asBytes = (value: string): Uint8Array => Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

/** Open the sealed key with the room's password. Rejects with "Wrong password." on anything else. */
export async function openModelKey(password: string, sealed: SealedKey = MODEL_KEY_SEALED): Promise<string> {
  if (password === "") throw new Error("Wrong password.")
  const encrypt = globalThis.crypto?.subtle
  if (encrypt === undefined) throw new Error("This browser cannot open the key.")
  try {
    const base = await encrypt.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"])
    const aes = await encrypt.deriveKey(
      { name: "PBKDF2", salt: asBytes(sealed.salt), iterations: sealed.iterations, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    )
    const clear = await encrypt.decrypt({ name: "AES-GCM", iv: asBytes(sealed.iv) }, aes, asBytes(sealed.ciphertext))
    return new TextDecoder().decode(clear)
  } catch {
    throw new Error("Wrong password.")
  }
}
