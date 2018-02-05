var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al buscar usuario",
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                message: "Credenciales incorrectas - email",
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                message: "Credenciales incorrectas - password",
                errors: err
            });
        }

        // Crear un token!!
        usuarioDB.password = ":)";
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
        return res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });


});

//RIO URUGUAY S.R.L CUIT: 30-68784108-1,Admin: Cmte. Andresito 34, Tel\/Fax (03758) 422354\/424283 – N3350BGB APOSTOLES Misiones.,I.V.A Resp. Inscripto, Usted viaja asegurado por: “PROTECCIÓN” Mutual de seguros del transporte público de pasajeros

module.exports = app;