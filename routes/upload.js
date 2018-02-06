const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposColeccion = ['hospitales', 'medicos', 'usuarios']

    if (tiposColeccion.indexOf(tipo) < 0) {
        return res
            .status(400)
            .json({
                ok: false,
                mensaje: 'Tipo de colección no válido',
                errors: { message: 'Solo se aceptan las colecciones ' + tiposColeccion.join(', ') }
            });
    }

    if (!req.files) {
        return res
            .status(400)
            .json({
                ok: false,
                mensaje: 'No se han enviado archivos',
                errors: { message: 'Debe seleccionar una imagen' }
            });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo éstas extensiones estan permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res
            .status(400)
            .json({
                ok: false,
                mensaje: 'Extension no válida',
                errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
            });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: 'Error al mover archivo',
                    errors: err
                });
        }
    });

    subirPorTipo(tipo, id, nombreArchivo, res);

    // res.status(200).json({ ok: true, mensaje: "Archivo subido" });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    var object;
    var tipoObjeto;

    if (tipo === 'usuarios') {
        object = Usuario;
        tipoObjeto = 'usuario';
    }
    if (tipo === 'medicos') {
        object = Medico;
        tipoObjeto = 'medico';
    }
    if (tipo === 'hospitales') {
        object = Hospital;
        tipoObjeto = 'hospital';
    }

    // object.findById(id, (err, coleccion) => {
    //     return res.send({ coleccion });
    // });

    object.findById(id, (err, coleccion) => {

        if (!coleccion) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: `El ${tipoObjeto} no existe`
                });
        }

        var pathViejo = `./uploads/${tipo}/${coleccion.img}`;
        //Si existe, eliminamos la imagen anterior
        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo);
        }

        coleccion.img = nombreArchivo;

        coleccion.save((err, coleccionActualizada) => {
            return res
                .status(200)
                .json({
                    ok: true,
                    mensaje: 'Imagen actualizada',
                    [tipoObjeto]: coleccionActualizada
                });
        });
    });

}

module.exports = app;