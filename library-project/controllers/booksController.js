const express = require('express');
const db = require('../db/connection');
const router = express.Router();
const validator = require('validator');
const fs = require('fs');

router.get('/add-books',(req,res)=>{
    // if(!req.session.auth){
    //     res.redirect('/');
    //     return;
    // }
    db.query(`SELECT id, name, surname FROM authors`,(err,resp)=>{
        if(err){
            res.render('add-books',{
                message: 'Unable to get author.'
            });
        }else{
            res.render('add-books',{
                authors: resp
            });
        }
    });
});

router.post('/add-book',(req,res)=>{
    // if(!req.session.auth){
    //     res.redirect('/');
    //     return;
    // }
    let bookTitle = req.body.title,
        bookPages = req.body.pages,
        bookIsbn = req.body.isbn,
        bookDesc = req.body.short_description,
        bookAuthor = req.body.author_id;
    if(!validator.isAlphanumeric(bookTitle,'en-US',{ignore:' .ąĄčČęĘėĖįĮšŠųŲūŪ'})){
        res.redirect('/books-list/?message=Wrong title!');
        return;
    }
    if(!validator.isInt(bookPages)){
        res.redirect('/books-list/?m=Insert numbers');
        return;
    }
    db.query(`INSERT INTO books (title, pages, isbn, short_description, author_id) VALUES (
        '${bookTitle}','${bookPages}','${bookIsbn}','${bookDesc}','${bookAuthor}')`,err=>{
            if(err){
                res.redirect('/books-list/?m=An error has occured');
                return;
            }
            res.redirect('/books-list/?m=Successfully added book');
        }); 
});

router.get('/books-list',(req,res)=>{
    let messages = req.query.m,
        status = req.query.s;
    db.query(`SELECT * FROM books`,(err,resp)=>{
        if(!err){
            res.render('books-list',{
                books: resp,
                title: 'Books',
                status,
                messages,
            });
        }
    });
   
});

module.exports = router;