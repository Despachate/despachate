var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fs = require('fs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Producto = require('../models/producto');
var Departamento = require('../models/departamento');
var Categoria = require('../models/categoria');
var Subcategoria = require('../models/subcategoria');
var Favorito = require('../models/favorito');

var Inventario = require('../models/inventario');
const producto = require('../models/producto');
// rutas

/* 
    Obtener todos los productos

*/

app.get('/', (req, res, next) => {
  Producto.find({})
    .populate('departamento')
    .populate('categoria')
    .populate('subcategoria')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando productos',
          errors: err,
        });
      }

      Producto.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          productos: productos,
          conteo,
        });
      });
    });
});

/* 
    Obtener todos los productos paginado y con filtros y busqueda

*/

app.get('/paginado/', async (req, res, next) => {
  try {
    let rango_inf = Number(req.query.rango_inf);
    let rango_sup = Number(req.query.rango_sup);
    let departamento = req.query.departamento;
    let categoria = req.query.categoria;
    let subcategoria = req.query.subcategoria;
    let pagina = Number(req.query.pagina);
    let limit = Number(req.query.limit);
    let search = req.query.search;
    let order = req.query.order;
    let user = req.query.user;
    let order_direction = req.query.order_direction;
    let estiloVida = req.query.estiloVida;

    let condicionInv = {};
    let condicionProd = {};
    let inv = [];
    ///FILTER RANGE OF PRICES///
    if (rango_inf && rango_sup) {
      //     console.log('rango_inf', rango_inf);
      //     console.log('rango_sup', rango_sup);
      condicionInv = { precio: { $gte: rango_inf, $lt: rango_sup } };
      let inventarios = await Inventario.find(condicionInv).distinct(
        'producto'
      );
      condicionProd = { _id: { $in: inventarios } };
    }
    ///FILTER BY DEPARTAMENTO, CATEGORIA, SUBCATEGORIA///

    if (user) {
      productos_ids = await Favorito.find({ usuario: user }).distinct(
        'producto'
      );
      condicionProd = { ...condicionProd, _id: { $in: productos_ids } };
    }

    condicionProd = departamento
      ? { ...condicionProd, departamento }
      : condicionProd;
    condicionProd = categoria ? { ...condicionProd, categoria } : condicionProd;
    condicionProd = subcategoria
      ? { ...condicionProd, subcategoria }
      : condicionProd;
    condicionProd = estiloVida
      ? { ...condicionProd, estiloVida }
      : condicionProd;

    if (search) {
      var regex = new RegExp(search, 'gi');
      condicionProd = {
        ...condicionProd,
        $or: [{ nombre: regex }, { etiqueta: regex }],
        status: { $nin: ['Oculto', 'Agotado'] }
      };
    }
    condicionProd = {
      ...condicionProd,
      status: { $nin: ['Oculto', 'Agotado'] }
    };
    let sort = {};

    if (order) {
      if (order === 'abc') {
        if (order_direction === 'ASC') {
          sort = { nombre: 1 };
        } else {
          sort = { nombre: -1 };
        }
      } else if (order === 'ultimos') {
        if (order_direction === 'ASC') {
          sort = { _id: 1 };
        } else {
          sort = { _id: -1 };
        }
      } else if (order === 'precio') {
        if (order_direction === 'ASC') {
          sort = { precio_ord: 1 };
        } else {
          sort = { precio_ord: -1 };
        }
      }
    }

    pagina = pagina ? Number(pagina) : 0;
    limit = limit ? Number(limit) : 5;

    let total = await Producto.find({
      status: { $ne: 'Oculto' },
      ...condicionProd,
    }).countDocuments();

    let total_paginas =
      Math.round(total / limit) > 0 ? Math.ceil(total / limit) : 0;
    let pagina_actual = Number(pagina);
    let pagina_siguiente =
      pagina_actual < total_paginas ? pagina_actual + 1 : total_paginas;
    let pagina_anterior = pagina_actual > 0 ? pagina_actual - 1 : 0;

    let productos = await Producto.find(condicionProd)
      .populate('departamento')
      .populate('categoria')
      .populate('subcategoria')
      .sort(sort)
      .skip(limit * pagina)
      .limit(limit);

    res.status(200).json({
      ok: true,
      skip: limit * pagina,
      productos: productos,
      pagina_actual,
      pagina_siguiente,
      pagina_anterior,
      total_paginas,
      total,
      condicionProd,
      inv,
    });
  } catch (err) {
    // throw err;
    return res.status(500).json({
      ok: false,
      mensaje: 'Error cargando productos',
      errors: err,
    });
  }
});

