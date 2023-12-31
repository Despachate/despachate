var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


var app = express();
var Usuario = require('../models/usuario');


/**
 * atenticacion normal Admin
 */
app.post('/admin', (req, res) => {


    var body = req.body;

    Usuario.findOne({ email: body.email, role: 'ADMIN_ROLE' }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }


        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // crear un token!!!
        usuarioDB.password = ':v';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            mensaje: 'Login ok',
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token
        });
    });



});

/**
 * atenticacion normal usuario
 */
app.post('/user', (req, res) => {


    var body = req.body;

    Usuario.findOne({ email: body.email, role: 'USER_ROLE' }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }


        
        if (!bcrypt.compareSync(body.password, usuarioDB.password) && body.tipo_login !== 'Google') {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // crear un token!!!
        usuarioDB.password = ':v';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            mensaje: 'Login ok',
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token
        });
    });



});


module.exports = app;