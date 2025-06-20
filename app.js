const express = require("express");
const app = express();
const cors = require("cors");
const hotelRoutes = require("./routes/hotelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingsRoutes");
const locationRoutes = require("./routes/locationRoutes");
const carRoutes = require("./routes/carRoutes");

// CORS Configuration (put this first)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Body parsing middleware (Express built-in)
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use("/api/v1/hotels", hotelRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/states", locationRoutes);
app.use("/api/v1/cars", carRoutes);
app.use("/api/v1/carbooking", carRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
