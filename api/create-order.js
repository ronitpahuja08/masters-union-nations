const crypto = require('node:crypto');

const ALLOWED_COMMITTEES = new Set(['UNHRC','MCC','CCEP','IPL','AIPPM','DALAL','STARTUP','IP']);

module.exports = async function createOrder(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const feeInr = Number(process.env.REGISTRATION_FEE_INR);
  if (!keyId || !keySecret || !Number.isFinite(feeInr) || feeInr <= 0) {
    console.error('Razorpay environment variables are incomplete');
    return res.status(503).json({ error: 'Payment gateway is not configured yet.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const name = String(body.name || '').trim().slice(0, 60);
  const committee = String(body.committee || '').trim().toUpperCase();
  if (!name || !ALLOWED_COMMITTEES.has(committee)) {
    return res.status(400).json({ error: 'Valid delegate and committee details are required.' });
  }

  const amount = Math.round(feeInr * 100);
  const receipt = ('mun26_' + crypto.randomUUID().replaceAll('-', '')).slice(0, 40);
  try {
    const auth = Buffer.from(keyId + ':' + keySecret).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'INR', receipt, notes: { delegate: name, committee } })
    });
    const order = await response.json();
    if (!response.ok) {
      console.error('Razorpay order creation failed', response.status, order?.error?.code);
      return res.status(502).json({ error: 'Razorpay could not create the payment order.' });
    }
    return res.status(200).json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      description: committee + ' Delegate Registration'
    });
  } catch (error) {
    console.error('Razorpay order request failed', error);
    return res.status(500).json({ error: 'Payment service is temporarily unavailable.' });
  }
};
