
var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/model');



app.post('/', (req,res,next) => {
    var body = req.body;
    Usuario.findOne({email: body.email}, (err, usuarioDB) => {
        if(err){
            res.status(500).json({
                ok: false,
                message: 'no se puede encontrar dicho usuario, error de BD',
                errors: errors
            })
        }
        if(!usuarioDB){
            res.status(400).json({
                ok: false,
                message: 'no se encuentra al usuario bad request - email incorrecto',
                errors: err
            })
        }
        if(!bcrypt.compare(body.password, usuarioDB.password)) {
                res.status(400).json({
                    ok: false,
                    message: 'no se encuentra al usuario bad request - email incorrecto',
                    errors: err
                })
                
        }
        //crear un token
        var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400});
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    });
            
});

module.exports = app;