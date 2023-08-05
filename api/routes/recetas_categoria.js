var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var Recetas_categoria = require("../models/recetas_categoria");

// rutas

/* 
    Obtener todos los receta

*/

app.get("/", (req, res, next) => {
  Recetas_categoria.find({}).exec((err, recetas_categoria) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: " categorias categoria",
        errors: err,
      });
    }

    Recetas_categoria.countDocuments({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        recetas_categoria: recetas_categoria,
        total: conteo,
      });
    });
  });
});
/* 
    Obtener todos los receta paginado

*/

app.get("/pages/", (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Recetas_categoria.find({})
    .skip(desde)
    .limit(hasta)
    .exec((err, receta) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando receta categoria",
          errors: err,
        });
      }

      Recetas_categoria.countDocuments({}, (err, conteo) => {
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

app.get("/:id", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Recetas_categoria.findById(id)
    .skip(desde)
    .limit(5)
    .exec((err, recetas_categoria) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando la receta categoria",
          errors: err,
        });
      }

      Recetas_categoria.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          recetas_categoria: recetas_categoria,
        });
      });
    });
});

/* 
    Actualizar receta
*/
app.put("/:id", (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Recetas_categoria.findById(id, (err, receta) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar receta categoria",
        errors: err,
      });
    }

    if (!receta) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al buscar receta, receta con id " + id + " no existe",
        errors: { message: "No exite un receta con ese ID" },
      });
    }
    receta.nombre = body.nombre;

    receta.save((err, receta_categoria_guardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar receta categoria",
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        receta: receta_categoria_guardado,
      });
    });
  });
});

/* 
    Crear un nuevo receta
*/

app.post("/", (req, res) => {
  var body = req.body;

  var receta = new Recetas_categoria({
    nombre: body.nombre,
  });

  receta.save((err, receta_categoria_guardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error guardando registro",
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      receta: receta_categoria_guardado,
    });
  });
});

/* 
    Borrar un receta por el id
*/
app.delete("/:id", (req, res) => {
  var id = req.params.id;

  Recetas_categoria.findByIdAndRemove(id, (err, receta_categoria_borrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error borrando receta categoria",
        errors: err,
      });
    }

    if (!receta_categoria_borrado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          "Error borrando receta categoria, no existe un receta categoria con ese ID",
        errors: { message: "No existe ningun receta con ese ID" },
      });
    }

    return res.status(200).json({
      ok: true,
      receta: receta_categoria_borrado,
    });
  });
});

module.exports = app;
