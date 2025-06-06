const app = require('./app');
const port = process.env.PORT || 3000;

require('dotenv').config();

/* eslint-disable no-console*/
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
