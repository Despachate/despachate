var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var recetaSchema = new Schema(
  {
    nombre: {
      type: String,
      unique: true,
      required: [true, 'El nombre es requerido'],
    },
    duracion: { type: String, required: [true, 'La duración es requerida'] },
    code: {
      type: String,
      unique: true,
      required: [true, 'El codigo es requerido'],
    },
    etiquetas: {
      type: String,
      required: [true, 'Las etiquetas son requeridas'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
    },
    listo_en: { type: String, required: [true, 'Listo en es requerido'] },
    preparacion: { type: String, required: [true, 'Preparación es requerido'] },
    cocinar: { type: String, required: [true, 'Cocinar es requerido'] },
    porciones: { type: Number, required: [true, 'Porciones es requerida'] },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: 'Recetas_categoria',
      required: [true, 'La categoria es requerida'],
    },
    img: {
      type: String,
      required: false,
    },
  },
  { collection: 'recetas' }
);

recetaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Receta', recetaSchema);
