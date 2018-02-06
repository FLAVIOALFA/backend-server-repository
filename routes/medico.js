var express = require('express');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var Medico = require('../models/medico');

// ==================================
// OBTENER LOS MÉDICOS
// ==================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    console.log(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: "Error en el servidor",
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            message: "Error en el servidor",
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });
            });
});

// ==================================
// ACTUALIZAR UN MÉDICO
// ==================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al buscar el médico",
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: 'El médico con el id ' + id + 'no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: "Error al actualizar el médico",
                    errors: err
                });
            }

            res.status(200).json({ ok: true, medico: medicoActualizado });
        });

    });

});

// ==================================
// ELIMINAR UN MÉDICO
// ==================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        res.status(200).json({ ok: true, medico: medicoBorrado });
    });
});

// ==================================
// CREAR UN MÉDICO
// ==================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Error al crear el medico",
                errors: err
            });
        }

        res.status(201).json({ ok: true, medico: medicoGuardado });
    });

});

module.exports = app;