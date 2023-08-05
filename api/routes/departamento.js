var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Departamento = require('../models/departamento');
var Categoria = require('../models/categoria');
var Subcategoria = require('../models/subcategoria');

// rutas

/* 
    Obtener todos los departamentos

*/

app.get('/', (req, res, next) => {
  let query_params = req.query;
  let query = {};
  if (!!query_params.search) {
    query.nombre = new RegExp(query_params.search, 'i');
  }
  Departamento.find(query, 'img nombre order').exec((err, departamentos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando departamentos',
        errors: err,
      });
    }

    Departamento.countDocuments({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        departamentos: departamentos,
        total: conteo,
      });
    });
  });
});

/* 
    Obtener todos los departamentos paginado

*/

app.get('/pages/', (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Departamento.find({}, 'img nombre')
    .skip(desde)
    .limit(hasta)
    .exec((err, departamentos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando departamentos',
          errors: err,
        });
      }

      Departamento.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          departamentos: departamentos,
          hasta,
          desde,
        });
      });
    });
});

app.get('/menuByDepartamentos/', async (req, res, next) => {
  try {
    let departamentos = [];
    for await (const departamento of Departamento.find({}).sort({ order: 1 })) {
      let categorias = [];
      for await (const categoria of Categoria.find({
        departamento: departamento._doc._id,
      })) {
        let subcategorias = [];
        for await (const subcategoria of Subcategoria.find({
          categoria: categoria._doc._id,
        })) {
          subcategorias.push({ ...subcategoria._doc });
        }
        categorias.push({ ...categoria._doc, subcategorias });
      }
      departamentos.push({ ...departamento._doc, categorias });
    }
    res.status(200).json({
      ok: true,
      menu: departamentos,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error cargando menu',
      errors: JSON.stringify(err),
    });
  }
});
app.get('/menuByDepartamento/:id', async (req, res, next) => {
  let id = req.params.id;
  try {
    let departamento = await Departamento.findById(id);
    let categorias = [];
    for await (const categoria of Categoria.find({
      departamento: id,
    })) {
      let subcategorias = [];
      for await (const subcategoria of Subcategoria.find({
        categoria: categoria._doc._id,
      })) {
        subcategorias.push({ ...subcategoria._doc });
      }
      categorias.push({ ...categoria._doc, subcategorias });
    }
    departamento = { ...departamento._doc, categorias };

    res.status(200).json({
      ok: true,
      departamento: departamento,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error cargando categoria',
      errors: err,
    });
  }
});
/* 
    Obtener un departamento por id

*/

app.get('/:id', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Departamento.findById(id, 'img nombre')
    .skip(desde)
    .limit(5)
    .exec((err, departamentos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando el departamento',
          errors: err,
        });
      }

      Departamento.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          departamentos: departamentos,
        });
      });
    });
});

/* 
    Actualizar departamento
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Departamento.findById(id, (err, departamento) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar departamento',
        errors: err,
      });
    }

    if (!departamento) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar departamento, departamento con id ' +
          id +
          ' no existe',
        errors: { message: 'No exite un departamento con ese ID' },
      });
    }
    departamento.imagen = body.imagen;
    departamento.nombre = body.nombre;
    departamento.order = body.order;

    departamento.save((err, departamentoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar departamento',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        departamento: departamentoGuardado,
      });
    });
  });
});

/* 
    Crear un nuevo departamento
*/

app.post('/', (req, res) => {
  var body = req.body;

  var departamento = new Departamento({
    img: body.img,
    nombre: body.nombre,
    order: body.order,
  });

  departamento.save((err, departamentoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando departamentos',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      departamento: departamentoGuardado,
      departamentoToken: req.departamento,
    });
  });
});

/* 
    Borrar un departamento por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Departamento.findByIdAndRemove(id, (err, departamentoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando departamento',
        errors: err,
      });
    }

    if (!departamentoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error borrando departamento, no existe un departamento con ese ID',
        errors: { message: 'No existe ningun departamento con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      departamento: departamentoBorrado,
    });
  });
});

module.exports = app;
