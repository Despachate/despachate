const express = require('express');

const app = express();

const HISTORIAL_CUPONES = require('../models/historialCupones');

app.get('/', async (req, res, next) => {
  try {
    const QUERY = req.query;
    let query = { deleted: false };
    if (QUERY.fecha_inicio)
      query.createdAt = { $gte: new Date(QUERY.fecha_inicio) };
    if (QUERY.fecha_fin) query.createdAt = { $lte: new Date(QUERY.fecha_fin) };
    if (QUERY.empresa) query.empresa = QUERY.empresa;

    let historialCupones = await HISTORIAL_CUPONES.find(query).populate(
      'usuario cupon pedido'
    );
    res.status(200).json({
      ok: true,
      historialCupones: historialCupones,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error cargando historialCupones',
      errors: err,
    });
  }
});

app.post('/', async (req, res, next) => {
  let { deleted, ...body } = req.body;
  try {
    let historialCupones = new HISTORIAL_CUPONES(body);
    await historialCupones.save();
    res.status(200).json({
      ok: true,
      historialCupones: historialCupones,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error creando historialCupones',
      errors: err,
    });
  }
});

app.put('/:id', async (req, res, next) => {
  let id = req.params.id;
  let { deleted, ...body } = req.body;
  try {
    let historialCupones = await HISTORIAL_CUPONES.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      ok: true,
      historialCupones: historialCupones,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error actualizando historialCupones',
      errors: err,
    });
  }
});

app.delete('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    let historialCupones = await HISTORIAL_CUPONES.findByIdAndUpdate(
      id,
      {
        deleted: true,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      ok: true,
      historialCupones: historialCupones,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error eliminando historialCupones',
      errors: err,
    });
  }
});

module.exports = app;
