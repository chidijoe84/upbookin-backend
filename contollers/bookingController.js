const db = require("../config/db");
const { sendBookingEmail } = require("../utils/mailer");

function generateBookingId(length = 15) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

exports.createBooking = async (req, res) => {
  const { customer, rooms, hotelId, totalAmount, checkInDate, checkOutDate } =
    req.body;

  const bookingId = generateBookingId();
  const booking_roomId = generateBookingId();
  //   const hotelId = rooms[0].hotelId;
  const paymentStatus = "not paid";
  const reservationStatus = "not reserved";

  try {
    // 1. Insert into bookings table
    await db.query(
      `INSERT INTO bookings 
          (bookingId, hotelId, firstName, lastName, email, phone, checkInDate, checkOutDate, specialRequests, totalAmount, paymentStatus, reservationStatus) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        hotelId,
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phone,
        checkInDate,
        checkOutDate,
        customer.specialRequests,
        totalAmount,
        paymentStatus,
        reservationStatus,
      ]
    );

    // 2. Insert each room into booking_rooms table
    const roomInsertPromises = rooms.map((room) =>
      db.query(
        `INSERT INTO booking_rooms (booking_roomId, bookingId, roomId, quantity, price) 
           VALUES (?, ?, ?, ?, ?)`,
        [booking_roomId, bookingId, room.roomId, room.quantity, room.price]
      )
    );

    const [hotelInfoRows] = await db.query(
      `SELECT hotelName FROM hotels WHERE hotelId = ?`,
      [hotelId]
    );
    const hotelName = hotelInfoRows[0]?.hotelName || "Unknown Hotel";

    // console.log("hotelInfo", hotelName);

    await Promise.all(roomInsertPromises);

    // Send email to user
    await sendBookingEmail(
      customer.email,
      "Your Booking Confirmation",
      generateCustomerEmailHTML(
        bookingId,
        customer,
        checkInDate,
        checkOutDate,
        totalAmount,
        hotelName
      )
    );

    // Send email to admin
    await sendBookingEmail(
      "Upbookins@gmail.com", // system admin email
      "New Booking Made",
      generateAdminEmailHTML(
        bookingId,
        customer,
        totalAmount,
        checkInDate,
        checkOutDate
      )
    );

    res.status(201).json({ message: "Booking created", bookingId });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(
      "SELECT b.*, br.*, r.roomType, h.hotelName FROM bookings b JOIN booking_rooms br ON b.bookingId = br.bookingId JOIN rooms r ON r.roomId = br.roomId JOIN hotels h ON b.hotelId = h.hotelId"
    );
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllBookingsOnly = async (req, res) => {
  try {
    const [bookings] = await db.query(
      "SELECT b.*, br.roomId, r.roomType, r.roomImage, h.`hotelName`, h.hotelId FROM bookings b JOIN booking_rooms br ON b.bookingId = br.bookingId JOIN rooms r ON r.roomId = br.roomId JOIN hotels h ON b.hotelId = h.hotelId GROUP BY b.bookingId"
    );
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get booking by bookingId
exports.getBookingById = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const [[booking]] = await db.query(
      "SELECT * FROM bookings WHERE bookingId = ?",
      [bookingId]
    );
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const [rooms] = await db.query(
      "SELECT * FROM booking_rooms WHERE bookingId = ?",
      [bookingId]
    );
    res.status(200).json({ ...booking, rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get bookings by customer email
exports.getBookingsByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const [bookings] = await db.query(
      "SELECT * FROM bookings WHERE email = ?",
      [email]
    );
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get bookings by hotelId
exports.getBookingsByHotel = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const [bookings] = await db.query(
      "SELECT * FROM bookings WHERE hotelId = ?",
      [hotelId]
    );
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/bookingController.js
exports.updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { paymentStatus } = req.body;

  //   console.log("bookingId", bookingId);

  try {
    const reservationStatus =
      paymentStatus === "paid" ? "fully booked" : "not reserved";

    const [result] = await db.query(
      `UPDATE bookings 
         SET paymentStatus = ?, reservationStatus = ? 
         WHERE bookingId = ?`,
      [paymentStatus, reservationStatus, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking status updated",
      paymentStatus,
      reservationStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const generateCustomerEmailHTML = (
  bookingId,
  customer,
  checkInDate,
  checkOutDate,
  totalAmount,
  hotelName
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        
        body {
          font-family: 'Poppins', Arial, sans-serif;
          color: #333333;
          line-height: 1.6;
          background-color: #f7fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .header {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          padding: 30px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-weight: 600;
          font-size: 24px;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .booking-details {
          background: #f8fafc;
          border-radius: 6px;
          padding: 20px;
          margin: 25px 0;
        }
        .detail-row {
          display: flex;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .detail-label {
          flex: 1;
          font-weight: 500;
          color: #64748b;
        }
        .detail-value {
          flex: 2;
          font-weight: 500;
        }
        .total-amount {
          color: #10b981;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #64748b;
          font-size: 14px;
          border-top: 1px solid #e2e8f0;
        }
        .logo {
          font-weight: 700;
          color: white;
          font-size: 22px;
          letter-spacing: 1px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #4f46e5;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin-top: 20px;
        }
        .hotel-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">UpBooking</div>
          <h1>Your Booking is Confirmed!</h1>
        </div>
        
        <div class="content">
          <div class="greeting">
            Dear ${customer.firstName} ${customer.lastName},
          </div>
          
          <p>Thank you for choosing UpBooking! Your reservation has been registered and we're preparing everything for your stay.</p>
          
          <!-- You could add a placeholder hotel image here -->
          <!-- <img src="https://via.placeholder.com/600x180?text=${encodeURIComponent(hotelName)}" class="hotel-image" alt="${hotelName}"> -->
          
          <div class="booking-details">
            <div class="detail-row">
              <div class="detail-label">Booking ID</div>

              <div class="detail-value"> ${bookingId}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Hotel Name</div>

              <div class="detail-value"> ${hotelName}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Check-in Date</div>

              <div class="detail-value"> ${checkInDate}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Check-out Date</div>

              <div class="detail-value"> ${checkOutDate}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Total Amount</div>

              <div class="detail-value total-amount"> ₦${totalAmount.toLocaleString()}</div>
            </div>
          </div>
          
          <p>We're looking forward to welcoming you! If you have any special requests or questions about your stay, please don't hesitate to reply to this email.</p>
          
          <!-- Optional button - would need to implement the actual link -->
          <!-- <a href="#" class="button">View Booking Details</a> -->
        </div>
        
        <div class="footer">
          <p>Warm regards,<br><strong>The UpBooking Team</strong></p>
          <p style="margin-top: 20px; font-size: 12px;">© ${new Date().getFullYear()} UpBooking. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateAdminEmailHTML = (
  bookingId,
  customer,
  totalAmount,
  checkInDate,
  checkOutDate
) => {
  return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #e53e3e;">New Booking Received</h2>
        <p>A new booking has just been made. Here are the details:</p>
  
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Booking ID:</td>
            <td style="padding: 8px; border: 1px solid #ccc;"><strong>${bookingId}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Customer Name:</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${
              customer.firstName
            } ${customer.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Email:</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${
              customer.email
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Phone:</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${
              customer.phone
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Check-in:</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${checkInDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Check-out:</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${checkOutDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Total Amount:</td>
            <td style="padding: 8px; border: 1px solid #ccc;">₦${totalAmount.toLocaleString()}</td>
          </tr>
        </table>
  
        <p style="margin-top: 30px;">Please review this booking in the admin dashboard.</p>
  
        <p>— <strong>UpBooking System</strong></p>
      </div>
    `;
};
