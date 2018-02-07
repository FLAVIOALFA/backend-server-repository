var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

//===========================================
// AUTENTICACION POR GOOGLE
//===========================================

app.post('/google', (req, res) => {

    var token = req.body.token || 'XXX';

    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken(token, GOOGLE_CLIENT_ID, (err, login) => {

        if (err) {
            return res
                .status(400)
                .json({
                    ok: true,
                    mensaje: 'Token no válido',
                    errors: err
                });
        }

        var payload = login.getPayload();
        var userid = payload['sub'];
        // If request specified a G Suite domain:
        //var domain = payload['hd'];

        Usuario.findOne({ email: payload.email }, (err, usuario) => {
            if (err) {
                return res
                    .status(500)
                    .json({
                        ok: true,
                        mensaje: 'Error al buscar usuario - login',
                        errors: err
                    });
            }

            if (usuario) {
                if (usuario.google === false) {
                    return res
                        .status(400)
                        .json({
                            ok: true,
                            mensaje: 'Debes autenticarte normalmente',
                            errors: err
                        });
                } else {
                    // Crear un token!!
                    usuario.password = ":)";
                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });
                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id
                    });
                }
                //Si el usuario no existe..
            } else {
                var newUsuario = new Usuario();
                newUsuario.nombre = payload.name;
                newUsuario.email = payload.email;
                newUsuario.password = ':)';
                newUsuario.google = true;
                newUsuario.img = payload.picture;

                newUsuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear usuario - google',
                            errors: err
                        })
                    }

                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });

                });
            }
        });

    });
});


//===========================================
// AUTENTICACION NORMAL
//===========================================
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