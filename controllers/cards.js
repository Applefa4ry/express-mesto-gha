const Card = require('../models/card');

const validator = (err, res) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    res.status(400).send({ message: err.message });
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

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      validator(err, res);
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      validator(err, res);
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findOne({ _id: req.params.cardId, owner: req.user._id })
    .then((card) => {
      if (!card) {
        throw new Error('notValidId');
      }
      return Card.findByIdAndRemove(req.params.cardId, updateCfg);
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      validator(err, res);
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    updateCfg,
  )
    .orFail(new Error('notValidId'))
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      validator(err, res);
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    updateCfg,
  )
    .orFail(new Error('notValidId'))
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      validator(err, res);
    });
};
