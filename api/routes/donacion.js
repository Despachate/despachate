var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Donacion = require('../models/donacion');

// rutas

/* 
    Obtener todos los empaques

*/

app.get('/', (req, res, next) => {

    Donacion.find({})
        .exec(
            (err, donaciones) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando donaciones',
                        errors: err
                    });
                }

                Donacion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        donaciones: donaciones,
                        total: conteo
                    });
                });


            });


});
/* 
    Obtener todos las donaciones paginado

*/

app.get('/pages/', (req, res, next) => {

    var desde = req.query.desde || 0;
    var hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);


    Donacion.find({})
        .skip(desde)
        .limit(hasta)
        .exec(
            (err, donaciones) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando empaque Suscripcion',
                        errors: err
                    });
                }

                Donacion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        donaciones: donaciones,
                        total: conteo,
                        hasta,
                        desde,
                    });
                });


            });


});
/* 
    Obtener la donación activa

*/

app.get('/donacionActiva', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Donacion.findOne({ estatus: "Activa" })
        .skip(desde)
        .limit(1)
        .exec(
            (err, donacion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando la donacion',
                        errors: err
                    });
                }

                Donacion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        donacion: donacion,
                    });
                });


            });


});
/* 
    Obtener una donación por id

*/

app.get('/:id', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var id = req.params.id;

    Donacion.findById(id)
        .skip(desde)
        .limit(5)
        .exec(
            (err, donacion) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando la donacion',
                        errors: err
                    });
                }

                Donacion.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        donacion: donacion,
                    });
                });


            });


});



/* 
    Actualizar donación
*/
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;
    if (body.estatus === "Activa") {
        Donacion.findOne({ estatus: "Activa" }, (err, donacion) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar donación',
                    errors: err
                });
            }
            if (donacion != null) {
                donacion.estatus = "Inactiva";
                donacion.save((err, donacionGuardado) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar donación',
                            errors: err
                        });
                    }

                    Donacion.findById(id, (err, donacion) => {

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al buscar donación',
                                errors: err
                            });
                        }

                        if (!donacion) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al buscar donación, donación con id ' + id + ' no existe',
                                errors: { message: 'No exite un donación con ese ID' }
                            });
                        }

                        donacion.nombre = body.nombre;
                        donacion.imagen = body.imagen;
                        donacion.estatus = body.estatus;
                        donacion.descripcion = body.descripcion;

                        donacion.save((err, donacionGuardado) => {
                            if (err) {
                                return res.status(400).json({
                                    ok: false,
                                    mensaje: 'Error al actualizar donación',
                                    errors: err
                                });
                            }

                            res.status(200).json({
                                ok: true,
                                donacion: donacionGuardado
                            });
                        });

                    });
                });
            } else {
                Donacion.findById(id, (err, donacion) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al buscar donación',
                            errors: err
                        });
                    }

                    if (donacion) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al buscar donación, donación con id ' + id + ' no existe',
                            errors: { message: 'No exite un donación con ese ID' }
                        });
                    }

                    donacion.nombre = body.nombre;
                    donacion.imagen = body.imagen;
                    donacion.estatus = body.estatus;
                    donacion.descripcion = body.descripcion;

                    donacion.save((err, donacionGuardado) => {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al actualizar donación',
                                errors: err
                            });
                        }

                        res.status(200).json({
                            ok: true,
                            donacion: donacionGuardado
                        });
                    });

                });
            }

        });
    } else {
        Donacion.findById(id, (err, donacion) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar donación',
                    errors: err
                });
            }

            if (donacion) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar donación, donación con id ' + id + ' no existe',
                    errors: { message: 'No exite un donación con ese ID' }
                });
            }

            donacion.nombre = body.nombre;
            donacion.imagen = body.imagen;
            donacion.estatus = body.estatus;
            donacion.descripcion = body.descripcion;

            donacion.save((err, donacionGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar donación',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    donacion: donacionGuardado
                });
            });

        });
    }


});



/* 
    Crear un nueva sonación
*/

app.post('/', (req, res) => {

    var body = req.body;

    var donacion = new Donacion({
        nombre: body.nombre,
        imagen: body.imagen,
        estatus: body.estatus,
        descripcion: body.descripcion,
    });


    if (body.estatus === "Activa") {
        Donacion.findOne({ estatus: "Activa" }, (err, donacionTemp) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar donación',
                    errors: err
                });
            }
            if (donacionTemp != null) {
                donacionTemp.estatus = "Inactiva";
                donacionTemp.save((err, donacionGuardado) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar donación',
                            errors: err
                        });
                    }

                    donacion.save((err, donacionGuardado) => {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al actualizar donación',
                                errors: err
                            });
                        }

                        res.status(200).json({
                            ok: true,
                            donacion: donacionGuardado
                        });
                    });

                });
            } else {
                donacion.save((err, donacionGuardado) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar donación',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        donacion: donacionGuardado
                    });
                });
            }

        });
    } else {
        donacion.save((err, donacionGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar donación',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                donacion: donacionGuardado
            });
        });
    }
});


/* 
    Borrar una donación por el id
*/
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Donacion.findByIdAndRemove(id, (err, donacionBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando donación',
                errors: err
            });
        }

        if (!donacionBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando donación, no existe un donación suscripción con ese ID',
                errors: { message: 'No existe ningun donación con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            donacion: donacionBorrado
        });
    });
});

module.exports = app;