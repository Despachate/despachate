var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Subcategoria = require('../models/subcategoria');

// rutas

/* 
    Obtener todos los subcategoria 

*/

app.get('/', (req, res, next) => {
  let query_params = req.query;
  let query = {};
  if (!!query_params.search) {
    query.nombre = new RegExp(query_params.search, 'i');
  }
  Subcategoria.find(query, 'nombre categoria')
    .populate('categoria')
    .exec((err, subcategorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando subcategoria',
          errors: err,
        });
      }

      Subcategoria.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          subcategorias: subcategorias,
          total: conteo,
        });
      });
    });
});

/* 
    Obtener todos los subcategoria paginados

*/

app.get('/pages/', (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Subcategoria.find({}, 'nombre categoria')
    .skip(desde)
    .limit(hasta)
    .exec((err, subcategoria) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando subcategoria',
          errors: err,
        });
      }

      Subcategoria.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          subcategoria: subcategoria,
          hasta,
          desde,
        });
      });
    });
});
/* 
    Obtener una categoria por id

*/

app.get('/:id', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Subcategoria.findById(id, 'nombre categoria')
    .skip(desde)
    .limit(5)
    .exec((err, subcategorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando la subcategoria',
          errors: err,
        });
      }

      Subcategoria.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          subcategorias: subcategorias,
        });
      });
    });
});
/* 
    Obtener una subcategoria por categoria

*/

app.get('/scatxcat/:id', (req, res, next) => {
  var id = req.params.id;

  Subcategoria.find({ categoria: id }).exec((err, subcategorias) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando subcategorias',
        errors: err,
      });
    }

    Subcategoria.countDocuments({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        subcategorias: subcategorias,
        total: conteo,
      });
    });
  });
});

/* 
    Actualizar subcategoria
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Subcategoria.findById(id, (err, subcategoria) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar subcategoria',
        errors: err,
      });
    }

    if (!subcategoria) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar subcategoria, subcategoria con id ' +
          id +
          ' no existe',
        errors: { message: 'No exite un subcategoria con ese ID' },
      });
    }
    subcategoria.nombre = body.nombre;
    subcategoria.categoria = body.categoria;

    subcategoria.save((err, subcategoriaGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar subcategoria',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        subcategoria: subcategoriaGuardado,
      });
    });
  });
});

/* 
    Crear una nueva subcategoria
*/

app.post('/', (req, res) => {
  var body = req.body;

  var subcategoria = new Subcategoria({
    nombre: body.nombre,
    categoria: body.categoria,
  });

  subcategoria.save((err, subcategoriaGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando subcategorias',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      subcategoria: subcategoriaGuardado,
      subcategoriaToken: req.subcategoria,
    });
  });
});

/* 
    Borrar una subcategoria por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Subcategoria.findByIdAndRemove(id, (err, subcategoriaBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando subcategoria',
        errors: err,
      });
    }

    if (!subcategoriaBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error borrando subcategoria, no existe un subcategoria con ese ID',
        errors: { message: 'No existe ningun subcategoria con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      subcategoria: subcategoriaBorrado,
    });
  });
});

module.exports = app;
