var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var Pedido = require("../models/pedido");
var Usuario = require("../models/usuario");
var Direccion = require("../models/direccion");
var DetallePedido = require("../models/detalleCarrito");
var HistorialCupones = require("../models/historialCupones");
var Cupon = require("../models/cuponDescuento");
var Producto = require("../models/producto");
var Inventario = require("../models/inventario");
const path = require("path");
var handlebars = require("handlebars");
var Mailing = require("../models/mailing");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var fs = require("fs");
const { registerDecorator } = require("handlebars");

// rutas

/* 
    Obtener todos los pedidos

*/

app.get("/", (req, res, next) => {
  Pedido.find({})
    .populate("direccion")
    .populate("cupon")
    .populate("usuario")
    .populate("empaque")
    .exec((err, pedidos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando pedidos",
          errors: err,
        });
      }

      Pedido.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          pedidos: pedidos,
          conteo,
        });
      });
    });
});
/* 
    Obtener todos los pedidos paginados

*/

app.get("/pages/", (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Pedido.find({})
    .skip(desde)
    .limit(hasta)
    .exec((err, pedidos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando pedidos",
          errors: err,
        });
      }

      Pedido.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          pedidos: pedidos,
          conteo,
          hasta,
          desde,
        });
      });
    });
});
app.get("/ventas/", async (req, res, next) => {
  let pagina = req.query.pagina || 1;
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  let search = req.query.search || "";
  desde = Number(desde);
  hasta = Number(hasta);
  let order_by = req.query.order_by || "fecha_compra";
  let order_direction = req.query.order_direction || -1;
  var regex = new RegExp(search, "gi");

  let usuarios = await Usuario.distinct("_id", {
    $or: [{ nombre: regex }],
  });
  let direcciones = await Direccion.distinct("_id", {
    $or: [
      { nombre: regex },
      { apellido: regex },
      { direccion: regex },
      { calle: regex },
      { numeroInterior: regex },
      { referencia: regex },
    ],
  });

  let total_registros = await Pedido.countDocuments({
    $or: [
      { formaContacto: regex },
      { metodoPago: regex },
      { estatusPago: regex },
      { estatusEnvio: regex },
      { usuario: { $in: usuarios } },
      { direccion: { $in: direcciones } },
    ],
  });
  let total_paginas = Math.ceil(total_registros / hasta);
  let pagina_actual = Math.ceil(desde / hasta) + 1;
  let paginas = [];
  for (let index = 1; index <= total_paginas; index++) {
    paginas.push(index);
  }

  var pedidos = [];

  for await (const pedido of Pedido.find({
    $or: [
      { formaContacto: regex },
      { metodoPago: regex },
      { estatusPago: regex },
      { estatusEnvio: regex },
      { usuario: { $in: usuarios } },
      { direccion: { $in: direcciones } },
    ],
  })
    .populate("direccion")
    .populate("cupon")
    .populate("usuario")
    .populate("empaque")
    .skip((pagina - 1) * hasta)
    .limit(hasta)
    .sort({ [order_by]: order_direction })) {
    let detalles = [];
    for await (const detalle of DetallePedido.find({ pedido: pedido._doc._id })
      .sort({ _id: -1 })
      .populate("producto")
      .populate("paquete")) {
      detalles.push(detalle._doc);
    }
    pedidos.push({ ...pedido._doc, productos: detalles });
  }
  res.status(200).json({
    ok: true,
    pedidos,
    total_registros,
    total_paginas,
    pagina,
    paginas,
  });
});
/* 
    Obtener pedido por id

*/

app.get("/pedidoXUsr/:id", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;
  console.log("id", id);

  Pedido.find({ usuario: id })
    .populate("direccion")
    .populate("cupon")
    .populate("usuario")
    .populate("empaque")
    .sort({ _id: -1 })
    .exec((err, pedido) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando el pedido",
          errors: err,
        });
      }

      Pedido.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          pedidos: pedido,
        });
      });
    });
});

