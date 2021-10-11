const Pagination = require('../modules/pagination.js');
const express = require('express');
const db = require('../db/connection');
const router = express.Router();
const validator = require('validator');
const fs = require('fs');

const multer  = require('multer');
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, callback){
        const uniqueSuffix = Date.now( + '-' + Math.round(Math.random()*1E9))
        callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    fileFilter: function(req, file, callback){
        if(file.mimetype != 'image/jpeg' && file.mimetype != 'image/png'){
            return callback(new Error('Wrong image format'));
        }
        callback(null,true);
    },
    storage: storage
});


router.get('/list-customers',(req,res)=>{
    let messages = req.query.message;
    let status =req.query.s
    let company_id = req.query.company_id;
    let customer_col = req.query.customer_col;
    let position = req.query.position;
    let where = (company_id) ? 'WHERE c.company_id = ' + company_id : '';
    let order_by = (customer_col) ? 'ORDER BY c.' + customer_col : '';
    let pos = (position) ? position : '';
    
    
    db.query(`SELECT * FROM companies`,(err,companies)=>{
        if(!err) {
            if(company_id){
                companies.forEach(function(val,index){
                    if(company_id == val['id']){
                        companies[index]['selected'] = true;
                    }
                });
            }
            db.query(`SELECT c.id, c.name, 
            c.surname, c.phone, c.email, 
            c.photo, c.company_id, 
            co.name AS company_name FROM customers AS c
            LEFT JOIN companies AS co
            ON c.company_id = co.id ${where} ${order_by} ${pos}`,(err,resp)=>{
                if(!err){
                    res.render('list-customers',{
                        customers: resp,
                        companies,
                        messages,
                        status
                    });
                } else {
                    res.redirect('/list-customers/?message=An error has ocured&s=danger')
                }
            });
        }else {
            res.redirect('/list-customers/?message=An error has ocured&s=danger')
        }
    });
});

router.get('/add-customer',(req,res)=>{
    db.query(`SELECT id, name FROM companies`,(err,resp)=>{
        if(err){
            res.render('add-customer',{
                message: 'Unable to get companies.',
                status: 'danger'
            });
        }else{
            res.render('add-customer',{
                companies:resp
            });
        }
    });
});

router.post('/add-customer', upload.single('photo'),(req,res)=>{
    let customerName = req.body.name;
    let customerSurname = req.body.surname;
    let customerPhone = req.body.phone;
    let customerEmail = req.body.email;
    // 'if' shorthand (req.file) - if condition ? - {req.file.filename} '' : - else '';
    let customerPhoto = (req.file) ? req.file.filename : ''; 
    let customerComment = req.body.comment;
    let customerCompany = req.body.company_id;

    //image/jpeg
    //image/png

    if(!validator.isAlpha(customerName,'en-US',{ignore:' ąĄčČęĘėĖįĮšŠųŲūŪ'})
    || 
    !validator.isLength(customerName,{min:2,max:50})){
        res.redirect('/list-customers/?message=Type in customer name&s=danger');
        return;
    }
    if(!validator.isAlpha(customerSurname,'en-US',{ignore:' ąĄčČęĘėĖįĮšŠųŲūŪ'}) 
    || 
    !validator.isLength(customerSurname,{min:3,max:100})){
        res.redirect('/list-customers/?message=Type in customer surname&s=danger');
        return;
    }
    if(!validator.isMobilePhone(customerPhone)){
        res.redirect('/list-customers/?message=Type in phone number&s=danger');
        return;
    }
    if(!validator.isEmail(customerEmail)){
        res.redirect('/list-customers/?message=Type in email address&s=danger');
        return;
    }
    if(!validator.isInt(customerCompany)){
        res.redirect('/list-customers/?message=Type in company id&s=danger');
        return;
    }
    // if(customerComment){
    //     comment = escape(comment);
    // }
    db.query(`INSERT INTO customers (name, surname, phone, email, photo, comment, company_id) VALUES (
        '${customerName}','${customerSurname}','${customerPhone}','${customerEmail}','${customerPhoto}','${customerComment}','${customerCompany}')`,err=>{
            if(err){
                res.redirect('/list-customers/?message=An error has occured&s=danger');
                return;
            }
            res.redirect('/list-customers/?message=Successfully added record&s=success');
        }); 
});

