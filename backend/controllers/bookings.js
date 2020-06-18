const pool = require('../db');
const { getUserId } = require('./users');

const createBooking = async (req, res) => {

  if (!req.user) {
    return res.sendStatus(401);
  }
  const { otherAccType, topic, progLanguages, timeslots } = req.body;
  if (!otherAccType || !topic || !progLanguages || !timeslots) {
    return res.sendStatus(400);
  }
  if (otherAccType !== 'Expert' && otherAccType !== 'Normal') {
    return res.sendStatus(422);
  }

  const userId = await getUserId(req.user);
  const otherIsExpert = otherAccType === 'Expert' ? true : false;

  const bookingId = await addBooking(userId, otherIsExpert, topic);
  if (!bookingId) return res.status(422).send('Invalid topic');

  await addBookingProgLanguages(bookingId, progLanguages)
  await addTimeslots(bookingId, timeslots);
  return res.sendStatus(201);
};

const addBooking = async (userId, otherIsExpert, topic) => {

  const topicRes = await pool
    .query('SELECT topic_id from topics WHERE topic_name = $1',
      [topic]);

  if (topicRes.rowCount === 0) {
    return;
  }

  const topicId = topicRes.rows[0].topic_id;
  const bookingRes = await pool
    .query('INSERT INTO bookings (user_id, topic_id, other_is_expert) VALUES ($1, $2, $3) RETURNING booking_id',
      [userId, topicId, otherIsExpert]);

  return bookingRes.rows[0].booking_id;

};

const addBookingProgLanguages = async (bookingId, progLanguages) => {

  progLanguages.forEach(async prog => {
    const { progName } = prog;
    const progIdRes = await pool
      .query('SELECT prog_id FROM prog_languages WHERE prog_name = $1',
        [progName]);

    const progId = progIdRes.rows[0].prog_id;

    await pool.query('INSERT INTO booking_prog_languages (booking_id, prog_id) '
      + 'VALUES ($1, $2)',
      [bookingId, progId]);
  });
};

const addTimeslots = async (bookingId, timeslots) => {

  timeslots.forEach(async timeslot => {
    const { date, timeStart } = timeslot;
    await pool.query('INSERT INTO timeslots (booking_id, date_col, time_start)'
      + 'VALUES ($1, $2, $3)',
      [bookingId, date, timeStart]);
  });

};

module.exports = {
  createBooking
};