
var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

//google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


//AUTENTICACION DE GOOGLE
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google', async(req,res,next) => {
    var token = req.body.token;
    var googleUser = await verify(token)
                                    .catch(err => {
                                        res.status(403).json({
                                            ok: false,
                                            message: ' bad request - token no valido',
                                            errors: err
                                        })
                                    })

    Usuario.findOne({email: googleUser.email}, (err,usuarioDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                message: 'no se puede encontrar dicho usuario, error de BD',
                errors: errors
            })
        }
        if(usuarioDB){
            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    message: 'En su caso usa una autenticación normal',
                    errors: err
                })
            }else{
                var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400});
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token
                })
            }
        }else{
            var usuario = new Usuario();
                usuario.nombre = googleUser.nombre;
                usuario.email= googleUser.email;
                usuario.img= googleUser.img;
                usuario.google= true;
                usuario.password = 'ElperroDeSanRoqueNoTieneRaboPorqueRamonRodriguezSeLoHaCortado'
                            
            usuario.save((err, usuarioDB) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error al guardar el usuario',
                        errors: err
                    })
                }
                var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400});
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token
                })
            })
        }
    })
})


//AUTENTICACION NORMAL
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
                    message: 'no se encuentra al usuario bad request - password incorrecta',
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