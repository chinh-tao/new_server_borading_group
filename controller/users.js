const UserModel = require('../model/user_model');
const LoginModel = require('../model/login_model');
const AdminModel = require('../model/admin_model');
const InvoiceModel = require('../model/invoice_model');
const IncidentModel = require('../model/incident_model');
const NoticeModel = require('../model/notice_model');
const Utils = require('../common/utils');

const fs = require('fs');
const randomstring = require('randomstring');
const { ObjectId } = require('mongodb');

exports.login = async (req, res) => {
    const { email, pass, device_mobi } = req.body;
    var model = new UserModel();

    try {
        model = await UserModel.find({
            email: email,
            pass: pass
        }, { _id: 0, pass: 0, deviceMobi: 0 }).toArray();
        if (model.length != 0) {
            let result = await LoginModel.findOne({
                email: email,
                deviceMobi: device_mobi
            });
            if (result === null) {
                const loginModel = new LoginModel(device_mobi, email);
                loginModel.insertOne();
            }
            let admin = await AdminModel.findOne({ idBranch: model[0].idBranch });
            delete model[0].idBranch;
            return res.json({
                code: 0,
                message: "Đăng nhập thành công!",
                payload: {
                    name: admin.name,
                    phone: admin.phone,
                    id_branch: admin.idBranch,
                    infor_user: model[0]
                }
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

        let checkAccount = await UserModel.findOne({ id: id });
        if (checkAccount === null) {
            return res.json({
                code: 400,
                message: 'Người dùng không tồn tại.',
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

        let checkDevice = await UserModel.findOne({ deviceMobi: device_mobi });
        if (checkDevice != null) {
            return res.json({
                code: 501,
                message: 'Đăng ký không thành công. Đã có tài khoản đăng ký trên thiết bị này.',
                payload: null
            });
        }

        const randomPass = randomstring.generate(7);
        const model = new UserModel();
        model.id = id;
        model.email = email;
        model.pass = randomPass;
        model.deviceMobi = device_mobi;
        if (images != undefined) {
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

exports.updateUser = async (req, res) => {
    try {
        const { email, old_pass, new_pass, phone, id } = req.body;
        let checkUser = await UserModel.findOne({ id: id });
        if (checkUser === null) {
            return res.json({
                code: 400,
                message: "Người dùng không tồn tại.",
                payload: null
            });
        }

        if (old_pass != undefined && checkUser.pass != old_pass) {
            return res.json({
                code: 400,
                message: "Mật khẩu cũ không chính xác.",
                payload: null
            });
        }
        const model = new UserModel();
        if(old_pass != undefined) model.pass = new_pass;
        if(email != undefined) model.email = email;
        if(phone != undefined) model.phone = phone;
        model.id = id;
        model.updateOne();
        return res.json({
            code: 0,
            message: "Cập nhập thông tin thành công!",
            payload: null
        });
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

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
        let checkAcc = await LoginModel.findOne({
            email: email,
            deviceMobi: device_mobi
        });
        if (checkAcc != null) {
            await LoginModel.deleteOne({ _id: ObjectId(checkAcc._id.toString()) });
            return res.json({
                code: 0,
                message: "Xoá tài khoản trên thiết bị thành công!",
                payload: null
            });
        }
        return res.json({
            code: 400,
            message: "Tài khoản chưa được đăng nhập trên thiết bị này.",
            payload: null
        });
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
};

exports.listMember = async (req, res) => {
    try {
        let branch = await checkBranch(req.headers['id_branch']);
        if (branch === false) {
            return res.json({
                code: 400,
                message: 'Chi nhánh không tồn tại.',
                payload: null
            });
        }
        const { room_number, user_name } = req.query;
        const condition = { idBranch: req.headers['id_branch'] };
        if (room_number != undefined) condition['roomNumber'] = room_number;
        if (user_name != undefined) condition['userName'] = { $regex: `^.*${user_name}.*$`, $options: 'i' };
        let result = await UserModel.find(condition, { _id: 0, pass: 0, deviceMobi: 0, idBranch: 0 }).toArray();
        if (result.length != 0) {
            return res.json({
                code: 0,
                message: "Lấy danh sách thành viên thành công!",
                payload: result
            });
        }
        return res.json({
            code: 400,
            message: 'Không tìm thấy thành viên phù hợp với yêu cầu.',
            payload: null
        });
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

exports.getBill = async (req, res) => {
    try {
        let branch = await checkBranch(req.headers['id_branch']);
        if (branch === false) {
            return res.json({
                code: 400,
                message: 'Chi nhánh không tồn tại.',
                payload: null
            });
        }
        var condition = { roomNumber: req.query.room, idBranch: req.headers['id_branch'] };
        if (req.query.month != undefined) condition['dateCreate'] = { $regex: `^${req.query.month}.*$`, $options: 'i' };
        let result = await InvoiceModel.find(condition).toArray();
        if (result.length != 0) {
            return res.json({
                code: 0,
                message: 'Lấy danh sách hoá đơn thành công!',
                payload: result
            });
        } else {
            return res.json({
                code: 400,
                message: "Không có hoá đơn nào được tìm thấy.",
                payload: null
            });
        }
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

exports.payment = async (req, res) => {
    try {
        const { name, category, date, images, id } = req.body;

        let result = await InvoiceModel.findOne({ _id: ObjectId(id) });
        if (result === null) {
            return res.json({
                code: 400,
                message: "Không tìm thấy hoá đơn phù hợp với yêu cầu.",
                payload: null
            });
        }

        var form = { name: name, category: category, date: date, status: 0 };
        const model = new InvoiceModel();
        model.id = new ObjectId(id);
        if (images != undefined) {
            const filed = await Utils.saveImage(`bill_${id}_${date}`, images);
            form['images'] = await Utils.urlImage(filed[0].metadata.name);
            fs.unlinkSync(`upload/bill_${id}_${date}.${images.type}`);
        }
        if (result.payment.length > 0) {
            model.payment = [...result.payment, form];
        } else {
            model.payment = [form];
        }
        await model.updateMany();
        return res.json({
            code: 0,
            message: 'Cập nhập thông tin thành công, vui lòng chờ quản trị viên xác nhận thanh toán!',
            payload: null
        });
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

exports.roomIncident = async (req, res) => {
    try {
        const { title, date, level, user_name, room, content } = req.body;

        let branch = await checkBranch(req.headers['id_branch']);
        if (branch === false) {
            return res.json({
                code: 400,
                message: 'Chi nhánh không tồn tại.',
                payload: null
            });
        }

        let checkUser = await UserModel.findOne({ userName: user_name, roomNumber: room });
        if (checkUser === null) {
            return res.json({
                code: 400,
                message: 'Thông tin người dùng không chính xác.',
                payload: null
            });
        }
        const model = new IncidentModel();
        model.title = title;
        model.date = date;
        model.level = level;
        model.userName = user_name;
        model.roomNumber = room;
        model.content = content;
        model.status = 0;
        model.idBranch = req.headers['id_branch'];
        await model.insertIncident();
        return res.json({
            code: 0,
            message: 'Yêu cầu đã được gửi tới quản trị viên!',
            payload: null
        });
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

exports.listIncident = async (req, res) => {
    try {
        let branch = await checkBranch(req.headers['id_branch']);
        if (branch === false) {
            return res.json({
                code: 400,
                message: 'Chi nhánh không tồn tại.',
                payload: null
            });
        }
        const { room, user_name, level, date, status } = req.query;
        var condition = { roomNumber: room, idBranch: req.headers['id_branch'] };
        if (user_name != undefined) condition['userName'] = { $regex: `^.*${user_name}.*$`, $options: 'i' };
        if (level != undefined) condition['level'] = { $regex: `^.*${level}.*$`, $options: 'i' };
        if (status != undefined) condition['status'] = status;
        if (date != undefined) condition['date'] = date;

        let result = await IncidentModel.find(condition, { _id: 0, idBranch: 0 }).toArray();
        if (result.length != 0) {
            return res.json({
                code: 0,
                message: 'Đã tìm thấy kết quả phù hợp với yêu cầu!',
                payload: result
            });
        } else {
            return res.json({
                code: 400,
                message: "Không tìm thấy kết quả phù hợp với yêu cầu.",
                payload: null
            });
        }
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

exports.listNotice = async (req, res) => {
    try {
        let branch = await checkBranch(req.headers['id_branch']);
        if (branch === false) {
            return res.json({
                code: 400,
                message: 'Chi nhánh không tồn tại.',
                payload: null
            });
        }
        let result = await NoticeModel.find({ idBranch: req.headers['id_branch'] }, { _id: 0 }).toArray();
        if (result.length != 0) {
            return res.json({
                code: 0,
                message: 'Lấy danh sách thông báo thành công!',
                payload: result
            });
        } else {
            return res.json({
                code: 400,
                message: "Không có thông báo nào được tìm thấy.",
                payload: null
            });
        }
    } catch (err) {
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

async function checkBranch(idBranch) {
    let branch = await AdminModel.findOne({ idBranch: idBranch });
    if (branch === null) {
        return false;
    }
    return true;
}