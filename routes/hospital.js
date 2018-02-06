var express = require('express');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var Hospital = require('../models/hospital');

// ==================================
// OBTENER LOS HOSPITALES
// ==================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(3)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: "Error en el servidor",
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({ ok: true, hospitales: hospitales, total: conteo });
            });
        });
});

// ==================================
// ACTUALIZAR UN HOSPITAL
// ==================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al buscar el hospital",
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital con el id ' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: "Error al actualizar el médico",
                    errors: err
                });
            }

            res.status(200).json({ ok: true, hospital: hospitalActualizado });
        });

    });

});

// ==================================
// ELIMINAR UN MÉDICO
// ==================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({ ok: true, hospital: hospitalBorrado });
    });
});

// ==================================
// CREAR UN MÉDICO
// ==================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Error al crear el hospital",
                errors: err
            });
        }

        res.status(201).json({ ok: true, hospital: hospitalGuardado });
    });

});

module.exports = app;