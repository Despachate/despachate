const express = require('express');

const app = express();

const EPLEADO = require('../models/empleado');

app.get('/', async (req, res, next) => {
  try {
    let query_params = req.query;
    let query = {};
    if (!!query_params.search) {
      query.nombre = new RegExp(query_params.search, 'i');
    }
    let empleados = await EPLEADO.find({ ...query, deleted: false });
    res.status(200).json({
      ok: true,
      empleados: empleados,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error cargando empleados',
      errors: err,
    });
  }
});

app.post('/', async (req, res, next) => {
  let { deleted, ...body } = req.body;
  try {
    let empleado = new EPLEADO(body);
    await empleado.save();
    res.status(200).json({
      ok: true,
      empleado: empleado,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error creando empleado',
      errors: err,
    });
  }
});

app.put('/:id', async (req, res, next) => {
  let id = req.params.id;
  let { deleted, ...body } = req.body;
  try {
    let empleado = await EPLEADO.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      ok: true,
      empleado: empleado,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error actualizando empleado',
      errors: err,
    });
  }
});

app.delete('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    let empleado = await EPLEADO.findByIdAndUpdate(
      id,
      { deleted: true },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      ok: true,
      empleado: empleado,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error eliminando empleado',
      errors: err,
    });
  }
});

module.exports = app;
