const User = require("../models/User");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.create({ email, password });
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Generate Tokens
    const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" },
    );

    // 3. Send Refresh Token in HttpOnly Cookie
    res.cookie("jwt", refreshToken, {
        httpOnly: true, // Inaccessible to JavaScript (prevents XSS)
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "Strict", // Prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 4. Send Access Token in JSON response
    res.json({ accessToken });
};

const refresh = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" });

            const accessToken = jwt.sign(
                { userId: decoded.userId },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" },
            );

            res.json({ accessToken });
        },
    );
};

const logout = (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "Strict",
        secure: true,
    });
    res.json({ message: "Logged out" });
};

module.exports = { register, login, refresh, logout };
