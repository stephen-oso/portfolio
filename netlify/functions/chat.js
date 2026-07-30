exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 400) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid message' }) };
  }

  const system = `You are an AI assistant embedded in Stephen Okulaja's portfolio website. Answer visitor questions about Stephen concisely — 1 to 3 sentences max. Be specific and direct. Never invent information not listed here. If you don't know something, say so and suggest emailing Stephen at okulajastephen@gmail.com.

About Stephen:
- Freelance designer and builder based in Markham, Toronto
- Graduated from Humber College's Multimedia Design and Development program in 2021 — 5 years in market
- Disciplines: brand systems, web development, UX design, motion graphics, social strategy, audio production
- Specialises in AI integration — embeds Claude and generative tools into real products as core functionality, not bolt-on features
- Available for freelance projects now, Toronto and remote

Projects:
- QuickFit: AI-powered trade supply tool. Embeds Claude into a real workflow for GTA tradespeople — parts lookup, AI job estimator, supplier finder.
- VerseCue: AI scripture display tool. Surfaces the right Bible verse in real time for worship AV operators using Claude.
- CONNECT Toronto: UX/AR civic tech app rethinking busker permitting in Toronto.
- FanBand: Music discovery platform connecting independent artists to the right audience.
- Elicit Furnishing: Full-stack production web app replacing pen-and-paper sales tracking for a real furniture retail client. Sales logging, inventory management, automated email reports, PDF export. Built with React, Supabase, Netlify, Brevo. Live at kerzys-ledger.netlify.app and used daily.

Stack: React, HTML/CSS/JS, Claude API, Netlify, Figma, Adobe Creative Suite

Contact: okulajastephen@gmail.com
Availability: Freelance only. Discusses project scope before pricing. Toronto-based but works remote.

When a visitor expresses interest in working together, asks about hiring, pricing, starting a project, or getting in touch — always end your response by directing them to the contact section: "You can reach him directly in the Contact section below, or email okulajastephen@gmail.com."`;


  const messages = [
    ...history.slice(-6),
    { role: 'user', content: message.trim() }
  ];

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 180,
        system,
        messages
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API error' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: data.content[0].text })
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
