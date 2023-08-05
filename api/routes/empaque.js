var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Empaque = require('../models/empaque');

// rutas

/* 
    Obtener todos los empaques

*/

app.get('/', (req, res, next) => {

    Empaque.find({})
        .exec(
            (err, empaques) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando empaque',
                        errors: err
                    });
                }

                Empaque.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        empaques: empaques,
                        total: conteo
                    });
                });


            });


});
/* 
    Obtener todos los empaque paginado

*/

app.get('/pages/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);


    Empaque.find({})
        .skip(desde)
        .limit(hasta)
        .exec(
            (err, empaques) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando empaque Suscripcion',
                        errors: err
                    });
                }

                Empaque.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        empaques: empaques,
                        total: conteo,
                        hasta,
                        desde,
                    });
                });


            });


});
/* 
    Obtener un empaque por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Empaque.findById(id)
        .skip(desde)
        .limit(5)
        .exec(
            (err, empaque) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el empaque',
                        errors: err
                    });
                }

                Empaque.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        empaque: empaque,
                    });
                });


            });


});



/* 
    Actualizar empaque
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Empaque.findById(id, (err, empaque) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar empaque',
                errors: err
            });
        }

        if (!empaque) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar empaque, empaque con id ' + id + ' no existe',
                errors: { message: 'No exite un empaque con ese ID' }
            });
        }

        empaque.precio = body.precio;
        empaque.tipoEmpaque = body.tipoEmpaque;

        empaque.save((err, empaqueGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar empaque',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                empaque: empaqueGuardado
            });
        });

    });

});



/* 
    Crear un nuevo empaque suscripción
*/

app.post('/', (req, res) => {

    var body = req.body;

    var empaque = new Empaque({
        precio: body.precio,
        tipoEmpaque: body.tipoEmpaque,
    });


    empaque.save((err, empaqueGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando empaques',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            empaque: empaqueGuardado,
            empaqueToken: req.empaque
        });

    });

});


/* 
    Borrar un empaque por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Empaque.findByIdAndRemove(id, (err, empaqueBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando empaque',
                errors: err
            });
        }

        if (!empaqueBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando empaque, no existe un empaque suscripción con ese ID',
                errors: { message: 'No existe ningun empaque con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            empaque: empaqueBorrado
        });
    });
});

module.exports = app;