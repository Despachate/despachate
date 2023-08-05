const express = require('express');
const app = express();
const EMPRESA = require('../models/empresa');

app.get('/', async (req, res, next) => {
  try {
    let query_params = req.query;
    let query = {};
    if (!!query_params.search) {
      query.nombre = new RegExp(query_params.search, 'i');
    }
    let empresas = await EMPRESA.find({ ...query, deleted: false });
    res.status(200).json({
      ok: true,
      empresas: empresas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error cargando empresas',
      errors: err,
    });
  }
});

app.post('/', async (req, res, next) => {
  let { deleted, ...body } = req.body;
  try {
    let empresa = new EMPRESA(body);
    await empresa.save();
    res.status(200).json({
      ok: true,
      empresa: empresa,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error creando empresa',
      errors: err,
    });
  }
});

app.put('/:id', async (req, res, next) => {
  let id = req.params.id;
  let { deleted, ...body } = req.body;
  try {
    let empresa = await EMPRESA.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      ok: true,
      empresa: empresa,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error actualizando empresa',
      errors: err,
    });
  }
});

app.delete('/:id', async (req, res, next) => {
  let id = req.params.id;
  try {
    let empresa = await EMPRESA.findByIdAndUpdate(id, {
      deleted: true,
    });
    res.status(200).json({
      ok: true,
      empresa: empresa,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error eliminando empresa',
      errors: err,
    });
  }
});

module.exports = app;
