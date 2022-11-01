const controller = require('../controller/admin');

const express = require('express');
const router = express.Router();

var href = ['','/web/forgot-pass'];
var titleElement = ['','Quên mật khẩu'];

//method GET
router.get('/infor-admin', controller.getAdmin);
// router.get('/',(req,res)=>{
//     href[0] = '/web/register';
//     titleElement[0] = 'Đăng ký';
//     return res.render('login',{
//         docTitle: 'Đăng nhập', 
//         href: href, 
//         titleElement: titleElement
//     });
// });
// router.get('/register',(req,res)=>{
//     href[0] = '/web';
//     titleElement[0] = 'Đăng nhập';
//     return res.render('register',{
//         docTitle: 'Đăng ký', 
//         href: href, 
//         titleElement: titleElement
//     });
// });
// router.get('/forgot-pass',(req,res)=>{
//     return res.render('forgot_pass',{
//         docTitle: 'Quên mật khẩu', 
//         href: ['/web','/web/register'], 
//         titleElement: ['Đăng nhập','Đăng ký']
//     });
// });

//method POST
router.post('/login', controller.login);
// router.post('/register', controller.register);
router.post('/forgot-pass', controller.forgotPass);

module.exports = router;