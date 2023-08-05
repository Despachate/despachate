var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');
var moment = require('moment'); // require

var app = express();

const path = require('path');
var handlebars = require('handlebars');
var Mailing = require('../models/mailing');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var fs = require('fs');
const { registerDecorator } = require('handlebars');

var CarritoSuscripcion = require('../models/carritoSuscripcion');

var Usuario = require('../models/usuario');
var HistorialCupones = require('../models/historialCupones');
/**
 * Método que envía un Email a una cuenta de Google (GMail) para actualizar una nueva
 * contraseña.
 */
/* Función para obtener un código con 8 dígitos utilizando letras y números random */
function getRandomNumber() {
  var length = 8,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    randomPass = '';
  for (var i = 0, n = charset.length; i < length; ++i) {
    randomPass += charset.charAt(Math.floor(Math.random() * n));
  }

  return randomPass; /* El método regresa la cadena del código */
}

app.post('/password/:email', (req, res, next) => {
  /* Credenciales del usuario que va a envíar el correo */
  var email = req.params.email;
  var password = getRandomNumber();

  Usuario.findOne({ email: email }, (err, usuarioe) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuarioe) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar usuario, usuario con el correo ' +
          email +
          ' no existe',
        errors: { message: 'No exite un usuario con ese ID' },
      });
    }

    usuarioe.password = bcrypt.hashSync(password, 10);
    usuarioe.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al guardar usuario',
          errors: err,
        });
      }
      fs.readFile(
        path.resolve(__dirname, `../assets/passwordemail.html`),
        { encoding: 'utf-8' },
        function (err, html) {
          if (err) {
            /* Si ocurre un error al leer el fichero, envía un mensaje */
            console.log(err);
            return res.status(500).json({
              ok: false,
              mensaje: 'Ocurrio un error al leer el fichero HTML',
              errors: err,
            });
          } else {
            /* Reemplazo de variables para la contraseña del usuario */
            var template = handlebars.compile(html);

            /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
            var replacements = {
              userPassword: usuarioe.nombre,
              pass: password,
            };
            var htmlToSend = template(replacements);

            /* Requiere los datos del correo que lo va a envíar, hacía quien se
                    va a enviar y texto del asunto del correo */
            var mailOptions = {
              from: '“Despachate Group” test@despachate.com.mx',
              cc: 'test@despachate.com.mx',
              bcc: 'test@despachate.com.mx',
              to: email,
              subject: 'Recuperación de cuenta',
              html: htmlToSend,
            };

            /* Envía el Email hacia el destino */
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
                console.log(error);
                return res.status(500).json({
                  ok: false,
                  mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
                  errors: error,
                });
              } else {
                /* Se ha envíado el Email de destino correctamente */
                console.log('Email enviado: ' + info.response);
                res.status(200).json({
                  ok: true,
                  mensaje: 'Se envío correctamente el mensaje Gmail',
                });
              }
            });
          }
        }
      );
    });
  });
  /* Lee el archivo HTML que va a envíar al correo */

  var transporter = nodemailer.createTransport(
    smtpTransport({
      host: 'localhost',
      port: 465,
      secure: true,
      auth: {
        user: 'test@despachate.com.mx',
        pass: 'd3sp4ch473',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );
});

app.post('/registro/:email', (req, res, next) => {
  /* Credenciales del usuario que va a envíar el correo */
  var email = req.params.email;

  Usuario.findOne({ email: email }, (err, usuarioe) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuarioe) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar usuario, usuario con el correo ' +
          email +
          ' no existe',
        errors: { message: 'No exite un usuario con ese ID' },
      });
    }

    fs.readFile(
      path.resolve(__dirname, `../assets/registro.html`),
      { encoding: 'utf-8' },
      function (err, html) {
        if (err) {
          /* Si ocurre un error al leer el fichero, envía un mensaje */
          console.log(err);
          return res.status(500).json({
            ok: false,
            mensaje: 'Ocurrio un error al leer el fichero HTML',
            errors: err,
          });
        } else {
          /* Reemplazo de variables para la contraseña del usuario */
          var template = handlebars.compile(html);

          /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
          var replacements = {
            user: usuarioe.nombre,
          };
          var htmlToSend = template(replacements);

          /* Requiere los datos del correo que lo va a envíar, hacía quien se
                va a enviar y texto del asunto del correo */
          var mailOptions = {
            from: '“Despachate Group” test@despachate.com.mx',
            cc: 'test@despachate.com.mx',
            bcc: 'test@despachate.com.mx',
            to: email,
            subject: 'Registro de cuenta',
            html: htmlToSend,
          };

          /* Envía el Email hacia el destino */
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
              console.log(error);
              return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
                errors: error,
              });
            } else {
              /* Se ha envíado el Email de destino correctamente */
              console.log('Email enviado: ' + info.response);
              res.status(200).json({
                ok: true,
                mensaje: 'Se envío correctamente el mensaje Gmail',
              });
            }
          });
        }
      }
    );
  });
  /* Lee el archivo HTML que va a envíar al correo */

  var transporter = nodemailer.createTransport(
    smtpTransport({
      host: 'localhost',
      port: 465,
      secure: true,
      auth: {
        user: 'test@despachate.com.mx',
        pass: 'd3sp4ch473',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );
});

app.post('/compra/:email', (req, res, next) => {
  /* Credenciales del usuario que va a envíar el correo */
  var email = req.params.email;
  var body = req.body;
  // console.log(body);

  const transporter = nodemailer.createTransport(
    smtpTransport({
      host: 'localhost',
      port: 465,
      secure: true,
      auth: {
        user: 'test@despachate.com.mx',
        pass: 'd3sp4ch473',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  Usuario.findOne({ email: email }, (err, usuarioe) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuarioe) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar usuario, usuario con el correo ' +
          email +
          ' no existe',
        errors: { message: 'No exite un usuario con ese ID' },
      });
    }

    fs.readFile(
      path.resolve(__dirname, `../assets/compracliente.html`),
      { encoding: 'utf-8' },
      async function (err, html) {
        if (err) {
          /* Si ocurre un error al leer el fichero, envía un mensaje */
          console.log(err);
          return res.status(500).json({
            ok: false,
            mensaje: 'Ocurrio un error al leer el fichero HTML',
            errors: err,
          });
        } else {
          /* Reemplazo de variables para la contraseña del usuario */
          var template = handlebars.compile(html);

          var detalles = '';
          for (const detalle of body.detalles) {
            detalles +=
              detalle.producto.nombre +
              ' ' +
              detalle.paquete.paquete +
              ' $' +
              detalle.paquete.precio +
              ' cantidad ' +
              detalle.cantidad +
              ',';
          }

          // TODO get cupons used for this order

          let cupones = await HistorialCupones.find({
            pedido: body.compra._id,
          })
            .populate('cupon')
            .lean();

          console.log('CUPONES', cupones);

          /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
          var replacements = {
            user: usuarioe.nombre,
            total: body.compra.precioTotal,
            fecha: `${body.compra.fechaRecepcion.split('T')[0]} ${
              body.compra.horarioRecepcion
            }`,
            direccion: `${body.direccion.calle} ${body.direccion.codigoPostal}`,
            donacion:
              Number(body.compra.donacion) +
              Math.round(
                ((Number(body.compra.precioTotal) -
                  Number(body.compra.donacion)) *
                  0.03 +
                  Number.EPSILON) *
                  100
              ) /
                100,
            donaciones:
              Number(body.donado) +
              (Number(body.compra.donacion) +
                Math.round(
                  ((Number(body.compra.precioTotal) -
                    Number(body.compra.donacion)) *
                    0.03 +
                    Number.EPSILON) *
                    100
                ) /
                  100),
            tipo: body.compra.referenciaPago,
            notas: body.compra.comentario,
            productos: body.detalles,
            cupones,
             saldo_comprado: body.compra.saldo_comprado,
            correo_saldo: body.compra.correo_saldo,
            saldo_usado: body.compra.saldo_usado,
          };
          var htmlToSend = template(replacements);

          /* Requiere los datos del correo que lo va a envíar, hacía quien se
                va a enviar y texto del asunto del correo */
          var mailOptions = {
            from: '“Despachate Group” test@despachate.com.mx',
            cc: 'mk@despachate.com.mx',
            bcc: 'test@despachate.com.mx',
            to: email,
            subject: 'Detalle de compra',
            html: htmlToSend,
          };

          /* Envía el Email hacia el destino */
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
              console.log(error);
              return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
                errors: error,
              });
            } else {
              /* Se ha envíado el Email de destino correctamente */
              console.log('Email enviado: ' + info.response);
              res.status(200).json({
                ok: true,
                mensaje: 'Se envío correctamente el mensaje Gmail',
              });
            }
          });
        }
      }
    );
  });
  /* Lee el archivo HTML que va a envíar al correo */
});

