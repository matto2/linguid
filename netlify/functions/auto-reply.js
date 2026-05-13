const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    // Convert the x-www-form-urlencoded data to an object.
    const formData = new URLSearchParams(event.body);
    const email = formData.get('email'); // Extract email from the form
    const unsubscribeUrl = `https://learnwithlinguid.com/unsubscribe?email=${encodeURIComponent(email)}`;

    if (!email) {
      console.error('Missing email field in form submission.');
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email' }) };
    }

    console.log(`Checking if ${email} is unsubscribed...`);

    // Check if the user is unsubscribed before sending the email.
    const unsubscribedListPath = path.join('/tmp', 'unsubscribed.json');

    let unsubscribedList = [];
    if (fs.existsSync(unsubscribedListPath)) {
      unsubscribedList = JSON.parse(fs.readFileSync(unsubscribedListPath, 'utf-8'));
    }

    if (unsubscribedList.includes(email)) {
      console.log(`Skipping email to ${email}, they have unsubscribed.`);
      return { statusCode: 200, body: JSON.stringify({ message: 'User unsubscribed, email not sent.' }) };
    }

    console.log(`Sending email to: ${email}`);

    const msg = {
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`
      },
      to: email,
      from: 'learnwithlinguid@gmail.com', // Replace with your verified SendGrid sender email
      subject: 'You are on the LiNGUiD early access list',
      text: `Thanks for joining the LiNGUiD early access list.

LiNGUiD helps learners practice French through real short-form video, tap-to-translate captions, saved words, review, and AI chat.

We will send product updates and early testing details when the next round opens.

Thanks for being part of the early group.
- The LiNGUiD Team

----------------------------------------------------------
If you no longer want to receive emails from us, you can unsubscribe here: ${unsubscribeUrl}`,
      
      html: `
        <p>Thanks for joining the <b>LiNGUiD</b> early access list.</p>

        <p>LiNGUiD helps learners practice French through real short-form video, tap-to-translate captions, saved words, review, and AI chat.</p>

        <p>We will send product updates and early testing details when the next round opens.</p>

        <p>Thanks for being part of the early group.<br>- The LiNGUiD Team</p>
        
        <hr>
        <p style="font-size: 12px; color: #666;">
          If you no longer want to receive these emails, you can 
          <a href="${unsubscribeUrl}" target="_blank" style="color: #666; text-decoration: underline;">unsubscribe here</a>.
        </p>
      `,
    };

    await sgMail.send(msg);
    console.log('Email sent successfully!');

    return { statusCode: 200, body: JSON.stringify({ message: 'Email sent!' }) };
  } catch (error) {
    console.error('Error sending email:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
