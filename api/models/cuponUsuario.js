var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var cuponUsuarioSchema = new Schema({
    cupon: { type: Schema.Types.ObjectId, ref: 'Cupon', required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { collection: 'cuponesUsuario' });

cuponUsuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('CuponUsuario', cuponUsuarioSchema);