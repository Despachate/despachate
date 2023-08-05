var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var Estatus = {
    values: ['Activa', 'Inactiva'],
    message: '{VALUE} no es un estatus permitido'
}
var donacionSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre de la donación es necesario'] },
    img: { type: String, required: [false, 'La imagen es necesaria'] },
    estatus: { type: String, required: [true, 'Se debe seleccionar un estatus'], default: 'Inactiva', enum: Estatus },
    descripcion: { type: String, required: [false, 'Debes ingresar una descripción'] }
}, { collection: 'donaciones' });

donacionSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Donacion', donacionSchema);