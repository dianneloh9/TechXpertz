const pool = require('../../db');

const preprocessBookings = async (date, time) => {

  const bookingIds = await getBookingIds(date, time);
  console.log(bookingIds);
  const uniqueBookings = await filterOutRepeatUsers(bookingIds);
  console.log(uniqueBookings);
  const separatedBookings = await separateOtherAccType(uniqueBookings);
  console.log(separatedBookings);
  return separatedBookings;

};

const getBookingIds = async (date, time) => {
  const bookingRes = await pool
    .query('SELECT booking_id FROM timeslots WHERE date_col = $1 AND time_start = $2',
      [date, time]);
  return bookingRes.rows.map(booking => booking.booking_id);
};

const filterOutRepeatUsers = async (bookingIds) => {

  const map = new Map();
  for (index in bookingIds) {
    const bookingId = bookingIds[index];
    const user = await pool
      .query('SELECT user_id FROM bookings WHERE booking_id = $1',
        [bookingId]);
    const userId = user.rows[0].user_id;
    if (map.has(userId)) {
      // keep the booking with a larger bookingId
      if (bookingId > map.get(userId)) {
        map.set(userId, bookingId);
      }
    } else {
      map.set(userId, bookingId);
    }
  }

  const bookings = [];
  map.forEach((value) => bookings.push(value));

  return bookings;
};

const separateOtherAccType = async (bookings) => {

  const normalNormals = [];
  const normalExperts = [];

  for (index in bookings) {
    const bookingId = bookings[index];
    const otherIsExpert = (await pool
      .query('SELECT other_is_expert FROM bookings WHERE booking_id = $1',
        [bookingId]))
      .rows[0].other_is_expert;
    otherIsExpert ? normalExperts.push(bookingId) : normalNormals.push(bookingId);
  }

  const separatedBookings = { normalNormals, normalExperts };
  return separatedBookings;

};

module.exports = {
  preprocessBookings
};