var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Oferta = require('../models/oferta');

// rutas

/* 
    Obtener todas las ofertas

*/

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 7;
    desde = Number(desde);
    hasta = Number(hasta);


    Oferta.find({})
        .populate("producto")
        .populate("inventario")
        .skip(desde)
        .exec(
            (err, ofertas) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando ofertas',
                        errors: err
                    });
                }

                Oferta.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        ofertas: ofertas,
                        hasta,
                        desde,
                    });
                });


            });


});
/* 
    Obtener una oferta por id

*/

app.get('/producto/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Oferta.findOne({ producto: id })
        .populate('inventario')
        .populate('producto')
        .exec(
            (err, oferta) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando la oferta',
                        errors: err
                    });
                }

                Oferta.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        oferta: oferta,
                    });
                });


            });


});

/* 
    Obtener una oferta por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Oferta.findById({ id: id })
        .skip(desde)
        .limit(5)
        .exec(
            (err, oferta) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando la oferta',
                        errors: err
                    });
                }

                Oferta.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        oferta: oferta,
                    });
                });


            });


});



/* 
    Actualizar oferta
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Oferta.findById(id, (err, oferta) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar oferta',
                errors: err
            });
        }

        if (!oferta) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar el oferta, el oferta con id ' + id + ' no existe',
                errors: { message: 'No exite un oferta con ese ID' }
            });
        }
        oferta.producto = body.producto;
        oferta.inventario = body.inventario;
        oferta.precio = body.precio;

        oferta.save((err, ofertaGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el oferta',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                oferta: ofertaGuardado
            });
        });

    });



});



/* 
    Crear una nueva oferta
*/

app.post('/', (req, res) => {

    var body = req.body;

    var oferta = new Oferta({
        producto: body.producto,
        inventario: body.inventario,
        precio: body.precio
    });


    oferta.save((err, ofertaGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando ofertas',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            oferta: ofertaGuardado,
            ofertaToken: req.oferta
        });

    });

});


/* 
    Borrar un oferta por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Oferta.findByIdAndRemove(id, (err, ofertaBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando oferta',
                errors: err
            });
        }

        if (!ofertaBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando oferta, no existe un oferta con ese ID',
                errors: { message: 'No existe ningun oferta con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            oferta: ofertaBorrado
        });
    });
});

module.exports = app;