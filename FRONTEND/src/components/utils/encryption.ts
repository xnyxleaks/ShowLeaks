// src/components/utils/encryption.ts
class EncryptionService {
  private key: CryptoKey | null = null;

  // VITE_ENCRYPTION_SECRET_KEY = 64 hex (32 bytes) — deve ser idêntica ao backend
  private readonly hexKey =
    import.meta.env.VITE_ENCRYPTION_SECRET_KEY ||
    '4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f';

  private hexToBytes(hex: string): Uint8Array {
    const c = hex.trim().toLowerCase();
    if (!/^[0-9a-f]+$/.test(c) || c.length % 2 !== 0) throw new Error('hex inválido');
    const out = new Uint8Array(c.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(c.substr(i * 2, 2), 16);
    return out;
  }
  private bytesToHex(buf: ArrayBuffer | Uint8Array): string {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  private bytesToBase64(buf: ArrayBuffer | Uint8Array): string {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  }
  private base64ToBytes(b64: string): Uint8Array {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  private async ensureKey(): Promise<CryptoKey> {
    if (!this.key) {
      const raw = this.hexToBytes(this.hexKey); // 32 bytes
      this.key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    }
    return this.key!;
  }

  // Compatível com backend: { data(base64), iv(hex 24), authTag(hex 32) }
  async encrypt(data: unknown): Promise<{ data: string; iv: string; authTag: string }> {
    const key = await this.ensureKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes
    const pt =
      typeof data === 'string' ? new TextEncoder().encode(data) : new TextEncoder().encode(JSON.stringify(data));

    const ctWithTag = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, pt);
    const full = new Uint8Array(ctWithTag);
    const tagLen = 16; // bytes
    const tag = full.slice(full.length - tagLen);
    const ct = full.slice(0, full.length - tagLen);

    return { data: this.bytesToBase64(ct), iv: this.bytesToHex(iv), authTag: this.bytesToHex(tag) };
  }

  async decrypt(payload: { data: string; iv: string; authTag: string }): Promise<any> {
    const key = await this.ensureKey();
    const iv = this.hexToBytes(payload.iv);          // 12 bytes
    const ct = this.base64ToBytes(payload.data);
    const tag = this.hexToBytes(payload.authTag);    // 16 bytes

    const full = new Uint8Array(ct.length + tag.length);
    full.set(ct, 0); full.set(tag, ct.length);

    const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, full);
    const text = new TextDecoder().decode(ptBuf);
    try { return JSON.parse(text); } catch { return text; }
  }

  async decryptApiResponse(response: any): Promise<any> {
    if (!response?.encrypted) return response;
    return this.decrypt(response.data);
  }
}

export default new EncryptionService();
