var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recetas_reseniaSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario es requerido'],
    },
    valoracion: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, 'La valoración es requerida'],
    },
    receta: { type: String, required: [true, 'La receta es requerida'] },
    fecha: { type: Date, required: [true, 'La fecha es requerida'] },
    titulo: { type: String, required: [true, 'El titulo es requerido'] },
    resenia: { type: String, required: [true, 'La reseña es requerida'] },
  },
  { collection: 'recetas_resenias' }
);

module.exports = mongoose.model('Recetas_resenia', recetas_reseniaSchema);
