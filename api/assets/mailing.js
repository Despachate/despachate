var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var handlebars = require('handlebars');

var mdAutenticacion = require('../middlewares/autenticacion');


var app = express();

var Mailing = require('../models/mailing');

var nodemailer = require('nodemailer');
var fs = require('fs');

/**
 * Método que envía un Email a una cuenta de Google (GMail) para actualizar una nueva
 * contraseña.
 */
app.post('/password', (req, res, next) => {
    /* Credenciales del usuario que va a envíar el correo */
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Mail Despachate',
            pass: 'Contraseña Mail'
        }
    });

    /* Lee el archivo HTML que va a envíar al correo */
    fs.readFile('../despachateApi-node/assets/correo/passwordemail.html', { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            /* Si ocurre un error al leer el fichero, envía un mensaje */
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al leer el fichero HTML',
                errors: err
            });
        } else {
            /* Reemplazo de variables para la contraseña del usuario */
            var template = handlebars.compile(html);

            /* Función para obtener un código con 8 dígitos utilizando letras y números random */
            function getRandomNumber() {
                var length = 8,
                    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                    randomPass = "";
                for (var i = 0, n = charset.length; i < length; ++i) {
                    randomPass += charset.charAt(Math.floor(Math.random() * n));
                }

                return randomPass; /* El método regresa la cadena del código */
            }

            /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
            var replacements = {
                userPassword: "Nombre de usuario del password generado",
                pass: getRandomNumber()
            };
            var htmlToSend = template(replacements);

            /* Requiere los datos del correo que lo va a envíar, hacía quien se
            va a enviar y texto del asunto del correo */
            var mailOptions = {
                from: 'Email Despachate',
                to: 'Email Usuario Externo',
                subject: 'Recuperación de cuenta',
                html: htmlToSend
            };

            /* Envía el Email hacia el destino */
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
                    console.log(error);
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
                        errors: error
                    });
                } else {
                    /* Se ha envíado el Email de destino correctamente */
                    console.log('Email enviado: ' + info.response);
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Se envío correctamente el mensaje Gmail'
                    });
                }
            });
        }
    });
});



/**
 * Método que envía un Email a una cuenta de Google (GMail) para envíar su estado
 * de suscripción.
 */
app.post('/suscripcion', (req, res, next) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Mail Despachate',
            pass: 'Contraseña Mail'
        }
    });

    /* Lee el archivo HTML que va a envíar al correo */
    fs.readFile('../despachateApi-node/assets/correo/suscripcionemail.html', { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            /* Si ocurre un error al leer el fichero, envía un mensaje */
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al leer el fichero HTML',
                errors: err
            });
        } else {
            /* Reemplazo de variables para la contraseña del usuario */
            var template = handlebars.compile(html);

            /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
            var replacements = {
                userSuscription: "Nombre del usuario suscrito"
            };
            var htmlToSend = template(replacements);

            /* Requiere los datos del correo que lo va a envíar, hacía quien se
            va a enviar y texto del asunto del correo */
            var mailOptions = {
                from: 'Mail Despachate',
                to: 'Mail Usuario Externo',
                subject: 'Seguimiento de compra con tu suscripción',
                html: htmlToSend/* ,
                attachments: [
                    {
                        filename: 'icons8-facebook-400.png',
                        path: 'C:/Users/OsvaX/Documents/Cactus Labs Projects/despachateApi-node/assets/correo/assets/images/icons8-facebook-400.png'
                    }
                ] */
            };

            /* Envía el Email hacia el destino */
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
                    console.log(error);
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
                        errors: error
                    });
                } else {
                    /* Se ha envíado el Email de destino correctamente */
                    console.log('Email enviado: ' + info.response);
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Se envío correctamente el mensaje Gmail'
                    });
                }
            });
        }
    });
});



/**
 * Método que envía un Email a una cuenta de Google (GMail) para envíar los datos de registro
 * de la empresa.
 */
