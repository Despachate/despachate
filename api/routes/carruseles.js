var express = require('express');
// var bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');
// var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Carrusel = require('../models/carruseles');
var CarruselProductos = require('../models/carruselProductos');

// rutas

/* 
    Obtener todos los carruseles

*/

app.get('/', async(req, res, next) => {
    try {
        let carouseles = [];
        for await(const carousel of Carrusel.find({})) {
            console.log(carousel);
            let productosCarousel = [];
            for await(const productocarousel of CarruselProductos.find({carrusel: carousel._doc._id}).populate('producto')) {
                productosCarousel.push(productocarousel._doc);
            }
            carouseles.push({...carousel._doc, productosCarousel});
        }
        res.status(200).json({
            ok: true,
            carruseles: carouseles, 
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando carruseles',
            errors: error
        });
    }
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
        carrusel.titulo = body.titulo;

        carrusel.save((err, cuponGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el carrusel',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                carrusel: cuponGuardado
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
        titulo: body.titulo
    });


    carrusel.save((err, cuponGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando cupons',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            carrusel: cuponGuardado,
            cuponToken: req.carrusel
        });

    });

});


/* 
    Borrar un carrusel por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Carrusel.findByIdAndRemove(id, (err, cuponBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando carrusel',
                errors: err
            });
        }

        if (!cuponBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando carrusel, no existe un carrusel con ese ID',
                errors: { message: 'No existe ningun carrusel con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            carrusel: cuponBorrado
        });
    });
});

module.exports = app;