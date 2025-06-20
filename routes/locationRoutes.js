const express = require("express");
const router = express.Router();
const locationController = require("../contollers/locationController");

router.get("/", locationController.getAllStates);
router.get("/country", locationController.getAllCountry);
router.get(
  "/local-governments/:stateId",
  locationController.getLocalGovernmentsByState
);

module.exports = router;
