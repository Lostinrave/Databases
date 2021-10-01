const mysql = require('mysql');

//Generating connection to MySQL
const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'clients'
});
//Starting database and callback
db.connect(err=>{
    if(err){
        console.log('Connection failed');
        return;
    }
    console.log('Connected successfully');
});

module.exports=db;