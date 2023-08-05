var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var Recetas_favorito = require('../models/recetas_favorito');

var app = express();

/**
 * Obtener recetas_favorito por id
 */
app.get('/recetas_favorito/:id', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Recetas_favorito.findById(id, (err, recetas_favorito) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando favoritos',
        errors: err,
      });
    }

    Recetas_favorito.count({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        recetas_favorito: recetas_favorito,
        total: conteo,
      });
    });
  });
});

/**
 * Obtener recetas_favorito usuario
 */
app.get('/receta_usuario/:usuario', (req, res, next) => {
  var usuario = req.params.usuario;

  let peticion = Recetas_favorito.find({ usuario });
  req.query.limit && peticion.limit(Number(req.query.limit));

  peticion.populate('receta');
  peticion.populate('usuario');

  peticion.exec((err, recetas_favorito) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando favoritos',
        errors: err,
      });
    }
    if (!recetas_favorito) {
      return res.status(200).json({
        ok: false,
        mensaje: 'No se encontro ninguna coincidencia',
        errors: { message: 'No hay coincidencias' },
      });
    }
    res.status(200).json({
      ok: true,
      recetas_favorito: recetas_favorito,
    });
  });
});
/**
 * Obtener recetas_favorito por receta y usuario
 */
app.get('/receta/:receta/:usuario', (req, res, next) => {
  var receta = req.params.receta;
  var usuario = req.params.usuario;

  Recetas_favorito.findOne({ receta, usuario }).exec(
    (err, recetas_favorito) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando favoritos',
          errors: err,
        });
      }
      if (!recetas_favorito) {
        return res.status(200).json({
          ok: false,
          mensaje: 'No se encontro ninguna coincidencia',
          errors: { message: 'No hay coincidencias' },
        });
      }
      res.status(200).json({
        ok: true,
        recetas_favorito: recetas_favorito,
      });
    }
  );
});
/* 
    Obtener los productos favoritos por id receta

*/
app.get('/recetaFavorito', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var arreglo = req.query.arreglo;
  console.log('arreglo ', arreglo);
  Recetas_favorito.find({ receta: { $in: arreglo } })
    .distinct('receta')
    .exec((err, recetas_favorito) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando el receta recetas_favorito',
          errors: err,
        });
      }
      console.log(recetas_favorito);
      Recetas_favorito.find({ receta: { $in: recetas_favorito } })
        .populate('receta')
        .exec((err, favoritos) => {
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error cargando los favoritos',
              errors: err,
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
  var receta = req.params.id;

  Recetas_favorito.find({ receta })
    .populate('receta')
    .exec((err, favoritos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando favoritos',
          errors: err,
        });
      }

      Recetas_favorito.count({ receta }, (err, conteo) => {
        res.status(200).json({
          ok: true,
          favoritos: favoritos,
          total: conteo,
        });
      });
    });
});
/**
 * Verificar si un receta ya fue agregado a favoritos
 */
app.get('/isFavorito/:idUsu/:idRec', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var idUsuario = req.params.idUsu;
  var idProducto = req.params.idRec;

  Recetas_favorito.findOne({ usuario: idUsuario, receta: idProducto }).exec(
    (err, favorito) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando favoritos',
          errors: err,
        });
      }
      Recetas_favorito.count({ usuario: idUsuario }, (err, conteo) => {
        res.status(200).json({
          ok: true,
          favorito,
        });
      });
    }
  );
});
/**
 * Actualizar recetas_favorito
 */

app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Recetas_favorito.findById(id, (err, recetas_favorito) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar recetas_favorito',
        errors: err,
      });
    }

    if (!recetas_favorito) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar recetas_favorito, recetas_favorito con ID ' +
          id +
          ' no existe',
        errors: { message: 'No exite un recetas_favorito con ese ID' },
      });
    }

    // info envio
    recetas_favorito.usuario = body.usuario;

    recetas_favorito.receta = body.receta;

    recetas_favorito.save((err, favoritoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar recetas_favorito',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        recetas_favorito: favoritoGuardado,
      });
    });
  });
});

/**
 * Crear recetas_favorito
 */

app.post('/', (req, res) => {
  var body = req.body;

  if (Object.entries(body).length > 0) {
    var recetas_favorito = new Recetas_favorito({
      usuario: body.usuario,
      receta: body.receta,
    });

    recetas_favorito.save((err, favoritoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al guardar recetas_favorito',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        recetas_favorito: favoritoGuardado,
      });
    });
  } else {
    return res.status(400).json({
      ok: false,
      mensaje: 'No se envio informacion para guardar',
      errors: { message: 'No hay informacion para guardar' },
    });
  }
});

/**
 * Borrar recetas_favorito por id
 */

app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Recetas_favorito.findByIdAndRemove(id, (err, favoritoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando recetas_favorito',
        errors: err,
      });
    }

    if (!favoritoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error borrando recetas_favorito, no existe recetas_favorito con ese ID',
        errors: { message: 'No existe recetas_favorito con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      recetas_favorito: favoritoBorrado,
    });
  });
});

module.exports = app;
