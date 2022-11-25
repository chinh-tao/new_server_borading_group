const client = require('../common/database').client;
const db = client.db();

class InvoiceModel{
    constructor(id, electricNumber, dateCreate, bill, idBranch, roomNumber, payment) {
        this.id = id;
        this.electricNumber = electricNumber;
        this.dateCreate = dateCreate;
        this.bill = bill;
        this.payment = payment;
        this.roomNumber = roomNumber;
        this.idBranch = idBranch;
    }

    static findOne(condition = {}) {
        return db.collection('Invoice').findOne(condition);
    }

    static find(condition = {}, project = {}) {
        return db.collection('Invoice').find(condition).project(project);
    }

    updateMany(){
        return db.collection('Invoice').updateMany(
            {_id: this.id},
            {$set: {payment: this.payment}});
    }
}

module.exports = InvoiceModel