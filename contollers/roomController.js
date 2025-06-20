const db = require("../config/db"); // Adjust path to your DB config
// const { nanoid } = require("nanoid");
function generateRoomId(length = 15) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a room
exports.createRoom = async (req, res) => {
  const {
    hotelId,
    roomType,
    roomPrice,
    roomDiscount,
    roomQuantity,
    roomDescription,
    roomImage,
    amenities, // Expecting an array like ["Free Wifi", "Pool Access"]
  } = req.body;

  const roomId = generateRoomId();
  const roomStatus = true;
  const roomImageJson = JSON.stringify(roomImage);

  try {
    // Convert amenities array to JSON string for DB storage
    const amenitiesJson = JSON.stringify(amenities || []); // Handle undefined case

    const [result] = await db.query(
      `INSERT INTO rooms (
          roomId, 
          hotelId, 
          roomType, 
          roomPrice, 
          roomDiscount,
          roomQuantity, 
          roomStatus,
          roomDescription, 
          roomImage, 
          amenities
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roomId,
        hotelId,
        roomType,
        roomPrice,
        roomDiscount,
        roomQuantity,
        roomStatus,
        roomDescription,
        roomImageJson,
        amenitiesJson, // Pass the JSON string
      ]
    );

    res.status(201).json({
      id: result.insertId,
      roomId,
      ...req.body,
      message: "Room created successfully",
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
};

// Get all rooms in a specific hotel
exports.getRoomsByHotel = async (req, res) => {
  const { hotelId } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT r.*, h.hotelName FROM rooms r JOIN hotels h ON h.hotelId = r.hotelId WHERE r.hotelId = ?",
      [hotelId]
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single room by ID
exports.getRoomById = async (req, res) => {
  const { roomId } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM rooms WHERE roomId = ?", [
      roomId,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Room not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a room
exports.updateRoom = async (req, res) => {
  const { roomId } = req.params;
  const {
    roomType,
    roomPrice,
    roomDiscount,
    roomQuantity,
    roomDescription,
    roomImage,
    amenities,
  } = req.body;

  try {
    const amenitiesString = JSON.stringify(amenities);
    // const roomImageJson = JSON.stringify(roomImage);

    const [result] = await db.query(
      `UPDATE rooms SET roomType = ?, roomPrice = ?, roomDiscount = ?, roomQuantity = ?, roomDescription = ?, roomImage = ?, amenities = ? 
       WHERE roomId = ?`,
      [
        roomType,
        roomPrice,
        roomDiscount,
        roomQuantity,
        roomDescription,
        roomImage,
        amenitiesString,
        roomId,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Room not found" });

    res.status(200).json({ message: "Room updated successfully" });
  } catch (err) {
    console.error(err); // helpful for debugging
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

exports.updateRoomStatus = async (req, res) => {
  const { roomId } = req.params;
  const { roomStatus } = req.body;

  try {
    // Convert to proper boolean (handles "true"/"false" strings too)
    const status =
      roomStatus === true || roomStatus === 1 || roomStatus === "true";

    const [result] = await db.query(
      `UPDATE rooms SET roomStatus = ?
         WHERE roomId = ?`,
      [status, roomId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json({
      success: true,
      roomStatus: status,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    const [result] = await db.query("DELETE FROM rooms WHERE roomId = ?", [
      roomId,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Room not found" });

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
