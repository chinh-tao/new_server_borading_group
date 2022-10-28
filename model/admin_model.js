const client = require('../common/database').client;
const db = client.db();

class AdminModel{
    constructor(email,name,pass,idBranch){
        this.email = email;
        this.name = name;
        this.pass = pass;
        this.idBranch = idBranch;
    }

    static findOne(condition = {}) {
        return db.collection('Admin').findOne(condition);
    }

    static find(condition = {}, project = {}) {
        return db.collection('Admin').find(condition).project(project);
    }

    updateOne(){
        var form = {};
        if(this.email){
            form['email'] = this.email;
        }
        if(this.name){
            form['name'] = this.name;
        }
        if(this.pass){
            form['pass'] = this.pass;
        }
        if(this.idBranch){
            form['idBranch'] = this.idBranch;
        }
        return db.collection('Admin').updateOne({email: this.email},{$set: form});
    }
}

module.exports = AdminModel;