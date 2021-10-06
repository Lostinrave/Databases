const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const path = require('path');
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
const db = require('./db/connection');
const validator = require('validator');
const session = require('express-session');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

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
app.use('/uploads', express.static('uploads'));
app.use('/static', express.static('public'));
app.use('/static/css', express.static(path.join(__dirname,'node_modules/bootstrap/dist/css')));
app.use('/static/js', express.static(path.join(__dirname,'node_modules/bootstrap/dist/js')));

app.get('/',(req,res)=>{
    res.render('login');
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

app.post('/add-customer', upload.single('photo'),(req,res)=>{
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

app.get('/edit-customer/:id',(req,res)=>{
    let id = req.params.id;
    db.query(`SELECT * FROM customers WHERE id='${id}'`,(err,resp)=>{
        if(!err){
            db.query(`SELECT id, name FROM companies`,(error,companies)=>{
                resp[0]['companies'] = companies;
                console.log(companies);
                console.log(resp);
                res.render('edit-customer',{
                    editCustomers:resp
                });
            });
        }
    });
});

app.post('/edit-customer', upload.single('photo'),(req,res)=>{
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

app.get('/delete-customer/:id',(req,res)=>{
    let id = req.params.id;
    db.query(`DELETE FROM customers WHERE id='${id}'`,(err,resp)=>{
        if(!err){
            res.redirect('/list-customers?message=Customer removed&s=danger');
        }
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