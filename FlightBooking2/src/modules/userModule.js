const db = require('../config/db');
/* eslint-disable no-console*/

exports.getUserPage = async (req, res) => {
  try {
    const result = await db.queryAsync('SELECT location FROM Airport');

    res.render('searchFlight', {
      user: req.session.user,
      location: result,
      flight: []
    });
  } catch (err) {
    console.log(err);
  }
  console.log(req.session.user);
};

exports.searchFlights = async (req, res) => {
  let { depLoc, arrLoc, depDate, arrDate } = req.body;
  if (depLoc == '') {
    depLoc = null;
  }
  if (arrLoc == '') {
    arrLoc = null;
  }
  if (depDate == '') {
    depDate = null;
  }
  if (arrDate == '') {
    arrDate = null;
  }

  try {
    const location = await db.queryAsync('SELECT location FROM Airport');
    const result = await db.queryAsync('CALL SearchFlights(?,?,?,?)', [
      depLoc,
      arrLoc,
      depDate,
      arrDate
    ]);
    console.log(result);

    res.render('searchFlight', {
      user: req.session.user,
      flight: result[0],
      location: location
    });
  } catch (err) {
    console.log(err);
  }
  console.log(req.session.user);
};

exports.getBookPage = async (req, res) => {
  const flightID = req.body.flightBook;
  const flightBook = await db.queryAsync('SELECT * FROM Flight WHERE FlightNumber = ?', [flightID]);

  res.render('bookFlight', {
    user: req.session.user,
    flightBook: flightBook[0]
  });
  console.log(flightBook, flightID);
};

exports.bookFlight = async (req, res) => {
  const checkPassenger = async (firstName, lastName, email, passport) => {
    let res = await db.queryAsync(
      'SELECT PassengerID FROM passenger WHERE FirstName=? AND LastName=? AND Email=? AND PassportNumber=?',
      [firstName, lastName, email, passport]
    );
    if (res.length == 0) {
      db.queryAsync(
        'INSERT INTO passenger (FirstName, LastName, Email, PassportNumber) VALUES (?,?,?,?)',
        [firstName, lastName, email, passport]
      );

      res = await db.queryAsync(
        'SELECT PassengerID FROM passenger WHERE FirstName=? AND LastName=? AND Email=? AND PassportNumber=?',
        [firstName, lastName, email, passport]
      );
    }
    return res[0].PassengerID;
  };
  const { firstName, lastName, email, passport, flightNumber } = req.body;
  const paymentStatus = 'pending';
  const flightRes = await db.queryAsync('SELECT FlightID FROM Flight WHERE FlightNumber = ?', [
    flightNumber
  ]);
  const passengerID = await checkPassenger(firstName, lastName, email, passport);
  const flightID = flightRes[0].FlightID;
  const userID = parseInt(req.session.user.id);

  console.log(req.session.user.id, flightID, passengerID, paymentStatus);
  try {
    await db.queryAsync('CALL BookingTicket(?,?,?,?)', [
      flightID,
      passengerID,
      userID,
      paymentStatus
    ]);

    res.redirect('history');
  } catch (err) {
    console.log(err);
  }
};

exports.getTicketPage = async (req, res) => {
  res.render('generateTicket', { user: req.session.user, ticket: [] });
};

exports.generateTicket = async (req, res) => {
  const histories = await db.queryAsync('CALL generateETicket(?)', [req.session.user.id]);

  const { bookID } = req.body;
  const history = histories[0];
  const ticket = history[bookID - 1];

  res.render('generateTicket', { user: req.session.user, ticket: ticket });
  console.log(ticket);
};

exports.getHistory = async (req, res) => {
  try {
    const result = await db.queryAsync('CALL GetBookingHistory(?)', [req.session.user.id]);
    res.render('flightHistory', {
      user: req.session.user,
      histories: result[0]
    });
  } catch (err) {
    console.log(err);
  }
  console.log(req.session.user);
};
