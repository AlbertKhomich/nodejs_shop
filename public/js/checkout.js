const stripe = Stripe(
  'pk_test_51OJueZLJW4VKEQvle1mLFzAYxzYoYc4Fhdf75hEVT9bdwJgxuARxZv2NESE5lfQI0CA4raz9PPvSGRJZkJb4lwoz00SikHdGCQ'
);

const paymentId = document.querySelector('input[name="paymentId"]').value;

(async () => {
  const response = await fetch(`/secret/${paymentId}`);
  const { client_secret: clientSecret } = await response.json();
  // Render the form using the clientSecret

  const options = { clientSecret: clientSecret };

  const elements = stripe.elements(options);

  const addressElement = elements.create('address', { mode: 'shipping' });
  addressElement.mount('#address-element');

  addressElement.on('change', (event) => {
    if (event.complete) {
      // Extract potentially complete address
      const address = event.value.address;
    }
  });

  const paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');

  const form = document.getElementById('payment-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${location.protocol}//${location.host}/checkout/success`, // => http://localhost:3000/checkout/success
      },
    });
    if (error) {
      const messageContainer = document.querySelector('#error-message');
      messageContainer.textContent = error.message;
    }
  });
})();
