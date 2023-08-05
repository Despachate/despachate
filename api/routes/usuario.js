var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');
var Pedido = require('../models/pedido');
var Cupon = require('../models/cupon');

// rutas

/* 
    Obtener todos los usuarios

*/

app.get('/', (req, res, next) => {
  let query_params = req.query;
  let query = {};
  if (!!query_params.search) {
    query.nombre = new RegExp(query_params.search, 'i');
  }
  Usuario.find(query, 'nombre email img role telefono fechaRegistro').exec(
    (err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando usuarios',
          errors: err,
        });
      }

      Usuario.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          usuarios: usuarios,
          total: conteo,
        });
      });
    }
  );
});

// get usuario by email
app.get('/email/:email', async (req, res, next) => {
  try {
    let email = req.params.email;
    let usuario = await Usuario.findOne({ email: email });
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el email ' + email + ' no existe',
        errors: { message: 'No existe un usuario con ese email' },
      });
    }
    res.status(200).json({
      ok: true,
      usuario: usuario,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al buscar usuario por email',
      errors: error,
    });
  }
});



app.get('/concupon/', async (req, res, next) => {
  var usuarios = [];
  for await (const usuario of Usuario.find()) {
    var cupones = [];
    var pedidos = [];
    for await (const cupon of Cupon.find({
      tipoCupon: 'Usuario',
      idUsuario: usuario._doc._id,
    })) {
      //console.log(cupon)
      for await (const pedido of Pedido.find({ cupon: cupon._doc._id })) {
        pedidos.push(cupon);
      }
    }
    usuarios.push({ ...usuario._doc, contadorCupon: pedidos.length });
  }
  res.status(200).json({
    ok: true,
    usuarios,
  });
});

app.get('/paginado/', (req, res, next) => {
  var desde = req.query.desde || 0;
  var hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Usuario.find({}, 'nombre email img role telefono fechaRegistro')
    .skip(desde)
    .limit(hasta)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando usuarios',
          errors: err,
        });
      }

      Usuario.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          usuarios: usuarios,
          hasta,
          desde,
          total: conteo,
        });
      });
    });
});

app.get('/saldo/:id', async (req, res, next) => {
   try {
     const id = req.params.id;
     const usuario = await Usuario.findById(id);

     const { saldo : saldoEnCuenta } = usuario;

     const pedidos = await Pedido.find(
      { usuario: id, estatusPago: "Pendiente", saldo_usado: { $gt: 0 }, saldo_descontado: false  },
      { saldo_usado: 1 }
     );

     const saldoPendienteDescontar = pedidos.reduce((a, b) => a + b.saldo_usado, 0);

     return res.status(200).json({
        ok: true,
        saldoEnCuenta,
        saldoPendienteDescontar,
        saldoDisponible: saldoEnCuenta - saldoPendienteDescontar  
     });

   } catch (error) {
    console.log(error);
      return res.status(500).json({
        ok: false,
        mensaje: "Error al calcular saldo",
        error,
      });
   }
});

/* 
    Actualizar datos usuario
*/
app.put('/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar usuario, usuario con id ' + id + ' no existe',
        errors: { message: 'No exite un usuario con ese ID' },
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;
    usuario.telefono = body.telefono;
    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar usuario',
          errors: err,
        });
      }

      usuarioGuardado.password = ':v';

      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado,
      });
    });
  });
});
/* 
    Actualizar usuario
*/
app.put('/cambiarPassword/:id', (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar usuario, usuario con id ' + id + ' no existe',
        errors: { message: 'No exite un usuario con ese ID' },
      });
    }
    usuario.password = bcrypt.hashSync(body.password, 10);
    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la contraseña',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado,
      });
    });
  });
});

/* 
    Generar password
*/

app.put('/cambiarPasswordAdmin/:id', (req, res) => {
  var id = req.params.id;
  const password = getRandomNumber();

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar usuario, usuario con id ' + id + ' no existe',
        errors: { message: 'No exite un usuario con ese ID' },
      });
    }
    usuario.password = bcrypt.hashSync(password, 10);
    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar la contraseña',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado,
        password: password,
      });
    });
  });
});

/* 
  modificar saldo usuario
  */
app.put('/modificarSaldo/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { saldo } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: { message: 'No exite un usuario con ese email' },
      });
    }
    const usuario_upadated = await Usuario.findOneAndUpdate(
      { email },
      { saldo },
      { new: true }
    );
    res.status(200).json({
      ok: true,
      usuario: usuario_upadated,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al buscar usuario',
      errors: error,
    });
  }
});

/* 
    Crear un nuevo usuario
*/

app.post('/', (req, res) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role,
    telefono: body.telefono,
    fechaRegistro: new Date(),
    saldo: 0,
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error cargando usuarios',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario,
    });
  });
});

/* 
    Borrar un usuario por el id
*/
app.delete('/:id', (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error borrando usuario',
        errors: err,
      });
    }

    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error borrando usuario, no existe un usuario con ese ID',
        errors: { message: 'No existe ningun usuario con ese ID' },
      });
    }

    return res.status(200).json({
      ok: true,
      usuario: usuarioBorrado,
    });
  });
});

function getRandomNumber() {
  var length = 8,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    randomPass = '';
  for (var i = 0, n = charset.length; i < length; ++i) {
    randomPass += charset.charAt(Math.floor(Math.random() * n));
  }

  return randomPass; /* El método regresa la cadena del código */
}

module.exports = app;
