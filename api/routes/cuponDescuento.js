const express = require('express');

const app = express();

const cuponDescuento = require('../models/cuponDescuento');

/**
 * @description Obtiene todos los carrouseles
 *
 *  */
app.get('/', async (req, res, next) => {
  try {
    const PARAMS = req.query;
    let query = { deleted: false };

    if (PARAMS.producto) {
      // query.producto = true;
      query.$or = [{ productos: { $in: [PARAMS.producto] }, producto: true }];
      if (PARAMS.categoria) {
        // query.categoria = true;
        // query.categorias = { $in: [PARAMS.categoria] };
        query.$or = [
          ...query.$or,
          { categorias: { $in: [PARAMS.categoria] }, categoria: true },
        ];
      }
      if (PARAMS.subcategoria) {
        // query.subcategoria = true;
        // query.subcategorias = { $in: [PARAMS.subcategoria] };
        query.$or = [
          ...query.$or,
          { subcategorias: { $in: [PARAMS.subcategoria] }, subcategoria: true },
        ];
      }
      if (PARAMS.departamento) {
        // query.departamento = true;
        // query.departamentos = { $in: [PARAMS.departamento] };
        query.$or = [
          ...query.$or,
          { departamentos: { $in: [PARAMS.departamento] }, departamento: true },
        ];
      }
    }

    if (PARAMS.codigo) {
      query.codigo = PARAMS.codigo;
    }

    let cupones = await cuponDescuento
      .find(query)
      .populate(
        'productos categorias subcategorias departamentos empresas usuarios'
      );

    res.status(200).json({
      ok: true,
      cupones: cupones,
      query,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error cargando cupones',
      errors: err,
    });
  }
});

app.post('/', async (req, res, next) => {
  let { deleted, ...body } = req.body;
  try {
    let cupon = new cuponDescuento(body);
    await cupon.save();
    res.status(200).json({
      ok: true,
      cupon: cupon,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error creando cupon',
      errors: err,
    });
  }
});

app.put('/:id', async (req, res, next) => {
  let id = req.params.id;
  let { deleted, ...body } = req.body;
  try {
    let cupon = await cuponDescuento.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      ok: true,
      cupon: cupon,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error actualizando cupon',
      errors: err,
    });
  }
});

app.delete('/:id', async (req, res, next) => {
  let id = req.params.id;
  try {
    let cupon = await cuponDescuento.findByIdAndUpdate(id, {
      deleted: true,
    });
    res.status(200).json({
      ok: true,
      cupon: cupon,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      mensaje: 'Error borrando cupon',
      errors: err,
    });
  }
});

module.exports = app;
