const express = require("express");
const router = express.Router();
const bookingController = require("../contollers/bookingController");

router.post("/", bookingController.createBooking);
router.get("/", bookingController.getAllBookings);
router.get("/allBookings", bookingController.getAllBookingsOnly);
router.get("/:bookingId", bookingController.getBookingById);
router.get("/email/:email", bookingController.getBookingsByEmail);
router.get("/hotel/:hotelId", bookingController.getBookingsByHotel);
router.put("/status/:bookingId", bookingController.updateBookingStatus);


module.exports = router;



