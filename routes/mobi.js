const userController = require('../controller/users');

const express = require('express');
const router = express.Router();

//method POST
router.post("/login", userController.login);
router.post('/register', userController.register);
router.post('/check-user', userController.checkUser);
router.post('/payment', userController.payment);
router.post('/room-incident', userController.roomIncident);

//method GET
router.get('/check-device', userController.checkDevice);
router.get('/list-member', userController.listMember);
router.get('/list-bill', userController.getBill);
router.get('/list-incident', userController.listIncident);
router.get('/list-notice', userController.listNotice);

//method PUT
router.put('/change-email', userController.changeMail);
router.put('/change-pass', userController.changePass);
router.put('/forgot-pass', userController.forgotPass);

//method DELETE
router.delete('/remove-account', userController.removeAccount);

module.exports = router;