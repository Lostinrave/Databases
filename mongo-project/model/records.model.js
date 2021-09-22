const mongoose=require('mongoose');

var RecordsSchema = new mongoose.Schema({
    name: {
        type:String
    },
    text: {
        type:String
    },
    date: {
        type:Date
    }
});

mongoose.model('records',RecordsSchema);