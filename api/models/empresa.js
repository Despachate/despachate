const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const empresaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la empresa es necesario'],
    },
    direccion: {
      type: String,
      required: [true, 'La direccion de la empresa es necesaria'],
    },
    telefono: {
      type: String,
      required: [true, 'El telefono de la empresa es necesario'],
    },
    email: {
      type: String,
      required: [true, 'El email de la empresa es necesario'],
    },
    deleted: { type: Boolean, default: false },
  },
  { collection: 'empresas', timestamps: true }
);

module.exports = mongoose.model('Empresa', empresaSchema);
