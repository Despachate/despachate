var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var Empaque = {
    values: ['Papel', 'Tela'],
    message: '{VALUE} no es un tipo de empaque permitido'
}

var empaqueSchema = new Schema({
    img: { type: String, required: false },
    precio: { type: Number, required: [true, 'El precio es necesario'] },
    tipoEmpaque: { type: String, unique: true, required: [true, 'Se debe seleccionar un tipo de empaque'], default: 'Papel', enum: Empaque },
}, { collection: 'empaques' });

empaqueSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Empaque', empaqueSchema);