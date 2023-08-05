var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var DetalleSuscripcion = require('../models/detalleSuscripcion');

// rutas

/* 
    Obtener todos los detalles suscripción

*/

app.get('/', (req, res, next) => {

    DetalleSuscripcion.find({})
        .populate("carritoSuscripcion")
        .populate("producto")
        .populate("paquete")
        .exec(
            (err, detalleSuscripcion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando detalle Suscripcion',
                        errors: err
                    });
                }

                DetalleSuscripcion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        detalleSuscripcion: detalleSuscripcion,
                        conteo
                    });
                });


            });


});
/* 
    Obtener todos los detalles suscripción paginado

*/

app.get('/pages/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);


    DetalleSuscripcion.find({})
        .sort({ $natural: -1 })
        .populate('producto')
        .skip(desde)
        .limit(hasta)
        .exec(
            (err, detalleSuscripcion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando detalle Suscripcion',
                        errors: err
                    });
                }

                DetalleSuscripcion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        detalleSuscripcion: detalleSuscripcion,
                        conteo,
                        hasta,
                        desde,
                    });
                });


            });


});
/* 
    Obtener detalle Suscripcion por id

*/

app.get('/detXIdCarSus/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    DetalleSuscripcion.find({ carritoSuscripcion: id })
        .populate('producto')
        .populate('paquete')
        .populate('carritoSuscripcion')
        .exec(
            (err, detalleSuscripcion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el detalle Suscripcion',
                        errors: err
                    });
                }

                DetalleSuscripcion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        detalleSuscripcion: detalleSuscripcion,
                    });
                });


            });


});

/* 
    Obtener un producto por id Carrito Suscripción y por id del producto

*/

app.get('/obtenerProducto/:idCarrSus/:idProd', (req, res, next) => {
    var idCarrSus = req.params.idCarrSus;
    var idProd = req.params.idProd
    DetalleSuscripcion.findOne({ carritoSuscripcion: idCarrSus, paquete: idProd })
        .exec(
            (err, detalleSus) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando producto',
                        errors: err,
                        existe: false
                    });
                }
                if (detalleSus == null) {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'No hay coincidencias, ese producto aun no esta registrado en la suscripción',
                        existe: false,
                    });
                }
                res.status(200).json({
                    ok: true,
                    detalleSus: detalleSus,
                    existe: true
                });


            });
});


/* 
    Actualizar detalle Suscripcion 
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    DetalleSuscripcion.findById(id, (err, detalleSuscripcion) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar detalle Suscripcion suscripcion',
                errors: err
            });
        }

        if (!detalleSuscripcion) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar detalle Suscripcion suscripcion, detalle Suscripcion con id ' + id + ' no existe',
                errors: { message: 'No exite un detalle Suscripcion con ese ID' }
            });
        }

        detalleSuscripcion.cantidad = body.cantidad;
        detalleSuscripcion.subtotal = body.subtotal;
        detalleSuscripcion.carritoSuscripcion = body.carritoSuscripcion;
        detalleSuscripcion.producto = body.producto;
        detalleSuscripcion.paquete = body.paquete;
        detalleSuscripcion.save((err, detalleSuscripcionGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar detalle Suscripcion',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                detalleSuscripcion: detalleSuscripcionGuardado
            });
        });

    });

});

/* 
    Actualizar la cantidad de productos agregados a la suscripción

*/

app.put('/actCantProd/:idCarrSus/:idProd', (req, res, next) => {
    var idCarrSus = req.params.idCarrSus;
    var idProd = req.params.idProd
    var body = req.body;
    DetalleSuscripcion.findOne({ carritoSuscripcion: idCarrSus, paquete: idProd }, (err, detalleSuscripcion) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el producto en detalle Suscripcion',
                errors: err
            });
        }

        if (!detalleSuscripcion) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar detalle Suscripcion, detalle Suscripcion con id ' + id + ' no existe',
                errors: { message: 'No exite un detalle Suscripcion con ese ID' }
            });
        }

        detalleSuscripcion.cantidad = body.cantidad;
        detalleSuscripcion.save((err, detalleSuscripcionGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar detalle Suscripcion',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                detalleSuscripcion: detalleSuscripcionGuardado
            });
        });

    });
});

/* 
    Crear un nuevo detalle Suscripcion 
*/

app.post('/', (req, res) => {

    var body = req.body;
    console.log(body);
    var detalleSuscripcion = new DetalleSuscripcion({
        cantidad: body.cantidad,
        subtotal: body.subtotal,
        carritoSuscripcion: body.carritoSuscripcion,
        producto: body.producto,
        paquete: body.paquete
    });


    detalleSuscripcion.save((err, detalleSuscripcionGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando detalleSuscripcions suscripción',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            detalleSuscripcion: detalleSuscripcionGuardado
        });

    });

});


/* 
    Borrar un detalle Suscripcion por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    DetalleSuscripcion.findByIdAndRemove(id, (err, detalleSuscripcionBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando detalle Suscripcion',
                errors: err
            });
        }

        if (!detalleSuscripcionBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando detalle Suscripcion, no existe un detalle Suscripcion con ese ID',
                errors: { message: 'No existe ningun detalle Suscripcion con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            detalleSuscripcion: detalleSuscripcionBorrado
        });
    });
});


/* 
    Borrar un producto de detalle Suscripcion id Carrito Suscripción y por id del producto
*/
app.delete('/eliminarProd/:idCarrSus/:idProd', (req, res, next) => {
    var idCarrSus = req.params.idCarrSus;
    var idProd = req.params.idProd

    DetalleSuscripcion.findOneAndRemove({ carritoSuscripcion: idCarrSus, paquete: idProd }, (err, detalleSuscripcionBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando producto de detalle Suscripcion',
                errors: err
            });
        }

        if (!detalleSuscripcionBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando producto de detalle Suscripcion, no existe un producto en detalle Suscripcion con ese ID',
                errors: { message: 'No existe ningun producto en detalle Suscripcion con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            detalleSuscripcion: detalleSuscripcionBorrado
        });
    });
});


/* 
    Borrar detalles Suscripcion id Carrito Suscripción y por id del producto
*/
app.delete('/eliminarDetalles/:idCarrSus', (req, res, next) => {
    var idCarrSus = req.params.idCarrSus;

    DetalleSuscripcion.remove({ carritoSuscripcion: idCarrSus }, (err, detalleSuscripcionBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando detalles Suscripcion',
                errors: err
            });
        }

        if (!detalleSuscripcionBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando detalles Suscripcion, no existe detalles Suscripcion con ese ID',
                errors: { message: 'No existen detalles Suscripcion con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            detalleSuscripcion: detalleSuscripcionBorrado
        });
    });
});
module.exports = app;