const connection = require('./model');
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('express-handlebars');
const recordsController = require('./controllers/records');
const publicPath=path.join(__dirname,'public');
app.use(express.urlencoded({
    extended:false
}));

app.set('views', path.join(__dirname,'/views/'));

app.engine('hbs',hbs({
    extname:'hbs',
    defaultLayout: 'mainlayout',
    layoutsDir: __dirname + '/views/layouts'
}));

app.set('view engine', 'hbs');

app.use(express.static(publicPath));

app.get('/',(req,res)=>{
    res.render('index');
});

app.use('/records',recordsController);

app.listen('3000',()=>{
    console.log('Server is up and running');
});