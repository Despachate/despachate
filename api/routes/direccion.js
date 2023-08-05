var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Direccion = require('../models/direccion');

// rutas

/* 
    Obtener todos las direcciones

*/

app.get('/', (req, res, next) => {

    Direccion.find({})
        .populate("usuario")
        .exec(
            (err, direccion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando direccion',
                        errors: err
                    });
                }

                Direccion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        direccion: direccion,
                        conteo
                    });
                });


            });


});
/* 
    Obtener todos los direccion paginado

*/

app.get('/pages/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);


    Direccion.find({})
        .skip(desde)
        .limit(hasta)
        .exec(
            (err, direccion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando direccion',
                        errors: err
                    });
                }

                Direccion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        direccion: direccion,
                        conteo,
                        hasta,
                        desde,
                    });
                });


            });


});
/* 
    Obtener un direccion por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Direccion.findById(id)
        .skip(desde)
        .limit(5)
        .exec(
            (err, direccion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando la direccion',
                        errors: err
                    });
                }

                Direccion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        direccion: direccion,
                    });
                });


            });


});

app.get('/dirXUsuario/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Direccion.find({ usuario: id })
        .exec(
            (err, direccion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando la direccion',
                        errors: err
                    });
                }

                Direccion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        direccion: direccion,
                    });
                });


            });


});

/* 
    Actualizar direccion
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Direccion.findById(id, (err, direccion) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar direccion',
                errors: err
            });
        }

        if (!direccion) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar direccion, direccion con id ' + id + ' no existe',
                errors: { message: 'No exite un direccion con ese ID' }
            });
        }

        direccion.nombre = body.nombre;
        direccion.apellidos = body.apellidos;
        direccion.calle = body.calle;
        direccion.numeroInterior = body.numeroInterior;
        direccion.referencia = body.referencia;
        direccion.codigoPostal = body.codigoPostal;
        direccion.usuario = body.usuario;
        direccion.colonia = body.colonia;


        direccion.save((err, direccionGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar direccion',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                direccion: direccionGuardado
            });
        });

    });

});



/* 
    Crear un nuevo direccion suscripción
*/

app.post('/', (req, res) => {

    var body = req.body;

    var direccion = new Direccion({
        nombre: body.nombre,
        apellidos: body.apellidos,
        calle: body.calle,
        numeroInterior: body.numeroInterior,
        referencia: body.referencia,
        codigoPostal: body.codigoPostal,
        usuario: body.usuario,
        colonia: body.colonia
    });


    direccion.save((err, direccionGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando direcciones',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            direccion: direccionGuardado,
            direccionToken: req.direccion
        });

    });

});


/* 
    Borrar un direccion por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Direccion.findByIdAndRemove(id, (err, direccionBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando direccion',
                errors: err
            });
        }

        if (!direccionBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando direccion, no existe un direccion suscripción con ese ID',
                errors: { message: 'No existe ningun direccion con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            direccion: direccionBorrado
        });
    });
});

module.exports = app;