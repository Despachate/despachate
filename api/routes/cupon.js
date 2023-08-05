var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Cupon = require('../models/cupon');

// rutas

/* 
    Obtener todos los cupones

*/

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);


    Cupon.find({}, 'codigo valor tipoCupon idUsuario')
        .skip(desde)
        .limit(hasta)
        .exec(
            (err, cupones) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando cupones',
                        errors: err
                    });
                }

                Cupon.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        cupones: cupones,
                        hasta,
                        desde,
                    });
                });


            });


});
/* 
    Obtener un cupon por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Cupon.findById(id, 'codigo valor tipoCupon idUsuario')
        .skip(desde)
        .limit(5)
        .exec(
            (err, cupones) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el producto',
                        errors: err
                    });
                }

                Cupon.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        cupones: cupones,
                    });
                });


            });


});

/* 
    Obtener cupones por id Usuario

*/

app.get('/cuponXIdUsu/:id', (req, res, next) => {

    var id = req.params.id;

    Cupon.find({ idUsuario: id })
        .exec(
            (err, cupones) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando cupones',
                        errors: err
                    });
                }

                Cupon.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        cupones: cupones,
                    });
                });


            });


});



app.get('/cuponXCodigo/:codigo', (req, res, next) => {

    var codigo = req.params.codigo;

    Cupon.findOne({ codigo: codigo })
        .exec(
            (err, cupon) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando cupones',
                        errors: err
                    });
                }

                Cupon.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        cupon: cupon,
                    });
                });


            });


});
/* 
    Actualizar cupon
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Cupon.findById(id, (err, cupon) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar cupon',
                errors: err
            });
        }

        if (!cupon) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar el cupon, el cupon con id ' + id + ' no existe',
                errors: { message: 'No exite un cupon con ese ID' }
            });
        }
        cupon.codigo = body.codigo;
        cupon.valor = body.valor;
        cupon.tipoCupon = body.tipoCupon;
        cupon.idUsuario = body.idUsuario;

        cupon.save((err, cuponGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el cupon',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                cupon: cuponGuardado
            });
        });

    });



});



/* 
    Crear un nuevo cupon
*/

app.post('/', (req, res) => {

    var body = req.body;

    var cupon = new Cupon({
        codigo: body.codigo,
        valor: body.valor,
        tipoCupon: body.tipoCupon,
        idUsuario: body.idUsuario
    });


    cupon.save((err, cuponGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando cupons',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            cupon: cuponGuardado,
            cuponToken: req.cupon
        });

    });

});


/* 
    Borrar un cupon por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Cupon.findByIdAndRemove(id, (err, cuponBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando cupon',
                errors: err
            });
        }

        if (!cuponBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando cupon, no existe un cupon con ese ID',
                errors: { message: 'No existe ningun cupon con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            cupon: cuponBorrado
        });
    });
});

module.exports = app;