/** Agregarles el primer precio de su paquete */

app.get('/precio/', async (req, res, next) => {
  try {
    for await (const producto of Producto.find({})) {
      let producto_update = await Producto.findById(producto._id);
      let paquete = await Inventario.findOne({ producto: producto._id });
      producto_update.precio_ord = !!paquete ? paquete.precio : null;
      await producto_update.save();
    }
    return res.status(200).json({
      ok: true,
      productos: await Producto.find({}),
    });
  } catch (error) {
    // throw err;
    console.error(error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error cargando productos',
      errors: error,
    });
  }
});

/* 
    Obtener todos los productos compilado con inventarios

*/

app.get('/compilado/', async (req, res, next) => {
  try {
    // var productos = [];
    // for await (const producto of Producto.find({})
    //   .populate('departamento')
    //   .populate('categoria')
    //   .populate('subcategoria')) {
    //   let inventarios = [];
    //   for await (const inventario of Inventario.find({
    //     producto: producto._doc._id,
    //   })) {
    //     inventarios.push(inventario._doc);
    //   }
    //   productos.push({ ...producto._doc, inventarios });
    // }
    // Producto.countDocuments({}, (err, conteo) => {
    //   res.status(200).json({
    //     ok: true,
    //     productos: productos,
    //     conteo,
    //   });
    // });
    var productos = [];
    const limit = Number(req.query.limit) || 15;
    const pagina = Number(req.query.pagina) || 1;
    const skip = limit * (pagina - 1);
    const order = req.query.order || 'nombre';
    const order_direction = Number(req.query.order_direction) || 1;
    const search = req.query.search || '';
    let total_registros = await Producto.countDocuments({});

    let total_paginas =
      Math.round(total_registros / limit) > 0
        ? Math.ceil(total_registros / limit)
        : 0;

    for await (const producto of Producto.find({
      $or: [
        { nombre: { $regex: search, $options: 'i' } },
        { etiqueta: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ],
    })
      .limit(limit)
      .skip(skip)
      .sort({ [order]: order_direction })
      .populate('departamento')
      .populate('categoria')
      .populate('subcategoria')) {
      let inventarios = [];
      let prod = { ...producto._doc };
      prod.departamento =
        prod.departamento != null
          ? prod.departamento.nombre
          : 'Sin departamento';
      prod.categoria =
        prod.categoria != null ? prod.categoria.nombre : 'Sin categoria';
      prod.subcategoria =
        prod.subcategoria != null
          ? prod.subcategoria.nombre
          : 'Sin subcategoria';

      delete prod.__v;
      for await (const inventario of Inventario.find({
        producto: producto._doc._id,
      })) {
        inventarios.push(inventario._doc);
      }
      productos.push({ ...producto._doc, inventarios });
    }

    return res.status(200).json({
      ok: true,
      productos: productos,
      total_registros,
      total_paginas,
      pagina,
      skip,
      limit,
      order,
      order_direction,
      search,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error cargando productos',
      errors: error,
    });
  }
});
app.get('/compiladov2/', async (req, res, next) => {
  try {
    var productos = [];
    for await (const producto of Producto.find({})
      .populate('departamento')
      .populate('categoria')
      .populate('subcategoria')) {
      let inventarios = [];
      let prod = { ...producto._doc };
      prod.departamento =
        prod.departamento != null
          ? prod.departamento.nombre
          : 'Sin departamento';
      prod.categoria =
        prod.categoria != null ? prod.categoria.nombre : 'Sin categoria';
      prod.subcategoria =
        prod.subcategoria != null
          ? prod.subcategoria.nombre
          : 'Sin subcategoria';

      delete prod.__v;
      for await (const inventario of Inventario.find({
        producto: producto._doc._id,
      })) {
        inventarios.push(inventario._doc);
      }
      let i = 0;
      for (const inventario of inventarios) {
        i++;
        for (const key in inventario) {
          if (inventario.hasOwnProperty(key)) {
            const element = inventario[key];
            prod[key + i] = element;
          }
        }
        delete prod['__v' + i];
      }
      productos.push({ ...prod });
    }
    Producto.countDocuments({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        productos: productos,
        conteo,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error cargando productos',
      errors: error,
    });
  }
});
/* 
    Obtener todos los productos por estilo de vida

*/
app.get('/estiloVida/:estiloVida', (req, res, next) => {
  var estilo = req.params.estiloVida;
  Producto.find({ estiloVida: estilo })
    .populate('departamento')
    .populate('categoria')
    .populate('subcategoria')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando productos por estilo de vida',
          errors: err,
        });
      }

      if (productos.length > 0) {
        Producto.countDocuments({}, (err, conteo) => {
          res.status(200).json({
            ok: true,
            productos: productos,
            conteo,
          });
        });
      } else {
        Departamento.find({
          nombre: { $regex: new RegExp('^' + estilo.toLowerCase(), 'i') },
        })
          .distinct('_id')
          .exec((err, departamentos) => {
            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando departamentos',
                errors: err,
              });
            }
            Producto.find({ departamento: { $in: departamentos } })
              .populate('departamento')
              .populate('categoria')
              .populate('subcategoria')
              .exec((err, productos) => {
                if (err) {
                  return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando productos por departamento',
                    errors: err,
                  });
                }

                Producto.countDocuments({}, (err, conteo) => {
                  res.status(200).json({
                    ok: true,
                    productos: productos,
                    conteo,
                  });
                });
              });
          });
      }
    });
});
/* 
    Obtener todos los productos por subcategoria
     


*/
app.get('/prodXsubcat/:idSubcat', (req, res, next) => {
  var id = req.params.idSubcat;
  Producto.find({ subcategoria: id })
    .populate('departamento')
    .populate('categoria')
    .populate('subcategoria')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando productos por subcategoria',
          errors: err,
        });
      }

      Producto.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          productos: productos,
          conteo,
        });
      });
    });
});
/* 
    Obtener todos los productos

*/

