var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Carrousel = require('../models/carrousel');

// rutas

/* 
    Obtener todos los carrouseles

*/

app.get('/', (req, res, next) => {

    Carrousel.find({})
        .exec(
            (err, carrouseles) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando carrouseles',
                        errors: err
                    });
                }

                Carrousel.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        carrouseles: carrouseles,
                        total: conteo
                    });
                });


            });


});
/* 
    Obtener un carrousel por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Carrousel.findById(id)
        .skip(desde)
        .limit(5)
        .exec(
            (err, carrouseles) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el producto',
                        errors: err
                    });
                }

                Carrousel.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        carrouseles: carrouseles,
                    });
                });


            });


});



/* 
    Actualizar carrousel
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Carrousel.findById(id, (err, carrousel) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar carrousel',
                errors: err
            });
        }

        if (!carrousel) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar el carrousel, el carrousel con id ' + id + ' no existe',
                errors: { message: 'No exite un carrousel con ese ID' }
            });
        }
        carrousel.codigo = body.img;

        carrousel.save((err, cuponGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el carrousel',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                carrousel: cuponGuardado
            });
        });

    });



});



/* 
    Crear un nuevo carrousel
*/

app.post('/', (req, res) => {

    var body = req.body;

    var carrousel = new Carrousel({
        img: body.img
    });


    carrousel.save((err, cuponGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando cupons',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            carrousel: cuponGuardado,
            cuponToken: req.carrousel
        });

    });

});


/* 
    Borrar un carrousel por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Carrousel.findByIdAndRemove(id, (err, cuponBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando carrousel',
                errors: err
            });
        }

        if (!cuponBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando carrousel, no existe un carrousel con ese ID',
                errors: { message: 'No existe ningun carrousel con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            carrousel: cuponBorrado
        });
    });
});

module.exports = app;