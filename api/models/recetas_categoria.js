var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var recetas_categoriaSchema = new Schema(
  {
    nombre: { type: String, required: [true, "El nombre es requerido"] },
  },
  { collection: "recetas_categorias" }
);

module.exports = mongoose.model("Recetas_categoria", recetas_categoriaSchema);
