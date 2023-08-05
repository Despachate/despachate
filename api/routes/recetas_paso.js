var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Receta = require('../models/recetas_paso');

// rutas

/* 
    Obtener todos los recetas_paso

*/

app.get('/byreceta/:id', (req, res, next) => {
  let id = req.params.id;
  Receta.find({ receta: id })
    .populate('categoria')
    .exec((err, recetas_pasos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando recetas_pasos',
          errors: err,
        });
      }

      Receta.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_pasos: recetas_pasos,
          total: conteo,
        });
      });
    });
});
/* 
    Obtener todos los recetas_paso paginado

*/

app.get('/pages/', (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Receta.find({})
    .skip(desde)
    .limit(hasta)
    .exec((err, recetas_paso) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando recetas_paso',
          errors: err,
        });
      }

      Receta.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_paso: recetas_paso,
          hasta,
          desde,
        });
      });
    });
});
/* 
    Obtener una recetas_paso por id

*/

app.get('/:id', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Receta.findById(id)
    .skip(desde)
    .limit(5)
    .exec((err, recetas_pasos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando la recetas_paso',
          errors: err,
        });
      }

      Receta.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_pasos: recetas_pasos,
        });
      });
    });
});

/* 
    Actualizar recetas_paso
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Receta.findById(id, (err, recetas_paso) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar recetas_paso',
        errors: err,
      });
    }

    if (!recetas_paso) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar recetas_paso, recetas_paso con id ' +
          id +
          ' no existe',
        errors: { message: 'No exite un recetas_paso con ese ID' },
      });
    }
    recetas_paso.receta = body.receta;
    recetas_paso.paso = body.paso;
    recetas_paso.descripcion = body.descripcion;

    recetas_paso.save((err, receta_guardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar recetas_paso',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        recetas_paso: receta_guardado,
      });
    });
  });
});

/* 
    Crear un nuevo recetas_paso
*/

app.post('/', (req, res) => {
  var body = req.body;

  var recetas_paso = new Receta({
    receta: body.receta,
    paso: body.paso,
    descripcion: body.descripcion,
  });

  recetas_paso.save((err, receta_guardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando recetas_pasos',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      recetas_paso: receta_guardado,
    });
  });
});

/* 
    Borrar un recetas_paso por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Receta.findByIdAndRemove(id, (err, receta_borrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando recetas_paso',
        errors: err,
      });
    }

    if (!receta_borrado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error borrando recetas_paso, no existe un recetas_paso con ese ID',
        errors: { message: 'No existe ningun recetas_paso con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      recetas_paso: receta_borrado,
    });
  });
});

module.exports = app;
