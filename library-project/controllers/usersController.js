const express = require('express');
const db = require('../db/connection');
const router = express.Router();
const session = require('express-session');
const validator = require('validator');
const md5 = require('md5');

// router.use(session({
//     secret: 'secret',
//     resave: true,
//     saveUninitialized: true
// }));

// router.get('/',(req,res)=>{
//     if(req.session.auth){
//         res.redirect('/list-books');
//     }else{
//         res.render('login');
//     }
    
// });

// router.get('/register',(req,res)=>{
//     let messages = req.query.message,
//         status =req.query.s;
//     res.render('register',{
//         messages,
//         status
//     });
// });

// router.post('/register',(req,res)=>{
//     let userName = req.body.name,
//         userEmail  = req.body.email,
//         userPass = req.body.password;
//         if(!validator.isAlpha(userName,'en-US',{ignore:' ąĄčČęĘėĖįĮšŠųŲūŪ'})
//         || 
//         !validator.isLength(userName,{min:2,max:50})){
//             res.redirect('/register/?message=Wrong name&s=danger');
//             return;
//         }
//         if(!validator.isEmail(userEmail)){
//             res.redirect('/register/?message=Wrong email address&s=danger');
//             return;
//         }
//         if(!validator.isStrongPassword(userPass,{ minLength: 8,
//             minLowercase: 1, 
//             minUppercase: 0, 
//             minNumbers: 1, 
//             minSymbols: 0})){
//             res.redirect('/register/?message=Password is too weak&s=danger');
//             return;
//         }
//         db.query(`INSERT INTO users (name, email, password) VALUES (
//             '${userName}', '${userEmail}', '${md5(userPass)}')`,err =>{
//                 if(err){
//                     res.redirect('/register/?message=An error has occured&s=danger');
//                     return;
//                 }
//                 res.redirect('/list-customers/?message=Successfully added record&s=success');
//             }); 
// });

// router.post('/login',(req,res)=>{
//     let user = req.body.email;
//     let pass = md5(req.body.password);


//     if(user && pass){
//         db.query(`SELECT * FROM users WHERE email = '${user}' AND password = '${pass}'`, (err, user)=>{
//             if(!err && user.length > 0){
                
//                 req.session.auth = true;
//                 req.session.user = user;
//                 let hour = 3600000;

//                 req.session.cookie.expires = new Date(Date.now() + hour);

//                 req.session.cookie.maxAge = hour;
//                 req.session.save();
//             }
//         });
//     }
//     res.redirect('/list-customers');
// });

// router.get('/logout',(req,res)=>{
//     req.session.destroy();
//     // req.session.auth = false;
//     // req.session.user = false;
//     // req.session.save();
//     res.redirect('/'); 
// });

module.exports = router;