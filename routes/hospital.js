
var express = require('express');

middlewareAUTh = require('../middlewares/autenticacion');

var app = express();
var Hospital = require('../models/hospital');

//Obtener todos los hospitales
app.get('/', (req,res,next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email img')
    .exec((err, hospitales) => {
        if(err){
            return res.status(500).json({
                ok: false,
                message: 'error al cargar el hospital',
                errors: err
            })
        }
        Hospital.count({}, (err,cont) => {
            res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: cont
            });
        })
    });
});

//Crear un nuevo hospital
app.post('/', middlewareAUTh.verificaToken, (req, res, next) => {
    var body = req.body;
    hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });
    hospital.save((err,hospitalGuardado) => {
        if(err){
            return res.status(400).json({
                ok: false,
                message: 'error al crear el hospital',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            //id_usuario: req.usuario._id
        });
    });
});

//Actualizar hospital
app.put('/:id', middlewareAUTh.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if(err){
            return res.status(500).json({
                ok: false,
                message: 'error al cargar el hospital',
                errors: err
            })
        }if(!hospital){
            return res.status(400).json({
                ok: false,
                message: 'error al cargar el hospital',
                errors: err
            })
        }
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;
        
        hospital.save((err,hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'error al actualizar el hospital',
                    errors: err
                })
            }
            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            })
        });
    });
});

//Borrar un hospital por su id
app.delete('/:id', middlewareAUTh.verificaToken, (req, res, next) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospital) => {
        if(err){
            return res.status(500).json({
                ok: false,
                message: 'error al cargar el hospital',
                errors: err
            })
        }if(!hospital){
            return res.status(400).json({
                ok: false,
                message: 'no existe el usuario especificado',
                errors: {message: 'no se encuentra el hospizal'}
            })
        }
        res.status(201).json({
            ok: true,
            hospital
        })
    })
})







module.exports = app;