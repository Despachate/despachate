var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var DetalleCarrito = require('../models/detalleCarrito');
var Producto = require('../models/producto');

// rutas

/* 
    Obtener todos los detalle carrito

*/

app.get('/', (req, res, next) => {

    DetalleCarrito.find({})
        .populate("pedido")
        .populate("producto")
        .exec(
            (err, detalleCarrito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando detalle Carrito',
                        errors: err
                    });
                }

                DetalleCarrito.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        detalleCarrito: detalleCarrito,
                        conteo
                    });
                });


            });


});
/* 
    Obtener todos los detalle carrito

*/

app.get('/detallePedido/:id', (req, res, next) => {
    var id = req.params.id;
    DetalleCarrito.find({ pedido: id })
        .populate("pedido")
        .populate("producto")
        .populate("paquete")
        .exec(
            (err, detalleCarrito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando detalle Carrito',
                        errors: err
                    });
                }

                DetalleCarrito.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        detalleCarrito: detalleCarrito,
                        conteo
                    });
                });


            });


});
/* 
    Obtener todos los detalle carrito paginado

*/

app.get('/pages/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);
    

    DetalleCarrito.find({})
        .distinct('producto')
        .exec(
            (err, detalleCarrito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando detalle Carrito',
                        errors: err
                    });
                }

                Producto.find({_id: {$in: detalleCarrito}})
                .sort({ $natural: -1 })
                .populate("departamento")
                .populate("categoria")
                .populate("subcategoria")
                .limit(10)
                .exec((err, productos) => {
                    DetalleCarrito.countDocuments({}, (err, conteo) => {
                        res.status(200).json({
                            ok: true,
                            productos,
                            conteo,
                            hasta,
                            desde,
                        });
                    });
                });


            });


});
/* 
    Obtener detalle Carrito por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    DetalleCarrito.findById(id)
        .skip(desde)
        .limit(5)
        .exec(
            (err, detalleCarrito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el detalle Carrito',
                        errors: err
                    });
                }

                DetalleCarrito.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        detalleCarrito: detalleCarrito,
                    });
                });


            });


});



/* 
    Actualizar detalle Carrito 
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    DetalleCarrito.findById(id, (err, detalleCarrito) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar detalle Carrito',
                errors: err
            });
        }

        if (!detalleCarrito) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar detalle Carrito, detalle Carrito con id ' + id + ' no existe',
                errors: { message: 'No exite un detalle Carrito con ese ID' }
            });
        }

        detalleCarrito.cantidad = body.cantidad;
        detalleCarrito.subtotal = body.subtotal;
        detalleCarrito.pedido = body.pedido;
        detalleCarrito.producto = body.producto;
        detalleCarrito.oferta = body.oferta;
        detalleCarrito.save((err, detalleCarritoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar detalle Carrito',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                detalleCarrito: detalleCarritoGuardado
            });
        });

    });

});



/* 
    Crear un nuevo detalle Carrito
*/

app.post('/', (req, res) => {

    var body = req.body;

    var detalleCarrito = new DetalleCarrito({
        cantidad: body.cantidad,
        subtotal: body.subtotal,
        pedido: body.pedido,
        producto: body.producto,
        oferta: body.oferta,
    });


    detalleCarrito.save((err, detalleCarritoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando detalle Carritos',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            detalleCarrito: detalleCarritoGuardado,
            detalleCarritoToken: req.detalleCarrito
        });

    });

});


/* 
    Borrar un detalle Carrito por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    DetalleCarrito.findByIdAndRemove(id, (err, detalleCarritoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando detalle Carrito',
                errors: err
            });
        }

        if (!detalleCarritoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando detalle Carrito, no existe un detalle Carrito con ese ID',
                errors: { message: 'No existe ningun detalle Carrito con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            detalleCarrito: detalleCarritoBorrado
        });
    });
});

module.exports = app;