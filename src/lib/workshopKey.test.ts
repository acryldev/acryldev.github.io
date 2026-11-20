import { describe, expect, it } from 'vitest'
import { openModelKey, type SealedKey } from './workshopKey'

const b64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes))
const bytes = (value: string): Uint8Array => Uint8Array.from(atob(value), char => char.charCodeAt(0))

/** Seal a value the way the workshop's key was sealed, so the test never carries the real password or key. */
async function seal(value: string, password: string): Promise<SealedKey> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  const aes = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 1000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt'])
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, new TextEncoder().encode(value))
  return { algorithm: 'AES-GCM', kdf: 'PBKDF2-SHA256', iterations: 1000, salt: b64(salt), iv: b64(iv), ciphertext: b64(new Uint8Array(cipher)) }
}

describe('the workshop model key', () => {
  it('opens only with its password, and gives back exactly what was sealed', async () => {
    const sealed = await seal('a-test-key-0123456789', 'the-room-password')
    await expect(openModelKey('the-room-password', sealed)).resolves.toBe('a-test-key-0123456789')
    await expect(openModelKey('not-the-password', sealed)).rejects.toThrow('Wrong password.')
    await expect(openModelKey('', sealed)).rejects.toThrow('Wrong password.')
  })

  it('checks the sealed shape rather than assuming bytes', async () => {
    await expect(openModelKey('x', { algorithm: 'AES-GCM', kdf: 'PBKDF2-SHA256', iterations: 1000, salt: 'not base64!', iv: 'AAAA', ciphertext: 'AAAA' })).rejects.toThrow('Wrong password.')
    expect(bytes('AAA=').length).toBe(2)
  })
})
