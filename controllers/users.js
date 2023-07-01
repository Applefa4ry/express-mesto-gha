const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const validator = (err, res) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    res.status(400).send({ message: err.message });
  } else if (err.message === 'Неправильные почта или пароль') {
    res.status(401).send({ message: err.message });
  } else if (err.message === 'notValidId') {
    res.status(404).send({ message: err.message });
  } else {
    res.status(500).send({ message: err.name });
  }
};

const updateCfg = {
  new: true, // обработчик then получит на вход обновлённую запись
  runValidators: true, // данные будут валидированы перед изменением
  upsert: false, // если пользователь не найден, он будет создан
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      validator(err, res);
    });
};

module.exports.getUser = (req, res) => {
  User.findById(!req.params.userId ? req.user._id : req.params.userId)
    .orFail(new Error('notValidId'))
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      validator(err, res);
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        // eslint-disable-next-line consistent-return
        .then((user) => {
          if (!user) {
            return Promise.reject(new Error('Возникла проблема'));
          }
          res.send({
            email: user.email,
            avatar: user.avatar,
            name: user.name,
            about: user.about,
          });
        })
        .catch((err) => {
          validator(err, res);
        });
    })
    .catch((err) => {
      validator(err, res);
    });
};

module.exports.editUserInfo = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, updateCfg)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      validator(err, res);
    });
};

module.exports.editUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, updateCfg)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      validator(err, res);
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        })
        .end();
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err });
    });
};
