
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:coleccion/:id', (req,res,next) => {

    var id = req.params.id;
    var coleccion = req.params.coleccion;

    var tipoColeccion = ['medico','hospital','usuario'];
    if(tipoColeccion.indexOf(coleccion)<0){
        return res.status(400).json({
            ok: false,
            message: 'Tipo de coleccion no valido',
            error: { message: 'no se ha guardado ninguna imagen' }
        })
    }

    if(!req.files){
        return res.status(400).json({
            ok: false,
            message: 'no files were uploaded',
            error: {message: 'no ha subido ninguna imagen'}
        })
    }
    var file = req.files.imagen;
    var nombre = file.name.split('.');
    var extension = nombre[nombre.length-1];

    //Validar extensiones
    var extensiones = ['png','gif','jpg','jpeg'];
    if(extensiones.indexOf(extension) < 0){
        return res.status(400).json({
            ok: false,
            message: 'no files were uploaded',
            error: {message: 'extensión no valida'}
        })
    }

    //Nombre del archivo personalizado con formato: id-numRandom.extension
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Mover archivo del temporal a una direccion en particular
    var path = `./uploads/${coleccion}/${nombreArchivo}`;
    file.mv(path, (err) => {
        if(err){
            return res.status(400).json({
                ok: false,
                message: 'no files were moved',
                error: { message: 'el archivo no se ha guardado en la direccion especifica' }
            })
        }
        moverArchivoPorColeccion(id, tipoColeccion, nombreArchivo, res);
    })
    
})

function moverArchivoPorColeccion(id, tipoColeccion, nombreArchivo, res){
    if(tipoColeccion === 'usuario'){
        Usuario.findById(id, (err,usuario) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar el usuario',
                    errors: err
                })
            }
            if (!usuario) {
                res.status(400).json({
                    ok: false,
                    message: 'Error al cargar el usuario',
                    errors: err
                })
            }
            var path_old = './uploads/usuario/' + usuario.img;
            if(fs.existsSync(path_old)){
                fs.unlink(path_old, (err) => {
                    if(err){
                        throw err;
                    }
                });
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error al actualizar el usuario',
                        errors: err
                    })
                }
                return res.status(200).json({
                    ok: true,
                    message: 'File moved &updated successfully',
                    usuario: usuarioActualizado
                })
            })
        })
        
    }
    if(tipoColeccion === 'medico'){
        Medico.findById(id, (err,medico) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar el medico',
                    errors: err
                })
            }
            if (!medico) {
                res.status(400).json({
                    ok: false,
                    message: 'Error al cargar el medico',
                    errors: err
                })
            }
            var file_old = './uploads/medico/'+medico.img;
            if(fs.existsSync(path_old)){
                fs.unlink(file_old);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error al actualizar el medico',
                        errors: err
                    })
                }
                return res.status(200).json({
                    ok: true,
                    message: 'File moved &updated successfully',
                    medico: medicoActualizado
                })

            })
        })
    }
    if(tipoColeccion === 'hospital'){
        Hospital.findById(id, (err,hospital) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar el medico',
                    errors: err
                })
            }
            if (!hospital) {
                res.status(400).json({
                    ok: false,
                    message: 'Error al cargar el hospital',
                    errors: err
                })
            }
            var file_old = './uploads/hospital'+hospital.img;
            if(fs.existsSync(path_old)){
                fs.unlink(file_old);
            }
            hospital.img=nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error al actualizar el medico',
                        errors: err
                    })
                }
                return res.status(200).json({
                    ok: true,
                    message: 'File moved &updated successfully',
                    hospital: hospitalActualizado
                })
            })
        })
    }
}

module.exports = app;

