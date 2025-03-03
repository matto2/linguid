const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const { email } = JSON.parse(event.body);

    const msg = {
      to: email, // User who submitted the form
      from: 'your-email@example.com', // Replace with your verified email
      subject: 'Thank you for signing up!',
      text: 'We appreciate your interest! Stay tuned for updates.',
      html: '<p>We appreciate your interest! Stay tuned for updates.</p>',
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent!' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};