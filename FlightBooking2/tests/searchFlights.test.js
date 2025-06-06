const { searchFlights } = require('../src/modules/userModule');
const db = require('../src/config/db');

jest.mock('../src/config/db', () => ({
  queryAsync: jest.fn()
}));

describe('searchFlights', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        depLoc: 'Jakarta',
        arrLoc: 'Bali',
        depDate: '2025-06-01',
        arrDate: '2025-06-10'
      },
      session: {
        user: {
          id: 1,
          username: 'testuser'
        }
      }
    };

    res = {
      render: jest.fn()
    };
  });

  it('harus merender searchFlight dengan hasil penerbangan', async () => {
    const mockLocations = [{ location: 'Jakarta' }, { location: 'Bali' }];
    const mockFlights = [
      {
        FlightNumber: 'F001',
        From: 'Jakarta',
        To: 'Bali',
        DepartureDate: '2025-06-01'
      }
    ];

    db.queryAsync
      .mockResolvedValueOnce(mockLocations) // untuk SELECT location
      .mockResolvedValueOnce([[...mockFlights]]); // untuk CALL SearchFlights

    await searchFlights(req, res);

    expect(res.render).toHaveBeenCalledWith('searchFlight', {
      user: req.session.user,
      flight: mockFlights,
      location: mockLocations
    });
  });

  it('harus merender searchFlight dengan data kosong jika tidak ada hasil', async () => {
    db.queryAsync
      .mockResolvedValueOnce([{ location: 'Jakarta' }, { location: 'Bali' }])
      .mockResolvedValueOnce([[]]);

    await searchFlights(req, res);

    expect(res.render).toHaveBeenCalledWith('searchFlight', {
      user: req.session.user,
      flight: [],
      location: [{ location: 'Jakarta' }, { location: 'Bali' }]
    });
  });

  it('harus menangani input kosong dan tetap berjalan', async () => {
    req.body.depLoc = '';
    req.body.arrLoc = '';
    req.body.depDate = '';
    req.body.arrDate = '';

    db.queryAsync
      .mockResolvedValueOnce([{ location: 'Jakarta' }, { location: 'Bali' }])
      .mockResolvedValueOnce([[]]);

    await searchFlights(req, res);

    expect(db.queryAsync).toHaveBeenCalledWith('CALL SearchFlights(?,?,?,?)', [
      null,
      null,
      null,
      null
    ]);
  });

  it('harus menangani error dengan try-catch', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    db.queryAsync.mockRejectedValue(new Error('DB Error'));

    await searchFlights(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleSpy.mockRestore();
  });
});
