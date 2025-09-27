// Middleware/encryptResponse.js
const encryptionService = require('../utils/encryption'); // deve exportar { encrypt, decrypt }

const encryptResponse = (req, res, next) => {
  const encryptedRoutes = ['/models', '/content']; // prefixos
  const shouldEncrypt = encryptedRoutes.some((route) => req.path.startsWith(route));

  if (!shouldEncrypt) return next();

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    try {
      // não recriptografar se já vier marcado
      if (res.statusCode >= 200 && res.statusCode < 300 && !body?.encrypted) {
        const payload = encryptionService.encrypt(body); // retorna { encrypted:true, data:{...}, timestamp }
        return originalJson(payload);
      }
      return originalJson(body);
    } catch (err) {
      console.error('Encryption middleware error:', err);
      return originalJson(body); // fallback sem criptografia
    }
  };

  next();
};

module.exports = encryptResponse;
