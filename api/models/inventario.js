var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var inventarioSchema = new Schema({
    paquete: { type: String, required: [true, 'El nombre del paquete es necesario'] },
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: [true, 'El producto es necesario'] },
    precio: { type: Number, required: [true, 'El precio es necesario'] },
    stock: { type: Number, required: [true, 'El stock es necesario'] }
}, { collection: 'inventarios' });

inventarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Inventario', inventarioSchema);