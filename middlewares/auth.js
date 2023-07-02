const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-error');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const token = req.cookie.jwt;
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    next(new AuthError('Необходима авторизация'));
  }
  req.user = payload;

  next();
};
