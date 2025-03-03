const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    // ✅ Convert the x-www-form-urlencoded data to an object
    const formData = new URLSearchParams(event.body);
    const email = formData.get('email'); // Extract email from the form

    if (!email) {
      console.error('Missing email field in form submission.');
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email' }) };
    }

    console.log(`Sending email to: ${email}`);

    const msg = {
      to: email,
      from: 'learnwithlinguid@gmail.com', // Replace with your verified SendGrid sender email
      subject: 'Thank you for signing up!',
      text: 'We appreciate your interest in Learning with Linguid!',
      html: '<p>We appreciate your interest in <b>Learning with Linguid</b>! Stay tuned for updates.</p>',
    };

    await sgMail.send(msg);
    console.log('Email sent successfully!');

    return { statusCode: 200, body: JSON.stringify({ message: 'Email sent!' }) };
  } catch (error) {
    console.error('Error sending email:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};