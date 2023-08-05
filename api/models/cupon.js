var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var tipoCuponesValidos = {
  values: ['Usuario', 'General'],
  message: '{VALUE} no es un rol permitido',
};

var cuponSchema = new Schema(
  {
    codigo: {
      type: String,
      unique: true,
      required: [true, 'El código del cupón es necesario'],
    },
    valor: {
      type: String,
      required: [true, 'El valor del cupón es necesario'],
    },
    tipoCupon: {
      type: String,
      required: true,
      default: 'TIPO_CUPON',
      enum: tipoCuponesValidos,
    },
    idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: false },
  },
  { collection: 'cupones' }
);

cuponSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Cupon', cuponSchema);
