import { sha256 as sha256Fallback } from 'js-sha256'

/**
 * SHA-256 해시 (Web Crypto API 우선, HTTP 환경에서는 폴백 사용).
 * 비밀번호를 클라이언트에서 해시한 뒤 서버로 전송할 때 사용.
 */
export async function sha256Hex(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (subtle) {
    const data = new TextEncoder().encode(text)
    const hashBuffer = await subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // HTTP(비보안) 환경 등에서 Web Crypto API가 없을 때 폴백
  return sha256Fallback(text)
}
