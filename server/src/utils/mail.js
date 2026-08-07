import nodemailer from 'nodemailer';

function canSendMail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOrderEmails(order) {
  if (!canSendMail()) {
    console.log('Email skipped (SMTP not configured). Order:', order._id);
    return { sent: false };
  }

  const transport = createTransport();
  const from = process.env.MAIL_FROM || 'QuantumStore <noreply@quaantumlogicslimited.com>';
  const adminTo = process.env.ADMIN_EMAIL || 'admin@quaantumlogicslimited.com';
  const itemLines = order.items
    .map((item) => `${item.name} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const customerBody = `Thanks for your order at QuantumStore (Quantum Logics Limited).

Order ID: ${order._id}
Total: $${order.totalAmount.toFixed(2)}
Payment: ${order.paymentStatus} (${order.paymentMethod})

Items:
${itemLines}

We will ship to:
${order.address}
`;

  const adminBody = `New QuantumStore order

Customer: ${order.customerName}
Email: ${order.email}
Phone: ${order.phone}
Total: $${order.totalAmount.toFixed(2)}
Payment: ${order.paymentStatus} (${order.paymentMethod})

Items:
${itemLines}

Ship to:
${order.address}
`;

  await transport.sendMail({
    from,
    to: order.email,
    subject: `Order confirmed — QuantumStore #${String(order._id).slice(-6)}`,
    text: customerBody,
  });

  await transport.sendMail({
    from,
    to: adminTo,
    subject: `New order — QuantumStore #${String(order._id).slice(-6)}`,
    text: adminBody,
  });

  return { sent: true };
}
