var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Receta = require('../models/receta');
var Recetas_favorito = require('../models/recetas_favorito');

// rutas

/* 
    Obtener todos los receta

*/

app.get('/', (req, res, next) => {
  Receta.find({})
    .populate('categoria')
    .exec((err, recetas) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando recetas',
          errors: err,
        });
      }

      Receta.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas: recetas,
          total: conteo,
        });
      });
    });
});
/* 
    Obtener todos los receta paginado

*/

app.get('/pages/', (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Receta.find({})
    .skip(desde)
    .limit(hasta)
    .exec((err, receta) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando receta',
          errors: err,
        });
      }

      Receta.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          receta: receta,
          hasta,
          desde,
        });
      });
    });
});
/* 
    Obtener una receta por id

*/

app.get('/paginado/', async (req, res, next) => {
  try {
    let categoria = req.query.categoria;
    let search = req.query.search;
    let pagina = req.query.pagina;
    let limit = req.query.limit;
    let user = req.query.user;
    let condicionRec = {};

    ///FILTER BY DEPARTAMENTO, CATEGORIA, SUBCATEGORIA///
    condicionRec = categoria ? { ...condicionRec, categoria } : condicionRec;

    if (search) {
      var regex = new RegExp(search, 'gi');
      condicionRec = {
        ...condicionRec,
        $or: [{ nombre: regex }, { etiquetas: regex }],
      };
    }

    let recetas_ids;
    if (user) {
      recetas_ids = await Recetas_favorito.find({ usuario: user }).distinct(
        'receta'
      );
      condicionRec = { ...condicionRec, _id: { $in: recetas_ids } };
    }

    pagina = pagina ? Number(pagina) : 0;
    limit = limit ? Number(limit) : 5;

    let total = await Receta.find(condicionRec).countDocuments();

    let total_paginas =
      Math.round(total / limit) > 0 ? Math.ceil(total / limit) : 0;
    let pagina_actual = Number(pagina);
    let pagina_siguiente = 0;
    if (total_paginas > 1) {
      pagina_siguiente =
        pagina_actual < total_paginas ? pagina_actual + 1 : total_paginas;
    } else {
      pagina_siguiente = 0;
    }
    let pagina_anterior = pagina_actual > 0 ? pagina_actual - 1 : 0;

    let recetas = await Receta.find(condicionRec)
      .populate('categoria')
      .skip(limit * pagina)
      .limit(limit);

    res.status(200).json({
      ok: true,
      skip: limit * pagina,
      recetas: recetas,
      pagina_actual,
      pagina_siguiente,
      pagina_anterior,
      total_paginas,
      total,
      condicionRec,
    });
  } catch (err) {
    // throw err;
    console.error(err);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error cargando productos',
      errors: err,
    });
  }
});

app.get('/:id', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Receta.findById(id)
    .skip(desde)
    .limit(5)
    .exec((err, recetas) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando la receta',
          errors: err,
        });
      }

      Receta.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas: recetas,
        });
      });
    });
});

/* 
    Actualizar receta
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Receta.findById(id, (err, receta) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar receta',
        errors: err,
      });
    }

    if (!receta) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar receta, receta con id ' + id + ' no existe',
        errors: { message: 'No exite un receta con ese ID' },
      });
    }
    receta.nombre = body.nombre;
    receta.duracion = body.duracion;
    receta.code = body.code;
    receta.etiquetas = body.etiquetas;
    receta.descripcion = body.descripcion;
    receta.listo_en = body.listo_en;
    receta.preparacion = body.preparacion;
    receta.cocinar = body.cocinar;
    receta.porciones = body.porciones;
    receta.categoria = body.categoria;
    receta.img = body.img;

    receta.save((err, receta_guardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar receta',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        receta: receta_guardado,
      });
    });
  });
});

/* 
    Crear un nuevo receta
*/

app.post('/', (req, res) => {
  var body = req.body;

  var receta = new Receta({
    nombre: body.nombre,
    duracion: body.duracion,
    code: body.code,
    etiquetas: body.etiquetas,
    descripcion: body.descripcion,
    listo_en: body.listo_en,
    preparacion: body.preparacion,
    cocinar: body.cocinar,
    porciones: body.porciones,
    categoria: body.categoria,
    img: body.img,
  });

  receta.save((err, receta_guardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando recetas',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      receta: receta_guardado,
    });
  });
});

/* 
    Borrar un receta por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Receta.findByIdAndRemove(id, (err, receta_borrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando receta',
        errors: err,
      });
    }

    if (!receta_borrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error borrando receta, no existe un receta con ese ID',
        errors: { message: 'No existe ningun receta con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      receta: receta_borrado,
    });
  });
});

module.exports = app;
