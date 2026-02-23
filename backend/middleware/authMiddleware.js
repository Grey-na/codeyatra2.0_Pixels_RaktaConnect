const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Must be: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  // extract token without "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalize so req.user always has id
    req.user = {
      id: decoded.id ?? decoded.userId,  // supports both token styles
      role: decoded.role,
      email: decoded.email,
    };

    if (!req.user.id) {
      return res.status(401).json({ message: "Invalid token payload (missing id)" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = authMiddleware;