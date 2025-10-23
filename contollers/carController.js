const db = require("../config/db"); // adjust path to your DB connection
const generateHotelId = require("../utils/generateHotelId");

// Register a new car
exports.registerCar = async (req, res) => {
  //   console.log("req.body", req.body);
  const {
    make,
    model,
    year,
    licensePlate,
    color,
    mileage,
    fuelType,
    transmission,
    dailyRate,
    hourlyRate,
    weeklyRate,
    carImage,
    state,
    localGov,
    city,
    pickupAddress,
    pickupNumber,
    escortPrice,
    escortAvailable,
  } = req.body;

  // Generate a unique ID for the car
  const carId = generateHotelId();

  try {
    // Insert into the cars table
    await db.query(
      `INSERT INTO carRegistration (
        carId,
        make,
        model,
        year,
        licensePlate,
        color,
        mileage,
        fuelType,
        transmission,
        dailyRate,
        hourlyRate,
        weeklyRate,
        carImage,
        state,
        localGov,
        city,
        pickupAddress,
        pickupNumber,
        escortPrice,
        escortAvailable
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        carId,
        make,
        model,
        year,
        licensePlate,
        color,
        mileage,
        fuelType,
        transmission,
        dailyRate,
        hourlyRate,
        weeklyRate,
        carImage,
        state,
        localGov,
        city,
        pickupAddress,
        pickupNumber,
        escortPrice || 0,
        escortAvailable,
      ]
    );

    res.status(201).json({ message: "Car registered successfully", carId });
  } catch (err) {
    console.error("Car Registration Error:", err);
    res.status(500).json({ error: "Failed to register car" });
  }
};

// Get all cars
exports.getAllCars = async (req, res) => {
  try {
    const [cars] = await db.execute("SELECT * FROM carRegistration");
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCarInfo = async (req, res) => {
  const { id } = req.params;

  console.log("carId", id);
  const {
    make,
    model,
    year,
    licensePlate,
    color,
    mileage,
    fuelType,
    transmission,
    dailyRate,
    hourlyRate,
    weeklyRate,
    carImage,
    state,
    localGov,
    city,
    pickupAddress,
    pickupNumber,
    escortPrice,
    escortAvailable,
  } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE carRegistration SET 
        make = ?, 
        model = ?, 
        year = ?, 
        licensePlate = ?, 
         color = ?, 
        mileage = ?, 
        fuelType = ?, 
        transmission = ?, 
        dailyRate = ?, 
        hourlyRate = ?,
        weeklyRate = ?,
        carImage = ?,
        state = ?,
        localGov = ?,
        city = ?, 
        pickupAddress = ?,
        pickupNumber = ?, 
        escortPrice = ?,
        escortAvailable = ?
       WHERE carId = ?`,
      [
        make,
        model,
        year,
        licensePlate,
        color,
        mileage,
        fuelType,
        transmission,
        dailyRate,
        hourlyRate,
        weeklyRate,
        carImage,
        state,
        localGov,
        city,
        pickupAddress,
        pickupNumber,
        escortPrice,
        escortAvailable,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "car not found" });
    }

    res.json({ message: "car information updated successfully" });
  } catch (err) {
    console.error("Error updating car:", err);
    res.status(500).json({ error: err.message });
  }
};
