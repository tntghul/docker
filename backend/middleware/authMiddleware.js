import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. Authentication token missing." });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "portfolio_super_jwt_secret_key_2026_xyz";
    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid, expired, or malformed authentication token." });
  }
};
