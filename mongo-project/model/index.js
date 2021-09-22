const mongoose=require('mongoose');

mongoose.connect('mongodb://localhost:27017/blog',(error)=>{
    if(!error){
        console.log('Connected to database')
    }else{
        console.log('Connection error');
    }
});

const records = require('./records.model');
