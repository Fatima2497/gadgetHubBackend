const mongoose  = require("mongoose")

const dbConn = () => {
    try{
        const conn = mongoose.connect(process.env.DATABASE_URL);
        console.log('connnection succesfull')
    }catch(e){
        console.log(e)
    }
}


module.exports = dbConn