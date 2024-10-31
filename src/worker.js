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
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Allow-Credentials': 'true',
            'Vary': 'Origin',
          },
        });
      }
  
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }
  
      try {
        const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Real-IP');
        const rateLimitKey = `ratelimit:${clientIP}`;
        
        const rateLimit = await env.KV_STORE.get(rateLimitKey);
        const currentCount = rateLimit ? parseInt(rateLimit) : 0;
        
        if (currentCount >= LIMIT_PER_DAY) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Rate limit exceeded. Please try again later.'
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
              'Access-Control-Allow-Credentials': 'true',
              'Retry-After': '3600',
              'Vary': 'Origin',
            },
          });
        }
        
        await env.KV_STORE.put(rateLimitKey, (currentCount + 1).toString(), {
          expirationTtl: 86400
        });

        const formData = await request.json();
        const { name, email, message } = formData;
        const url = request.url;
  
        if (!name?.trim() || !email?.trim() || !message?.trim()) {
          return new Response('Missing required fields', { status: 400 });
        }

        if (!isValidEmail(email)) {
          return new Response('Invalid email format', { status: 400 });
        }

        const sanitizedName = sanitizeHtml(name);
        const sanitizedMessage = sanitizeHtml(message);

        const emailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>
            
            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${sanitizedName}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Submitted from:</strong> ${url}</p>
            </div>

            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Message:</strong></p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
                ${sanitizedMessage.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        `;

        const emailData = {
          from: EMAIL_FROM,
          to: EMAIL_TO,
          subject: `New Contact Form Submission from ${sanitizedName}`,
          html: emailTemplate,
          reply_to: email,
        };
  
        const emailResponse = await fetch(RESEND_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });
  
        const emailResult = await emailResponse.json();
  
        if (!emailResponse.ok) {
          const errorMessage = emailResult.error?.message || 'Failed to send email';
          console.error('Email sending failed:', errorMessage);
          throw new Error(errorMessage);
        }
  
        return new Response(JSON.stringify({
          success: true,
          message: 'Form submitted successfully'
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
            'Access-Control-Allow-Credentials': 'true',
            'X-RateLimit-Limit': `${LIMIT_PER_DAY}`,
            'X-RateLimit-Remaining': (LIMIT_PER_DAY - (currentCount + 1)).toString(),
            'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + 86400,
            'Vary': 'Origin',
          },
        });
  
      } catch (error) {
        console.error('Form submission error:', error);
        return new Response(JSON.stringify({
          success: false,
          message: 'An error occurred while processing your request'
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

// Add email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Add HTML sanitization helper
const sanitizeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};