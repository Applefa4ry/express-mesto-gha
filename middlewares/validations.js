const { celebrate, Joi } = require('celebrate');
const urlRegex = require('../constants/regex');

module.exports.validateUserBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(urlRegex),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
  }),
});

module.exports.validateAuthentication = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
  }),
});
