// requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// inicializar variables

var app = express();

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  next();
});

// Body Parser

// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var productoRoutes = require('./routes/producto');
var cuponRoutes = require('./routes/cupon');
var departamentoRoutes = require('./routes/departamento');
var categoriaRoutes = require('./routes/categoria');
var subCategoriaRoutes = require('./routes/subcategoria');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
var empaqueRoutes = require('./routes/empaque');
var direccionRoutes = require('./routes/direccion');
var carritoSuscripcionRoutes = require('./routes/carritoSuscripcion');
var pedidoRoutes = require('./routes/pedido');
var detalleCarritoRoutes = require('./routes/detalleCarrito');
var detalleSuscripcionRoutes = require('./routes/detalleSuscripcion');
var carrouselRoutes = require('./routes/carrousel');
var ofertaRoutes = require('./routes/oferta');
var donacionRoutes = require('./routes/donacion');
var favoritoRoutes = require('./routes/favorito');
var mailingRoutes = require('./routes/mailing');
var inventarioRoutes = require('./routes/inventario');
var cuponUsuarioRoutes = require('./routes/cuponUsuario');
var carritoRoutes = require('./routes/carrito');
var caruselesRoutes = require('./routes/carruseles');
var caruselProductosRoutes = require('./routes/carruselProductos');

var recetaRoutes = require('./routes/receta');
var recetas_categoriaRoutes = require('./routes/recetas_categoria');
var recetas_favoritoRoutes = require('./routes/recetas_favorito');
var recetas_ingredienteRoutes = require('./routes/recetas_ingrediente');
var recetas_pasoRoutes = require('./routes/recetas_paso');
var recetas_reseniaRoutes = require('./routes/recetas_resenia');

var stripeRoutes = require('./routes/stripe');
var cuponDescuentoRoute = require('./routes/cuponDescuento');
var empresaRoute = require('./routes/empresa');
var empleadoRoute = require('./routes/empleado');
var historialCuponesRoute = require('./routes/historialCupones');
// conexion a la base de datos

mongoose.connection.openUri(
  'mongodb://127.0.0.1:27017/despachateDB',
  { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true },
  (err, resp) => {
    if (err) throw err;

    console.log('Base de datos:  \x1b[32m%s\x1b[0m', 'online');
  }
);

//server index config
//var serveIndex = require('serve-index');
//app.use(express.static(__dirname + '/'))
//app.use('/uploads', serveIndex(__dirname + '/uploads'));

// rutas
app.use('/usuario', usuarioRoutes);
app.use('/producto', productoRoutes);
app.use('/departamento', departamentoRoutes);
app.use('/categoria', categoriaRoutes);
app.use('/subcategoria', subCategoriaRoutes);
app.use('/empaque', empaqueRoutes);
app.use('/direccion', direccionRoutes);
app.use('/carritoSuscripcion', carritoSuscripcionRoutes);
app.use('/cupon', cuponRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/pedido', pedidoRoutes);
app.use('/detalleCarrito', detalleCarritoRoutes);
app.use('/detalleSuscripcion', detalleSuscripcionRoutes);
app.use('/carrousel', carrouselRoutes);
app.use('/oferta', ofertaRoutes);
app.use('/donacion', donacionRoutes);
app.use('/favorito', favoritoRoutes);
app.use('/mailing', mailingRoutes);
app.use('/inventario', inventarioRoutes);
app.use('/cuponUsuario', cuponUsuarioRoutes);
app.use('/carrito', carritoRoutes);
app.use('/carruseles', caruselesRoutes);
app.use('/carruselproductos', caruselProductosRoutes);

app.use('/receta', recetaRoutes);
app.use('/recetas_categoria', recetas_categoriaRoutes);
app.use('/recetas_favorito', recetas_favoritoRoutes);
app.use('/recetas_ingrediente', recetas_ingredienteRoutes);
app.use('/recetas_paso', recetas_pasoRoutes);
app.use('/recetas_resenia', recetas_reseniaRoutes);
app.use('/stripe', stripeRoutes);
app.use('/cuponDescuento', cuponDescuentoRoute);
app.use('/empresa', empresaRoute);
app.use('/empleado', empleadoRoute);
app.use('/historial_cupones', historialCuponesRoute);

app.use('/', appRoutes);

// escuchar peticiones

app.listen(3000, () => {
  console.log(
    'Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m',
    'online'
  );
});
