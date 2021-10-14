const express = require('express');
const db = require('../db/connection');
const router = express.Router();
const validator = require('validator');
const fs = require('fs');

router.get('/add-books',(req,res)=>{
    if(!req.session.auth){
        res.redirect('/');
        return;
    }
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
    if(!req.session.auth){
        res.redirect('/');
        return;
    }
    let bookTitle = req.body.title,
        bookPages = req.body.pages,
        bookIsbn = req.body.isbn,
        bookDesc = req.body.short_description,
        bookAuthor = req.body.author_id;
    if(!validator.isAlphanumeric(bookTitle,'en-US',{ignore:' ąĄčČęĘėĖįĮšŠųŲūŪžŽ'})){
        res.redirect('/books-list/?message=Wrong title!&s=warning');
        return;
    }
    if(!validator.isInt(bookPages)){
        res.redirect('/books-list/?m=Insert numbers!&s=warning');
        return;
    }
    db.query(`INSERT INTO books (title, pages, isbn, short_description, author_id) VALUES (
        '${bookTitle}','${bookPages}','${bookIsbn}','${bookDesc}','${bookAuthor}')`,err=>{
            if(err){
                res.redirect('/books-list/?m=An error has occured!&s=danger');
                return;
            }
            res.redirect('/books-list/?m=Successfully added book&s=success');
        }); 
});

router.get('/books-list',(req,res)=>{
    if(!req.session.auth){
        res.redirect('/');
        return;
    }
    let messages = req.query.m,
        message = {},
        s = req.query.s,
        author_id = req.query.author_id,
        where = (author_id) ? 'WHERE b.author_id = ' + author_id : '';
        if(s=='success'){
            message = {
                mainBg:'bg-green-200',
                icon:'bg-green-600',
                alert:'text-green-400',
                svg:'success.svg'
            }
        }
        if(s=='warning'){
            message = {
                mainBg:'bg-yellow-500',
                icon:'bg-yellow-700',
                alert:'text-yellow-600',
                svg:'warning.svg'
            }
        }
        if(s=='danger'){
            message = {
                mainBg:'bg-red-200',
                icon:'bg-red-600',
                alert:'text-red-400',
                svg:'danger.svg'
            }
        }

    db.query(`SELECT * FROM authors`,(err,authors)=>{
        if(!err) {
            if(author_id){
                authors.forEach(function(val,index){
                    if(author_id == val['id']){
                        authors[index]['selected'] = true;
                    }
                });
            }
            db.query(`SELECT b.id, b.title, 
                b.pages, b.isbn, b.short_description, b.author_id,
                au.name AS author_name, au.surname AS author_surname FROM books AS b
                LEFT JOIN authors AS au
                ON b.author_id = au.id ${where} ORDER BY b.title`,(err,resp)=>{
                if(!err){
                    res.render('books-list',{
                        books: resp,
                        authors,
                        title: 'Books',
                        s,
                        messages,
                        message
                    });
                }
            });
        };
    });
});

router.get('/delete-book/:id',(req,res)=>{
        if(!req.session.auth){
        res.redirect('/');
        return;
    }
    let id = req.params.id;
    db.query(`DELETE FROM books WHERE id='${id}'`,err=>{
        if(!err){
            res.redirect('/books-list?m=book removed&s=danger');
        }
        else{
            res.redirect('/authors-list?m=Unable to remove book&s=danger');
        }
    });
});

router.get('/edit-book/:id', (req, res) => {

    if(!req.session.auth) {
        res.redirect('/');
        return;
    }

    let id          = req.params.id;
    let messages    = req.query.m;
    let s           = req.query.s;

    db.query(`SELECT * FROM books WHERE id = ${id}`, (err, book) => {
        
        if(!err) {
            book = book[0];
            //Išsitraukiame autoriu sąrašą.
            db.query(`SELECT id, name, surname FROM authors`, (err, authors) => {
                //Sutikriname autorius ar kuris nors iš jų buvo priskirta knygai,
                authors.forEach(function(val, index) {

                    //Jeigu einamas autoriaus id atitinka id iš knygu informacijos, prisikiriame naują indeksą ir reikšmę
                    if(book['author_id'] == val['id'])
                        authors[index]['selected'] = true;
                });

                if(err) {
                    res.render('add-books', {books: book, messages: 'Unable to get authors from database.'});
                } else {
                    res.render('edit-books', {books: book, authors, messages});
                }
                
            });

        } else {

            res.redirect('/list-books/?m=Unable to find this book&s=danger');

        }

    });

});

router.post('/edit-book/:id',(req,res)=>{
    if(!req.session.auth){
        res.redirect('/');
        return;
    }
    let bookTitle = req.body.title,
        bookPages = req.body.pages,
        bookIsbn = req.body.isbn,
        bookDesc = req.body.short_description,
        bookAuthor = req.body.author_id,
        id = req.params.id;
    if(!validator.isAlphanumeric(bookTitle,'en-US',{ignore:' ąĄčČęĘėĖįĮšŠųŲūŪžŽ'})){
        res.redirect('/books-list/?message=Wrong title!&s=warning');
        return;
    }
    if(!validator.isInt(bookPages)){
        res.redirect('/books-list/?m=Insert numbers!&s=warning');
        return;
    }
    sql = `UPDATE books SET title = ?, pages = ?, isbn = ?, short_description = ?, author_id = ? WHERE id = ?`;
    values = [bookTitle, bookPages, bookIsbn, bookDesc, bookAuthor, id];
    db.query(sql, values,err=>{
            if(err){
                res.redirect('/books-list/?m=An error has occured&s=danger');
                return;
            }
            res.redirect('/books-list/?m=Successfully edited book&s=success');
        }); 
});

module.exports = router;