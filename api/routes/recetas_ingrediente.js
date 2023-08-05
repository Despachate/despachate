var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Recetas_ingrediente = require('../models/recetas_ingrediente');

// rutas

/* 
    Obtener todos los recetas_ingrediente

*/

app.get('/byreceta/:id', (req, res, next) => {
  let id = req.params.id;
  Recetas_ingrediente.find({ receta: id })
    .populate('receta')
    .populate('producto')
    .populate('paquete')
    .exec((err, recetas_ingredientes) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando recetas_ingredientes',
          errors: err,
        });
      }

      Recetas_ingrediente.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_ingredientes: recetas_ingredientes,
          total: conteo,
        });
      });
    });
});
/* 
    Obtener todos los recetas_ingrediente paginado

*/

app.get('/pages/', (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Recetas_ingrediente.find({})
    .skip(desde)
    .limit(hasta)
    .exec((err, recetas_ingrediente) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando recetas_ingrediente',
          errors: err,
        });
      }

      Recetas_ingrediente.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_ingrediente: recetas_ingrediente,
          hasta,
          desde,
        });
      });
    });
});
/* 
    Obtener una recetas_ingrediente por id

*/

app.get('/:id', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Recetas_ingrediente.findById(id)
    .skip(desde)
    .limit(5)
    .exec((err, recetas_ingredientes) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando la recetas_ingrediente',
          errors: err,
        });
      }

      Recetas_ingrediente.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_ingredientes: recetas_ingredientes,
        });
      });
    });
});

/* 
    Actualizar recetas_ingrediente
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Recetas_ingrediente.findById(id, (err, recetas_ingrediente) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar recetas_ingrediente',
        errors: err,
      });
    }

    if (!recetas_ingrediente) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar recetas_ingrediente, recetas_ingrediente con id ' +
          id +
          ' no existe',
        errors: { message: 'No exite un recetas_ingrediente con ese ID' },
      });
    }
    recetas_ingrediente.ingrediente = body.ingrediente;
    recetas_ingrediente.cantidad_medida = body.cantidad_medida;
    recetas_ingrediente.receta = body.receta;
    recetas_ingrediente.producto = body.producto;
    recetas_ingrediente.paquete = body.paquete;

    recetas_ingrediente.save((err, receta_guardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar recetas_ingrediente',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        recetas_ingrediente: receta_guardado,
      });
    });
  });
});

/* 
    Crear un nuevo recetas_ingrediente
*/

app.post('/', (req, res) => {
  var body = req.body;

  var recetas_ingrediente = new Recetas_ingrediente({
    ingrediente: body.ingrediente,
    cantidad_medida: body.cantidad_medida,
    receta: body.receta,
    producto: body.producto,
    paquete: body.paquete,
  });

  recetas_ingrediente.save((err, receta_guardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando recetas_ingredientes',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      recetas_ingrediente: receta_guardado,
    });
  });
});

/* 
    Borrar un recetas_ingrediente por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Recetas_ingrediente.findByIdAndRemove(id, (err, receta_borrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando recetas_ingrediente',
        errors: err,
      });
    }

    if (!receta_borrado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error borrando recetas_ingrediente, no existe un recetas_ingrediente con ese ID',
        errors: { message: 'No existe ningun recetas_ingrediente con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      recetas_ingrediente: receta_borrado,
    });
  });
});

module.exports = app;
