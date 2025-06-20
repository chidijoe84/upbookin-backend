const express = require("express");
const router = express.Router();
const roomController = require("../contollers/roomController");

// Create a new room
router.post("/", roomController.createRoom);

// Get all rooms for a hotel
router.get("/hotel/:hotelId", roomController.getRoomsByHotel);

// Get a single room by roomId
router.get("/:roomId", roomController.getRoomById); 

// Update a room by roomId
router.put("/:roomId", roomController.updateRoom);

router.put("/status/:roomId", roomController.updateRoomStatus);

// Delete a room by roomId
router.delete("/:roomId", roomController.deleteRoom);

module.exports = router;
