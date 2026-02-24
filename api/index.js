const { success, error } = require('../functions')
const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const config = require('../config')
const mysql = require('mysql')

const app = express()

// ================= MIDDLEWARE =================
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    next()
})

// ================= DATABASE =================
const db = mysql.createConnection({
    host: 'mysql-jinane.alwaysdata.net',
    database: 'jinane_atelier3_nodejs',
    user: 'jinane',
    password: 'BEN@2019'
})

db.connect(err => {
    if (err) {
        console.log(err.message)
    } else {
        console.log('---Connected--')
    }
})

let MembersRouter = express.Router()

// ===== ROUTES =====

MembersRouter.get('/', (req, res) => {
    db.query('SELECT * FROM members', (err, result) => {
        if (err) {
            res.json(error(err.message))
        } else {
            res.json(success(result))
        }
    })
})

MembersRouter.get('/:id', (req, res) => {
    db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            res.json(error(err.message))
        } else {
            if (result[0]) {
                res.json(success(result[0]))
            } else {
                res.json(error('Wrong id'))
            }
        }
    })
})

MembersRouter.post('/', (req, res) => {
    if (!req.body.name) {
        return res.json(error('no name value'))
    }

    db.query('INSERT INTO members(name) VALUES(?)', [req.body.name], (err, result) => {
        if (err) {
            res.json(error(err.message))
        } else {
            res.json(success('Member added'))
        }
    })
})

MembersRouter.put('/:id', (req, res) => {
    if (!req.body.name) {
        return res.json(error('no name value'))
    }

    db.query(
        'UPDATE members SET name = ? WHERE id = ?',
        [req.body.name, req.params.id],
        (err) => {
            if (err) {
                res.json(error(err.message))
            } else {
                res.json(success('Updated'))
            }
        }
    )
})

MembersRouter.delete('/:id', (req, res) => {
    db.query('DELETE FROM members WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            res.json(error(err.message))
        } else {
            res.json(success('Deleted'))
        }
    })
})

app.use(config.rootAPI + 'members', MembersRouter)

module.exports = app