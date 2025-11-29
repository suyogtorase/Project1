import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";

const adminAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "Not Authorized. Please login again." });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedToken.id) {
            return res.status(401).json({ success: false, message: "Invalid token. Please login again." });
        }

        req.admin = await adminModel.findById(decodedToken.id);

        next();
    } catch (error) {
        console.log("Error in adminAuth:", error.message);
        return res
            .status(401)
            .json({ success: false, message: "Token expired or invalid. Please login again." });
    }
};

export default adminAuth;