app.get('/nuevoBolsa/', (req, res, next) => {
  Producto.find({})
    .sort({ $natural: -1 })
    .limit(7)
    .populate('departamento')
    .populate('categoria')
    .populate('subcategoria')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando productos',
          errors: err,
        });
      }

      Producto.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          productos: productos,
          conteo,
        });
      });
    });
});
/* 
    Obtener todos los productos

*/

app.get('/recomendadoParaTi/', (req, res, next) => {
  Producto.find({
    sku: {
      $in: [
        'AR006367',
        'AR006368',
        'AR004538',
        'AR004661',
        'AR004667',
        'AR004452',
        'AR004343',
        'AR004348',
        'AR004400',
        'AR004796',
        'AR004463',
        'AR004369',
      ],
    },
  })
    .sort({ $natural: -1 })
    .populate('departamento')
    .populate('categoria')
    .populate('subcategoria')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando productos',
          errors: err,
        });
      }

      Producto.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          productos: productos,
          conteo,
        });
      });
    });
});

app.get('/recomendadoFavoritos/', (req, res, next) => {
  Producto.find({
    es_favorito: {
      $in: [ 'si'],
    },
  })
    .sort({ $natural: -1 })
    .populate('departamento')
    .populate('categoria')
    .populate('subcategoria')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando productos',
          errors: err,
        });
      }

      Producto.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          productos: productos,
          conteo,
        });
      });
    });
});
/* 
    Obtener todos los productos y cambiar etiquetas
*/
app.get('/replace/', async (req, res) => {
  let success = [];
  let errors = [];
  let i = 0;
  for await (const producto of Producto.find({})
    .populate('departamento')
    .populate('categoria')
    .populate('subcategoria')) {
    i++;
    try {
      let prod = await Producto.findById(producto.id);
      if (i == 1) {
        console.log(prod, producto);
      }
      prod.etiqueta = !prod.etiqueta.includes(producto.nombre)
        ? prod.etiqueta + ', ' + producto.nombre
        : prod.etiqueta;
      prod.etiqueta = !prod.etiqueta.includes(producto.departamento.nombre)
        ? prod.etiqueta + ', ' + producto.departamento.nombre
        : prod.etiqueta;
      prod.etiqueta = !prod.etiqueta.includes(producto.categoria.nombre)
        ? prod.etiqueta + ', ' + producto.categoria.nombre
        : prod.etiqueta;
      prod.etiqueta = !prod.etiqueta.includes(producto.subcategoria.nombre)
        ? prod.etiqueta + ', ' + producto.subcategoria.nombre
        : prod.etiqueta;
      let newetiqueta = [];

      for (const etiqueta of prod.etiqueta.split(', ')) {
        let result = '';
        if (etiqueta.includes('á')) {
          result = etiqueta.replace(/á/gi, 'a');
        } else if (etiqueta.includes('é')) {
          result = etiqueta.replace(/é/gi, 'e');
        } else if (etiqueta.includes('í')) {
          result = etiqueta.replace(/í/gi, 'i');
        } else if (etiqueta.includes('ó')) {
          result = etiqueta.replace(/ó/gi, 'o');
        } else if (etiqueta.includes('ú')) {
          result = etiqueta.replace(/ú/gi, 'u');
        }
        if (result != '') {
          newetiqueta.push(result);
        }
      }

      for (const etiqueta of prod.etiqueta.split(', ')) {
        let plurales = [];
        for (const plural of etiqueta.split(' ')) {
          let singular = '';
          singular = plural.trim().replace(/as$/, 'a');
          singular = singular.trim().replace(/es$/, 'e');
          singular = singular.trim().replace(/is$/, 'i');
          singular = singular.trim().replace(/os$/, 'o');
          singular = singular.trim().replace(/us$/, 'u');
          if (i == 1) {
            console.log(singular);
          }
          if (singular == 'y' && plurales.length > 0) {
            plurales.push(singular);
          }
          if (singular != plural) {
            plurales.push(singular);
          }
        }
        if (plurales.length > 0) {
          newetiqueta.push(plurales.join(' '));
        }
      }

      prod.etiqueta =
        newetiqueta.length > 0
          ? prod.etiqueta + ', ' + newetiqueta.join(', ')
          : prod.etiqueta;

      prod.etiqueta = prod.etiqueta
        .split(', ')
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ');

      let result = await prod.save();
      success.push(result);
    } catch (error) {
      errors.push({
        ok: false,
        mensaje: 'Error cargando productos',
        errors: error,
      });
      // return res.status(500).json();
    }
  }
  console.log(errors[0]);
  res.status(200).json({
    ok: true,
    mensaje: 'Actualizacion completada',
    errors,
    success,
  });
});

