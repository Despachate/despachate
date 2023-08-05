var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');


var Favorito = require('../models/favorito');

var app = express();



/* 
    Obtener últimos 3 productos agregados a favoritos

*/

app.get('/3prodFav/:id', (req, res, next) => {
    var usuario = req.params.id;
    Favorito.find({ usuario }).sort({ $natural: -1 }).limit(3)
        .populate('producto')
        .exec(
            (err, favoritos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando favoritos',
                        errors: err
                    });
                }

                Favorito.count({ usuario }, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        favoritos: favoritos,
                        total: conteo
                    });
                });


            });


});

/**
 * Obtener favorito por id
 */
app.get('/favorito/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Favorito.findById(id, (err, favorito) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando favoritos',
                errors: err
            });
        }

        Favorito.count({}, (err, conteo) => {
            res.status(200).json({
                ok: true,
                favorito: favorito,
                total: conteo
            });
        });


    });


});

/**
 * Obtener favorito por producto y usuario
 */
app.get('/producto/:producto/:usuario', (req, res, next) => {

    var producto = req.params.producto;
    var usuario = req.params.usuario;

    Favorito.findOne({ producto, usuario })
        .exec(
            (err, favorito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando favoritos',
                        errors: err
                    });
                }
                if (!favorito) {
                    return res.status(200).json({
                        ok: false,
                        mensaje: 'No se encontro ninguna coincidencia',
                        errors: { message: 'No hay coincidencias' }
                    })
                }
                res.status(200).json({
                    ok: true,
                    favorito: favorito,
                });


            });


});
/* 
    Obtener los productos favoritos por id producto

*/
app.get('/prodFavorito', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var arreglo = req.query.arreglo;
    console.log('arreglo ', arreglo);
    Favorito.find({ producto: { $in: arreglo } })
        .distinct('producto')
        .exec(
            (err, favorito) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el producto favorito',
                        errors: err
                    });
                }
                console.log(favorito);
                Favorito.find({ producto: { $in: favorito } })
                    .populate('producto')
                    .exec(
                        (err, favoritos) => {
                            if (err) {
                                return res.status(500).json({
                                    ok: false,
                                    mensaje: 'Error cargando los favoritos',
                                    errors: err
                                });
                            }

                            console.log(favoritos);

                            res.status(200).json({
                                ok: true,
                                favoritos: favoritos,
                            });



                        });



            });


});
/**
 * Obtener favoritos
 */
app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var usuario = req.params.id;

    Favorito.find({ usuario })
        .populate('producto')
        .exec(
            (err, favoritos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando favoritos',
                        errors: err
                    });
                }

                Favorito.count({ usuario }, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        favoritos: favoritos,
                        total: conteo
                    });
                });


            });


});
/**
 * Verificar si un producto ya fue agregado a favoritos
 */
app.get('/isFavorito/:idUsu/:idProd', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var idUsuario = req.params.idUsu;
    var idProducto = req.params.idProd;

    Favorito.findOne({ usuario: idUsuario, producto: idProducto })
        .exec(
            (err, favoritos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando favoritos',
                        errors: err
                    });
                }
                Favorito.count({ usuario }, (err, conteo) => {
                    res.status(200).json({
                        ok: true
                    });
                });


            });
});
/**
 * Actualizar favorito
 */

app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Favorito.findById(id, (err, favorito) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar favorito',
                errors: err
            });
        }

        if (!favorito) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar favorito, favorito con ID ' + id + ' no existe',
                errors: { message: 'No exite un favorito con ese ID' }
            });
        }

        // info envio
        favorito.usuario = body.usuario;

        favorito.producto = body.producto;


        favorito.save((err, favoritoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar favorito',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                favorito: favoritoGuardado
            });
        });

    });


});

/**
 * Crear favorito
 */

app.post('/', (req, res) => {
    var body = req.body;

    if (Object.entries(body).length > 0) {

        var favorito = new Favorito({
            usuario: body.usuario,
            producto: body.producto
        });

        favorito.save((err, favoritoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al guardar favorito',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                favorito: favoritoGuardado
            });
        });

    } else {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se envio informacion para guardar',
            errors: { message: 'No hay informacion para guardar' }
        });
    }
});


/**
 * Borrar favorito por id
 */


app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Favorito.findByIdAndRemove(id, (err, favoritoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando favorito',
                errors: err
            });
        }

        if (!favoritoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando favorito, no existe favorito con ese ID',
                errors: { message: 'No existe favorito con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            favorito: favoritoBorrado
        });
    });
});

module.exports = app;