app.post('/venta/:email', (req, res, next) => {
  /* Credenciales del usuario que va a envíar el correo */
  var email = req.params.email;
  var body = req.body;
  console.log(body);
  const transporter = nodemailer.createTransport(
    smtpTransport({
      host: 'localhost',
      port: 465,
      secure: true,
      auth: {
        user: 'test@despachate.com.mx',
        pass: 'd3sp4ch473',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  Usuario.findOne({ email: email }, (err, usuarioe) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuarioe) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Error al buscar usuario, usuario con el correo ' +
          email +
          ' no existe',
        errors: { message: 'No exite un usuario con ese ID' },
      });
    }

    fs.readFile(
      path.resolve(__dirname, `../assets/compra.html`),
      { encoding: 'utf-8' },
      async function (err, html) {
        if (err) {
          /* Si ocurre un error al leer el fichero, envía un mensaje */
          console.log(err);
          return res.status(500).json({
            ok: false,
            mensaje: 'Ocurrio un error al leer el fichero HTML',
            errors: err,
          });
        } else {
          /* Reemplazo de variables para la contraseña del usuario */
          var template = handlebars.compile(html);

          var detalles = '';
          for (const detalle of body.detalles) {
            detalles +=
              detalle.producto.nombre +
              ' ' +
              detalle.producto.sku +
              ' ' +
              detalle.paquete.paquete +
              ' $' +
              detalle.paquete.precio +
              ' cantidad ' +
              detalle.cantidad +
              ',';
          }

          let cupones = await HistorialCupones.find({
            pedido: body.compra._id,
          })
            .populate('cupon')
            .lean();
          /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
          var replacements = {
            user: usuarioe.nombre,
            total: body.compra.precioTotal,
            fechaCompra: body.compra.fechaCompra,
            fechaRecepcion: body.compra.fechaRecepcion,
            horarioRecepcion: body.compra.horarioRecepcion,
            precioTotal: body.compra.precioTotal,
            cantidadTotal: body.compra.cantidadTotal,
            metodoPago: body.compra.metodoPago,
            referenciaPago: body.compra.referenciaPago,
            contacto: body.compra.contacto,
            formaContacto: body.compra.formaContacto,
            estatusPago: body.compra.estatusPago,
            estatusEnvio: body.compra.estatusEnvio,
            nombre: body.direccion.nombre,
            apellidos: body.direccion.apellidos,
            calle: body.direccion.calle,
            numeroInterior: body.direccion.numeroInterior,
            referencia: body.direccion.referencia,
            codigoPostal: body.direccion.codigoPostal,
            colonia: body.direccion.colonia,
            email: usuarioe.email,
            telefono: usuarioe.telefono,
            empaque: body.empaque.tipoEmpaque,
            cantidadEmpaque: body.compra.cantidadEmpaque,
            notas: body.compra.comentario,
            donacion:
              Number(body.compra.donacion) +
              Math.round(
                ((Number(body.compra.precioTotal) -
                  Number(body.compra.donacion)) *
                  0.03 +
                  Number.EPSILON) *
                  100
              ) /
                100,
            donaciones:
              Number(body.donado) +
              (Number(body.compra.donacion) +
                Math.round(
                  ((Number(body.compra.precioTotal) -
                    Number(body.compra.donacion)) *
                    0.03 +
                    Number.EPSILON) *
                    100
                ) /
                  100),
            tipo: body.compra.referenciaPago,
            productos: body.detalles,
            cupones,

            saldo_comprado: body.compra.saldo_comprado,
            correo_saldo: body.compra.correo_saldo,
            saldo_usado: body.compra.saldo_usado,
          };
          var htmlToSend = template(replacements);

          /* Requiere los datos del correo que lo va a envíar, hacía quien se
                va a enviar y texto del asunto del correo */
          var mailOptions = {
            from: '“Despachate Group” test@despachate.com.mx',
            cc: 'mk@despachate.com.mx',
            bcc: 'test@despachate.com.mx',
            to: 'mk@despachate.com.mx, melgabrielc@gmail.com, melanie@despachate.mx, shopper@despachate.mx, e-commerce@arteventas.com'
            subject: 'Detalle de venta',
            html: htmlToSend,
          };

          /* Envía el Email hacia el destino */
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
              console.log(error);
              return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
                errors: error,
              });
            } else {
              /* Se ha envíado el Email de destino correctamente */
              console.log('Email enviado: ' + info.response);
              res.status(200).json({
                ok: true,
                mensaje: 'Se envío correctamente el mensaje Gmail',
              });
            }
          });
        }
      }
    );
  });
  /* Lee el archivo HTML que va a envíar al correo */
});

