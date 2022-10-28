const message = require('./config');

const nodemailer = require('nodemailer');
const fs = require('fs');
const admin = require('firebase-admin');
const {Storage} = require('@google-cloud/storage');

class Utils {
    static sendMail(email, randomPass) {
        const setupEmail = {
            from: message.email,
            to: `${email}`,
            subject: message.subject,
            text: message.contentEmail(randomPass)
        };
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: message.email,
                pass: message.password
            }
        }).sendMail(setupEmail);
    }

    static get dataErr() {
        return {
            code: 202,
            message: message.MSG_TIME_CLIENT,
            payload: null
        };
    }

    static async saveImage(id = '',images){
        fs.writeFileSync(`upload/${id}.${images.type}`,Buffer.from(images.file, 'base64'));
        var bucket = admin.storage().bucket();
        const metadata = {
            metadata: {
                firebaseStorageDownloadTokens: id
            },
            cacheControl: 'public, max-age=31536000',
        };
        return bucket.upload(`upload/${id}.${images.type}`, {
            gzip: true,
            metadata: metadata,
        }); 
    }

    static async urlImage(filedName = ''){
        const storage = new Storage({keyFilename: message.keyFilename});
        const result = storage.bucket(message.storageBucket);
        const file = result.file(filedName);
        const listUrl = await file.getSignedUrl({action: 'read',expires: '03-09-2491'});
        return listUrl[0];
    }
}

module.exports = Utils;