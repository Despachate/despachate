var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var departamentoSchema = new Schema(
  {
    img: { type: String, required: false },
    nombre: {
      type: String,
      unique: true,
      required: [true, 'El nombre del departamento es necesario'],
    },
    order: { type: Number, required: [true, 'El orden es necesario'] },
  },
  { collection: 'departamentos' }
);

departamentoSchema.plugin(uniqueValidator, {
  message: '{PATH} debe de ser unico',
});

module.exports = mongoose.model('Departamento', departamentoSchema);
