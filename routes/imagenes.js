
var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

app.get('/:coleccion/:img', (req,res,next) => {
    
    var coleccion = req.params.coleccion;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${coleccion}/${img}`);

    if(fs.existsSync(pathImagen)){
        res.sendFile(pathImagen);
    }else{
        var noImage = path.resolve(__dirname, '../assets/no-img.jpg'); 
        res.sendFile(noImage);
    }

})

module.exports = app;