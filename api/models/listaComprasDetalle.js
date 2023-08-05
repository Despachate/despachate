var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var listaComprasDetalleSchema = new Schema(
  {
    cantidad: { type: Number, required: [true, 'La cantidad es necesaria'] },
    total: { type: Number, required: [true, 'El subtotal es necesario'] },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [false, 'El id del usuario es necesario'],
    },
    lista_compras: {
      type: Schema.Types.ObjectId,
      ref: 'ListaCompras',
      required: [false, 'El id de la lisa e compras es necesario'],
    },
    producto: {
      type: Schema.Types.ObjectId,
      ref: 'Producto',
      required: [true, 'El id del producto es necesario'],
    },
    paquete: {
      type: Schema.Types.ObjectId,
      ref: 'Inventario',
      required: [true, 'El id del paquete es necesario'],
    },
    oferta: { type: Number, required: false },
    cupon: {
      type: Schema.Types.ObjectId,
      ref: 'CuponDescuento',
      required: false,
    },
    fecha: { type: Date, required: [true, 'La fecha es necesario'] },
  },
  { collection: 'listaComprasDetalle' }
);

listaComprasDetalleSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('ListaComprasDetalle', listaComprasDetalleSchema);
