const mongoose = new require('mongoose');

const Schema = mongoose.Schema;

const empleadoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del empleado es necesario'],
    },
    apellido: {
      type: String,
      required: [true, 'El apellido del empleado es necesario'],
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: 'Empresa',
      required: [true, 'La empresa del empleado es necesaria'],
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [false, 'El usuario del empleado es necesario'],
    },
    deleted: { type: Boolean, default: false },
  },
  { collection: 'empleados', timestamps: true }
);

module.exports = mongoose.model('Empleado', empleadoSchema);
