const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const RecordsModel = mongoose.model('records');


router.get('/',(req,res)=>{

    // get records
    RecordsModel.find((error,info)=>{
        if(!error){
            info.forEach(function(item){
                var date = new Date(item.date);
                item.date = date.toLocaleDateString('lt-LT');
                item._id = item._id.toString();
            });
            res.render('list',{data:info});
        }else{
            res.send('An error has occured');
        }
    }).collation({locale: 'lt'}).sort({name: 1}).lean();
    
});

router.get('/add',(req,res)=>{
    res.render('add');
});

router.post('/edit_submit',(req,res)=>{
    RecordsModel.findOneAndUpdate({_id:req.body.id},{
        name: req.body.name,
        text: req.body.text,
        date: req.body.date
    })
    res.redirect('/records');
});

router.get('/edit/:id',(req,res)=>{
   const id = req.params.id;
   RecordsModel.findById(id).lean().then(info=>{
    var date = new Date(info.date);
    info.date = date.toLocaleDateString('lt-LT');
    res.render('edit',{
        edit: info
    });
   }).catch(error=>{
       res.json({
        response: 'Failed',
        message:error.message
       });
   });
});

router.post('/submit',(req,res)=>{

    //add records
    var record = new RecordsModel();
    record.name = req.body.name;
    record.text = req.body.text;
    record.date = req.body.date;
    record.save();
    res.redirect('/records');
});

// router.get('/search/:s',(req,res)=>{
//     const s=req.params.s;
//     RecordsModel.find({$name:{$regex:s}},(error,info)=>{
//         if(!error){
//             res.send(info);
//         }else{
//             res.send('An error has occured');
//         }
//     }).collation({locale: 'lt'}).sort({name: 1}).lean();
// });

module.exports=router;

