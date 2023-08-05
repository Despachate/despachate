var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var ListaComprasDetalle = require('../models/listaComprasDetalle');
var Producto = require('../models/producto');

// rutas

/* 
    Obtener todos los detalle listacomra

*/

app.get('/', (req, res, next) => {
    ListaComprasDetalle.find({})
    .populate('pedido')
    .populate('producto')
    .exec((err, listacomra) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando detalle de listas',
          errors: err,
        });
      }

      ListaComprasDetalle.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          listacomra: listacomra,
          conteo,
        });
      });
    });
});
/* 
    Obtener todos los detalle listacomra

*/

app.get('/detalleUsuario/:id', (req, res, next) => {
  var id = req.params.id;
  ListaComprasDetalle.find({ usuario: id })
    .populate('usuario')
    .populate('producto')
    .populate('paquete')
    .exec((err, listacomra) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando detalle de lista',
          errors: err,
        });
      }

      ListaComprasDetalle.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          listacomra: listacomra,
          conteo,
        });
      });
    });
});
/* 
    Obtener todos los detalle listacomra paginado

*/

app.get('/:id', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  ListaComprasDetalle.findById(id)
    .populate('usuario')
    .populate('producto')
    .populate('paquete')
    .exec((err, listacomra) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando el detalle de lista',
          errors: err,
        });
      }

      ListaComprasDetalle.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          listacomra: listacomra,
        });
      });
    });
});

/* 
    Actualizar detalle listacomra 
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  ListaComprasDetalle.findById(id, (err, listacomra) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar detalle de lista',
        errors: err,
      });
    }

    if (!listacomra) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar detalle listacomra, detalle de lista con id ' +
          id +
          ' no existe',
        errors: { message: 'No exite un detalle de lista con ese ID' },
      });
    }

    listacomra.cantidad = body.cantidad;
    listacomra.total = body.total;
    listacomra.usuario = body.usuario;
    listacomra.lista_compras = body.lista_compras;
    listacomra.producto = body.producto;
    listacomra.paquete = body.paquete;
    listacomra.oferta = body.oferta;
    listacomra.cupon = body.cupon;
    listacomra.fecha = body.fecha;

    listacomra.save((err, listacomraGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar detalle de lista',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        listacomra: listacomraGuardado,
      });
    });
  });
});

/* 
    Crear un nuevo detalle listacomra
*/

app.post('/', (req, res) => {
  var body = req.body;

  var listacomra = new ListaComprasDetalle({
    cantidad: body.cantidad,
    total: body.total,
    usuario: body.usuario,
    producto: body.producto,
    paquete: body.paquete,
    oferta: body.oferta,
    cupon: body.cupon,
    fecha: body.fecha,
  });

  listacomra.save((err, listacomraGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando detalle de lista',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      listacomra: listacomraGuardado,
      detallelistacomraToken: req.listacomra,
    });
  });
});

/* 
    Borrar un detalle listacomra por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  ListaComprasDetalle.findByIdAndRemove(id, (err, detallelistacomraBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando detalle de lista',
        errors: err,
      });
    }

    if (!detallelistacomraBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error borrando detalle de lista, no existe un detalle de lista con ese ID',
        errors: { message: 'No existe ningun detalle de lista con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      listacomra: detallelistacomraBorrado,
    });
  });
});

module.exports = app;
