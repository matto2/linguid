const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    // ✅ Convert the x-www-form-urlencoded data to an object
    const formData = new URLSearchParams(event.body);
    const email = formData.get('email'); // Extract email from the form
    const unsubscribeUrl = `https://learnwithlinguid.com/unsubscribe?email=${encodeURIComponent(email)}`;

    if (!email) {
      console.error('Missing email field in form submission.');
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email' }) };
    }

    console.log(`Checking if ${email} is unsubscribed...`);

    // ✅ Check if the user is unsubscribed before sending the email
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
      subject: 'Welcome to The Future of Language Learning!',
      text: `Thank you for signing up to test out LiNGUiD! We're thrilled to have you on board.
      
Your feedback is incredibly valuable to us. We want to make sure this app is the best it can be for language learners like you.
      
👉 Try the app here: https://linguid.vercel.app/
      
Once you’ve checked out LiNGUiD, please take a few minutes to fill out this short form to share your thoughts and experiences:
      
📝 Give Feedback: https://your-google-form-link.com

If you no longer want to receive emails from us, you can unsubscribe here: ${unsubscribeUrl}
      
Thanks for being part of our journey!
- The LiNGUiD Team`,
      
      html: `
        <p>Thank you for signing up to test out <b>LiNGUiD</b>! We're thrilled to have you on board.</p>
        
        <p>Your feedback is incredibly valuable to us. We want to make sure this app is the best it can be for language learners like you.</p>
        
        <p><strong>👉 Try the app here:</strong> <a href="https://linguid.vercel.app/" target="_blank" style="color: #1a73e8; font-weight: bold;">Launch LiNGUiD</a></p>
        
        <p>Once you’ve checked out LiNGUiD, please take a few minutes to fill out this short form to share your thoughts and experiences:</p>
        
        <p><strong>📝 Give Feedback:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSe64p-rO44MoaeTdob6-ssTV2k-gOHdXMQm5eeiYiiuQCVQVg/viewform?usp=dialog" target="_blank" style="color: #1a73e8; font-weight: bold;">Submit Feedback</a></p>

        <hr>
        <p style="font-size: 12px; color: #666;">
          If you no longer want to receive these emails, you can 
          <a href="${unsubscribeUrl}" target="_blank" style="color: #666; text-decoration: underline;">unsubscribe here</a>.
        </p>
        
        <p>Thanks for being part of our journey!<br>- The LiNGUiD Team</p>
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