/**
 * Método que envía un Email a una cuenta de Google (GMail) para envíar su estado
 * de suscripción.
 */
app.post('/resetSuscripciones/', (req, res, next) => {
  var email = [];
  CarritoSuscripcion.find({})
    .populate('usuario')
    .exec(async (err, suscripciones) => {
      if (err) {
        /* Si ocurre un error al leer el fichero, envía un mensaje */
        console.log(err);
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al obtener suscripciones',
          errors: err,
        });
      }
      // var correos = [];
      // suscripciones.forEach(element => {
      //     correos.push(element.usuario.email);
      // });
      var errors = [];
      var success = [];
      let index = 0;
      for (const suscripcion of suscripciones) {
        index++;
        suscripcion.fecha = new Date();
        try {
          let sus = await suscripcion.save();
          success.push(sus);
        } catch (error) {
          errors.push(error);
        }

        if (index === suscripciones.length) {
          res.status(200).json({
            ok: true,
            errors,
            success,
          });
        }
      }
    });
});

/**
 * Método que envía un Email a una cuenta de Google (GMail) para envíar su estado
 * de suscripción.
 */
app.post('/suscripcion/', (req, res, next) => {
  var email = [];
  CarritoSuscripcion.find({})
    .populate('usuario')
    .exec((err, suscripciones) => {
      if (err) {
        /* Si ocurre un error al leer el fichero, envía un mensaje */
        console.log(err);
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al obtener suscripciones',
          errors: err,
        });
      }
      // var correos = [];
      // suscripciones.forEach(element => {
      //     correos.push(element.usuario.email);
      // });
      enviarCorreos(req, res, suscripciones);
    });
});

