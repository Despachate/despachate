var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var categoriaSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre de la categoria es necesario'] },
    departamento: { type: Schema.Types.ObjectId, ref: 'Departamento', required: [true, 'El departamento al que pertenece la categoria es necesario'] },
}, { collection: 'categorias' });

categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Categoria', categoriaSchema);