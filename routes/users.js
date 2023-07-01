const router = require('express').Router();
const {
  getUsers, getUser, editUserInfo, editUserAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUser);
router.patch('/me', editUserInfo);
router.patch('/me/avatar', editUserAvatar);

module.exports = router;