// Actualizar saldo de pedidos pagodos sin saldo agregado

app.get("/checkSaldoAgregado", async (req, res) => {
  const pedidos = await Pedido.find({
    saldo_comprado: { $gt: 0 },
    saldo_agregado: false,
    estatusPago: "Pagado",
  });

  if (pedidos.length === 0) {
    return res.status(200).json({ msg: "No hay pedidos para actualizar" });
  }

  let usuarios_actualizados = [];

  for (const pedido of pedidos) {
    const usuario = await Usuario.findOne({ email: pedido.correo_saldo });

    if (!usuario) {
      const usuarioNuevo = await Usuario.findByIdAndUpdate(
        pedido.usuario,
        {
          $inc: { saldo: pedido.saldo_comprado },
        },
        { new: true }
      );
      console.log("usuarioNuevo", usuarioNuevo);

      usuarios_actualizados.push(usuarioNuevo);
    } else {
      const usuarioNuevo = await Usuario.findByIdAndUpdate(
        usuario._id,
        {
          $inc: { saldo: pedido.saldo_comprado },
        },
        { new: true }
      );

      usuarios_actualizados.push(usuarioNuevo);
    }
  }

  const pedidos_actualizados = await Pedido.updateMany(
    {
      saldo_comprado: { $gt: 0 },
      saldo_agregado: false,
      estatusPago: "Pagado",
    },
    { saldo_agregado: true }
  );

  return res.status(200).json({ pedidos_actualizados, usuarios_actualizados });
});

/* 
    Obtener pedido por id

*/

app.get("/:id", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  var id = req.params.id;

  Pedido.findById(id)
    .populate("direccion")
    .populate("cupon")
    .populate("usuario")
    .populate("empaque")
    .exec((err, pedido) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando el pedido",
          errors: err,
        });
      }

      Pedido.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          pedido: pedido,
        });
      });
    });
});

/* 
    Actualizar pedidos 
*/
app.put("/:id", (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Pedido.findById(id, (err, pedidos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar pedido",
        errors: err,
      });
    }

    if (!pedidos) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al buscar pedido, pedido con id " + id + " no existe",
        errors: { message: "No exite un pedido con ese ID" },
      });
    }

    pedidos.fechaCompra = body.fechaCompra;
    pedidos.fechaRecepcion = body.fechaRecepcion;
    pedidos.horarioRecepcion = body.horarioRecepcion;
    pedidos.precioTotal = body.precioTotal;
    pedidos.cantidadTotal = body.cantidadTotal;
    pedidos.metodoPago = body.metodoPago;
    pedidos.referenciaPago = body.referenciaPago;
    pedidos.contacto = body.contacto;
    pedidos.formaContacto = body.formaContacto;
    pedidos.estatusPago = body.estatusPago;
    pedidos.estatusEnvio = body.estatusEnvio;
    pedidos.direccion = body.direccion;
    pedidos.cupon = body.cupon;
    pedidos.usuario = body.usuario;
    pedidos.empaque = body.empaque;
    pedidos.cantidadEmpaque = body.cantidadEmpaque;
    pedidos.donacion = body.donacion;
    pedidos.comentario = body.comentario;
    pedidos.RFC = body.RFC;

    pedidos.save(async (err, pedidosGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar pedidos",
          errors: err,
        });
      }

      try {
        if (
          pedidosGuardado.estatusPago == "Pagado" &&
          pedidosGuardado.saldo_usado > 0
        ) {
          // decrement saldo a usuario

          await Usuario.findByIdAndUpdate(pedidosGuardado.usuario, {
            $inc: { saldo: -pedidosGuardado.saldo_usado },
          });
          await Pedido.findByIdAndUpdate(
            pedidosGuardado._id,
            {
              $set: {
                saldo_descontado: true,
              },
            },
            { new: true }
          );
        }
        if (
          pedidosGuardado.estatusPago == "Pagado" &&
          pedidosGuardado.saldo_comprado > 0
        ) {
          await Usuario.findByIdAndUpdate(pedidosGuardado.usuario, {
            $inc: { saldo: pedidosGuardado.saldo_comprado },
          });
          await Pedido.findByIdAndUpdate(
            pedidosGuardado._id,
            {
              $set: {
                saldo_agregado: true,
              },
            },
            { new: true }
          );
        }
      } catch (err) {}

      res.status(200).json({
        ok: true,
        pedidos: pedidosGuardado,
      });
    });
  });
});