function getWeekInMonth(year, month, day) {
  let weekNum = 1; // w<e start at week 1

  let weekDay = new Date(year, month - 1, 1).getDay(); // we get the weekDay of day 1

  weekDay = weekDay === 0 ? 6 : weekDay - 1; // we recalculate the weekDay (Mon:0, Tue:1, Wed:2, Thu:3, Fri:4, Sat:5, Sun:6)

  let monday = 1 + (7 - weekDay); // we get the first monday of the month

  while (monday <= day) {
    //we calculate in wich week is our day
    weekNum++;
    monday += 7;
  }

  return weekNum; //we return it
}

function formatDate(date) {
  var d = date,
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function isToday(momentDate, fecha) {
  var REFERENCE = moment(fecha); // fixed just for testing, use moment();
  var TODAY = REFERENCE.clone().startOf('day');
  var YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
  var A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');
  var TWO_WEEK_OLD = REFERENCE.clone().subtract(14, 'days').startOf('day');
  var THREE_WEEK_OLD = REFERENCE.clone().subtract(21, 'days').startOf('day');
  return momentDate.isSame(TODAY, 'd');
}

function isYesterday(momentDate, fecha) {
  var REFERENCE = moment(fecha); // fixed just for testing, use moment();
  var TODAY = REFERENCE.clone().startOf('day');
  var YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
  var A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');
  var TWO_WEEK_OLD = REFERENCE.clone().subtract(14, 'days').startOf('day');
  var THREE_WEEK_OLD = REFERENCE.clone().subtract(21, 'days').startOf('day');
  return momentDate.isSame(YESTERDAY, 'd');
}

function isWithinAWeek(momentDate, fecha) {
  var REFERENCE = moment(fecha); // fixed just for testing, use moment();
  var TODAY = REFERENCE.clone().startOf('day');
  var YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
  var A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');
  var TWO_WEEK_OLD = REFERENCE.clone().subtract(14, 'days').startOf('day');
  var THREE_WEEK_OLD = REFERENCE.clone().subtract(21, 'days').startOf('day');
  return momentDate.isAfter(A_WEEK_OLD);
}

function isWithinTwoWeek(momentDate, fecha) {
  var REFERENCE = moment(fecha); // fixed just for testing, use moment();
  var TODAY = REFERENCE.clone().startOf('day');
  var YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
  var A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');
  var TWO_WEEK_OLD = REFERENCE.clone().subtract(14, 'days').startOf('day');
  var THREE_WEEK_OLD = REFERENCE.clone().subtract(21, 'days').startOf('day');
  return momentDate.isAfter(TWO_WEEK_OLD);
}

function isWithinThreeWeek(momentDate, fecha) {
  var REFERENCE = moment(fecha); // fixed just for testing, use moment();
  var TODAY = REFERENCE.clone().startOf('day');
  var YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
  var A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');
  var TWO_WEEK_OLD = REFERENCE.clone().subtract(14, 'days').startOf('day');
  var THREE_WEEK_OLD = REFERENCE.clone().subtract(21, 'days').startOf('day');
  return momentDate.isAfter(THREE_WEEK_OLD);
}

function isThreeWeeksOrMore(momentDate, fecha) {
  var REFERENCE = moment(fecha); // fixed just for testing, use moment();
  var TODAY = REFERENCE.clone().startOf('day');
  var YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
  var A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');
  var TWO_WEEK_OLD = REFERENCE.clone().subtract(14, 'days').startOf('day');
  var THREE_WEEK_OLD = REFERENCE.clone().subtract(21, 'days').startOf('day');
  return !isWithinAWeek(momentDate);
}
async function enviarCorreos(req, res, suscripciones) {
  var index = 0;
  var errors = [];
  var success = [];
  for (const suscripcion of suscripciones) {
    index += 1;
    let mandar = false;
    let currentDate = new Date();
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    var d = currentDate,
      month = '' + (d.getMonth() + 1);
    day = '' + d.getDate();
    year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    let current = moment([year, month, day].join('-'));

    let recepcion = 0;
    if (suscripcion.diaRecepcion === 'Lunes') {
      recepcion = 0;
    }
    if (suscripcion.diaRecepcion === 'Martes') {
      recepcion = 1;
    } else if (suscripcion.diaRecepcion === 'Miércoles') {
      recepcion = 2;
    } else if (suscripcion.diaRecepcion === 'Jueves') {
      recepcion = 3;
    } else if (suscripcion.diaRecepcion === 'Viernes') {
      recepcion = 4;
    } else if (suscripcion.diaRecepcion === 'Sábado') {
      recepcion = 5;
    } else if (suscripcion.diaRecepcion === 'Domingo') {
      recepcion = 6;
    }

    var sendOnDate = new Date(suscripcion.fecha);
    //sendOnDate = new Date(sendOnDate.setDate(sendOnDate.getDate() + 7));
    if (suscripcion.frecuenciaEntrega === 'cada Semana') {
      sendOnDate = new Date(sendOnDate.setDate(sendOnDate.getDate() + 7));
    } else if (suscripcion.frecuenciaEntrega === 'cada 2 Semanas') {
      sendOnDate = new Date(sendOnDate.setDate(sendOnDate.getDate() + 14));
    } else if (suscripcion.frecuenciaEntrega === 'cada 3 Semanas') {
      sendOnDate = new Date(sendOnDate.setDate(sendOnDate.getDate() + 21));
    } else if (suscripcion.frecuenciaEntrega === 'cada 4 Semanas') {
      sendOnDate = new Date(sendOnDate.setDate(sendOnDate.getDate() + 28));
    }

    if (sendOnDate.getDay() > recepcion) {
      let mayor = sendOnDate.getDay();
      let menor = recepcion;
      let diferencia = mayor - menor;
      sendOnDate = new Date(
        sendOnDate.setDate(sendOnDate.getDate() - diferencia)
      );
    } else {
      let mayor = recepcion;
      let menor = sendOnDate.getDay();
      let diferencia = mayor - menor;
      sendOnDate = new Date(
        sendOnDate.setDate(currentDate.getDate() + diferencia)
      );
    }

    if (
      currentDate.getDate() === sendOnDate.getDate() &&
      currentDate.getMonth() === sendOnDate.getMonth() &&
      currentDate.getFullYear() === sendOnDate.getFullYear()
    ) {
      mandar = true;
      suscripcion.fecha = sendOnDate;
      try {
        await suscripcion.save();
      } catch (error) {
        errors.push(error);
      }
    } else {
      mandar = false;
    }

    // if (currentDate.getDay() > recepcion) {
    //     let mayor = currentDate.getDay();
    //     let menor = recepcion;
    //     let diferencia = mayor - menor;
    //     currentDate = new Date(currentDate.setDate(currentDate.getDate() - diferencia));
    // } else {
    //     let mayor = recepcion;
    //     let menor = currentDate.getDay();
    //     let diferencia = mayor + menor;
    //     currentDate = new Date(currentDate.setDate(currentDate.getDate() + diferencia));
    // }

    //success.push({ fecha: suscripcion.fecha, frecuencia: suscripcion.frecuenciaEntrega, dia: suscripcion.diaRecepcion, send: sendOnDate, currentDate, mandar });

    // suscripcion.usuario && suscripcion.usuario != null && mandar
    if (mandar && suscripcion.usuario != null) {
      var transporter = nodemailer.createTransport(
        smtpTransport({
          host: 'localhost',
          port: 465,
          secure: true,
          auth: {
            user: 'test@despachate.com.mx',
            pass: 'd3sp4ch473',
          },
          tls: {
            rejectUnauthorized: false,
          },
        })
      );

      /* Lee el archivo HTML que va a envíar al correo */
      await fs.readFile(
        path.resolve(__dirname, `../assets/suscripcionemail.html`),
        { encoding: 'utf-8' },
        function (err, html) {
          if (err) {
            /* Si ocurre un error al leer el fichero, envía un mensaje */
            console.log(err);
            errors.push({
              ok: false,
              mensaje: 'Ocurrio un error al leer el fichero HTML',
              errors: err,
            });
          } else {
            /* Reemplazo de variables para la contraseña del usuario */
            var template = handlebars.compile(html);

            /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
            var replacements = {
              userSuscription: suscripcion.usuario.nombre,
            };
            var htmlToSend = template(replacements);

            /* Requiere los datos del correo que lo va a envíar, hacía quien se
                    va a enviar y texto del asunto del correo */
            var mailOptions = {
              from: '“Despachate Group” test@despachate.com.mx',
              cc: 'test@despachate.com.mx',
              bcc: 'test@despachate.com.mx',
              to: suscripcion.usuario.email,
              subject: 'Recordatorio suscripción',
              html: htmlToSend,
            };

            /* Envía el Email hacia el destino */
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
                console.log(error);
                errors.push({
                  ok: false,
                  mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
                  errors: error,
                });
              } else {
                /* Se ha envíado el Email de destino correctamente */
                console.log('Email enviado: ' + info.response);
                success.push({
                  ok: true,
                  mensaje: 'Se envío correctamente el mensaje Gmail',
                });
              }
            });
          }
        }
      );
    }

    if (index === suscripciones.length) {
      res.status(200).json({
        ok: true,
        errors,
        success,
      });
    }
  }
}

