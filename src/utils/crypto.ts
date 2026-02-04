/**
 * SHA-256 해시 (Web Crypto API). 비밀번호를 클라이언트에서 해시한 뒤 서버로 전송할 때 사용.
 */
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
