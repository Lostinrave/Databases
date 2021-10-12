const express = require('express');
const db = require('../db/connection');
const router = express.Router();
const validator = require('validator');

router.get('/add-authors',(req,res)=>{
    // if(!req.session.auth){
    //     res.redirect('/');
    //     return;
    // }
    res.render('add-author');
});

router.post('/add-author',(req,res)=>{
    // if(!req.session.auth){
    //     res.redirect('/');
    //     return;
    // }
    let authorName = req.body.name;
    let authorSurname = req.body.surname;
    if(!validator.isAlphanumeric(authorName,'en-US',{ignore:' .ąĄčČęĘėĖįĮšŠųŲūŪ'})
    || 
    !validator.isLength(authorName,{min:3,max:64})){
        res.redirect('/authors-list/?message=Wrong name!');
        return;
    }
    if(!validator.isAlphanumeric(authorSurname,'en-US',{ignore:' .ąĄčČęĘėĖįĮšŠųŲūŪ'}) 
    || 
    !validator.isLength(authorSurname,{min:3,max:64})){
        res.redirect('/authors-list/?m=Wrong surname!');
        return;
    }
    db.query(`INSERT INTO authors (name, surname) VALUES (
        '${authorName}','${authorSurname}')`,err=>{
            if(err){
                res.redirect('/authors-list/?m=An error has occured');
                return;
            }
            res.redirect('/authors-list/?m=Successfully added author');
        }); 
});

router.get('/authors-list',(req,res)=>{
    let messages = req.query.m,
        status = req.query.s;
    db.query(`SELECT * FROM authors`,(err,resp)=>{
        if(!err){
            res.render('authors-list',{
                authors: resp,
                title: 'Authors',
                status,
                messages,
            });
        }
    });
   
});

router.get('/delete-author/:id',(req,res)=>{
//     if(!req.session.auth){
//     res.redirect('/');
//     return;
// }
    let id = req.params.id;
    db.query(`DELETE FROM authors WHERE id='${id}'`,err=>{
        if(!err){
            res.redirect('/authors-list?m=Author removed');
        }
        else{
            res.redirect('/authors-list?m=Unable to remove author');
        }
    });
});

module.exports = router;