var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var recetas_favoritoSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El usuario es requerido"],
    },
    receta: {
      type: Schema.Types.ObjectId,
      ref: "Receta",
      required: [true, "La receta es requerida"],
    },
  },
  { collection: "recetas_favoritos" }
);

module.exports = mongoose.model("Recetas_favorito", recetas_favoritoSchema);
