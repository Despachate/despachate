var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Recetas_resenia = require('../models/recetas_resenia');

// rutas

/* 
    Obtener todos los recetas_resenia

*/

app.get('/', (req, res, next) => {
  Recetas_resenia.find({})
    .populate('receta')
    .populate('usuario')
    .exec((err, recetas_resenias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando recetas reseñas',
          errors: err,
        });
      }

      Recetas_resenia.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_resenias: recetas_resenias,
          total: conteo,
        });
      });
    });
});
/* 
    Obtener todos los recetas_resenia

*/

app.get('/receta/:id', (req, res, next) => {
  let id = req.params.id;
  Recetas_resenia.find({ receta: id })
    .populate('receta')
    .populate('usuario')
    .exec((err, recetas_resenias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando recetas reseñas',
          errors: err,
        });
      }

      Recetas_resenia.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_resenias: recetas_resenias,
          total: conteo,
        });
      });
    });
});

/* 
    Obtener todos los recetas_resenia paginado

*/

app.get('/pages/', (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Recetas_resenia.find({})
    .skip(desde)
    .limit(hasta)
    .exec((err, recetas_resenia) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando recetas reseña',
          errors: err,
        });
      }

      Recetas_resenia.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_resenia: recetas_resenia,
          hasta,
          desde,
        });
      });
    });
});
/* 
    Obtener una recetas_resenia por id

*/

app.get('/:id', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Recetas_resenia.findById(id)
    .skip(desde)
    .limit(5)
    .exec((err, recetas_resenias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando la recetas reseña',
          errors: err,
        });
      }

      Recetas_resenia.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_resenias: recetas_resenias,
        });
      });
    });
});

/* 
    Actualizar recetas_resenia
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Recetas_resenia.findById(id, (err, recetas_resenia) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar recetas reseña',
        errors: err,
      });
    }

    if (!recetas_resenia) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar recetas_resenia, recetas reseña con id ' +
          id +
          ' no existe',
        errors: { message: 'No exite un recetas reseña con ese ID' },
      });
    }
    recetas_resenia.usuario = body.usuario;
    recetas_resenia.valoracion = body.valoracion;
    recetas_resenia.receta = body.receta;
    recetas_resenia.fecha = body.fecha;
    recetas_resenia.titulo = body.titulo;
    recetas_resenia.resenia = body.resenia;

    recetas_resenia.save((err, receta_guardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar recetas reseña',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        recetas_resenia: receta_guardado,
      });
    });
  });
});

/* 
    Crear un nuevo recetas_resenia
*/

app.post('/', (req, res) => {
  var body = req.body;

  var recetas_resenia = new Recetas_resenia({
    usuario: body.usuario,
    valoracion: body.valoracion,
    receta: body.receta,
    fecha: body.fecha,
    titulo: body.titulo,
    resenia: body.resenia,
  });

  recetas_resenia.save((err, receta_guardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando recetas reseñas',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      recetas_resenia: receta_guardado,
    });
  });
});

/* 
    Borrar un recetas_resenia por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Recetas_resenia.findByIdAndRemove(id, (err, receta_borrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando recetas reseña',
        errors: err,
      });
    }

    if (!receta_borrado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error borrando recetas_resenia, no existe un recetas reseña con ese ID',
        errors: { message: 'No existe ningun recetas reseña con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      recetas_resenia: receta_borrado,
    });
  });
});

module.exports = app;