/**
 * Método que envía un Email a una cuenta de Google (GMail) para envíar los datos de registro
 * de la empresa.
 */
app.post('/registrotienda/:email', (req, res, next) => {
  var email = req.params.email;
  var body = req.body;
  console.log(req.body);
  /* Credenciales del usuario que va a envíar el correo */
  var transporter = nodemailer.createTransport(
    smtpTransport({
      host: 'localhost',
      port: 465,
      secure: true,
      auth: {
        user: 'test@despachate.com.mx',
        pass: 'd3sp4ch473',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  /* Lee el archivo HTML que va a envíar al correo */
  fs.readFile(
    path.resolve(__dirname, '../assets/tiendasuscripcionemail.html'),
    { encoding: 'utf-8' },
    function (err, html) {
      if (err) {
        /* Si ocurre un error al leer el fichero, envía un mensaje */
        console.log(err);
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al leer el fichero HTML',
          errors: err,
        });
      } else {
        /* Reemplazo de variables para la contraseña del usuario */
        var template = handlebars.compile(html);

        /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
        var replacements = {
          nombreEmpresa: body.cliente.empresa,
          nombreCompleto: body.cliente.nombre,
          correo: body.cliente.correo,
          puesto: body.cliente.puesto,
          descripcionEmpresa: body.cliente.descripcion,
          productos: body.cliente.productos,
          archivo: body.archivo,
        };
        var htmlToSend = template(replacements);

        /* Requiere los datos del correo que lo va a envíar, hacía quien se
            va a enviar y texto del asunto del correo */
        var mailOptions = {
          from: '“Despachate Group” test@despachate.com.mx',
          cc: 'test@despachate.com.mx',
          bcc: 'test@despachate.com.mx',
          to: email,
          subject: 'Captura de datos',
          html: htmlToSend,
        };

        /* Envía el Email hacia el destino */
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
            console.log(error);
            return res.status(500).json({
              ok: false,
              mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
              errors: error,
            });
          } else {
            /* Se ha envíado el Email de destino correctamente */
            console.log('Email enviado: ' + info.response);
            res.status(200).json({
              ok: true,
              mensaje: 'Se envío correctamente el mensaje Gmail',
            });
          }
        });
      }
    }
  );
});

