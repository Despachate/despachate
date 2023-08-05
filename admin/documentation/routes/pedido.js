var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Pedido = require('../models/pedido');

// rutas

/* 
    Obtener todos los pedidos

*/

app.get('/', (req, res, next) => {

    Pedido.find({})
        .populate("direccion")
        .populate("cupon")
        .populate("usuario")
        .populate("empaque")
        .exec(
            (err, pedidos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando pedidos',
                        errors: err
                    });
                }

                Pedido.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        pedidos: pedidos,
                        conteo
                    });
                });


            });


});
/* 
    Obtener todos los pedidos paginados

*/

app.get('/pages/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);


    Pedido.find({})
        .skip(desde)
        .limit(hasta)
        .exec(
            (err, pedidos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando pedidos',
                        errors: err
                    });
                }

                Pedido.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        pedidos: pedidos,
                        conteo,
                        hasta,
                        desde,
                    });
                });


            });


});
/* 
    Obtener pedido por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Pedido.findById(id)
        .populate("direccion")
        .populate("cupon")
        .populate("usuario")
        .populate("empaque")
        .exec(
            (err, pedido) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el pedido',
                        errors: err
                    });
                }

                Pedido.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        pedido: pedido,
                    });
                });


            });


});



/* 
    Actualizar pedidos 
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Pedido.findById(id, (err, pedidos) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar pedido',
                errors: err
            });
        }

        if (!pedidos) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar pedido, pedido con id ' + id + ' no existe',
                errors: { message: 'No exite un pedido con ese ID' }
            });
        }

        pedidos.fechaCompra = body.fechaCompra;
        pedidos.fechaRecepcion = body.fechaRecepcion;
        pedidos.precioTotal = body.precioTotal;
        pedidos.cantidadTotal = body.cantidadTotal;
        pedidos.metodoPago = body.metodoPago;
        pedidos.referenciaPago = body.referenciaPago;
        pedidos.contacto = body.contacto;
        pedidos.formaContacto = body.formaContacto;
        pedidos.estatusPago = body.estatusPago;
        pedidos.estatusEnvio = body.estatusEnvio;
        pedidos.direccion = body.direccion;
        pedidos.cupon = body.cupon;
        pedidos.usuario = body.usuario;
        pedidos.empaque = body.empaque;

        pedidos.save((err, pedidosGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar pedidos',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                pedidos: pedidosGuardado
            });
        });

    });

});



/* 
    Crear un nuevo pedido
*/

app.post('/', (req, res) => {

    var body = req.body;

    var pedidos = new Pedido({
        fechaCompra: body.fechaCompra,
        fechaRecepcion: body.fechaRecepcion,
        precioTotal: body.precioTotal,
        cantidadTotal: body.cantidadTotal,
        metodoPago: body.metodoPago,
        referenciaPago: body.referenciaPago,
        contacto: body.contacto,
        formaContacto: body.formaContacto,
        estatusPago: body.estatusPago,
        estatusEnvio: body.estatusEnvio,
        direccion: body.direccion,
        cupon: body.cupon,
        usuario: body.usuario,
        empaque: body.empaque,
    });


    pedidos.save((err, pedidosGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando pedidos',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            pedidos: pedidosGuardado,
            pedidosToken: req.pedidos
        });

    });

});


/* 
    Borrar un pedido por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Pedido.findByIdAndRemove(id, (err, pedidosBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando un pedido',
                errors: err
            });
        }

        if (!pedidosBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando pedidos, no existe un pedido con ese ID',
                errors: { message: 'No existe ningun pedido con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            pedidos: pedidosBorrado
        });
    });
});

module.exports = app;