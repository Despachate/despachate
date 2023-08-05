var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Inventario = require('../models/inventario');
var Producto = require('../models/producto');


// rutas

/* 
    Obtener todos los inventarios

*/

app.get('/', (req, res, next) => {

    Inventario.find({})
        .populate("producto")
        .exec(
            (err, inventarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando inventarios',
                        errors: err
                    });
                }

                Inventario.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        inventarios: inventarios,
                        conteo
                    });
                });


            });


});


app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Inventario.findById(id)
        .populate('producto')
        .exec(
            (err, inventario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el inventario',
                        errors: err
                    });
                }


                res.status(200).json({
                    ok: true,
                    inventario: inventario,
                });



            });


});
/* 
    Obtener los inventarios de un producto por id producto

*/
app.get('/invProd/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Inventario.find({ producto: id })
        .populate('producto')
        .exec(
            (err, inventario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el inventario',
                        errors: err
                    });
                }


                res.status(200).json({
                    ok: true,
                    inventario: inventario,
                });



            });


});

/* 
    Obtener los inventarios de un producto por id producto y por el precio del paquete

*/
app.get('/invXPrecio/:precio', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var arreglo = req.query.arreglo;
    console.log('arreglo ', arreglo);
    var precio = req.params.precio;
    var precios = precio.split('-');
    var rango1 = precios[0];
    var rango2 = precios[1];
    Inventario.find({ producto: { $in: arreglo }, "precio": { "$gte": rango1, "$lt": rango2 } })
        .populate('producto')
        .distinct('producto')
        .exec(
            (err, inventario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el inventario',
                        errors: err
                    });
                }

                Producto.find({ _id: { $in: inventario } })

                .exec(
                    (err, productos) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando el productos',
                                errors: err
                            });
                        }


                        res.status(200).json({
                            ok: true,
                            productos: productos,
                        });



                    });



            });


});

/* 
    Actualizar inventario
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Inventario.findById(id, (err, inventario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar inventario',
                errors: err
            });
        }

        if (!inventario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar inventario, inventario con id ' + id + ' no existe',
                errors: { message: 'No exite un inventario con ese ID' }
            });
        }

        inventario.paquete = body.paquete;
        inventario.producto = body.producto;
        inventario.precio = body.precio;
        inventario.stock = body.stock;


        inventario.save((err, inventarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar inventario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                inventario: inventarioGuardado
            });
        });

    });

});



/* 
    Crear un nuevo inventario
*/

app.post('/', (req, res) => {

    var body = req.body;

    var inventario = new Inventario({
        paquete: body.paquete,
        producto: body.producto,
        precio: body.precio,
        stock: body.stock,
    });


    inventario.save((err, inventarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando inventario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            inventario: inventarioGuardado
        });

    });

});




/* 
    Borrar un inventario por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Inventario.findByIdAndRemove(id, (err, inventarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando inventario',
                errors: err
            });
        }

        if (!inventarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando inventario, no existe un inventario con ese ID',
                errors: { message: 'No existe ningun inventario con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            inventario: inventarioBorrado
        });
    });
});

module.exports = app;