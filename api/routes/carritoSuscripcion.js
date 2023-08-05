var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var CarritoSuscripcion = require('../models/carritoSuscripcion');

// rutas

/* 
    Obtener todos los carritos suscripción

*/

app.get('/', (req, res, next) => {

    CarritoSuscripcion.find({})
        .populate("direccion")
        .populate("empaque")
        .populate("usuario")
        .exec(
            (err, carrito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando carrito',
                        errors: err
                    });
                }

                CarritoSuscripcion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        carrito: carrito,
                        conteo
                    });
                });


            });


});
/* 
    Obtener un carritoSuscripción por id Usuario

*/

app.get('/:idUsuario', (req, res, next) => {
    var id = req.params.idUsuario
    CarritoSuscripcion.findOne({ usuario: id })
        .populate("direccion")
        .populate("empaque")
        .exec(
            (err, carrito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando carrito',
                        errors: err
                    });
                }
                if (carrito == null) {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'No hay coincidencias',
                        existe: false,
                    });
                }
                res.status(200).json({
                    ok: true,
                    carrito: carrito,
                    existe: true
                });


            });


});
/* 
    Obtener todos los carrito paginado

*/

app.get('/pages/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);


    CarritoSuscripcion.find({})
        .skip(desde)
        .limit(hasta)
        .exec(
            (err, carrito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando carrito Suscripcion',
                        errors: err
                    });
                }

                CarritoSuscripcion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        carrito: carrito,
                        conteo,
                        hasta,
                        desde,
                    });
                });


            });


});
/* 
    Obtener un carrito Suscripción por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    CarritoSuscripcion.findById(id)
        .skip(desde)
        .limit(5)
        .exec(
            (err, carrito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el carrito Suscripción',
                        errors: err
                    });
                }

                CarritoSuscripcion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        carrito: carrito,
                    });
                });


            });


});



/* 
    Actualizar carrito Suscripción
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    CarritoSuscripcion.findById(id, (err, carrito) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar carrito suscripcion',
                errors: err
            });
        }

        if (!carrito) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar carrito suscripcion, carrito suscripcion con id ' + id + ' no existe',
                errors: { message: 'No exite un carrito suscripcion con ese ID' }
            });
        }

        carrito.frecuenciaEntrega = body.frecuenciaEntrega;
        carrito.horarioEntrega = body.horarioEntrega;
        carrito.diaRecepcion = body.diaRecepcion;
        carrito.contacto = body.contacto;
        carrito.formaContacto = body.formaContacto;
        carrito.metodoPago = body.metodoPago;
        carrito.referenciaPago = body.referenciaPago;
        carrito.precioTotal = body.precioTotal;
        carrito.cantidadTotal = body.cantidadTotal;
        carrito.direccion = body.direccion;
        carrito.empaque = body.empaque;
        carrito.usuario = body.usuario;
        carrito.fecha = new Date();
        carrito.cantidadEmpaques = body.cantidadEmpaques;
        carrito.save((err, carritoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar carrito Suscripción',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                carrito: carritoGuardado
            });
        });

    });

});



/* 
    Crear un nuevo carrito suscripción
*/

app.post('/', (req, res) => {

    var body = req.body;

    var carrito = new CarritoSuscripcion({
        frecuenciaEntrega: body.frecuenciaEntrega,
        horarioEntrega: body.horarioEntrega,
        diaRecepcion: body.diaRecepcion,
        contacto: body.contacto,
        formaContacto: body.formaContacto,
        metodoPago: body.metodoPago,
        referenciaPago: body.referenciaPago,
        precioTotal: body.precioTotal,
        cantidadTotal: body.cantidadTotal,
        direccion: body.direccion,
        empaque: body.empaque,
        usuario: body.usuario,
        fecha: new Date(),
        cantidadEmpaques: body.cantidadEmpaques,
    });


    carrito.save((err, carritoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando carritos suscripción',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            carrito: carritoGuardado,
            carritoToken: req.carrito
        });

    });

});


/* 
    Borrar un carrito por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    CarritoSuscripcion.findByIdAndRemove(id, (err, carritoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando carrito suscripción',
                errors: err
            });
        }

        if (!carritoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando carrito suscripción, no existe un carrito suscripción con ese ID',
                errors: { message: 'No existe ningun carrito suscripción con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            carrito: carritoBorrado
        });
    });
});

module.exports = app;