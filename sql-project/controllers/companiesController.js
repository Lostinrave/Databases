const Pagination = require('../modules/pagination.js');
const express = require('express');
const db = require('../db/connection');
const router = express.Router();
const validator = require('validator');

router.get('/add-company',(req,res)=>{
    res.render('add-company');
});

router.post('/add-company',(req,res)=>{
    let companyName = req.body.name;
    let companyAddress = req.body.address;
    if(!validator.isAlphanumeric(companyName,'en-US',{ignore:' .ąĄčČęĘėĖįĮšŠųŲūŪ'})
    || 
    !validator.isLength(companyName,{min:3,max:50})){
        res.redirect('/list-companies/?message=Type in company name&s=danger');
        return;
    }
    if(!validator.isAlphanumeric(companyAddress,'en-US',{ignore:' .ąĄčČęĘėĖįĮšŠųŲūŪ'}) 
    || 
    !validator.isLength(companyAddress,{min:3,max:100})){
        res.redirect('/list-companies/?message=Type in company address&s=danger');
        return;
    }
    db.query(`SELECT * FROM companies WHERE name = '${companyName}'`,(err,resp)=>{
        if(resp.length == 0){
            db.query(`INSERT INTO companies (name, address) VALUES (
                '${companyName}','${companyAddress}')`,err=>{
                    if(err){
                        res.redirect('/list-companies/?message=An error has occured&s=danger');
                        return;
                    }
                    res.redirect('/list-companies/?message=Successfully added record&s=success');
                }); 
        }else {
            res.redirect('/list-companies/?message=Record already exists&s=warning');
        }
    });

});


router.get('/edit-company/:id',(req,res)=>{
    let id = req.params.id;
    db.query(`SELECT * FROM companies WHERE id='${id}'`,(err,resp)=>{
        if(!err){
            res.render('edit-company',{
                edit:resp
            });
        }
    });
    
});

router.post('/edit-company',(req,res)=>{
    let companyName = req.body.name;
    let companyAddress = req.body.address;
    let id = req.body.id;
    if(!validator.isAlphanumeric(companyName,'en-US',{ignore:' .ąĄčČęĘėĖįĮšŠųŲūŪ'})
    ||!validator.isLength(companyName,{min:3,max:50})){
        res.redirect('/list-companies/?message=Wrong company name format&s=danger');
        return;
    }
    if(!validator.isAlphanumeric(companyAddress,'en-US',{ignore:' .ąĄčČęĘėĖįĮšŠųŲūŪ'}) 
    ||!validator.isLength(companyAddress,{min:3,max:100})){
        res.redirect('/list-companies/?message=Wrong company address format&s=danger');
        return;
    }
   
    db.query(`SELECT * FROM companies WHERE name = '${companyName}' AND id != ${id}`,(err,resp)=>{
        if(resp.length == 0){
            db.query(`UPDATE companies SET name = '${companyName}',
            address = '${companyAddress}' WHERE id ='${id}'`,err=>{
               if(err){
                   res.redirect('/list-companies/?message=An error has occured&s=danger');
                   return;
               }
               res.redirect('/list-companies/?message=Successfully edited record&s=success');
           });
        }else{
            res.redirect('/list-companies/?message=Company already exists&s=warning');
        }
    });
});

router.get('/delete-company/:id',(req,res)=>{
    let id = req.params.id;
    db.query(`DELETE FROM companies WHERE id='${id}'`,(err,resp)=>{
        if(!err){
            res.redirect('/list-companies?message=Company removed&s=danger');
        }
    });
    
});

router.get('/list-companies',(req,res)=>{

    let messages = req.query.message;
    let status =req.query.s

    db.query(`SELECT * FROM companies`,(err,resp)=>{
        if(!err){
            res.render('list-companies',{
                companies: resp,
                messages,
                status
            });
        }
    });
    
});


module.exports = router;