
var express = require('express');

middlewareAUTh = require('../middlewares/autenticacion');

var app = express();
var Medico = require('../models/medico');

//Obtener todos los medicos
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email img')
    .populate('hospital')
    .exec((err, medicos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'error al cargar el medicoc',
                errors: err
            })
        }
        Medico.count({}, (err,cont) => {
            res.status(200).json({
                ok: true,
                medicos: medicos,
                total: cont
            });
        })
    });
});

//Crear un nuevo medico
app.post('/', middlewareAUTh.verificaToken, (req, res, next) => {
    var body = req.body;
    medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'error al crear el medico',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,

        });
    });
});

//Actualizar medico
app.put('/:id', middlewareAUTh.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'error al cargar el medico',
                errors: err
            })
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: 'error al cargar el medico',
                errors: err
            })
        }
        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'error al actualizar el medico',
                    errors: err
                })
            }
            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            })
        });
    });
});

//Borrar un medico por su id
app.delete('/:id', middlewareAUTh.verificaToken, (req, res, next) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'error al cargar el medico',
                errors: err
            })
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: 'no existe el medico especificado',
                errors: {
                    message: 'no se encuentra el medico'
                }
            })
        }
        res.status(201).json({
            ok: true,
            medico
        })
    })
})







module.exports = app;