app.get('/restoreEtiquetas/', async (req, res) => {
  let success = [];
  let errors = [];
  let productos = require('../config/etiquetas.json');
  for (const producto of productos) {
    try {
      let prod = await Producto.findById(producto._id);
      prod.etiqueta = producto.etiqueta;
      let prod_guardado = await prod.save();
      success.push(prod_guardado);
    } catch (error) {
      errors.push({
        ok: false,
        mensaje: 'Error cargando productos',
        errors: error,
      });
    }
  }
  res.status(200).json({
    ok: true,
    mensaje: 'Actualizacion completada',
    errors,
    success,
  });
});
/* 
        Obtener todos los productos que coincidan con el término de busqueda

    */
app.get('/buscar/:termino', (req, res, next) => {
  var termino = req.params.termino;
  var regex = new RegExp(termino, 'gi');
  Producto.find({ $or: [{ nombre: regex }, { etiqueta: regex }] })
    .populate('departamento')
    .populate('categoria')
    .populate('subcategoria')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando productos por término de busqueda',
          errors: err,
        });
      }
      res.status(200).json({
        ok: true,
        productos: productos,
      });
    });
});
/* 
        Obtener todos los productos que coincidan con el término de busqueda

    */
app.get('/buscadorHint/', (req, res, next) => {
  var termino = req.query.termino;
  var regex = new RegExp('^' + termino, 'i');
  Producto.find({ nombre: regex })
    .select('nombre  -_id')
    .sort({ nombre: -1 })
    .limit(10)
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando productos por término de busqueda',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        productos: productos,
      });
    });
});
/* 
    Obtener todos los productos paginado

*/

