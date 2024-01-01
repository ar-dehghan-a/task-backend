const {DataTypes} = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./userModel');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
    readOnly: true,
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isImportant: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  note: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  task: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {msg: 'لطفا تسک خود را وارد کنید'},
      notEmpty: {msg: 'تسک نمی‌تواند خالی باشد'},
    },
  },
  doneAt: DataTypes.DATE,
});

User.hasMany(Task, {foreignKey: 'userId'});
Task.belongsTo(User, {foreignKey: 'userId'});

module.exports = Task;
