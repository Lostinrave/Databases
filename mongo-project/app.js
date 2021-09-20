const connection = require('./model/connection');
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('express-handlebars');
const parser = require('body-parser');

app.use(parser.urlencoded({
    extended:true
}));

app.set('views', path.join(__dirname,'/views/'));

app.engine('hbs',hbs({
    extname:'hbs',
    defaultLayout: 'mainlayout',
    layoutsDir: __dirname + '/views/layouts'
}));

app.set('view engine', 'hbs');

app.get('/',(req,res)=>{
    res.render('index');
});

app.listen('3000',()=>{
    console.log('Server is up and running');
});