const express = require("express");
const router = express.Router();
const hotelController = require("../contollers/hotelController");

router.post("/", hotelController.createHotel);
router.get("/", hotelController.getAllHotels);
router.get("/apartments", hotelController.getAllApartment);
router.get("/search", hotelController.searchHotels);
router.get("/:id", hotelController.getHotelById);
router.put("/:id", hotelController.updateHotel);
router.delete("/:id", hotelController.deleteHotel);

module.exports = router;
