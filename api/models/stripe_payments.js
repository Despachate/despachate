const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stripePaymentsSchema = new Schema(
  {
    check_session_id: {
      type: String,
      required: [true, 'El check_session_id es necesario'],
    },
    pedido: {
      type: Schema.Types.ObjectId,
      ref: 'Pedido',
      required: [true, 'El pedido es necesario'],
    },
  },
  { collection: 'stripe_payments', timestamps: true }
);

module.exports = mongoose.model('StripePayments', stripePaymentsSchema);
