const { verify } = require('jsonwebtoken');

const Authmiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Não autorizado" });
    }

    const [scheme, token] = authHeader.trim().split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: "Token malformado" });
    }

    verify(token, process.env.TOKEN_VERIFY_ACCESS, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token inválido ou expirado" });
        }

        req.user = decoded;
        next();
    });
};

module.exports = Authmiddleware;
