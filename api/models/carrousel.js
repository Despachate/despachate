var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var carrouselSchema = new Schema({
    img: { type: String, required: false }
});

module.exports = mongoose.model('Carrousel', carrouselSchema);