app.post('/registrotienda', (req, res, next) => {
    /* Credenciales del usuario que va a envíar el correo */
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Email Despachate',
            pass: 'Constraseña Mail'
        }
    });

    /* Lee el archivo HTML que va a envíar al correo */
    fs.readFile('../despachateApi-node/assets/correo/tiendasuscripcionemail.html', { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            /* Si ocurre un error al leer el fichero, envía un mensaje */
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al leer el fichero HTML',
                errors: err
            });
        } else {
            /* Reemplazo de variables para la contraseña del usuario */
            var template = handlebars.compile(html);

            /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
            var replacements = {
                nombreEmpresa: "Nombre de la empresa suscrita",
                nombreCompleto: "Nombre de la persona suscrita",
                correo: "Mail de la persona suscrita",
                puesto: "Puesto de la persona suscrita",
                descripcionEmpresa: "Descripción de la empresa",
                productos: "Productos que ofrece la empresa"
            };
            var htmlToSend = template(replacements);

            /* Requiere los datos del correo que lo va a envíar, hacía quien se
            va a enviar y texto del asunto del correo */
            var mailOptions = {
                from: 'Mail Despachate',
                to: 'Mail Usuario Externo',
                subject: '¡Tu negocio en Despachate!',
                html: htmlToSend/* ,
                attachments: [
                    {
                        filename: 'icons8-facebook-400.png',
                        path: 'C:/Users/OsvaX/Documents/Cactus Labs Projects/despachateApi-node/assets/correo/assets/images/icons8-facebook-400.png'
                    }
                ] */
            };

            /* Envía el Email hacia el destino */
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
                    console.log(error);
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
                        errors: error
                    });
                } else {
                    /* Se ha envíado el Email de destino correctamente */
                    console.log('Email enviado: ' + info.response);
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Se envío correctamente el mensaje Gmail'
                    });
                }
            });
        }
    });
});



/**
 * Método que envía un Email a una cuenta de Google (GMail) que notifica que el usuario ha recibido
 * un cupón por parte de otro usuario.
 */
app.post('/cupon', (req, res, next) => {
    /* Credenciales del usuario que va a envíar el correo */
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'Despachate Email',
            pass: 'Contraseña Mail'
        }
    });

    /* Lee el archivo HTML que va a envíar al correo */
    fs.readFile('../despachateApi-node/assets/correo/cuponesemail.html', { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            /* Si ocurre un error al leer el fichero, envía un mensaje */
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al leer el fichero HTML',
                errors: err
            });
        } else {
            /* Reemplazo de variables para la contraseña del usuario */
            var template = handlebars.compile(html);

            /* Función para obtener un código con 8 dígitos utilizando letras y números random */
            function getRandomNumber() {
                var length = 8,
                    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                    randomPass = "";
                for (var i = 0, n = charset.length; i < length; ++i) {
                    randomPass += charset.charAt(Math.floor(Math.random() * n));
                }

                return randomPass; /* El método regresa la cadena del código */
            }

            /* Reemplaza los campos editables en el archivo HTML, son los que tienen {} */
            var replacements = {
                nombreCuponRecibido: "Nombre del usuario que recibió el cupón",
                nombreCuponEnviado: "Nombre del usuario que envío el cupón",
                codigoCuponRecibido: getRandomNumber()
            };
            var htmlToSend = template(replacements);

            /* Requiere los datos del correo que lo va a envíar, hacía quien se
            va a enviar y texto del asunto del correo */
            var mailOptions = {
                from: 'Email Despachate',
                to: 'Email usuario que recibió el cupón',
                subject: 'Un cupon ha sido agregado a tu cuenta',
                html: htmlToSend
            };

            /* Envía el Email hacia el destino */
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    /* Ha ocurrido un error, no se ha envíado el mensaje al Email de destino */
                    console.log(error);
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio un error al enviar el mensaje Gmail',
                        errors: error
                    });
                } else {
                    /* Se ha envíado el Email de destino correctamente */
                    console.log('Email enviado: ' + info.response);
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Se envío correctamente el mensaje Gmail'
                    });
                }
            });
        }
    });
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
        .exec(
            (err, mailings) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando mailings',
                        errors: err
                    });
                }

                Mailing.countDocuments({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        mailings: mailings,
                        hasta,
                        desde,
                        total: conteo
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
                errors: err
            });
        }

        if (!mailing) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar mailing, mailing con id ' + id + ' no existe',
                errors: { message: 'No exite un mailing con ese ID' }
            });
        }

        mailing.nombre = body.nombre;
        mailing.email = body.email;
        mailing.save((err, mailingGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar mailing',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mailing: mailingGuardado
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
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mailing: mailingGuardado,
            mailingToken: req.mailing
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
                errors: err
            });
        }

        if (!mailingBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error borrando mailing, no existe un mailing con ese ID',
                errors: { message: 'No existe ningun mailing con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            mailing: mailingBorrado
        });
    });
});

module.exports = app;