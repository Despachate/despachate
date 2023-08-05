var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var subcategoriaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre de la subcategoria es necesario'] },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: [true, 'La categoria a la que pertenece la subcategoria es necesaria'] },
}, { collection: 'subcategorias' });

subcategoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Subcategoria', subcategoriaSchema);