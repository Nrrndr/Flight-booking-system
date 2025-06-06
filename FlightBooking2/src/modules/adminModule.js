const db = require('../config/db');
/* eslint-disable no-console*/

exports.getAdminPage = async (req, res) => {
  try {
    const locations = await db.queryAsync('SELECT location FROM Airport');
    const airlines = await db.queryAsync('SELECT AirlineName FROM Airline');

    res.render('addFlight', {
      user: req.session.user,
      location: locations,
      airline: airlines
    });
  } catch (err) {
    console.log(err);
  }
};

exports.addFlight = async (req, res) => {
  try {
    const { flightNumber, depLoc, arrLoc, depDate, arrDate, totalSeats, airline } = req.body;

    const originAirportCode = await db.queryAsync(
      'SELECT AirportCode FROM Airport WHERE Airport.Location = ?',
      [depLoc]
    );
    const destinationAirportCode = await db.queryAsync(
      'SELECT AirportCode FROM Airport WHERE Airport.Location = ?',
      [arrLoc]
    );
    const airlineID = await db.queryAsync('SELECT AirlineID FROM Airline WHERE AirlineName = ?', [
      airline
    ]);

    console.log(airlineID);
    console.log(destinationAirportCode);
    console.log(depLoc);
    console.log(originAirportCode);

    await db.queryAsync('CALL addFlight(?, ?, ?, ?, ?, ?, ?, ?)', [
      flightNumber,
      originAirportCode[0].AirportCode,
      destinationAirportCode[0].AirportCode,
      depDate,
      arrDate,
      totalSeats,
      totalSeats,
      airlineID[0].AirlineID
    ]);

    res.redirect('/admin');
  } catch (err) {
    console.log(err);
  }
};

exports.getRevenuePage = async (req, res) => {
  res.render('checkRevenue', {
    user: req.session.user
  });
};

exports.checkRevenue = async (req, res) => {
  try {
    const { reportType, startDate, endDate, flightID, passengerID, airportCode } = req.body;

    let id = '';
    if (flightID) id = flightID;
    else if (passengerID) id = passengerID;
    else if (airportCode) id = airportCode;

    const result = await db.queryAsync('CALL getRevenueReport(?, ?, ?, ?)', [
      reportType,
      id,
      startDate,
      endDate
    ]);

    const data = result[0];

    res.render('checkRevenue', {
      data: data
    });
  } catch (err) {
    console.log(err);
  }
};
