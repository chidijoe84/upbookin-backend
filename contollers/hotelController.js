const db = require("../config/db");
const generateHotelId = require("../utils/generateHotelId");

exports.createHotel = async (req, res) => {
  let {
    hotelName,
    hotelContactNo,
    hotelDescription,
    hotelAddress,
    minimumPrice,
    propertyType,
    hotelImage,
    country,
    state,
    localGov,
    city,
    hotelRating,
    amenities,
  } = req.body;

  const hotelId = generateHotelId();
  // hotelImage = 'default.jpg';

  try {
    const amenitiesString = JSON.stringify(amenities);
    const [result] = await db.query(
      `INSERT INTO hotels 
         (hotelId, hotelName, hotelContactNo, hotelDescription, hotelAddress, minimumPrice, propertyType, hotelImage, country, state, localGov, city, hotelRating, hotelAmenities) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hotelId,
        hotelName,
        hotelContactNo,
        hotelDescription,
        hotelAddress,
        minimumPrice,
        propertyType,
        hotelImage,
        country,
        state,
        localGov,
        city,
        hotelRating,
        amenitiesString,
      ]
    );

    res.status(201).json({ id: result.insertId, hotelId, ...req.body });
  } catch (err) {
    console.error("SQL error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all hotels
exports.getAllHotels = async (req, res) => {
  try {
    const [hotels] = await db.execute("SELECT * FROM hotels");
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllApartment = async (req, res) => {
  try {
    const [apartment] = await db.execute(
      "SELECT * FROM hotels WHERE propertyType = ?",
      ["apartment"]
    );
    res.json(apartment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get hotel by ID
exports.getHotelById = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM hotels WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Hotel not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update hotel
exports.updateHotel = async (req, res) => {
  const { id } = req.params;

  console.log("hotelId", id);
  const {
    hotelName,
    hotelContactNo,
    hotelDescription,
    hotelAddress,
    minimumPrice,
    propertyType,
    hotelImage,
    country,
    state,
    localGov,
    city,
    hotelRating,
    amenities,
  } = req.body;

  try {
    const amenitiesString = JSON.stringify(amenities);
    const [result] = await db.execute(
      `UPDATE hotels SET 
        hotelName = ?, 
        hotelContactNo = ?, 
        hotelDescription = ?, 
        hotelAddress = ?, 
        minimumPrice = ?,
        propertyType = ?,
        hotelImage = ?, 
        country = ?, 
        state = ?, 
        localGov = ?, 
        city = ?, 
        hotelRating = ?,
        hotelAmenities = ?
       WHERE hotelId = ?`,
      [
        hotelName,
        hotelContactNo,
        hotelDescription,
        hotelAddress,
        minimumPrice,
        propertyType,
        hotelImage,
        country,
        state,
        localGov,
        city,
        hotelRating,
        amenitiesString,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json({ message: "Hotel updated successfully" });
  } catch (err) {
    console.error("Error updating hotel:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete hotel
exports.deleteHotel = async (req, res) => {
  const { id } = req.params;
  // console.log("hotel id", id);
  try {
    const [result] = await db.execute("DELETE FROM hotels WHERE hotelId = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Hotel not found" });
    res.json({ message: "Hotel deleted" });
  } catch (err) {
    console.log("error: err.message", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.searchHotels = async (req, res) => {
  console.log("req.query", req.query);
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Search query is required" });
  }

  const searchTerm = `%${q.trim()}%`;

  try {
    const [hotels] = await db.query(
      `SELECT * FROM hotels 
         WHERE hotelName LIKE ? 
            OR state LIKE ? 
            OR city LIKE ? 
            OR localGov LIKE ? 
            OR hotelAddress LIKE ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    res.status(200).json(hotels);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
