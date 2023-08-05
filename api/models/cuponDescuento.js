const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const cuponDescuentoSchema = new Schema(
  {
    codigo: {
      type: String,
      unique: true,
      required: [true, 'El código del cupón es necesario'],
    },
    valor: {
      type: String,
      required: [true, 'El valor del cupón es necesario'],
    },
    tipo: { type: String, required: [true, 'El tipo del cupón es necesario'] },
    // Caducidad
    caduca: { type: Boolean, required: [true, 'El campo caduca es necesario'] },
    tipoCaducidad: { type: String, required: false },
    fechaInicio: { type: Date, required: false },
    fechaCaducidad: { type: Date, required: false },
    // Intentos
    intentos: {
      type: Number,
      required: [true, 'El campo intentos es necesario'],
    },
    intentosMaximos: { type: Number, required: false },
    // Compra mínima
    compraMinima: {
      type: Boolean,
      required: [true, 'El campo compraMinima es necesario'],
    },
    valorCompraMinima: { type: Number, required: false },
    // Usuario
    usuario: {
      type: Boolean,
      required: [true, 'El campo usuario es necesario'],
    },
    // Usuarios
    usuarios: [
      { type: Schema.Types.ObjectId, ref: 'Usuario', required: false },
    ],
    // Producto
    producto: {
      type: Boolean,
      required: [true, 'El campo producto es necesario'],
    },
    // productos
    productos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: false,
      },
    ],
    // Categoria
    categoria: {
      type: Boolean,
      required: [true, 'El campo categoria es necesario'],
    },
    // categorias
    categorias: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: false,
      },
    ],
    // Subcategoria
    subcategoria: {
      type: Boolean,
      required: [true, 'El campo subcategoria es necesario'],
    },
    // subcategorias
    subcategorias: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subcategoria',
        required: false,
      },
    ],
    // departamento
    departamento: {
      type: Boolean,
      required: [true, 'El campo departamento es necesario'],
    },
    departamentos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Departamento',
        required: false,
      },
    ],
    // Empresa
    empresa: {
      type: Boolean,
      required: [true, 'El campo empresa es necesario'],
    },
    empresas: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Empresa',
        required: false,
      },
    ],
    deleted: { type: Boolean, default: false },
  },
  { collection: 'cuponesDescuento', timestamps: true }
);

module.exports = mongoose.model('CuponDescuento', cuponDescuentoSchema);
