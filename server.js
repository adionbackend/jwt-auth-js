require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser()); // Crucial for reading the HttpOnly cookie

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => console.error(err));

app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`),
);
