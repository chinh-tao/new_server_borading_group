const express = require('express');
const apps = express();
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
var serviceAccount = require("./boarding-group-firebase-adminsdk-j57nt-8c9ffe1e4a.json");
const path = require('path');

const createServer = require('./common/database').createServer;
const mobiRoutes = require('./routes/mobi');
const webRoutes = require('./routes/web');
const config = require('./common/config');

apps.set('view engine','pug');
apps.set('views','views');

apps.use(bodyParser.urlencoded({extended: true }));
apps.use(bodyParser.json({limit: '50mb'}));
apps.use(express.static(path.join(__dirname,'public')));

apps.use((req,res,next)=>{
    res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Headers', 'Origin,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,locale,id_branch');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

apps.use('/mobi', mobiRoutes);
apps.use('/web', webRoutes);

apps.use((req,res, next)=>{
    // req.headers['access-control-expose-headers']
   return res.status(400).render('404');
});

createServer(()=>{
    apps.listen(process.env.PORT || 8000);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: config.storageBucket
    });
});