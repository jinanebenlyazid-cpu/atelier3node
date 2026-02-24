const {success, error} = require('./functions')
const bodyParser = require('body-parser') 
const express = require('express') 
const app = express() 
const morgan = require('morgan') 
const config = require('./config')
const mysql=require('mysql')

// ================= CONNECTION DATABASE =================
const db=mysql.createConnection({
    host:'mysql-jinane.alwaysdata.net',
    database:'jinane_atelier3_nodejs',
    user:'jinane',
    password:'BEN@2019'
})
let MembersRouter = express.Router()
db.connect((err)=>{
    if(err){
        console.log(err.message)
    }else{
        console.log('---Connected--')
        // ================= ROUTER =================
        
        app.use(morgan('dev'))
        app.use(bodyParser.json()); 
        app.use(bodyParser.urlencoded({ extended: true })); 

        //   autoriser les req Ajax 
                app.use(function(req, res, next) {
	                    res.header("Access-Control-Allow-Origin", "*");
 
                             next();
                       });
    }


    // Récupère un membre avec son ID
    MembersRouter.get('/:id',(req,res)=>{
        db.query('select * from members where id = ?' ,[req.params.id],(err,result)=>{
            if (err){
                    res.json(error(err.message))
                }else{
                   if(result[0]!= undefined){
                    res.json(success(result[0]))
                   }else{
                    res.json(error('wrong id !'))
                   }
                }
        })

        
    })

     // Supprime un membre avec ID
     MembersRouter.delete('/:id',(req,res)=>{
        db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
            if (err) {
                res.json(error(err.message))
            } else {
                if (result[0] != undefined) {
                    db.query('DELETE FROM members WHERE id = ?', [req.params.id], (err, result) => {
                        if (err) {
                            res.json(error(err.message))
                        } else {
                            res.json(success('Suppression avec succes!!!'))
                        }
                    })
                } else {
                    res.json(error('Wrong id'))
                }
            }
        })
     })

     // Modifie un membre avec ID
     MembersRouter.put('/:id',(req,res)=>{
        if(req.body.name){
            db.query('select * from members where id != ?',[req.params.id],(err,result)=>{
                if (err){
                    res.json(error(err.message))
                }else{
                    if (result[0] != undefined) {
                        res.json(error('same name'))
                    } else {

                        db.query('UPDATE members SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err, result) => {
                            if (err) {
                                res.json(error(err.message))
                            } else {
                                res.json(success('Modification avec succes !!!'))
                            }
                        })
                    }
                }
            })
        }else{
            res.json(error('no name value !'))
        }
     })

    MembersRouter.get('/',(req,res)=>{
        if (req.query.max != undefined && req.query.max > 0) {
            db.query('SELECT * FROM members  LIMIT 0, '+req.query.max, (err, result) => {
                if (err) {
                    res.json(error(err.message))
                } else {
                    res.json(success(result))
                }
            })
        } else if (req.query.max != undefined) {
            res.json(error('Wrong max value'))
        } else {
            db.query('SELECT * FROM members', (err, result) => {
                if (err) {
                    res.json(error(err.message))
                } else {
                    res.json(success(result))
                }
            })
        }
    })
    MembersRouter.post('/',(req,res)=>{
        if (req.body.name) {
            db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {
                if (err) {
                    res.json(error(err.message))
                } else {
                if (result[0] != undefined) {
                    res.json(error('name already taken'))
                } else {
                    db.query('INSERT INTO members(name) VALUES(?)', [req.body.name], (err, result) => {
                        if (err) {
                            res.json(error(err.message))
                        } else {
                        db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {
                            if (err) {
                                res.json(error(err.message))
                            } else {
                                res.json(success({
                                    id: result[0].id,
                                    name: result[0].name
                                }))
                            }
                        })
                        }
                    })
                }
            }
            })
        
        } else {
            res.json(error('no name value'))
        }
    })






app.use(config.rootAPI+'members', MembersRouter)
app.listen(config.port, () => console.log('Started on port '+config.port)) 


   

})