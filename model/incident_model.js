const client = require('../common/database').client;
const db = client.db();

class IncidentModel{
    constructor(title, date, level, userName, roomNumber, status, idBranch) {
        this.title = title;
        this.date = date;
        this.userName = userName;
        this.level = level;
        this.roomNumber = roomNumber;
        this.status = status;
        this.idBranch = idBranch;
    }

    insertIncident(){
        return db.collection('Incident').insertOne(this);
    }

    static find(condition = {}, project = {}) {
        return db.collection('Incident').find(condition).project(project);
    }
}

module.exports = IncidentModel;