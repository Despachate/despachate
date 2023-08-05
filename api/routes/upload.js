var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Departamento = require('../models/departamento');
var Prouducto = require('../models/producto');
var Carrousel = require('../models/carrousel');
var Empaque = require('../models/empaque');
var Donacion = require('../models/donacion');
var Usuario = require('../models/usuario');
var Receta = require('../models/receta');
// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  //tipos de colecciones
  var tiposValidos = [
    'departamentos',
    'productos',
    'carrouseles',
    'exceles',
    'empaques',
    'donaciones',
    'usuarios',
    'pdfs',
    'recetas',
  ];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de coleccion no valido',
      errors: {
        message: 'El tipo de coleccion no se encuentra entre los tipos validos',
      },
    });
  }
  //verifica si seleccionaron archivo
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No selecciono nada',
      errors: { message: 'Debe seleccionar imagenes' },
    });
  }

  //obtener nombre del archivo

  var archivo = req.files.imagen1;
  // console.log(req.files);
  console.log(archivo);
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  //extensiones aceptadas
  var extencionesValidas = [
    'png',
    'jpg',
    'gif',
    'jpeg',
    'PNG',
    'JPG',
    'GIF',
    'JPEG',
    'xlsx',
    'pdf',
    'webp',
    'WEBP',
  ];
  var extensionesImagenes = [
    'png',
    'jpg',
    'gif',
    'jpeg',
    'PNG',
    'JPG',
    'GIF',
    'JPEG',
    'WEBP',
    'webp',
  ];

  if (extencionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extencion no valida',
      errors: {
        message: 'Las extenciones validas son ' + extencionesValidas.join(', '),
      },
    });
  }
  console.log(extensionesImagenes.indexOf(extensionArchivo));
  if (extensionesImagenes.indexOf(extensionArchivo) > 0) {
    console.log(archivo.size);
    if (archivo.size > 300000) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Tamaño de imagen excedido',
        errors: {
          message: 'La imagen debe de pesar maximo 300kb',
        },
      });
    }
  }

  //nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
  //mover archivo a un path especifico
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, (err) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al mover archivo',
        errors: err,
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === 'productos') {
    Prouducto.findById(id, (err, producto) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al consultar usuarios',
          errors: err,
        });
      }
      if (!producto) {
        return res.status(500).json({
          ok: false,
          mensaje: 'No se encontro ningun producto con ese id',
          errors: { message: 'no se encontro ningun producto con el id ' + id },
        });
      }
      var pathViejo = './uploads/productos/' + producto.img;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      producto.img = nombreArchivo;

      producto.save((err, productoActualizado) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar usuarios',
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          mensaje: 'Imagen de producto actualizada',
          producto: productoActualizado,
        });
      });
    });
  }
  if (tipo === 'usuarios') {
    Usuario.findById(id, (err, usuario) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al consultar usuarios',
          errors: err,
        });
      }
      if (!usuario) {
        return res.status(500).json({
          ok: false,
          mensaje: 'No se encontro ningun producto con ese id',
          errors: { message: 'no se encontro ningun producto con el id ' + id },
        });
      }
      var pathViejo = './uploads/productos/' + usuario.img;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      usuario.img = nombreArchivo;

      usuario.save((err, usuarioActualizado) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar usuarios',
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          mensaje: 'Imagen de producto actualizada',
          usuario: usuarioActualizado,
        });
      });
    });
  }
  if (tipo === 'departamentos') {
    Departamento.findById(id, (err, departamento) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al consultar departamentos',
          errors: err,
        });
      }
      if (!departamento) {
        return res.status(500).json({
          ok: false,
          mensaje: 'No se encontro ningun departamento con ese id',
          errors: {
            message: 'no se encontro ningun departamento con el id ' + id,
          },
        });
      }
      var pathViejo = './uploads/departamentos/' + departamento.img;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      departamento.img = nombreArchivo;

      departamento.save((err, departamentoActualizado) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar medicos',
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          mensaje: 'Imagen de departamento actualizada',
          departamento: departamentoActualizado,
        });
      });
    });
  }
  if (tipo === 'carrouseles') {
    Carrousel.findById(id, (err, carrousel) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al consultar carrousel',
          errors: err,
        });
      }
      if (!carrousel) {
        return res.status(500).json({
          ok: false,
          mensaje: 'No se encontro ningun carrousel con ese id',
          errors: {
            message: 'no se encontro ningun carrousel con el id ' + id,
          },
        });
      }
      var pathViejo = './uploads/carrouseles/' + carrousel.img;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      carrousel.img = nombreArchivo;

      carrousel.save((err, carrouselActualizado) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar medicos',
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          mensaje: 'Imagen de carrousel actualizada',
          carrousel: carrouselActualizado,
        });
      });
    });
  }
  if (tipo === 'empaques') {
    Empaque.findById(id, (err, empaque) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al consultar empaque',
          errors: err,
        });
      }
      if (!empaque) {
        return res.status(500).json({
          ok: false,
          mensaje: 'No se encontro ningun empaque con ese id',
          errors: { message: 'no se encontro ningun empaque con el id ' + id },
        });
      }
      var pathViejo = './uploads/carrouseles/' + empaque.img;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      empaque.img = nombreArchivo;

      empaque.save((err, empaqueActualizado) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar medicos',
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          mensaje: 'Imagen de empaque actualizada',
          empaque: empaqueActualizado,
        });
      });
    });
  }
  if (tipo === 'donaciones') {
    Donacion.findById(id, (err, donacion) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al consultar donaciones',
          errors: err,
        });
      }
      if (!donacion) {
        return res.status(500).json({
          ok: false,
          mensaje: 'No se encontro ninguna donación con ese id',
          errors: {
            message: 'no se encontro ninguna donación con el id ' + id,
          },
        });
      }
      var pathViejo = './uploads/donaciones/' + donacion.img;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      donacion.img = nombreArchivo;

      donacion.save((err, donacionActualizado) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar donaciones',
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          mensaje: 'Imagen de donación actualizada',
          donacion: donacionActualizado,
        });
      });
    });
  }
  if (tipo === 'exceles') {
    var path = './uploads/exceles/' + nombreArchivo;
    var XLSX = require('xlsx');
    var workbook = XLSX.readFile(path);
    // var first_sheet_name = workbook.SheetNames[0];
    /* Get worksheet */
    // var worksheet = workbook.Sheets[first_sheet_name];

    // console.log(workbook);
    var wb = [];
    for (const ws of workbook.SheetNames) {
      // console.log(ws);
      wb.push(XLSX.utils.sheet_to_json(workbook.Sheets[ws]));
    }
    res.status(200).json({
      ok: true,
      worksheet: wb,
    });
  }
  if (tipo === 'pdfs') {
    res.status(200).json({
      ok: true,
      nombreArchivo,
    });
  }
  if (tipo === 'recetas') {
    Receta.findById(id, (err, receta) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al consultar receta',
          errors: err,
        });
      }
      if (!receta) {
        return res.status(500).json({
          ok: false,
          mensaje: 'No se encontro ningun receta con ese id',
          errors: { message: 'no se encontro ningun receta con el id ' + id },
        });
      }
      var pathViejo = './uploads/recetas/' + receta.img;

      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      receta.img = nombreArchivo;

      receta.save((err, recetaActualizada) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar receta',
            errors: err,
          });
        }
        res.status(200).json({
          ok: true,
          mensaje: 'Imagen de receta actualizada',
          receta: recetaActualizada,
        });
      });
    });
  }
}

module.exports = app;
