const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const InvalidRequest = require('../errors/invalid-request');

const updateCfg = {
  new: true, // обработчик then получит на вход обновлённую запись
  runValidators: true, // данные будут валидированы перед изменением
  upsert: false, // если пользователь не найден, он будет создан
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'Error') {
        next(new InvalidRequest('Ошибка при создании карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findOne({ _id: req.params.cardId, owner: req.user._id })
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Неверный ID карточки'));
      }
      return Card.findByIdAndRemove(req.params.cardId, updateCfg);
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        next(new InvalidRequest('Ошибка при удалении карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    updateCfg,
  )
    .orFail(new NotFoundError('Неверный ID карточки'))
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'Error' && err.message !== 'Неверный ID карточки') {
        next(new InvalidRequest('Ошибка при лайке карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    updateCfg,
  )
    .orFail(new NotFoundError('Неверный ID карточки'))
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        next(new InvalidRequest('Ошибка при дизлайке карточки'));
      } else {
        next(err);
      }
    });
};
