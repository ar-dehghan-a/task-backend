require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/utils/database');

const port = process.env.PORT || 3000;
sequelize
  .sync()
  .then(() => app.listen(port, () => console.log(`App running on port ${port}...`)))
  .catch(err => console.log(err));
