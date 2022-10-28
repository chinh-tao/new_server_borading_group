const UserModel = require('../model/user_model');
const LoginModel = require('../model/login_model');
const Utils = require('../common/utils');

const fs = require('fs');
const randomstring = require('randomstring');

exports.login = async (req, res) => {
    const { email, pass, device_mobi } = req.body;
    var model = new UserModel();

    try {
        model = await UserModel.findOne({
            email: email,
            pass: pass
        });
        if (model != null) {
            let result = await LoginModel.findOne({
                email: email,
                deviceMobi: device_mobi
            });
            if (result === null) {
                const loginModel = new LoginModel(device_mobi, email);
                loginModel.insertOne();
            }
            return res.json({
                code: 0,
                message: "Đăng nhập thành công!",
                payload: model
            });
        } else {
            return res.json({
                code: 400,
                message: "Tài khoản email hoặc mật khẩu sai.",
                payload: null
            });
        }
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    };
};

exports.register = async (req, res) => {
    try {
        const { id, email, images, device_mobi } = req.body;
        const randomPass = randomstring.generate(7);

        let checkAccount = await UserModel.findOne({ id: id });
        if (checkAccount === null) {
            return res.json({
                code: 400,
                message: 'Người dùng không tồn tại.',
                payload: null
            });
        } else if (checkAccount.deviceMobi != null) {
            return res.json({
                code: 501,
                message: 'Đăng ký không thành công. Thông tin tài khoản đã tồn tại.',
                payload: null
            });
        }

        let checkEmail = await UserModel.findOne({ email: email });
        if (checkEmail != null) {
            return res.json({
                code: 501,
                message: 'Đăng ký không thành công. Đã có tài khoản đăng ký email này.',
                payload: null
            });
        }

        const model = new UserModel();
        model.id = id;
        model.email = email;
        model.pass = randomPass;
        model.deviceMobi = device_mobi;
        if (images != undefined){
            const filed = await Utils.saveImage(id, images);
            model.images = await Utils.urlImage(filed[0].metadata.name);
            fs.unlinkSync(`upload/${id}.${images.type}`);
        }
        await model.updateOne();
        Utils.sendMail(email, randomPass);

        return res.json({
            code: 0,
            message: "Đăng ký tài khoản thành công!",
            payload: null
        });
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
};

exports.checkUser = async (req, res) => {
    var model = new UserModel();
    try {
        model = await UserModel.findOne({ id: req.body.id });
        if (model != null) {
            return res.json({
                code: 0,
                message: 'Kiểm tra thông tin thành công!',
                payload: model.userName
            });
        } else {
            return res.json({
                code: 400,
                message: 'Người dùng không tồn tại.',
                payload: null
            });
        }
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
};

// exports.sendCode = (req, res) => {
//     const { email } = req.body;
//     crypto.randomInt(0, 100000, (err, random) => {
//         const randomNum = random.toString().padStart(6, '0');
//         if (err) {
//             console.log(err);
//             return res.json({
//                 code: 501,
//                 message: "Có một lỗi xảy ra trong quá trình gửi mã.",
//                 payload: null
//             });
//         } else {
//             const setupEmail = {
//                 from: string.email,
//                 to: `${email}`,
//                 subject: string.subject_code,
//                 text: string.mailSendCode(randomNum)
//             };
//             config.myEmail.sendMail(setupEmail, (err, infor) => {
//                 if (err) {
//                     console.log(err);
//                     return res.json({
//                         code: 501,
//                         message: "Có một lỗi xảy ra trong quá trình gửi mã.",
//                         payload: null
//                     });
//                 }
//                 return res.json({
//                     code: 0,
//                     message: 'Chúng tôi đã gửi mã xác thực vào email của bạn!',
//                     payload: {
//                         verifi_code: randomNum
//                     }
//                 });
//             });
//         }
//     });
// };

exports.checkDevice = async (req, res) => {
    var dataUser = [];
    var hasDevice = true;
    let listUser = await UserModel.findJoin(req.query.device_mobi).toArray();
    if (listUser.length > 1) {
        listUser.forEach(data => {
            var user = {};
            user.userName = data.User.userName;
            user.images = data.User.images;
            user.email = data.Login.email;
            dataUser.push(user);
        });
    } else {
        let checkAccount = await UserModel.findOne({
            deviceMobi: req.query.device_mobi
        });
        if (checkAccount === null) {
            hasDevice = false;
        }
    }
    return res.json({
        code: 0,
        message: "Kiểm tra device thành công!",
        payload: {
            has_device: hasDevice,
            data_user: dataUser
        }
    });
};

// exports.changePass = async (req, res) => {
//     const { email, pass_confirm } = req.body;
//     try {
//         await userModel.update({
//             pass: pass_confirm
//         }, { where: { email: email } });
//         return res.json({
//             code: 0,
//             message: "Cập nhập thông tin thành công!",
//             payload: null
//         });
//     } catch (err) {
//         console.log(err);
//         return res.json(Utils.dataErr);
//     }
// };

exports.forgotPass = async (req, res) => {
    const { id, email } = req.body;
    try {
        let checkID = await UserModel.findOne({ id: id });
        if (checkID != null) {
            if (checkID.email === email) {
                const randomPass = randomstring.generate(7);
                const model = new UserModel();
                model.id = id;
                model.pass = randomPass;
                await model.updateOne();
                Utils.sendMail(email, randomPass);
                return res.json({
                    code: 0,
                    message: "Đặt lại mật khẩu thành công!",
                    payload: null
                });
            } else {
                res.json({
                    code: 400,
                    message: "Email không khớp với tài khoản.",
                    payload: null
                });
            }
        } else {
            return res.json({
                code: 400,
                message: "Người dùng không tồn tại.",
                payload: null
            });
        }
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
};

exports.removeAccount = async (req, res) => {
    const { email, device_mobi } = req.body;
    try {
        await UserModel.deleteOne({
            email: email,
            deviceMobi: device_mobi
        });
        return res.json({
            code: 0,
            message: "Xoá tài khoản trên thiết bị thành công!",
            payload: null
        });
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
};