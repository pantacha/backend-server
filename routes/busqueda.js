
var express = require('express');

var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//Busquedas específicas de colecciones en la BD
app.get('/coleccion/:item/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var item = req.params.item;
    var regex = new RegExp(busqueda, 'i');
    var promise;

    switch (item) {
        case 'usuario':
            promise = buscarHospitales(busqueda, regex);
            break;
        case 'hospital':
            promise = buscarHospitales(busqueda, regex);
            break;
        case 'medico':
            promise = buscarMedicos(busqueda, regex);
            break;
        default:
            res.status(400).json({
                ok: true,
                message: 'Los items se ecnuadran en usuario, hospital y medico',
                error: {
                    message: 'no se encuentra la solicitud'
                }
            })
    }
    promise.then((data) => {
        res.status(200).json({
            ok: true,
            [item]: data
        })
    })
})

//Busquedas generales en la BD
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
                    buscarHospitales(busqueda,regex),
                    buscarMedicos(busqueda,regex),
                    buscaraUsuarios(busqueda,regex)
                ])
                .then(responses => {
                    res.status(200).json({
                        ok: true,
                        hospitales: responses[0],
                        medicos: responses[1],
                        usuarios: responses[2]
                    })
                })
    
});
function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({
            nombre: regex
        })
        .populate('usuario', 'nombre email role')
        .exec((err, hospitales) => {
            if (err) {
                reject('error al cargar', err);
            }
            resolve(hospitales);
        })
    })
}

function buscarMedicos(busqueda, regex){
    return new Promise((resolve,reject) => {
        Medico.find({nombre: regex})
              .populate('usuario', 'nombre email role')
              .populate('hospital')
              .exec((err,medicos) => {
                        if(err){
                            reject('error al cargar', err);
                        }
                        resolve(medicos);
                    })
    }) 
}

//buscar varias columnas por colección
function buscaraUsuarios(busqueda,regex){

    return new Promise((resolve,reject) => {
        Usuario.find()
                .or([{'nombre': regex},{'email': regex}])
                .exec((err,usuarios) => {
                    if(err){
                        reject('error al cargar', err);
                    }
                    resolve(usuarios);
                })
    })
}


module.exports = app;