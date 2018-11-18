
var express = require('express');

var bcrypt = require('bcrypt');
var saltRounds = 10;

var middlewareAUTh = require('../middlewares/autenticacion');

var app = express();
var Usuario = require('../models/model');

//Obtener todos los usuario
app.get('/', (req,res,next) => {
    Usuario.find({}, 'nombre email img role').exec( (err,usuarios) => {
        if(err){
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar el usuario',
                err: err
            })
        }
        res.status(200).json({
            ok: true,
            usuarios: usuarios
        });
    });
});

//Crear un nuevo usuario
app.post('/', middlewareAUTh.verificaToken, (req, res, next) => {
    var body = req.body; 
        usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, saltRounds,(err, hash) => {
                password = hash;
            }),
            img: body.img,
            role: body.role
        });
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al crear el usuario',
                    errors: err
                })
            }
            res.status(201).json({
                ok: true,
                usuarioGuardado,
                usuarioToken: req.usuario
            });
        })
})

//Actualizar usuario
app.put('/:id', (req,res,next) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, 'nombre email img role').exec( (err, usuario) => {
        if(err){
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar el usuario',
                errors: err
            })
        }
        if(!usuario){
            res.status(400).json({
                ok: false,
                message: 'Error al cargar el usuario',
                errors: err
            })
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err,usuarioGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el usuario',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

//Borrar un usuario por su id
app.delete('/:id', (req,res,next) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuario) => {
        if(err){
            return res.status(500).json({
                ok: false,
                message: 'Error al cargar el usuario',
                errors: err
            })
        }
        if(!usuario){
            return res.status(400).json({
                ok: false,
                message: 'No existe el usuario especificado',
                errors: {message: 'No se encuentra el usuario'}
            })
        }
        res.status(200).json({
            ok: true,
            usuario: usuario
        });
    })
})

module.exports = app;