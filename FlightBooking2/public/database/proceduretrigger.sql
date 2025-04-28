use flight_booking_sys;


DROP PROCEDURE IF EXISTS SearchFlights;
DROP PROCEDURE IF EXISTS getBookingHistory;
DROP PROCEDURE IF EXISTS generateETicket;
DROP PROCEDURE IF EXISTS bookingTicket;
DROP TRIGGER IF EXISTS updateAvailableSeats;
DROP PROCEDURE IF EXISTS addFlight;
DROP PROCEDURE IF EXISTS getRevenueReport;

DELIMITER //
CREATE PROCEDURE SearchFlights(
    IN origin VARCHAR(50),
    IN destination VARCHAR(50),
    IN departureDate DATETIME,
    IN arrivalDate DATETIME
) 
    BEGIN
        SELECT f.FlightNumber,a1.Location AS Origin, a2.Location AS Destination, f.DepartureDateTime, f.ArrivalDateTime, f.TotalSeats,  f.AvailableSeats 
        FROM flight f 
            INNER JOIN airport a1 ON a1.AirportCode = f.OriginAirportCode 
            INNER JOIN airport a2 ON a2.AirportCode = f.DestinationAirportCode 
        WHERE (origin IS NULL OR a1.Location = origin) 
            AND (destination IS NULL OR a2.Location = destination) 
            AND (departureDate IS NULL OR DATE(f.DepartureDateTime) =  DATE(departureDate)) 
            AND (arrivalDate IS NULL OR DATE(f.ArrivalDateTime) =  DATE(arrivalDate)) 
            AND f.AvailableSeats > 0 
        ORDER BY f.DepartureDateTime ASC;
    END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE getBookingHistory(
    IN userID INT
) 
    BEGIN
        SELECT CONCAT(p.FirstName, ' ', p.LastName) as Name, f.FlightNumber, a1.Location AS Departure, a2.Location AS Arrival, f.DepartureDateTime, f.ArrivalDateTime,b.BookingDate ,b.PaymentStatus 
        FROM booking b 
            INNER JOIN flight f ON b.FlightID = f.FlightID 
            INNER JOIN airport a1 ON a1.AirportCode = f.OriginAirportCode 
            INNER JOIN airport a2 ON a2.AirportCode = f.DestinationAirportCode 
            INNER JOIN passenger p ON b.PassengerID = p.PassengerID 
        WHERE b.UserID = userID;
    END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE generateETicket(
    IN userID INT
) 
    BEGIN
        SELECT CONCAT(p.FirstName, ' ', p.LastName) as Name, f.FlightNumber, f.OriginAirportCode, a1.Location AS Departure, f.DestinationAirportCode,a2.Location AS Arrival, f.DepartureDateTime, f.ArrivalDateTime, a.AirlineName
        FROM booking b 
            INNER JOIN flight f ON b.FlightID = f.FlightID
            INNER JOIN airline a ON f.AirlineID = a.AirlineID 
            INNER JOIN airport a1 ON a1.AirportCode = f.OriginAirportCode 
            INNER JOIN airport a2 ON a2.AirportCode = f.DestinationAirportCode 
            INNER JOIN passenger p ON b.PassengerID = p.PassengerID 
        WHERE b.UserID = userID;
    END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE bookingTicket(
    IN flightID INT,
    IN passengerID INT,
    IN userID INT,
    IN paymentStatus VARCHAR(50)
) 
    BEGIN
        INSERT INTO booking (FlightID, PassengerID, UserID, PaymentStatus) 
        VALUES (flightID, passengerID, userID, paymentStatus);
    END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER updateAvailableSeats
    AFTER INSERT ON Booking
    FOR EACH ROW
    BEGIN
        UPDATE flight 
        SET AvailableSeats = AvailableSeats - 1 
        WHERE FlightID = NEW.FlightID;
    END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE addFlight(
    IN flightNumber VARCHAR(20),
    IN originAirportCode VARCHAR(50),
    IN destinationAirportCode VARCHAR(50),
    IN departureDateTime DATETIME,
    IN arrivalDateTime DATETIME,
    IN totalSeats INT,
    IN availableSeats INT,
    IN airlineID INT
)
    BEGIN
        INSERT INTO flight (FlightNumber, OriginAirportCode, DestinationAirportCode, DepartureDateTime, ArrivalDateTime, TotalSeats, AvailableSeats, AirlineID) 
        VALUES (flightNumber, originAirportCode, destinationAirportCode, departureDateTime, arrivalDateTime, totalSeats, availableSeats,
        airlineID);
    END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE getRevenueReport(
    IN reportType VARCHAR(20),
    IN ID VARCHAR(20),
    IN startDate DATETIME,
    IN endDate DATETIME
)
    BEGIN
        IF reportType = 'Flight' THEN
            SELECT 
                f.flightID, 
                f.flightNumber, 
                COUNT(p.paymentID) AS totalTicketsSold, 
                SUM(p.amount) AS totalRevenue
            FROM flight f
                JOIN booking b ON f.flightID = b.flightID
                JOIN payment p ON b.bookingID = p.bookingID
            WHERE (p.transactionDateTime BETWEEN startDate AND endDate) AND (ID = '' OR f.flightID = CAST(ID AS SIGNED))
            GROUP BY f.flightID, f.flightNumber
            ORDER BY totalRevenue DESC;
        
        ELSEIF reportType = 'Passenger' THEN
            SELECT CONCAT(p.firstName, ' ', p.lastName) AS passengerName, 
                COUNT(pay.paymentID) AS ticketPurchased, 
                SUM(pay.amount) AS totalAmountSpent
            FROM passenger p
                JOIN booking b ON p.passengerID = b.passengerID
                JOIN payment pay ON b.bookingID = pay.bookingID
            WHERE ((pay.transactionDateTime BETWEEN startDate AND endDate) AND (ID = '' OR p.passengerID = CAST(ID AS SIGNED))
            )
            GROUP BY p.passengerID, passengerName
            ORDER BY totalAmountSpent DESC;
        
        ELSEIF reportType = 'Airport' THEN
            SELECT 
                a.airportCode, 
                a.airportName,  
                SUM(p.amount) AS totalRevenue
            FROM airport a
                JOIN flight f ON a.airportCode = f.originAirportCode OR a.airportCode = f.destinationAirportCode
                JOIN booking b ON f.flightID = b.flightID
                JOIN payment p ON b.bookingID = p.bookingID
            WHERE ((p.transactionDateTime BETWEEN startDate AND endDate) AND (ID = '' OR airportCode = ID)
            )
            GROUP BY a.airportCode, a.airportName
            ORDER BY totalRevenue DESC;

        ELSEIF reportType = 'Monthly' THEN
            SELECT 
                YEAR(p.transactionDateTime) AS year,
                MONTH(p.transactionDateTime) AS month,
                SUM(p.amount) AS monthlyRevenue
            FROM payment p
            WHERE (p.transactionDateTime BETWEEN startDate AND endDate)
            GROUP BY YEAR(p.transactionDateTime), MONTH(p.transactionDateTime)
            ORDER BY year, month DESC;
        END IF;
    END //

DELIMITER ;