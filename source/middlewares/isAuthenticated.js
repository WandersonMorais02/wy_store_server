import "dotenv/config";
import pkg from "jsonwebtoken";
const { verify } = pkg;

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function isAuthenticated(req, res, next)
{
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).json({
            message: "Authentication token not provided",
        });
    }

    const [, token] = authToken.split(" ");

    try {
        const decoded = verify(token, String(process.env.JWT_SECRET));

        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };

        return next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}
