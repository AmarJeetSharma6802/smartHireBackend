import jwt from 'jsonwebtoken'
import { userData } from '../model/user.model.js';
const verifyJwt = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log("Received Token:", token);
    console.log("Cookies:", req.cookies); 
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    console.log("Decoded Token:", decoded);

    const user = await userData.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid access token: User not found." });
    }
 
    req.user = user;  
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ message: "Invalid token.", error: error.message });
  }
};

export{verifyJwt}  