/*  Actualizar estatus de pago */
app.put("/estatusPago/:id", (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Pedido.findById(id, (err, pedidos) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar pedido",
        errors: err,
      });
    }

    if (!pedidos) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al buscar pedido, pedido con id " + id + " no existe",
        errors: { message: "No exite un pedido con ese ID" },
      });
    }

    pedidos.estatusPago = body.estatusPago;
    pedidos.save(async (err, pedidosGuardado) => {
      try {
        if (
          pedidosGuardado.estatusPago == "Pagado" &&
          pedidosGuardado.saldo_usado > 0
        ) {
          // decrement saldo a usuario

          await Usuario.findByIdAndUpdate(pedidosGuardado.usuario, {
            $inc: { saldo: -pedidosGuardado.saldo_usado },
          });
          await Pedido.findByIdAndUpdate(
            pedidosGuardado._id,
            {
              $set: {
                saldo_descontado: true,
              },
            },
            { new: true }
          );
        }
        if (
          pedidosGuardado.estatusPago == "Pagado" &&
          pedidosGuardado.saldo_comprado > 0
        ) {
          if (!!pedidosGuardado.correo_saldo) {
            let usuario = await Usuario.findOne({
              email: pedidosGuardado.correo_saldo,
            });
            if (!!usuario) {
              await Usuario.findByIdAndUpdate(usuario._id, {
                $inc: { saldo: pedidosGuardado.saldo_comprado },
              });
            } else {
              await Usuario.findByIdAndUpdate(pedidosGuardado.usuario, {
                $inc: { saldo: pedidosGuardado.saldo_comprado },
              });
            }
          } else {
            await Usuario.findByIdAndUpdate(pedidosGuardado.usuario, {
              $inc: { saldo: pedidosGuardado.saldo_comprado },
            });
          }

          await Pedido.findByIdAndUpdate(
            pedidosGuardado._id,
            {
              $set: {
                saldo_agregado: true,
              },
            },
            { new: true }
          );
        }
      } catch (err) {}

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar pedidos",
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        pedidos: pedidosGuardado,
      });
    });
  });
});

/* 
    Crear un nuevo pedido
*/