router.get('/edit-customer/:id',(req,res)=>{
    let id = req.params.id;
    db.query(`SELECT * FROM customers WHERE id='${id}'`,(err,resp)=>{
        if(!err){
            db.query(`SELECT id, name FROM companies`,(error,companies)=>{
                resp[0]['companies'] = companies;
                res.render('edit-customer',{
                    editCustomers:resp
                });
            });
        }
    });
});

router.post('/edit-customer', upload.single('photo'),(req,res)=>{
    let customerName = req.body.name;
    let customerSurname = req.body.surname;
    let customerPhone = req.body.phone;
    let customerEmail = req.body.email;
    // 'if' shorthand (req.file) - if condition ? - {req.file.filename} '' : - else '';
    let customerPhoto = (req.file) ? req.file.filename : ''; 
    let customerComment = req.body.comment;
    let customerCompany = req.body.company_id;
    let id = req.body.id;

    //image/jpeg
    //image/png

    if(!validator.isAlpha(customerName,'en-US',{ignore:' ąĄčČęĘėĖįĮšŠųŲūŪ'})
    || 
    !validator.isLength(customerName,{min:2,max:50})){
        res.redirect('/list-customers/?message=Type in customer name&s=danger');
        return;
    }
    if(!validator.isAlpha(customerSurname,'en-US',{ignore:' ąĄčČęĘėĖįĮšŠųŲūŪ'}) 
    || 
    !validator.isLength(customerSurname,{min:3,max:100})){
        res.redirect('/list-customers/?message=Type in customer surname&s=danger');
        return;
    }
    if(!validator.isMobilePhone(customerPhone)){
        res.redirect('/list-customers/?message=Type in phone number&s=danger');
        return;
    }
    if(!validator.isEmail(customerEmail)){
        res.redirect('/list-customers/?message=Type in email address&s=danger');
        return;
    }
    if(!validator.isInt(customerCompany)){
        res.redirect('/list-customers/?message=Type in company id&s=danger');
        return;
    }
    // if(customerComment){
    //     comment = escape(comment);
    // }
    db.query(`UPDATE customers SET name = '${customerName}', surname = '${customerSurname}', phone = '${customerPhone}', email = '${customerEmail}', photo = '${customerPhoto}', comment = '${customerComment}', company_id = '${customerCompany}'WHERE id ='${id}'`,err=>{
        if(err){
            res.redirect('/list-customers/?message=An error has occured&s=danger');
            return;
        }
        res.redirect('/list-customers/?message=Successfully edited record&s=success');
    }); 
});

router.get('/delete-customer/:id',(req,res)=>{
    let id = req.params.id;
    db.query(`SELECT photo FROM customers WHERE id='${id}'`, (err, customer)=>{
        if(!err){
            if(customer[0]['photo']){
                fs.unlink(__dirname + '../../uploads/' + customer[0]['photo'], err =>{
                    if(err){
                        res.redirect('/list-customers/?message=Unable to delete photo&s=danger');
                    }
                });
            }
            db.query(`DELETE FROM customers WHERE id='${id}'`,(err,resp)=>{
                if(!err){
                    res.redirect('/list-customers/?message=Customer removed&s=danger');
                }
            });
        }
    });
});

router.get('/list-customers/:page',(req,res) => {
    page_id = parseInt(req.params.page),
    currentPage = page_id > 0 ? page_id : 1,

//Change pageUri to your page url without the 'page' query string 
        pageUri = '/list-customers/';

        /*Get total items*/
        db.query('SELECT COUNT(*) as totalCount FROM customers',(err,result)=>{

            // Display 10 items per page
            const perPage = 5,
                totalCount = result[0].totalCount;

            // Instantiate Pagination class
            const Paginate = new Pagination(totalCount,currentPage,pageUri,perPage);


            /*Query items*/
            db.query('SELECT * FROM customers LIMIT '+Paginate.perPage+' OFFSET '+Paginate.start,(err,result)=>{

                data = {
                    customers : result,
                    pages : Paginate.links()
                }
                console.log(Paginate.links());
                // Send data to view
                res.render('list-customers',data);
            });
        });
});

module.exports = router;