app.get('/pages/', (req, res, next) => {
  const page = Number(req.query.page) || 0;
  const limit = Number(req.query.limit) || 5;
  const search = req.query.search || '';
  const sort = req.query.sort || 'nombre';
  const order = Number(req.query.order) || 1;

  let find = {};
  if (!!search) {
    find = { $or: [{ nombre: { $regex: search, $options: 'i' } }] };
  }

  let query = Producto.find(find);

  query
    .sort([[sort, order]])
    .skip(page * limit)
    .limit(limit);

  query.exec((err, productos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando productos',
        errors: err,
      });
    }

    Producto.countDocuments({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        productos: productos,
        conteo,
        total_pages: Math.ceil(conteo / limit),
        limit,
        page,
      });
    });
  });
});
app.get('/excel/', (req, res) => {
  var XLSX = require('xlsx');
  var workbook = XLSX.readFile('./uploads/ejemplo.xlsx');
  var first_sheet_name = workbook.SheetNames[0];
  /* Get worksheet */
  var worksheet = workbook.Sheets[first_sheet_name];

  console.log(workbook);
  var wb = [];
  for (const ws of workbook.SheetNames) {
    console.log(ws);
    wb.push(XLSX.utils.sheet_to_json(workbook.Sheets[ws]));
  }
  res.status(400).json({
    ok: true,
    worksheet: wb,
  });
  /* DO SOMETHING WITH workbook HERE */
});
/* 
    Obtener un producto por id

*/

app.get('/:id', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Producto.findById(id)
    .populate('departamento')
    .populate('categoria')
    .populate('subcategoria')
    .exec((err, producto) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando el producto',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        producto: producto,
      });
    });
});

/* 
    Actualizar producto
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Producto.findById(id, (err, producto) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar producto',
        errors: err,
      });
    }

    if (!producto) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar producto, producto con id ' + id + ' no existe',
        errors: { message: 'No exite un producto con ese ID' },
      });
    }

    producto.nombre = body.nombre;
    producto.descripcion = body.descripcion;
    producto.etiqueta = body.etiqueta;
    producto.departamento = body.departamento;
    producto.categoria = body.categoria;
    producto.subcategoria = body.subcategoria;
    producto.sku = body.sku;
    producto.estiloVida = body.estiloVida;
    producto.resumenBreve = body.resumenBreve;
    producto.imagen = body.imagen;
    producto.peso = body.peso;
    producto.medida = body.medida;
    producto.status = body.status;

    producto.save((err, productoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar producto',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        producto: productoGuardado,
      });
    });
  });
});

/* 
    Crear un nuevo producto
*/

app.post('/', (req, res) => {
  var body = req.body;

  var producto = new Producto({
    nombre: body.nombre,
    descripcion: body.descripcion,
    etiqueta: body.etiqueta,
    departamento: body.departamento,
    categoria: body.categoria,
    subcategoria: body.subcategoria,
    sku: body.sku,
    estiloVida: body.estiloVida,
    resumenBreve: body.resumenBreve,
    img: body.img,
    peso: body.peso,
    medida: body.medida,
    status: body.status,
  });

  producto.save((err, productoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error guardando producto',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      producto: productoGuardado,
    });
  });
});

/* 
  Duplicar producto
*/