app.post("/", (req, res) => {
  var body = req.body;

  var pedidos = new Pedido({
    fechaCompra: body.fechaCompra,
    fechaRecepcion: body.fechaRecepcion,
    horarioRecepcion: body.horarioRecepcion,
    precioTotal: body.precioTotal,
    cantidadTotal: body.cantidadTotal,
    metodoPago: body.metodoPago,
    referenciaPago: body.referenciaPago,
    contacto: body.contacto,
    formaContacto: body.formaContacto,
    estatusPago: body.estatusPago,
    estatusEnvio: body.estatusEnvio,
    direccion: body.direccion,
    cupon: body.cupon,
    usuario: body.usuario,
    empaque: body.empaque,
    cantidadEmpaque: body.cantidadEmpaque,
    donacion: body.donacion,
    saldo_comprado: !!body.saldo_comprado ? body.saldo_comprado : 0,
    correo_saldo: !!body.correo_saldo ? body.correo_saldo : 0,
    saldo_usado: !!body.saldo_usado ? body.saldo_usado : 0,
    saldo_descontado: !!body.saldo_descontado ? body.saldo_descontado : false,
    saldo_agregado: !!body.saldo_agregado ? body.saldo_agregado : false,
    RFC: body.RFC,
    comentario: body.comentario,
  });

  pedidos.save(async (err, pedidoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error cargando pedidos",
        errors: err,
      });
    }
    try {
      if (
        pedidoGuardado.estatusPago == "Pagado" &&
        pedidoGuardado.saldo_usado > 0
      ) {
        // decrement saldo a usuario

        await Usuario.findByIdAndUpdate(pedidoGuardado.usuario, {
          $inc: { saldo: -pedidoGuardado.saldo_usado },
        });
        await Pedido.findByIdAndUpdate(
          pedidoGuardado._id,
          {
            $set: {
              saldo_descontado: true,
            },
          },
          { new: true }
        );
      }
      if (
        pedidoGuardado.estatusPago == "Pagado" &&
        pedidoGuardado.saldo_comprado > 0
      ) {
        if (!!pedidoGuardado.correo_saldo) {
          let usuario = await Usuario.findOne({
            email: pedidoGuardado.correo_saldo,
          });
          if (!!usuario) {
            await Usuario.findByIdAndUpdate(usuario._id, {
              $inc: { saldo: pedidoGuardado.saldo_comprado },
            });
          } else {
            await Usuario.findByIdAndUpdate(pedidoGuardado.usuario, {
              $inc: { saldo: pedidoGuardado.saldo_comprado },
            });
          }
        } else {
          await Usuario.findByIdAndUpdate(pedidoGuardado.usuario, {
            $inc: { saldo: pedidoGuardado.saldo_comprado },
          });
        }

        await Pedido.findByIdAndUpdate(
          pedidoGuardado._id,
          {
            $set: {
              saldo_agregado: true,
            },
          },
          { new: true }
        );
      }
    } catch (err) {}

    res.status(201).json({
      ok: true,
      pedido: pedidoGuardado,
    });
  });
});

function sendVentaMail() {
  var transporter = nodemailer.createTransport(
    smtpTransport({
      host: "localhost",
      port: 465,
      secure: true,
      auth: {
        user: "test@despachate.com.mx",
        pass: "d3sp4ch473",
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );
  fs.readFile(
    path.resolve(__dirname, `../assets/compra.html`),
    { encoding: "utf-8" },
    function (err, html) {
      if (err) {
        /* Si ocurre un error al leer el fichero, envía un mensaje */
        console.log(err);
        console.log({
          ok: false,
          mensaje: "Ocurrio un error al leer el fichero HTML compra",
          errors: err,
        });
      } else {
        /* Reemplazo de variables para la contraseña del usuario */
        var template = handlebars.compile(html);

        var replacements = {
          user: "",
        };
        /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
        var htmlToSend = template(replacements);

        /* Requiere los datos del correo que lo va a envíar, hacía quien se
                    va a enviar y texto del asunto del correo */
        var mailOptions = {
          from: "“Despachate Group” test@despachate.com.mx",
          cc: "test@despachate.com.mx",
          bcc: "test@despachate.com.mx",
          to: "mk@despachate.com.mx",
          subject: "Compra realizada",
          html: htmlToSend,
        };

        /* Envía el Email hacia el destino */
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
            console.log(error);
            console.log({
              ok: false,
              mensaje: "Ocurrio un error al enviar el mensaje compra",
              errors: error,
            });
          } else {
            /* Se ha envíado el Email de destino correctamente */
            console.log("Email enviado: " + info.response);
            console.log({
              ok: true,
              mensaje: "Se envío correctamente el mensaje compra",
            });
          }
        });
      }
    }
  );
}

