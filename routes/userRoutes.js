const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");

// Any route using verifyJWT requires a valid Access Token
router.get("/profile", verifyJWT, (req, res) => {
    res.json({
        message: "Welcome to your protected profile!",
        userId: req.userId,
    });
});

module.exports = router;
