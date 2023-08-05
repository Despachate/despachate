var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var listaComprasSchema = new Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    total: { type: Number, required: [true, 'El total es necesario'] },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [false, 'El id del usuario es necesario'],
    },
    fecha: { type: Date, required: [true, 'La fecha es necesario'] },
  },
  { collection: 'listaCompras' }
);

listaComprasSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('ListaCompras', listaComprasSchema);
