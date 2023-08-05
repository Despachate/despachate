var express = require('express');
// var bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');
// var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Carrusel = require('../models/carruselProductos');

// rutas

/* 
    Obtener todos los carruseles

*/

app.get('/', (req, res, next) => {
    Carrusel.find({})
        .populate("carrusel")
        .populate("producto")
        .exec(
            (err, carruselproductos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando carruselproductos',
                        errors: err
                    });
                }

                Carrusel.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        carruselproductos: carruselproductos,
                        conteo
                    });
                });


            });


});

app.get('/bycarrusel/:id', (req, res, next) => {
    var id = req.params.id;
    Carrusel.find({carrusel: id})
        .populate("carrusel")
        .populate("producto")
        .exec(
            (err, carruselproductos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando carruselproductos',
                        errors: err
                    });
                }

                Carrusel.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        carruselproductos: carruselproductos,
                        conteo
                    });
                });


            });


});
/* 
    Obtener un carrusel por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Carrusel.findById(id)
        .skip(desde)
        .limit(5)
        .exec(
            (err, carruseles) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el producto',
                        errors: err
                    });
                }

                Carrusel.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        carruseles: carruseles,
                    });
                });


            });


});



/* 
    Actualizar carrusel
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Carrusel.findById(id, (err, carrusel) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar carrusel',
                errors: err
            });
        }

        if (!carrusel) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar el carrusel, el carrusel con id ' + id + ' no existe',
                errors: { message: 'No exite un carrusel con ese ID' }
            });
        }
        Carrusel.producto = body.producto;
        Carrusel.carrusel = body.carrusel;

        Carrusel.save((err, carruselGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el carrusel',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                carrusel: carruselGuardado
            });
        });

    });



});





/* 
    Crear un nuevo carrusel
*/

app.post('/', (req, res) => {

    var body = req.body;

    var carrusel = new Carrusel({
        producto: body.producto,
        carrusel: body.carrusel
    });


    carrusel.save((err, carruselGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando carrusel',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            carrusel: carruselGuardado,
            carruselToken: req.carrusel
        });

    });

});


/* 
    Borrar un carrusel por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Carrusel.findByIdAndRemove(id, (err, carruselBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando carrusel',
                errors: err
            });
        }

        if (!carruselBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando carrusel, no existe un carrusel con ese ID',
                errors: { message: 'No existe ningun carrusel con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            carrusel: carruselBorrado
        });
    });
});

module.exports = app;