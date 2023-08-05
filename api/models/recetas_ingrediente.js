var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var recetas_ingredienteSchema = new Schema(
  {
    ingrediente: {
      type: String,
      required: [true, 'El ingrediente es requerido'],
    },
    cantidad_medida: {
      type: String,
      required: [true, 'La cantidad y medida son requeridos'],
    },
    receta: {
      type: Schema.Types.ObjectId,
      ref: 'Receta',
      required: [true, 'La receta es requerida'],
    },
    producto: {
      type: Schema.Types.ObjectId,
      ref: 'Producto',
      required: [true, 'El producto es requerido'],
    },
    paquete: {
      type: Schema.Types.ObjectId,
      ref: 'Inventario',
      required: [true, 'El paquete es requerido'],
    },
  },
  { collection: 'recetas_ingredientes' }
);

module.exports = mongoose.model(
  'Recetas_ingrediente',
  recetas_ingredienteSchema
);
