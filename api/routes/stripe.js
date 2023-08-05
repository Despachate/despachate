var express = require('express');
var app = express();

const URL = 'http://localhost:4200/';

const Stripe = require('stripe');
const stripe = Stripe(
  'sk_test_51KFhD4KxNLkcjMb4NfLvIVN2q5x9VA4F6VYc0ZFE5DPngvJnyEtxpCGWJkqvDli5PGe5HpQVED4LvVDEkRx54jS200dtygFIMM'
);

const StripePayment = require('../models/stripe_payments');

app.get('/:compra', async (req, res, next) => {
  let { compra } = req.params;

  try {
    let payment = await StripePayment.findOne({ pedido: compra });

    if (!payment) {
      return res.status(404).json({
        ok: false,
        message: 'No se encontró el pago',
      });
    }

    let { check_session_id } = payment;

    let session = await stripe.checkout.sessions.retrieve(check_session_id);

    res.json({
      ok: true,
      session,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: 'Error inesperado',
    });
  }
});

app.post('/old_payments', async (req, res, next) => {
  // card gift { valor: number, codigo: string}
  let { products, compra } = req.body;
  if (!products && !compra) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Faltan datos',
      errors: { message: 'Faltan datos', monto, usuario },
    });
  }
  let line_items = products.map((item) => ({
    price_data: {
      currency: 'mxn',
      unit_amount: (item.paquete.precio - item.oferta) * 100,
      product_data: {
        name: `${item.producto.nombre} ( ${item.paquete.paquete} )`,
        images: [
          `https://despachate.com.mx/node/imagenes/productos/${item.producto.img}`,
        ],
      },
    },
    quantity: item.cantidad,
  }));

  donacion = {
    price_data: {
      currency: 'mxn',
      unit_amount: compra.donacion * 100,
      product_data: {
        name: 'Donación',
        images: [
          `https://despachate.com.mx/node/imagenes/donaciones/5f19ea10265f2e789e7c5f3f-528.PNG`,
        ],
      },
    },
    quantity: 1,
  };

  empaque = {
    price_data: {
      currency: 'mxn',
      unit_amount: compra.empaque.precio * 100,
      product_data: {
        name: `Empaque (${compra.empaque.tipoEmpaque})`,
        images: [
          `https://despachate.com.mx/tienda/assets/images/${
            compra.empaque.tipoEmpaque === 'Tela'
              ? '002-datosentrega.jpg'
              : '001-datosentrega.jpg'
          }`,
        ],
      },
    },
    quantity: compra.cantidadEmpaque,
  };
  envio = {
    price_data: {
      currency: 'mxn',
      unit_amount: compra.costoEnvio * 100,
      product_data: {
        name: `Envio`,
        images: [],
      },
    },
    quantity: 1,
  };

  line_items = [...line_items, donacion, empaque, envio];

  if (compra.saldo_comprado > 0) {
    let saldo = {
      price_data: {
        currency: 'mxn',
        unit_amount: compra.saldo_comprado * 100,
        product_data: {
          name: `Saldo`,
          images: [],
        },
      },
      quantity: 1,
    };
    line_items = [...line_items, saldo];
  }

  try {
    const session = await stripe.checkout.sessions.create({
      success_url: `${URL}success;id=${compra._id}`,
      cancel_url: `${URL}cancel;id=${compra._id}`,
      line_items,
      mode: 'payment',
    });

    const stripePayment = new StripePayment({
      check_session_id: session.id,
      pedido: compra._id,
    });

    const payment = await stripePayment.save();

    return res.status(200).json({
      ok: true,
      session,
      payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al crear la sesion de pago',
      errors: error,
    });
  }
});

app.post('/', async (req, res, next) => {
  let { products, compra } = req.body;
  if (!products && !compra) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Faltan datos',
      errors: { message: 'Faltan datos', compra, usuario },
    });
  }
  let line_items = [
    {
      price_data: {
        currency: 'mxn',
        unit_amount: Math.round(compra.precioTotal * 100),
        product_data: {
          name: `Carrito Despachate`,
          images: [],
        },
      },
      quantity: 1,
    },
  ];

  try {
    const session = await stripe.checkout.sessions.create({
      success_url: `${URL}success;id=${compra._id}`,
      cancel_url: `${URL}cancel;id=${compra._id}`,
      line_items,
      mode: 'payment',
    });

    const stripePayment = new StripePayment({
      check_session_id: session.id,
      pedido: compra._id,
    });

    const payment = await stripePayment.save();

    return res.status(200).json({
      ok: true,
      session,
      payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al crear la sesion de pago',
      errors: error,
    });
  }
});

app.post('/giftCard/', async (req, res, next) => {
  let { compra } = req.body;
  if (  !compra) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Faltan datos',
      errors: { message: 'Faltan datos', compra, usuario },
    });
  }
  let line_items = [
    {
      price_data: {
        currency: 'mxn',
        unit_amount: Math.round(compra.precioTotal * 100),
        product_data: {
          name: `Compra Gift Card`,
          images: [],
        },
      },
      quantity: 1,
    },
  ];

  try {
    const session = await stripe.checkout.sessions.create({
      success_url: `${URL}successGiftCard;id=${compra._id}`,
      cancel_url: `${URL}cancel;id=${compra._id}`,
      line_items,
      mode: 'payment',
    });

    const stripePayment = new StripePayment({
      check_session_id: session.id,
      pedido: compra._id,
    });

    const payment = await stripePayment.save();

    return res.status(200).json({
      ok: true,
      session,
      payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al crear la sesion de pago',
      errors: error,
    });
  }
});

module.exports = app;