/**
 * Método que envía un Email a una cuenta de Google (GMail) que notifica que el usuario ha recibido
 * un cupón por parte de otro usuario.
 */
app.post('/cupon/:cupon', (req, res, next) => {
  var email = req.body.emails;
  var body = req.body;
  var cupon = req.params.cupon;
  /* Credenciales del usuario que va a envíar el correo */
  var transporter = nodemailer.createTransport(
    smtpTransport({
      host: 'localhost',
      port: 465,
      secure: true,
      auth: {
        user: 'test@despachate.com.mx',
        pass: 'd3sp4ch473',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  /* Lee el archivo HTML que va a envíar al correo */
  fs.readFile(
    path.resolve(__dirname, '../assets/cuponesemail.html'),
    { encoding: 'utf-8' },
    function (err, html) {
      if (err) {
        /* Si ocurre un error al leer el fichero, envía un mensaje */
        console.log(err);
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al leer el fichero HTML',
          errors: err,
        });
      } else {
        /* Reemplazo de variables para la contraseña del usuario */
        var template = handlebars.compile(html);

        /* Función para obtener un código con 8 dígitos utilizando letras y números random */
        function getRandomNumber() {
          var length = 8,
            charset =
              'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            randomPass = '';
          for (var i = 0, n = charset.length; i < length; ++i) {
            randomPass += charset.charAt(Math.floor(Math.random() * n));
          }

          return randomPass; /* El método regresa la cadena del código */
        }

        /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
        var replacements = {
          nombreCuponRecibido: ', somos despachate.com.mx',
          nombreCuponEnviado: body.usuario.nombre,
          codigoCuponRecibido: cupon,
        };
        var htmlToSend = template(replacements);

        /* Requiere los datos del correo que lo va a envíar, hacía quien se
            va a enviar y texto del asunto del correo */
        var mailOptions = {
          from: '“Despachate Group” test@despachate.com.mx',
          cc: 'test@despachate.com.mx',
          bcc: 'test@despachate.com.mx',
          to: email,
          subject: 'Cupon de descuento',
          html: htmlToSend,
        };

        /* Envía el Email hacia el destino */
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
            console.log(error);
            return res.status(500).json({
              ok: false,
              mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
              errors: error,
            });
          } else {
            /* Se ha envíado el Email de destino correctamente */
            console.log('Email enviado: ' + info.response);
            res.status(200).json({
              ok: true,
              mensaje: 'Se envío correctamente el mensaje Gmail',
            });
          }
        });
      }
    }
  );
});



