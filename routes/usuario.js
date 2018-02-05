var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');
var Usuario = require('../models/usuario');

// Rutas

//==================================================
// OBTENER USUARIOS
//==================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email imagen role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: "Error en el servidor",
                        errors: err
                    });
                }

                res.status(200).json({ ok: true, usuarios: usuarios });

            });
});

//==================================================
// ACTUALIZAR UN USUARIO
//==================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al buscar usuario",
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario con el id ' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: "Error al actualizar usuario",
                    errors: err
                });
            }

            res.status(200).json({ ok: true, usuario: usuarioActualizado });
        });

    });

});

//==================================================
// ELIMINAR UN USUARIO
//==================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({ ok: true, usuario: usuarioBorrado });
    });
});

//==================================================
// CREAR UN USUARIO
//==================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Error en el servidor",
                errors: err
            });
        }

        res.status(201).json({ ok: true, usuario: usuarioGuardado, usuarioToken: req.usuario });
    });

});

module.exports = app;