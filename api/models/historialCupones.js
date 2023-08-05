const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const historialCuponesSchema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: false },
    cupon: {
      type: Schema.Types.ObjectId,
      ref: 'CuponDescuento',
      required: false,
    },
    pedido: {
      type: Schema.Types.ObjectId,
      ref: 'Pedido',
      required: false,
    },
    deleted: { type: Boolean, default: false },
  },
  { collection: 'historialCupones', timestamps: true }
);

module.exports = mongoose.model('HistorialCupones', historialCuponesSchema);
