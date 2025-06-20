const db = require("../config/db"); // your DB connection
const generateHotelId = require("../utils/generateHotelId");
const { sendBookingEmail } = require("../utils/mailer");

exports.bookCar = async (req, res) => {
  const {
    carId,
    pickupDate,
    pickupTime,
    hours,
    totalPrice,
    fullName,
    phone,
    email,
    specialRequests,
  } = req.body;

  const bookingId = generateHotelId();

  // Basic validation
  if (!carId || !pickupDate || !pickupTime || !hours || !fullName || !phone) {
    return res
      .status(400)
      .json({ error: "All required fields must be filled" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO carbookings  
       (bookingId, carId, pickup_date, pickup_time, hours, totalPrice, fullName, phone, email, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        carId,
        pickupDate,
        pickupTime,
        hours,
        totalPrice,
        fullName,
        phone,
        email,
        specialRequests,
      ]
    );

    const [carInfoRows] = await db.query(
      `SELECT make, model FROM carregistration WHERE carId = ?`,
      [carId]
    );
    const carName = carInfoRows[0]?.make || "Unknown car";
    const carModel = carInfoRows[0]?.model || "Unknown car";

    await sendBookingEmail(
      email,
      "Your Booking Confirmation",
      generateCustomerEmailHTML(
        bookingId,
        fullName,
        pickupDate,
        pickupTime,
        totalPrice,
        carName,
        carModel,
        hours,
        totalPrice
      )
    );

    // Send email to admin
    await sendBookingEmail(
      "Upbookins@gmail.com", // system admin email
      "New Booking Made",
      generateAdminEmailHTML(
        bookingId,
        fullName,
        phone,
        email,
        pickupDate,
        pickupTime,
        totalPrice,
        carName,
        carModel,
        hours,
        specialRequests
      )
    );

    res.status(201).json({
      message: "Car booked successfully",
      bookingId: result.insertId,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateAdminEmailHTML = (
  bookingId,
  fullName,
  phone,
  email,
  pickupDate,
  pickupTime,
  totalPrice,
  carName,
  carModel,
  hours,
  specialRequests
) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Car Booking Notification</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #e74c3c;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #e74c3c;
            margin-top: 0;
        }
        .booking-details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: bold;
            width: 150px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        .urgent {
            color: #e74c3c;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Car Booking Received!</h1>
    </div>
    <div class="content">
        <p class="urgent">Action Required: New booking needs your attention</p>
        
        <div class="booking-details">
            <div class="detail-row">
                <div class="detail-label">Booking ID:</div>
                <div>${bookingId}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Customer Name:</div>
                <div>${fullName}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div>${phone}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div>${email}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Car:</div>
                <div>${carName} ${carModel}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Pickup Date:</div>
                <div>${pickupDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Pickup Time:</div>
                <div>${pickupTime}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Duration:</div>
                <div>${hours} hours</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Total Price:</div>
                <div>${totalPrice}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Special Requests:</div>
                <div>${specialRequests}</div>
            </div>
        </div>
        
        <p>Please prepare the car and ensure everything is ready for the customer's pickup.</p>
        
        <div class="footer">
            <p>© 2025 upBookin.com. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `;
};

const generateCustomerEmailHTML = (
  bookingId,
  fullName,
  pickupDate,
  pickupTime,
  totalPrice,
  carName,
  carModel,
  hours
) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Your Car Booking Confirmation</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin-top: 0;
        }
        .booking-details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: bold;
            width: 150px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Booking is Confirmed!</h1>
    </div>
    <div class="content">
        <p>Dear ${fullName},</p>
        <p>Thank you for booking with us. Here are your booking details:</p>
        
        <div class="booking-details">
            <div class="detail-row">
                <div class="detail-label">Booking ID:</div>
                <div>${bookingId}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Car:</div>
                <div>${carName} ${carModel}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Pickup Date:</div>
                <div>${pickupDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Pickup Time:</div>
                <div>${pickupTime}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Duration:</div>
                <div>${hours} hours</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Total Price:</div>
                <div>${totalPrice}</div>
            </div>
        </div>
        
        <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
        
        <a href="mailto:Upbookins@gmail.com" class="button">Contact Us</a>
        
        <div class="footer">
            <p>© 2025 upBookin.com. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};
