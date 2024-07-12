require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/utils/database');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

const port = process.env.PORT || 3000;
sequelize.sync().then(() => app.listen(port, () => console.log(`App running on port ${port}...`)));

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  process.exit(1);
});
