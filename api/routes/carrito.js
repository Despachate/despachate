var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Carrito = require('../models/carrito');
var Producto = require('../models/producto');

// rutas

/* 
    Obtener todos los detalle carrito

*/

app.get('/', (req, res, next) => {
  Carrito.find({})
    .populate('pedido')
    .populate('producto')
    .exec((err, carrito) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando detalle Carrito',
          errors: err,
        });
      }

      Carrito.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          carrito: carrito,
          conteo,
        });
      });
    });
});
/* 
    Obtener todos los detalle carrito

*/

app.get('/detalleUsuario/:id', (req, res, next) => {
  var id = req.params.id;
  Carrito.find({ usuario: id })
    .populate('usuario')
    .populate('producto')
    .populate('paquete')
    .exec((err, carrito) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando detalle Carrito',
          errors: err,
        });
      }

      Carrito.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          carrito: carrito,
          conteo,
        });
      });
    });
});
/* 
    Obtener todos los detalle carrito paginado

*/

app.post('/remove48hrs/', async (req, res) => {
  try {
    var dates = [];
    var dates48hrs = [];
    var oks = [];
    for await (const carrito of Carrito.find({})) {
      let date = new Date();
      dates.push(date);
      let dateCarrito_48hrs = new Date(carrito.fecha);
      console.log(carrito.fecha);
      console.log(dateCarrito_48hrs);

      dateCarrito_48hrs = new Date(
        dateCarrito_48hrs.setDate(dateCarrito_48hrs.getDate() + 30)
      );
      dates48hrs.push(dateCarrito_48hrs);
      if (dateCarrito_48hrs.getTime() < date.getTime()) {
        ok = await Carrito.findByIdAndRemove(carrito._id);
        oks.push(ok);
      }
    }
    res.status(200).json({
      ok: true,
      oks,
      dates,
      dates48hrs,
    });
  } catch (err) {
    // throw err;
    console.log(err);
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

  Carrito.findById(id)
    .populate('usuario')
    .populate('producto')
    .populate('paquete')
    .exec((err, carrito) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando el detalle Carrito',
          errors: err,
        });
      }

      Carrito.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          carrito: carrito,
        });
      });
    });
});

/* 
    Actualizar detalle Carrito 
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Carrito.findById(id, (err, carrito) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar detalle Carrito',
        errors: err,
      });
    }

    if (!carrito) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar detalle Carrito, detalle Carrito con id ' +
          id +
          ' no existe',
        errors: { message: 'No exite un detalle Carrito con ese ID' },
      });
    }

    carrito.cantidad = body.cantidad;
    carrito.total = body.total;
    carrito.usuario = body.usuario;
    carrito.producto = body.producto;
    carrito.paquete = body.paquete;
    carrito.oferta = body.oferta;
    carrito.cupon = body.cupon;
    carrito.fecha = body.fecha;

    carrito.save((err, carritoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar detalle Carrito',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        carrito: carritoGuardado,
      });
    });
  });
});

/* 
    Crear un nuevo detalle Carrito
*/

app.post('/', (req, res) => {
  var body = req.body;

  var carrito = new Carrito({
    cantidad: body.cantidad,
    total: body.total,
    usuario: body.usuario,
    producto: body.producto,
    paquete: body.paquete,
    oferta: body.oferta,
    cupon: body.cupon,
    fecha: body.fecha,
  });

  carrito.save((err, carritoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando detalle Carritos',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      carrito: carritoGuardado,
      detalleCarritoToken: req.carrito,
    });
  });
});

/* 
    Borrar un detalle Carrito por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Carrito.findByIdAndRemove(id, (err, detalleCarritoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando detalle Carrito',
        errors: err,
      });
    }

    if (!detalleCarritoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error borrando detalle Carrito, no existe un detalle Carrito con ese ID',
        errors: { message: 'No existe ningun detalle Carrito con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      carrito: detalleCarritoBorrado,
    });
  });
});

module.exports = app;
