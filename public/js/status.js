const stripe = Stripe(
  'pk_test_51OJueZLJW4VKEQvle1mLFzAYxzYoYc4Fhdf75hEVT9bdwJgxuARxZv2NESE5lfQI0CA4raz9PPvSGRJZkJb4lwoz00SikHdGCQ'
);

const clientSecret = new URLSearchParams(window.location.search).get(
  'payment_intent_client_secret'
);

stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
  const message = document.querySelector('#message');

  switch (paymentIntent.status) {
    case 'succeded':
      message.innerText = 'Success! Payment recieved.';
      break;

    case 'processing':
      message.innerText =
        "Payment processing. We'll update you when payment is received.";
      break;

    case 'requries_payment_method':
      message.innerText = 'Payment failed. Please try another payment method.';
      break;

    default:
      message.innerText = 'Something went wrong.';
      break;
  }
});