app.post('/regalasaldoamigo/:email', (req, res, next) => {
  var email = req.params.email;
  var body = req.body;
  console.log(req.body);
  /* Credenciales del usuario que va a envíar el correo */
  var transporter = nodemailer.createTransport(
    smtpTransport({
      host: 'localhost',
      port: 465,
      secure: true,
      auth: {
        user: 'test@despachate.com.mx',
        pass: 'd3sp4ch473',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  /* Lee el archivo HTML que va a envíar al correo */
  fs.readFile(
    path.resolve(__dirname, '../assets/regalosaldo.html'),
    { encoding: 'utf-8' },
    function (err, html) {
      if (err) {
        /* Si ocurre un error al leer el fichero, envía un mensaje */
        console.log(err);
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al leer el fichero HTML',
          errors: err,
        });
      } else {
        /* Reemplazo de variables para la contraseña del usuario */
        var template = handlebars.compile(html);

        /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
        var replacements = {
          user_amigo: body.user_amigo,
          saldo: body.saldo,
          mensaje_amigo: body.mensaje_amigo,
        };
        var htmlToSend = template(replacements);

        /* Requiere los datos del correo que lo va a envíar, hacía quien se
            va a enviar y texto del asunto del correo */
        var mailOptions = {
          from: '“Despachate Group” test@despachate.com.mx',
          cc: 'test@despachate.com.mx',
          bcc: 'test@despachate.com.mx',
          to: email,
          subject: 'Abono de saldo',
          html: htmlToSend,
        };

        /* Envía el Email hacia el destino */
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
            console.log(error);
            return res.status(500).json({
              ok: false,
              mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
              errors: error,
            });
          } else {
            /* Se ha envíado el Email de destino correctamente */
            console.log('Email enviado: ' + info.response);
            res.status(200).json({
              ok: true,
              mensaje: 'Se envío correctamente el mensaje Gmail',
            });
          }
        });
      }
    }
  );
});

