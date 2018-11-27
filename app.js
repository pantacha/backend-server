
//Requires
var express = require('express');
var mongoose = require('mongoose');
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagesRoutes = require('./routes/imagenes');
var bodyParser = require('body-parser');

//Inicializar variables
var app = express();
// parse application/x-www-form-urlencoded // parse application/json
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//COnexion a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err,resp) => {
    if(err){
        throw err;
    }else{
        console.log('BD \x1b[32m%s\x1b[0m', 'online');
        
    }
})

//Rutas
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagesRoutes);
app.use('/', appRoutes);


//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000 \x1b[32m%s\x1b[0m', 'online');
    
})
