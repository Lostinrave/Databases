const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const path = require('path');
const db = require('./db/connection');
const validator = require('validator');

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
app.use('/static', express.static('public'));
app.use('/static/css', express.static(path.join(__dirname,'node_modules/bootstrap/dist/css')));
app.use('/static/js', express.static(path.join(__dirname,'node_modules/bootstrap/dist/js')));

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/add-company',(req,res)=>{
    res.render('add-company');
});

app.post('/add-company',(req,res)=>{
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


app.get('/edit-company/:id',(req,res)=>{
    let id = req.params.id;
    db.query(`SELECT * FROM companies WHERE id='${id}'`,(err,resp)=>{
        if(!err){
            res.render('edit-company',{
                edit:resp
            });
        }
    });
    
});

app.post('/edit-company',(req,res)=>{
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
        console.log(resp);
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

app.get('/delete-company/:id',(req,res)=>{
    let id = req.params.id;
    db.query(`DELETE FROM companies WHERE id='${id}'`,(err,resp)=>{
        if(!err){
            res.redirect('/list-companies?message=Company removed&s=danger');
        }
    });
    
});

app.get('/list-companies',(req,res)=>{

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

app.get('/list-customers',(req,res)=>{
    let messages = req.query.message;
    let status =req.query.s

    db.query(`SELECT * FROM customers`,(err,resp)=>{
        if(!err){
            res.render('list-customers',{
                customers: resp,
                messages,
                status
            });
        }
    });
    
});

app.get('/add-customer',(req,res)=>{
    res.render('add-customer');
});

app.post('/add-customer',(req,res)=>{
    let customerName = req.body.name;
    let customerSurname = req.body.surname;
    let customerPhone = req.body.phone;
    let customerEmail = req.body.email;
    let customerPhoto = req.body.photo;
    let customerComment = req.body.comment;
    if(!validator.isAlphanumeric(customerName,'en-US',{ignore:' ąĄčČęĘėĖįĮšŠųŲūŪ'})
    || 
    !validator.isLength(customerName,{min:3,max:50})){
        res.redirect('/list-customers/?message=Type in customer name&s=danger');
        return;
    }
    if(!validator.isAlphanumeric(customerSurname,'en-US',{ignore:' ąĄčČęĘėĖįĮšŠųŲūŪ'}) 
    || 
    !validator.isLength(customerSurname,{min:3,max:100})){
        res.redirect('/list-customers/?message=Type in customer surname&s=danger');
        return;
    }
    if(!validator.isMobilePhone(customerPhone) 
    || 
    !validator.isLength(customerPhone,{min:3,max:24})){
        res.redirect('/list-customers/?message=Type in phone number&s=danger');
        return;
    }
    if(!validator.isEmail(customerEmail) 
    || 
    !validator.isLength(customerEmail,{min:3,max:64})){
        res.redirect('/list-customers/?message=Type in email address&s=danger');
        return;
    }
    db.query(`INSERT INTO customers (name, surname, phone, email, photo, comment) VALUES (
        '${customerName}','${customerSurname}','${customerPhone}','${customerEmail}','${customerPhoto}','${customerComment}')`,err=>{
            if(err){
                res.redirect('/list-customers/?message=An error has occured&s=danger');
                return;
            }
            res.redirect('/list-customers/?message=Successfully added record&s=success');
        }); 
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