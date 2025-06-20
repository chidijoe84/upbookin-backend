const db = require('../config/db')

// controllers/locationController.js

exports.getAllCountry = async (req, res) => {
  try {
    const [country] = await db.query("SELECT * FROM country");
    res.status(200).json(country);
  } catch (err) {
    console.error("Error fetching country:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllStates = async (req, res) => {
  try {
    const [states] = await db.query("SELECT * FROM states");
    res.status(200).json(states);
  } catch (err) {
    console.error("Error fetching states:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// controllers/locationController.js

exports.getLocalGovernmentsByState = async (req, res) => {
  const { stateId } = req.params;

  try {
    const [locals] = await db.query(
      "SELECT * FROM local_governments WHERE state_id = ?",
      [stateId]
    );
    res.status(200).json(locals);
  } catch (err) {
    console.error("Error fetching local governments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

