// const adminModel = require('../model/admin_model');
const config = require('../common/config');
const mess = require('../common/config');
const client = require('../common/database').client;
const db = client.db();

const Utils = require('../common/utils');
const AdminModel = require('../model/admin_model');
const UserModel = require('../model/user_model');
const RandExp = require('randexp');
const randomPass = new RandExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9$@!%*?&#^+=-_]{8}$/);

exports.forgotPass = async (req, res) => {
    const { email } = req.body;
    try {
        let checkEmail = await AdminModel.findOne({
            email: email
        });
        if (checkEmail === null) {
            return res.json({
                code: 400,
                message: "Địa chỉ email chưa được đăng ký.",
                payload: null
            });
        } else {
            const password = randomPass.gen();
            const model = new AdminModel();
            model.email = checkEmail['email'];
            model.pass = password;
            await model.updateOne();
            Utils.sendMail(email, password);
            return res.json({
                code: 0,
                message: "Đặt lại mật khẩu thành công!",
                payload: null
            });
        }
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

exports.login = async (req, res, next) => {
    const { email, pass } = req.body;
    try {
        let checkAccount = await AdminModel.find({
            email: email,
            pass: pass
        }, { _id: 0, pass: 0 }).toArray();
        if (checkAccount.length === 0) {
            return res.json({
                code: 400,
                message: 'Thông tin người dùng không tồn tại.',
                payload: null
            });
        } else {
            return res.json({
                code: 0,
                message: 'Đăng nhập thành công!',
                payload: checkAccount[0]
            });
        }
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

exports.getAdmin = async (req, res) => {
    try {
        let data = await AdminModel.find({ idBranch: req.query.id }, { _id: 0, pass: 0 }).toArray();
        return res.json({
            code: 0,
            message: "Lấy thông tin thành công!",
            payload: data[0]
        });
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

exports.addUser = async (req, res) => {
    try {
        const { id_user, name_user, user_room, phone_user, id_branch } = req.body;
        var id, name, phone = null;
        if (id_user != '') id = await UserModel.findOne({id: {$regex: `^.*${id_user}.*$`, $options: 'i'}});
        if (name_user != '') name = await UserModel.findOne({userName: {$regex: `^.*${name_user}.*$`, $options: 'i'}});
        if (phone_user != '') phone = await UserModel.findOne({phone: {$regex: `^.*${phone_user}.*$`, $options: 'i'}});
        
        if (![id_user, name_user, user_room].includes('') && id === null && name === null && phone === null) {
            const model = new UserModel();
            model.id = id_user;
            model.userName = name_user;
            model.phone = phone_user;
            model.roomNumber = user_room;
            model.idBranch = id_branch;
            await model.insertUser();
            const dataUser = await UserModel.find({ idBranch: model.idBranch }, { _id: 0, pass: 0 }).toArray();
            return res.json({
                code: 0,
                message: "Đã thêm thanh viên mới vào chi nhánh!",
                payload: dataUser
            });
        }else{
            var condition = { idBranch: id_branch };
            if (id_user != '') condition['id'] = {$regex: `^.*${id_user}.*$`, $options: 'i'};
            if (name_user != '') condition['userName'] = {$regex: `^.*${name_user}.*$`, $options: 'i'};
            if (user_room != '') condition['roomNumber'] = {$regex: `^.*${user_room}.*$`, $options: 'i'};
            if (phone_user != '') condition['phone'] = {$regex: `^.*${phone_user}.*$`, $options: 'i'};
            const dataUser = await UserModel.find(condition, { _id: 0, pass: 0 }).toArray();
            if (dataUser.length == 0) {
                return res.json({
                    code: 400,
                    message: "Không tìm thấy thành viên phù hợp với yêu cầu.",
                    payload: null
                });
            } else {
                return res.json({
                    code: 0,
                    message: "Đã tìm thấy thành viên phù hợp với yêu cầu!",
                    payload: dataUser
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}