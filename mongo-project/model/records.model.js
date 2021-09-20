const mongoose=require('mongoose');

var RecordsSchema = new mongoose.Schema({
    recordId: {
        type:String
    },
    name: {
        type:String
    },
    text: {
        type:String
    },
    date: {
        type:date
    }
});

mongoose.model('records',RecordsSchema);