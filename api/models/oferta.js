var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var ofertaSchema = new Schema({
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: [true, 'El producto es necesario'] },
    inventario: { type: Schema.Types.ObjectId, ref: 'Inventario', unique: true, required: [true, 'El inventario es necesario'] },
    precio: { type: Number, required: [true, 'El precio es necesario'] }
}, { collection: 'ofertas' });

ofertaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Oferta', ofertaSchema);