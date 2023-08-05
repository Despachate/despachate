var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var recetas_pasosSchema = new Schema(
  {
    receta: {
      type: Schema.Types.ObjectId,
      ref: "Receta",
      required: [true, "La receta es requerida"],
    },
    paso: { type: Number, required: [true, "El paso es requerido"] },
    descripcion: {
      type: String,
      required: [true, "La descripción es requerida"],
    },
  },
  { collection: "recetas_pasos" }
);

module.exports = mongoose.model("Recetas_paso", recetas_pasosSchema);
