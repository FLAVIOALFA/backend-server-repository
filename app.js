'use stric';
// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Inicializar variables
var app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Basde de datos: \x1b[32m%s\x1b[0m', 'online');

});

//Rutas
app.use('/hospital', hospitalRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/medico', medicoRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/login', loginRoutes);

app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});