app.post('/duplicar/:id', async (req, res, next) => {
  try {
    // Duplicar datos generales del producto
    let producto = await Producto.findById(req.params.id);
    let producto_duplicado = new Producto({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      etiqueta: producto.etiqueta,
      departamento: producto.departamento,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      estiloVida: producto.estiloVida,
      sku: producto.sku + '_duplicado',
      resumenBreve: producto.resumenBreve,
      img: producto.img,
      peso: producto.peso,
      medida: producto.medida,
      status: producto.status,
      precio_ord: producto.precio_ord,
    });
    let producto_guardado = await producto_duplicado.save();
    // Obtener todos los inventarios del producto a duplicar
    let inventarios = await Inventario.find({ producto: req.params.id });
    // Duplicar inventarios
    let inventarios_guardados = [];
    for (const inventario of inventarios) {
      let inventario_duplicado = new Inventario({
        producto: producto_guardado._id,
        paquete: inventario.paquete,
        producto: inventario.producto,
        precio: inventario.precio,
        stock: inventario.stock,
      });

      inventarios_guardados = [
        await inventario_duplicado.save(),
        ...inventarios_guardados,
      ];
    }

    return res.status(200).json({
      ok: true,
      producto: producto_guardado,
      inventarios: inventarios_guardados,
    });
  } catch (error) {
    // throw err;
    console.error(error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error duplicando producto',
      errors: error,
    });
  }
});

/* Ocultar producto */
app.post('/ocultar/:id', async (req, res) => {
  try {
    let producto = await Producto.findById(req.params.id);
    producto.status = 'Oculto';
    let producto_guardado = await producto.save();
    return res.status(200).json({
      ok: true,
      producto: producto_guardado,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error ocultando producto',
      errors: error,
    });
  }
});


app.post('/adm_favoritos/:id', async (req, res) => {
  try {
    let producto = await Producto.findById(req.params.id);
    
    if(producto.es_favorito == 'no') {
      producto.es_favorito = 'si';
    } else {
      producto.es_favorito = 'no';
    }
    
    let producto_guardado = await producto.save();
    return res.status(200).json({
      ok: true,
      producto: producto_guardado,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error ocultando producto',
      errors: error,
    });
  }
});

/* 
    Crear un nuevo producto
*/

app.post('/excel/', (req, res) => {
  var body = req.body;
  var productos = body;

  guardarProductos(productos, res);
});
async function guardarProductos(productos, res) {
  var productosGuardados = [];
  const errors = [];
  var i = 0;
  for (const producto of productos) {
    var prod = new Producto({ ...producto, stock: 0 });
    var campos = await obtenerCampos(
      producto.departamento,
      producto.categoria,
      producto.subcategoria
    );
    prod.categoria = campos.categoria !== null ? campos.categoria._id : null;
    prod.subcategoria =
      campos.subcategoria !== null ? campos.subcategoria._id : null;
    prod.departamento =
      campos.departamento !== null ? campos.departamento._id : null;
    var save = await prod.save((err, productoGuardado) => {
      i++;
      if (err) {
        errors.push({ err, prod, producto });
      } else {
        productosGuardados.push(productoGuardado);
        var inventario = new Inventario({
          precio: producto.precio,
          paquete: producto.peso + '' + producto.medida,
          stock: producto.stock,
          producto: productoGuardado._id,
        });
        inventario.save((err, inventarioGuardado) => {});
      }

      if (i === productos.length) {
        if (errors.length > 0) {
          return res.status(400).json({
            ok: false,
            errors: errors,
            productos: productosGuardados,
          });
        } else {
          return res.status(200).json({
            ok: true,
            errors: errors,
            productos: productosGuardados,
          });
        }
      }
    });
    //console.log(errors);
    //console.log(productosGuardados);
  }
}

async function obtenerCampos(depto, cat, scat) {
  const departamento = await Departamento.findOne(
    { nombre: depto },
    (err, departamento) => {
      if (err) {
        return null;
      }
      departamento;
    }
  );
  const categoria = await Categoria.findOne(
    { nombre: cat },
    (err, categoria) => {
      if (err) {
        return null;
      }
      categoria;
    }
  );
  const subcategoria = await Subcategoria.findOne(
    { nombre: scat },
    (err, subcategoria) => {
      if (err) {
        return null;
      }
      subcategoria;
    }
  );
  return { departamento, categoria, subcategoria };
}

/* 
    Borrar un producto por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Producto.findByIdAndRemove(id, (err, productoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando producto',
        errors: err,
      });
    }

    if (!productoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error borrando producto, no existe un producto con ese ID',
        errors: { message: 'No existe ningun producto con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      producto: productoBorrado,
    });
  });
});

module.exports = app;
