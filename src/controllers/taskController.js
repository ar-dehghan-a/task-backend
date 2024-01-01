const Task = require('../models/taskModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Task, req.query).sort();
  const tasks = await features.getAll();

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOne({
    where: {
      id: req.params.id,
      userId: req.query.user.id,
    },
  });

  if (!task) return next(new AppError('با این ID هیچ تسکی پیدا نشد', 404));

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

exports.addTask = catchAsync(async (req, res, next) => {
  const newTask = await Task.create({task: req.body.task, userId: req.query.user.id});

  res.status(201).json({
    status: 'success',
    data: {
      task: newTask,
    },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOne({
    where: {
      id: req.params.id,
      userId: req.query.user.id,
    },
  });

  if (!task) return next(new AppError('با این ID هیچ تسکی پیدا نشد', 404));

  await task.update(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.destroy({
    where: {
      id: req.params.id,
      userId: req.query.user.id,
    },
  });

  if (!task) return next(new AppError('با این ID هیچ تسکی پیدا نشد', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
