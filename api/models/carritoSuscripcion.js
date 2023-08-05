var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var formaContactoValid = { values: ["Ninguna", "Whatsapp", "Teléfono"], message: '{VALUE} no es una forma de contacto valida' };
var carritoSuscripcionSchema = new Schema({
    frecuenciaEntrega: { type: String, required: [true, 'La fecha de entrega es necesaria'] },
    horarioEntrega: { type: String, required: [true, 'El horario de entrega es necesario'] },
    diaRecepcion: { type: String, required: [true, 'El dá de recepción es necesario'] },
    contacto: { type: Boolean, required: [true, 'Debes seleccionar si desas que te contacten o no'] },
    formaContacto: { type: String, enum: formaContactoValid, default: "Ninguna", required: [true, 'Debes seleccionar la forma en que te gustaría que te contactaran'] },
    metodoPago: { type: String, required: [true, 'Selecciona un método de pago'] },
    referenciaPago: { type: String, required: [true, 'Se debe ingresar le referencia obtenida al realizar el pago'] },
    precioTotal: { type: Number, required: [true, 'El precio total es necesario'] },
    cantidadTotal: { type: Number, required: [true, 'La cantidad Total es necesaria'] },
    direccion: { type: Schema.Types.ObjectId, ref: 'Direccion', required: [true, 'Se debe ingresar la dirección de entrega'] },
    empaque: { type: Schema.Types.ObjectId, ref: 'Empaque', required: [true, 'Se debe seleccionar un tipo de empaque'] },
    cantidadEmpaques: { type: Number, required: [true, 'La cantidad de empaques es necesaria'], default: 0 },
    fecha: { type: Date, required: [true,'La fecha es necesaria'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'Se debe establecer un usuario'] }
}, { collection: 'carritoSuscripciones' });

carritoSuscripcionSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('CarritoSuscripcion', carritoSuscripcionSchema);