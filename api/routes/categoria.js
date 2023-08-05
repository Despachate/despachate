var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Categoria = require('../models/categoria');

// rutas

/* 
    Obtener todos los categoria

*/

app.get('/', (req, res, next) => {
  let query_params = req.query;
  let query = {};
  if (!!query_params.search) {
    query.nombre = new RegExp(query_params.search, 'i');
  }

  Categoria.find(query, 'nombre departamento')
    .populate('departamento')
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando categorias',
          errors: err,
        });
      }

      Categoria.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          categorias: categorias,
          total: conteo,
          query,
        });
      });
    });
});
/* 
    Obtener todos los categoria paginado

*/

app.get('/pages/', (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Categoria.find({}, 'nombre departamento')
    .skip(desde)
    .limit(hasta)
    .exec((err, categoria) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando categoria',
          errors: err,
        });
      }

      Categoria.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          categoria: categoria,
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

  Categoria.findById(id, 'nombre departamento')
    .skip(desde)
    .limit(5)
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando la categoria',
          errors: err,
        });
      }

      Categoria.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          categorias: categorias,
        });
      });
    });
});
/* 
    Obtener una categoria por departamento

*/

app.get('/catxdpto/:id', (req, res, next) => {
  var id = req.params.id;

  Categoria.find({ departamento: id }).exec((err, categorias) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando categorias',
        errors: err,
      });
    }

    Categoria.countDocuments({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        categorias: categorias,
        total: conteo,
      });
    });
  });
});

/* 
    Actualizar categoria
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Categoria.findById(id, (err, categoria) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar categoria',
        errors: err,
      });
    }

    if (!categoria) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar categoria, categoria con id ' + id + ' no existe',
        errors: { message: 'No exite un categoria con ese ID' },
      });
    }
    categoria.nombre = body.nombre;
    categoria.departamento = body.departamento;

    categoria.save((err, categoriaGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar categoria',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        categoria: categoriaGuardado,
      });
    });
  });
});

/* 
    Crear un nuevo categoria
*/

app.post('/', (req, res) => {
  var body = req.body;

  var categoria = new Categoria({
    nombre: body.nombre,
    departamento: body.departamento,
  });

  categoria.save((err, categoriaGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando categorias',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      categoria: categoriaGuardado,
      categoriaToken: req.categoria,
    });
  });
});

/* 
    Borrar un categoria por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando categoria',
        errors: err,
      });
    }

    if (!categoriaBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error borrando categoria, no existe un categoria con ese ID',
        errors: { message: 'No existe ningun categoria con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      categoria: categoriaBorrado,
    });
  });
});

module.exports = app;
