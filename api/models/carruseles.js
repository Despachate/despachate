var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var carruselesSchema = new Schema({
    titulo: { type: String, required: [true, 'El titulo del carrucel es necesario'] }
});

module.exports = mongoose.model('Carruseles', carruselesSchema);