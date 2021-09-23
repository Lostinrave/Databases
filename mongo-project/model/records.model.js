const mongoose=require('mongoose');
const validator=require('validator');

var RecordsSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        trim:true
    },
    text: {
        type:String,
        required:true,
        trim:true
    },
    date: {
        type:Date,
        required:true,
        validate(value){
            if(!validator.isDate(value)){
                throw new Error('Wrong data format');
            }
        }
    }
});

mongoose.model('records',RecordsSchema);