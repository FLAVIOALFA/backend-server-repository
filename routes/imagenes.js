const express = require('express');
const app = express();
const fs = require('fs');

// Rutas
app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
    var path = `./uploads/${tipo}/${img}`;

    fs.exists(path, (existe) => {
        if (!existe) {
            path = './assets/no-img.jpg';
        }


        res.sendfile(path);

    });
});

module.exports = app;