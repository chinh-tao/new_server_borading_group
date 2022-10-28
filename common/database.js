const {MongoClient} = require('mongodb');
const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://chinh-tao:chinhFPT1908@cluster0.d1gorgd.mongodb.net/DB_Boarding?retryWrites=true&w=majority');

const connectMongo = () =>{
    try{
        mongoClient.connect();
        console.log('connected');
        return true;
    }catch(err){
        console.log(err);
        return false
    }
}

const createServer = callback =>{
    let connected = connectMongo();
    if(connected === true){
        return callback();
    }
    return;
}

exports.createServer = createServer;
exports.client = mongoClient;