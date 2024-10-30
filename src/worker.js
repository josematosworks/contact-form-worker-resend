export default {
    async fetch(request, env) {
      const ALLOWED_ORIGIN = env.ALLOWED_ORIGIN;
      const EMAIL_FROM = env.EMAIL_FROM; 
      const EMAIL_TO = env.EMAIL_TO.split(','); 
      const RESEND_API_ENDPOINT = env.RESEND_API_ENDPOINT;
      const RESEND_API_KEY = env.RESEND_API_KEY;

      const origin = request.headers.get('Origin');
      if (origin !== ALLOWED_ORIGIN) {
        return new Response('Unauthorized origin', {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
  
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          },
        });
      }
  
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }
  
      try {
        const formData = await request.json();
        const { name, email, message } = formData;
  
        if (!name || !email || !message) {
          return new Response('Missing required fields', { status: 400 });
        }

  
        const emailData = {
          from: EMAIL_FROM,
          to: EMAIL_TO,
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        };
  
        const emailResponse = await fetch(RESEND_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ secrets.RESEND_API_KEY }`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });
  
        const emailResult = await emailResponse.json();
  
        if (!emailResponse.ok || emailResult.error) {
          throw new Error(emailResult.error?.message || 'Failed to send email');
        }
  
        return new Response(JSON.stringify({
          success: true,
          message: 'Form submitted successfully'
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          },
        });
  
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: error.message
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          },
        });
      }
    },
  };