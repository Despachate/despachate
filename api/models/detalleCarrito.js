var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var detalleCarritoSchema = new Schema(
  {
    cantidad: { type: Number, required: [true, 'La cantidad es necesaria'] },
    subtotal: { type: Number, required: [true, 'El subtotal es necesario'] },
    pedido: {
      type: Schema.Types.ObjectId,
      ref: 'Pedido',
      required: [true, 'El id del pedido es necesario'],
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
    cupon: {
      type: Schema.Types.ObjectId,
      ref: 'CuponDescuento',
      required: false,
    },
    oferta: { type: Number, required: false },
  },
  { collection: 'detallesCarrito' }
);

detalleCarritoSchema.plugin(uniqueValidator, {
  message: '{PATH} debe de ser unico',
});

module.exports = mongoose.model('DetalleCarrito', detalleCarritoSchema);
