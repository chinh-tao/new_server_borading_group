const client = require('../common/database').client;
const db = client.db();

class UserModel {
    constructor(id, email, userName, pass, deviceMobi, images, roomNumber, idBranch) {
        this.id = id;
        this.email = email;
        this.userName = userName;
        this.pass = pass;
        this.deviceMobi = deviceMobi;
        this.images = images;
        this.roomNumber = roomNumber;
        this.idBranch = idBranch;
    }

    updateOne(){
        var form = {};
        if(this.email){
            form['email'] = this.email;
        }
        if(this.pass){
            form['pass'] = this.pass;
        }
        if(this.images){
            form['images'] = this.images;
        }
        if(this.deviceMobi){
            form['deviceMobi'] = this.deviceMobi;
        }
        return db.collection('User').updateOne({id: this.id},{$set: form});
    }

    static deleteOne(condition = {}){
        return db.collection('Login').deleteOne(condition);
    }

    static findOne(condition = {}) {
        return db.collection('User').findOne(condition);
    }

    static findJoin(device){
        return db.collection("User").aggregate(
            [
                {
                    $project: {
                        _id: 0,
                        User: "$$ROOT"
                    }
                },
                {
                    $lookup: {
                        localField: "User.email",
                        from: "Login",
                        foreignField: "email",
                        as: "Login"
                    }
                },
                {
                    $unwind: {
                        path: "$Login",
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $match: {
                        "Login.deviceMobi": device
                    }
                },
                {
                    $project: {
                        "Login.email": "$Login.email",
                        "User.userName": "$User.userName",
                        "User.images": "$User.images",
                        "_id": 0
                    }
                }
            ],
            {
                "allowDiskUse": true
            }
        );
    }
}
module.exports = UserModel;