app.post("/detalles", (req, res) => {
  var body = req.body;
  DetallePedido.insertMany(body.detalles, (errd, detallesGuardados) => {
    if (errd) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error cargando detalles",
        errors: errd,
      });
    }
    // sendVentaMail();
    descontar(body.detalles, detallesGuardados, res);
  });
});
app.post("/historialCupones", (req, res) => {
  var body = req.body;
  HistorialCupones.insertMany(body, (errd, cuponesGuardados) => {
    if (errd) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error cargando cupones",
        errors: errd,
      });
    }

    body?.forEach(async ({ cupon }) => {
      // sumar 1 intentos
      await Cupon.findByIdAndUpdate(
        cupon,
        { $inc: { intentos: 1 } },
        { new: true }
      );
    });
    res.status(201).json({
      ok: true,
      cupones: cuponesGuardados,
    });

    // sendVentaMail();
    // descontar(body.cupones, cuponesGuardados, res);
  });
});

async function descontar(productos, detallesGuardados, res) {
  let respuestas = [];
  let index = 0;
  for (const element of productos) {
    index++;
    // console.log(Number(element.producto.stock) - Number(element.cantidad));

    let tempproducto = await Inventario.findById(
      element.paquete._id,
      (err, producto) => {
        if (err) {
          respuestas.push({
            ok: false,
            mensaje: "Descontando stock",
            errors: err,
          });
          return null;
        } else {
          return producto;
        }
      }
    );
    if (tempproducto != null) {
      tempproducto.stock =
        Number(tempproducto.stock) - Number(element.cantidad);
      if (tempproducto.stock <= 0) {
        // await Producto.findById(element.producto._id, (err, producto) => {
        //   if (producto) {
        //     producto.status = 'Agotado';
        //     Producto.findByIdAndUpdate(
        //       element.producto._id,
        //       producto,
        //       (err, producto) => {}
        //     );
        //   }
        // });
      }
      await Inventario.findByIdAndUpdate(
        element.paquete._id,
        tempproducto,
        (err, producto) => {
          if (err) {
            respuestas.push({
              ok: false,
              mensaje: "Error cargando detalles",
              errors: err,
            });
          } else {
            respuestas.push({
              ok: true,
              detalles: producto,
              producto: element.producto,
            });
          }
          console.log(element.cantidad, element.producto.stock);
        }
      );
    }

    if (productos.length == index) {
      return res.status(201).json({
        ok: true,
        respuestas,
        detalles: detallesGuardados,
      });
    }
  }
}

/* 
    Borrar un pedido por el id
*/
app.delete("/:id", (req, res) => {
  var id = req.params.id;

  Pedido.findByIdAndRemove(id, (err, pedidosBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error borrando un pedido",
        errors: err,
      });
    }

    if (!pedidosBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error borrando pedidos, no existe un pedido con ese ID",
        errors: { message: "No existe ningun pedido con ese ID" },
      });
    }

    return res.status(200).json({
      ok: true,
      pedidos: pedidosBorrado,
    });
  });
});

app.get("/giftCardSaldoComprado/:id", (req, res, next) => {
  var id = req.params.id;
  console.log("id", id);
  Pedido.find({ saldo_comprado: { $ne: 0 }, usuario: id })
    .populate("direccion")
    .populate("cupon")
    .populate("usuario")
    .populate("empaque")
    .sort({ _id: -1 })
    .exec((err, pedido) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando datos",
          errors: err,
        });
      }

      Pedido.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          pedidos: pedido,
          id: id,
        });
      });
    });
});

app.get("/giftCardSaldoUsado/:id", (req, res, next) => {
  var id = req.params.id;
  console.log("id", id);
  Pedido.find({ saldo_usado: { $ne: 0 }, usuario: id })
    .populate("direccion")
    .populate("cupon")
    .populate("usuario")
    .populate("empaque")
    .sort({ _id: -1 })
    .exec((err, pedido) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando datos",
          errors: err,
        });
      }

      Pedido.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          pedidos: pedido,
        });
      });
    });
});

module.exports = app;
