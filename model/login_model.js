const client = require('../common/database').client;
const db = client.db();

class LoginModel {
    constructor(deviceMobi, email) {
        this.deviceMobi = deviceMobi;
        this.email = email;
    }

    insertOne() {
        return db.collection('Login').insertOne(this);
    }

    static findOne(condition = {}) {
        return db.collection('Login').findOne(condition);
    }

    static deleteOne(condition = {}){
        return db.collection('Login').deleteOne(condition);
    }
}

module.exports = LoginModel;