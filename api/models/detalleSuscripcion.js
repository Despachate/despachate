var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var detalleSuscripcionSchema = new Schema({
    cantidad: { type: Number, required: [true, 'La cantidad es necesaria'] },
    subtotal: { type: Number, required: [true, 'El subtotal es necesario'] },
    carritoSuscripcion: { type: Schema.Types.ObjectId, ref: 'CarritoSuscripcion', required: [true, 'El id del carrito de suscripción es necesario'] },
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: [true, 'El id del producto es necesario'] },
    paquete: { type: Schema.Types.ObjectId, ref: 'Inventario', required: [true, 'El id del paquete es necesario'] },
}, { collection: 'detalleSuscripciones' });

detalleSuscripcionSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('DetalleSuscripcion', detalleSuscripcionSchema);