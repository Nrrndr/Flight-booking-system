const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bc = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const util = require('util');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'cacaprut1234',
  database: 'flight_booking_sys',
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});

const queryAsync = util.promisify(db.query).bind(db);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
  })
);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/register', async (req, res) => {
  const { username, email, phoneNumber, password, confirmPassword } = req.body;
  const role = 'user';

  if (!username || !email || !password) {
    return res.send('Semua field harus diisi');
  }
  if (password !== confirmPassword) {
    return res.send('Password tidak sesuai');
  }

  try {
    const hashedPassword = await bc.hash(password, 10);

    await queryAsync(
      'INSERT INTO users (username, email, PhoneNumber, PasswordHash, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, phoneNumber, hashedPassword, role]
    );
    await queryAsync('COMMIT;');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.send('Username atau email sudah terdaftar');
    }
    return res.status(500).send('Terjadi kesalahan pada server');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE Username = ?',
    [username],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Terjadi kesalahan pada server');
      }

      if (result.length === 0) {
        return res.status(401).send('Username tidak ditemukan');
      }

      const user = result[0];

      bc.compare(password, user.PasswordHash, (err, isMatch) => {
        if (err) {
          console.error('Bcrypt error:', err);
          return res
            .status(500)
            .send('Terjadi kesalahan saat verifikasi password');
        }

        if (!isMatch) {
          return res.status(401).send('Password salah');
        }

        req.session.user = {
          id: user.UserID,
          username: user.Username,
          email: user.Email,
          role: user.Role,
        };
        req.session.save();

        console.log(req.session.user, 'login berhasil');

        if (req.session.user.role === 'admin') {
          res.redirect('/admin');
        } else {
          res.redirect('/user');
        }
      });
    }
  );
});

app.get('/admin', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/');
  }
  try {
    const locations = await queryAsync('SELECT location FROM Airport');
    const airlines = await queryAsync('SELECT AirlineName FROM Airline');

    res.render('addFlight', {
      user: req.session.user,
      location: locations,
      airline: airlines,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/addFlight', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/');
  }

  try {
    const {
      flightNumber,
      depLoc,
      arrLoc,
      depDate,
      arrDate,
      totalSeats,
      airline,
    } = req.body;

    originAirportCode = await queryAsync(
      'SELECT AirportCode FROM Airport WHERE Airport.Location = ?',
      [depLoc]
    );
    destinationAirportCode = await queryAsync(
      'SELECT AirportCode FROM Airport WHERE Airport.Location = ?',
      [arrLoc]
    );
    airlineID = await queryAsync(
      'SELECT AirlineID FROM Airline WHERE AirlineName = ?',
      [airline]
    );

    console.log(airlineID);
    console.log(destinationAirportCode);
    console.log(depLoc);
    console.log(originAirportCode);

    await queryAsync('CALL addFlight(?, ?, ?, ?, ?, ?, ?, ?)', [
      flightNumber,
      originAirportCode[0].AirportCode,
      destinationAirportCode[0].AirportCode,
      depDate,
      arrDate,
      totalSeats,
      totalSeats,
      airlineID[0].AirlineID,
    ]);

    res.redirect('/admin');
  } catch (err) {
    console.log(err);
  }
});

app.get('/checkRevenue', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/');
  }

  res.render('checkRevenue', {
    user: req.session.user,
  });
});

app.post('/checkRevenue', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/');
  }

  try {
    let { reportType, startDate, endDate, flightID, passengerID, airportCode } =
      req.body;

    let id = '';
    if (flightID) id = flightID;
    else if (passengerID) id = passengerID;
    else if (airportCode) id = airportCode;

    const result = await queryAsync('CALL getRevenueReport(?, ?, ?, ?)', [
      reportType,
      id,
      startDate,
      endDate,
    ]);

    const data = result[0];

    res.render('checkRevenue', {
      data: data,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get('/user', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/');
  }
  try {
    const result = await queryAsync('SELECT location FROM Airport');

    res.render('searchFlight', {
      user: req.session.user,
      location: result,
      flight: [],
    });
  } catch (err) {
    console.log(err);
  }
  console.log(req.session.user);
});

app.post('/search', async (req, res) => {
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

  if (!req.session.user) {
    return res.redirect('/');
  }
  try {
    const location = await queryAsync('SELECT location FROM Airport');
    const result = await queryAsync('CALL SearchFlights(?,?,?,?)', [
      depLoc,
      arrLoc,
      depDate,
      arrDate,
    ]);
    console.log(result);

    res.render('searchFlight', {
      user: req.session.user,
      flight: result[0],
      location: location,
    });
  } catch (err) {
    console.log(err);
  }
  console.log(req.session.user);
});

app.post('/book', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/');
  }

  const flightID = req.body.flightBook;
  let flightBook = await queryAsync(
    'SELECT * FROM Flight WHERE FlightNumber = ?',
    [flightID]
  );

  res.render('bookFlight', {
    user: req.session.user,
    flightBook: flightBook[0],
  });
  console.log(flightBook, flightID);
});

app.post('/booking', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/');
  }

  const checkPassenger = async (firstName, lastName, email, passport) => {
    let res = await queryAsync(
      'SELECT PassengerID FROM passenger WHERE FirstName=? AND LastName=? AND Email=? AND PassportNumber=?',
      [firstName, lastName, email, passport]
    );
    if (res.length == 0) {
      queryAsync(
        'INSERT INTO passenger (FirstName, LastName, Email, PassportNumber) VALUES (?,?,?,?)',
        [firstName, lastName, email, passport]
      );

      res = await queryAsync(
        'SELECT PassengerID FROM passenger WHERE FirstName=? AND LastName=? AND Email=? AND PassportNumber=?',
        [firstName, lastName, email, passport]
      );
    }
    return res[0].PassengerID;
  };

  const { firstName, lastName, email, passport, flightNumber } = req.body;
  const paymentStatus = 'pending';
  const flightRes = await queryAsync(
    'SELECT FlightID FROM Flight WHERE FlightNumber = ?',
    [flightNumber]
  );
  let passengerID = await checkPassenger(firstName, lastName, email, passport);
  const flightID = flightRes[0].FlightID;
  let userID = parseInt(req.session.user.id);

  console.log(req.session.user.id, flightID, passengerID, paymentStatus);
  try {
    await queryAsync('CALL BookingTicket(?,?,?,?)', [
      flightID,
      passengerID,
      userID,
      paymentStatus,
    ]);

    res.redirect('history');
  } catch (err) {
    console.log(err);
  }
});

app.get('/ticket', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/');
  }
  res.render('generateTicket', { user: req.session.user, ticket: [] });
});

app.post('/generateticket', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/');
  }

  const histories = await queryAsync('CALL generateETicket(?)', [
    req.session.user.id,
  ]);

  const { bookID } = req.body;
  const history = histories[0];
  const ticket = history[bookID - 1];

  res.render('generateTicket', { user: req.session.user, ticket: ticket });
  console.log(ticket);
});

app.get('/history', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.redirect('/');
  }
  try {
    const result = await queryAsync('CALL GetBookingHistory(?)', [
      req.session.user.id,
    ]);
    res.render('flightHistory', {
      user: req.session.user,
      histories: result[0],
    });
  } catch (err) {
    console.log(err);
  }
  console.log(req.session.user);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
