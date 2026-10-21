const crypto = require('node:crypto');

module.exports = async function verifyPayment(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('RAZORPAY_KEY_SECRET is missing');
    return res.status(503).json({ error: 'Payment verification is not configured yet.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const orderId = String(body.razorpay_order_id || '');
  const paymentId = String(body.razorpay_payment_id || '');
  const signature = String(body.razorpay_signature || '');
  if (!orderId || !paymentId || !/^[a-f0-9]{64}$/i.test(signature)) {
    return res.status(400).json({ error: 'Incomplete payment verification data.' });
  }

  const expected = crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex');
  const valid = crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  if (!valid) return res.status(400).json({ verified: false, error: 'Payment signature is invalid.' });

  return res.status(200).json({ verified: true, paymentId });
};
