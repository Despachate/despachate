var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var status = {
  values: ['Agotado', 'En stock', 'Oculto'],
  message: '{VALUE} no es un tipo de status permitido',
};

var falvoritos = {
  values: ['si', 'no'],
  message: '"{VALUE}" no es un valor permitido',
};

var productoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es necesario'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es necesaria'],
    },
    etiqueta: { type: String, required: [true, 'La etiqueta es necesaria'] },
    departamento: {
      type: Schema.Types.ObjectId,
      ref: 'Departamento',
      required: [true, 'El departamento es necesario'],
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoria es necesaria'],
    },
    subcategoria: {
      type: Schema.Types.ObjectId,
      ref: 'Subcategoria',
      required: [true, 'La subcategoria es necesaria'],
    },
    estiloVida: {
      type: String,
      required: [true, 'El estilo de vida es necesario'],
    },
    sku: {
      type: String,
      unique: true,
      required: [true, 'El sku es necesario'],
    },
    resumenBreve: {
      type: String,
      required: [true, 'El resumen breve es necesario'],
    },
    img: { type: String, required: false },
    peso: { type: Number, required: [true, 'El peso es necesario'] },
    medida: { type: String, required: [true, 'La medida es necesaria'] },
    status: { type: String, required: true, default: 'En stock', enum: status },
    precio_ord: { type: Number, required: false },
    es_favorito: { type: String, required: false, default: 'no', enum: falvoritos },
  },
  { collection: 'productos' }
);

productoSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

module.exports = mongoose.model('Producto', productoSchema);
