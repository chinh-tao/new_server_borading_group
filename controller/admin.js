// const adminModel = require('../model/admin_model');
const config = require('../common/config');
const mess = require('../common/config');
const client = require('../common/database').client;
const db = client.db();

const Utils = require('../common/utils');
const AdminModel = require('../model/admin_model');
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
                code: 501,
                message: "Địa chỉ email chưa được đăng ký.",
                payload: null
            });
        } else {
            const password = randomPass.gen();
            const model = new AdminModel();
            model.email = checkEmail['email'];
            model.pass = password;
            await model.updateOne();
            Utils.sendMail(email,password);
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

exports.login = async (req,res,next)=>{
    const { email, pass } = req.body;
    try{
        let checkAccount = await AdminModel.find({
            email: email,
            pass: pass
        },{_id: 0, pass: 0}).toArray();
        if(checkAccount.length === 0){
            return res.json({
                code: 501,
                message: 'Thông tin người dùng không tồn tại.',
                payload: null
            });
        }else{
            return res.json({
                code: 0,
                message: 'Đăng nhập thành công!',
                payload: checkAccount[0]
            });
        }
    }catch(err){
        console.log(err);
        return res.json(Utils.dataErr);
    }
}

exports.getAdmin = async (req,res)=>{
    try{
        let data = await AdminModel.find({idBranch: req.query.id},{_id: 0, pass: 0}).toArray();
        return res.json({
            code: 0,
            message: "Lấy thông tin thành công!",
            payload: data[0]
        });
    }catch(err){
        console.log(err);
        return res.json(Utils.dataErr);
    }
}