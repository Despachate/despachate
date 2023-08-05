var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var CuponUsuario = require('../models/cuponUsuario');

// rutas

/* 
    Obtener todos los cupones Usuario

*/

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);


    CuponUsuario.find({}, ' ')
        .skip(desde)
        .limit(hasta)
        .exec(
            (err, cuponesUsuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando cupones Usuario',
                        errors: err
                    });
                }

                CuponUsuario.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        cuponesUsuario: cuponesUsuario,
                        hasta,
                        desde,
                    });
                });


            });


});
/* 
    Obtener un cupon Usuario por id

*/

app.get('/cuponUsado/:idUsuario/:idCupon', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var idUsuario = req.params.idUsuario;
    var idCupon = req.params.idCupon;

    CuponUsuario.findOne({ usuario: idUsuario, cupon: idCupon })
        .exec(
            (err, cuponUsuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el cupones Usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    cuponUsuario: cuponUsuario,
                });


            });


});
/* 
    Obtener un cupon Usuario por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    CuponUsuario.findById(id)
        .skip(desde)
        .limit(5)
        .exec(
            (err, cuponesUsuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el cupones Usuario',
                        errors: err
                    });
                }

                CuponUsuario.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        cuponesUsuario: cuponesUsuario,
                    });
                });


            });


});

/* 
    Actualizar cupones Usuario
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    CuponUsuario.findById(id, (err, cuponesUsuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar cuponesUsuario',
                errors: err
            });
        }

        if (!cuponesUsuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar el cuponesUsuario, el cuponesUsuario con id ' + id + ' no existe',
                errors: { message: 'No exite un cuponesUsuario con ese ID' }
            });
        }
        cuponesUsuario.cupon = body.cupon;
        cuponesUsuario.usuario = body.usuario;

        cuponesUsuario.save((err, cuponesUsuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el cupon',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                cuponesUsuario: cuponesUsuarioGuardado
            });
        });

    });



});



/* 
    Crear un nuevo cupon
*/

app.post('/', (req, res) => {

    var body = req.body;

    var cuponesUsuario = new CuponUsuario({
        cupon: body.cupon,
        usuario: body.usuario,
    });


    cuponesUsuario.save((err, cuponesUsuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando cupons',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            cuponesUsuario: cuponesUsuarioGuardado,
            cuponesUsuariooken: req.cuponesUsuario
        });

    });

});


/* 
    Borrar un cupon por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    CuponUsuario.findByIdAndRemove(id, (err, cuponesUsuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando cupon',
                errors: err
            });
        }

        if (!cuponesUsuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando cupon, no existe un cupon con ese ID',
                errors: { message: 'No existe ningun cupon con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            cuponesUsuario: cuponesUsuarioBorrado
        });
    });
});

module.exports = app;