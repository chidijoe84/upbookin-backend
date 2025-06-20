const express = require("express");
const router = express.Router();
const carController = require("../contollers/carController");
const carBookingController = require("../contollers/carBookingController");

router.post("/registration", carController.registerCar);
router.get("/allcars", carController.getAllCars);
router.put("/:id", carController.updateCarInfo);
router.post("/book", carBookingController.bookCar);

module.exports = router;
