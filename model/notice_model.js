const client = require('../common/database').client;
const db = client.db();

class NoticeModel{
    constructor(title, content, date, idBranch) {
        this.title = title;
        this.content = content;
        this.date = date;
        this.idBranch = idBranch;
    }

    static find(condition = {}, project = {}) {
        return db.collection('Notification').find(condition).project(project);
    }
}

module.exports = NoticeModel;