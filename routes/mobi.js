const userController = require('../controller/users');

const express = require('express');
const router = express.Router();

//method POST
router.post("/login", userController.login);
router.post('/register', userController.register);
router.post('/check-user', userController.checkUser);
// router.post('/send-code', userController.sendCode);

//method GET
router.get('/check-device', userController.checkDevice);

//method PUT
// router.put('/change-pass', userController.changePass);
router.put('/forgot-pass', userController.forgotPass);

//method DELETE
router.delete('/remove-account', userController.removeAccount);

module.exports = router;