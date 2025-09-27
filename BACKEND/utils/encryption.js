// utils/encryption.js
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';

// ENCRYPTION_SECRET_KEY = 64 hex (32 bytes)
const HEX_KEY = process.env.ENCRYPTION_SECRET_KEY;
if (!HEX_KEY || !/^[0-9a-fA-F]{64}$/.test(HEX_KEY)) {
  throw new Error('ENCRYPTION_SECRET_KEY inválida: exija 64 caracteres hexadecimais.');
}
const KEY = Buffer.from(HEX_KEY, 'hex'); // 32 bytes

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12); // 96 bits
  const dataBuf = Buffer.isBuffer(plaintext)
    ? plaintext
    : Buffer.from(typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext), 'utf8');

  const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  const ct = Buffer.concat([cipher.update(dataBuf), cipher.final()]);
  const tag = cipher.getAuthTag(); // 16 bytes

  return {
    encrypted: true,
    data: {
      data: ct.toString('base64'),   // ciphertext puro (sem tag)
      iv: iv.toString('hex'),        // 24 chars
      authTag: tag.toString('hex'),  // 32 chars
    },
    timestamp: Date.now(),
  };
}

function decrypt(payload) {
  const { data, iv, authTag } = payload;
  const ivBuf = Buffer.from(iv, 'hex');        // 12 bytes
  const tagBuf = Buffer.from(authTag, 'hex');  // 16 bytes
  const ctBuf = Buffer.from(data, 'base64');

  const decipher = crypto.createDecipheriv(ALGO, KEY, ivBuf, { authTagLength: 16 });
  decipher.setAuthTag(tagBuf);
  const pt = Buffer.concat([decipher.update(ctBuf), decipher.final()]);
  const text = pt.toString('utf8');
  try { return JSON.parse(text); } catch { return text; }
}

module.exports = { encrypt, decrypt };
