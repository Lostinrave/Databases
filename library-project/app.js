const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const path = require('path');
const db = require('./db/connection');
//controllers
const usersController = require('./controllers/usersController');
const booksController = require('./controllers/booksController');
const authorsController = require('./controllers/authorsController');

app.use(express.urlencoded({
    extended:false
}));

app.engine('hbs',hbs({
    extname:'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/template',
    partialsDir: __dirname + '/views/partials'
}));

app.set('views', path.join(__dirname,'/views/'));

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname,'public')));

//controller routes
app.use('/', usersController);
app.use('/', booksController);
app.use('/', authorsController);
app.use('/',(req,res)=>{
    res.render('index');
});
app.listen('3000');

//SQL query
//CREATE DATABASE <name>
// db.query('DROP TABLE IF EXISTS records')
// db.query(`CREATE TABLE IF NOT EXISTS records(
//     id int(9) NOT NULL AUTO_INCREMENT,
//     name varchar(256),
//     text text,
//     PRIMARY KEY (id)
//     ) AUTO_INCREMENT=1 DEFAULT CHARSET=utf8`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     console.log(res);
// });
// db.query(`INSERT INTO records(name, text) VALUES (
//     'New 2', 'New inserted text here')`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     console.log(res);
// });
// db.query(`INSERT INTO records(name, text) VALUES (
//     'New 3', 'New inserted text here')`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     console.log(res);
// });
// db.query(`INSERT INTO records(name, text) VALUES (
//     'New4', 'New inserted text here')`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     console.log(res);
// });
// db.query(`INSERT INTO records(name, text) VALUES (
//     'new5', 'New inserted text here')`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     console.log(res);
// });
// db.query(`SELECT * FROM records`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     console.log(res);
// });
// db.query(`UPDATE records SET name ='edited2', text ='edited text2' WHERE id = 1`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     // console.log(res);
// });
// db.query(`UPDATE records SET name ='another edit', text ='another edited text' WHERE id = 2`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     // console.log(res);
// });
// db.query(`UPDATE records SET name ='third edit' WHERE id = 3`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     // console.log(res);
// });
// db.query(`UPDATE records SET name ='forth edit' WHERE id = 4`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     // console.log(res);
// });
// db.query(`UPDATE records SET name ='fith edit' WHERE id = 5`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
//     // console.log(res);
// });
// db.query(`DELETE FROM records WHERE id>3`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
// });
// db.query(`ALTER TABLE records AUTO_INCREMENT=1`,(err,res)=>{
//     if(err){
//         console.log(err);
//     }
// });