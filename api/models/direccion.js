var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var direccionSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    apellidos: { type: String, required: [true, 'Los apellidos son necesarios'] },
    calle: { type: String, required: [true, 'El nombre de la calle es necesario'] },
    numeroInterior: { type: String, required: [false, 'Debes especificar el numero interior'] },
    referencia: { type: String, required: [true, 'Los referencia es necesaria'] },
    codigoPostal: { type: Number, required: [true, 'El código postal es necesario'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'Se debe seleccionar un id de Usuario'] },
    colonia: { type: String, required: [true, 'La colonia es necesaria']}
}, { collection: 'direcciones' });

direccionSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Direccion', direccionSchema);