app.post('/regalasaldoamigoadmin', (req, res, next) => {
  var body = req.body;
  console.log(req.body);
  /* Credenciales del usuario que va a envíar el correo */
  var transporter = nodemailer.createTransport(
    smtpTransport({
      host: 'localhost',
      port: 465,
      secure: true,
      auth: {
        user: 'test@despachate.com.mx',
        pass: 'd3sp4ch473',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  /* Lee el archivo HTML que va a envíar al correo */
  fs.readFile(
    path.resolve(__dirname, '../assets/correoadminregalosaldo.html'),
    { encoding: 'utf-8' },
    function (err, html) {
      if (err) {
        /* Si ocurre un error al leer el fichero, envía un mensaje */
        console.log(err);
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al leer el fichero HTML',
          errors: err,
        });
      } else {
        /* Reemplazo de variables para la contraseña del usuario */
        var template = handlebars.compile(html);

        /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
        var replacements = {
          user_origen: body.user_origen,
          saldo: body.saldo,
          user_amigo: body.user_amigo,
        };
        var htmlToSend = template(replacements);

        /* Requiere los datos del correo que lo va a envíar, hacía quien se
            va a enviar y texto del asunto del correo */
        var mailOptions = {
          from: '“Despachate Group” test@despachate.com.mx',
          cc: 'test@despachate.com.mx',
          bcc: 'test@despachate.com.mx',
          to: 'test@despachate.com.mx',
          subject: 'Abono de saldo',
          html: htmlToSend,
        };

        /* Envía el Email hacia el destino */
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
            console.log(error);
            return res.status(500).json({
              ok: false,
              mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
              errors: error,
            });
          } else {
            /* Se ha envíado el Email de destino correctamente */
            console.log('Email enviado: ' + info.response);
            res.status(200).json({
              ok: true,
              mensaje: 'Se envío correctamente el mensaje Gmail',
            });
          }
        });
      }
    }
  );
});

app.post('/usosaldoamigoadmin', (req, res, next) => {
  var body = req.body;
  console.log(req.body);
  /* Credenciales del usuario que va a envíar el correo */
  var transporter = nodemailer.createTransport(
    smtpTransport({
      host: 'localhost',
      port: 465,
      secure: true,
      auth: {
        user: 'test@despachate.com.mx',
        pass: 'd3sp4ch473',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  /* Lee el archivo HTML que va a envíar al correo */
  fs.readFile(
    path.resolve(__dirname, '../assets/usosaldoamigo.html'),
    { encoding: 'utf-8' },
    function (err, html) {
      if (err) {
        /* Si ocurre un error al leer el fichero, envía un mensaje */
        console.log(err);
        return res.status(500).json({
          ok: false,
          mensaje: 'Ocurrio un error al leer el fichero HTML',
          errors: err,
        });
      } else {
        /* Reemplazo de variables para la contraseña del usuario */
        var template = handlebars.compile(html);

        /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
        var replacements = {
          user_origen: body.user_origen,
          saldo: body.saldo
        };
        var htmlToSend = template(replacements);

        /* Requiere los datos del correo que lo va a envíar, hacía quien se
            va a enviar y texto del asunto del correo */
        var mailOptions = {
          from: '“Despachate Group” test@despachate.com.mx',
          cc: 'test@despachate.com.mx',
          bcc: 'test@despachate.com.mx',
          to: 'test@despachate.com.mx',
          subject: 'Uso de saldo',
          html: htmlToSend,
        };

        /* Envía el Email hacia el destino */
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
            console.log(error);
            return res.status(500).json({
              ok: false,
              mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
              errors: error,
            });
          } else {
            /* Se ha envíado el Email de destino correctamente */
            console.log('Email enviado: ' + info.response);
            res.status(200).json({
              ok: true,
              mensaje: 'Se envío correctamente el mensaje Gmail',
            });
          }
        });
      }
    }
  );
});





















// rutas

/* 
    Obtener todos los usuarios inscritos en el Mailing

*/

app.get('/', (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Mailing.find({}, 'nombre email')
    .skip(desde)
    .limit(hasta)
    .exec((err, mailings) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando mailings',
          errors: err,
        });
      }

      Mailing.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          mailings: mailings,
          hasta,
          desde,
          total: conteo,
        });
      });
    });
});

/* 
    Actualizar mailing
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Mailing.findById(id, (err, mailing) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar mailing',
        errors: err,
      });
    }

    if (!mailing) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar mailing, mailing con id ' + id + ' no existe',
        errors: { message: 'No exite un mailing con ese ID' },
      });
    }

    mailing.nombre = body.nombre;
    mailing.email = body.email;
    mailing.save((err, mailingGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar mailing',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        mailing: mailingGuardado,
      });
    });
  });
});

/* 
    Crear un nuevo registro mailing
*/

app.post('/', (req, res) => {
  var body = req.body;

  var mailing = new Mailing({
    nombre: body.nombre,
    email: body.email,
  });

  mailing.save((err, mailingGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando mailings',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      mailing: mailingGuardado,
      mailingToken: req.mailing,
    });
  });
});

/* 
    Borrar un mailing por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Mailing.findByIdAndRemove(id, (err, mailingBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando mailing',
        errors: err,
      });
    }

    if (!mailingBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error borrando mailing, no existe un mailing con ese ID',
        errors: { message: 'No existe ningun mailing con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      mailing: mailingBorrado,
    });
  });
});

module.exports = app;
