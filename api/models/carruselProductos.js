var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var carruselproductosSchema = new Schema({
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: [true, 'El id del producto es necesario'] },
    carrusel: { type: Schema.Types.ObjectId, ref: 'Carruseles', required: [true, 'El id del carrusel es necesario'] },

});

module.exports = mongoose.model('Carruselproductos', carruselproductosSchema);