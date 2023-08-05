var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var formaContactoValid = {
  values: ['Ninguna', 'WhatsApp', 'Teléfono'],
  message: '{VALUE} no es una forma de contacto valida',
};
var estatusPagoValid = {
  values: ['Pendiente', 'Pagado'],
  message: '{VALUE} no es un estatus de pago valido',
};
var estatusEnvioValid = {
  values: ['Pendiente', 'En preparación', 'Enviado', 'Recibido'],
  message: '{VALUE} no es un estatus de envio valido',
};

var pedidoSchema = new Schema(
  {
    fechaCompra: {
      type: Date,
      required: [true, 'La fecha de compra es necesaria'],
    },
    fechaRecepcion: {
      type: Date,
      required: [true, 'La fecha de recepcion es necesaria'],
    },
    horarioRecepcion: {
      type: String,
      required: [true, 'El horario de recepcion es necesario'],
    },
    precioTotal: {
      type: Number,
      required: [true, 'El precio total es necesario'],
    },
    cantidadTotal: {
      type: Number,
      required: [true, 'La cantidad Total es necesaria'],
    },
    metodoPago: {
      type: String,
      required: [true, 'Selecciona un método de pago'],
    },
    referenciaPago: {
      type: String,
      required: [
        true,
        'Se debe ingresar le referencia obtenida al realizar el pago',
      ],
    },
    contacto: {
      type: Boolean,
      required: [true, 'Debes seleccionar si desas que te contacten o no'],
    },
    formaContacto: {
      type: String,
      enum: formaContactoValid,
      default: 'Ninguna',
      required: [
        true,
        'Debes seleccionar la forma en que te gustaría que te contactaran',
      ],
    },
    estatusPago: {
      type: String,
      enum: estatusPagoValid,
      default: 'Pendiente',
      required: [true, 'Debes seleccionar el estatus de pago'],
    },
    estatusEnvio: {
      type: String,
      enum: estatusEnvioValid,
      default: 'Pendiente',
      required: [true, 'Debes seleccionar el estatus de envio'],
    },
    direccion: {
      type: Schema.Types.ObjectId,
      ref: 'Direccion',
      required: [true, 'Se debe ingresar la dirección de entrega'],
    },
    cupon: { type: Schema.Types.ObjectId, ref: 'Cupon', required: false },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Se debe ingresar el usuario que realizo el pedido'],
    },
    empaque: {
      type: Schema.Types.ObjectId,
      ref: 'Empaque',
      required: [true, 'Se debe seleccionar un tipo de empaque'],
    },
    cantidadEmpaque: {
      type: Number,
      required: [true, 'La cantidad de empaques es necesaria'],
    },
    donacion: {
      type: Number,
      required: [true, 'La donación es necesaria'],
      default: 0,
    },
    saldo_comprado: {
      type: Number,
      required: false,
      default: 0,
    },
    correo_saldo: {
      type: String,
      required: false,
      default: '',
    },
    saldo_usado: {
      type: Number,
      required: false,
      default: 0,
    },
    saldo_descontado: {
      type: Boolean,
      required: false,
      default: false,
    },
    saldo_agregado: {
      type: Boolean,
      required: false,
      default: false,
    },

    RFC: { type: String, required: false },
    comentario: { type: String, required: false },
  },
  { collection: 'pedidos' }
);

pedidoSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Pedido', pedidoSchema);
