var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var favoritoSchema = new Schema({
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: [true, 'El producto es necesario'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'El usuario es necesario'] }
}, { collection: 'favoritos' });

favoritoSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Favorito', favoritoSchema);