import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name } = req.body || {};

    const cleanName = String(name || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 32);

    if (!cleanName) return res.status(400).json({ error: "Name required" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 100,
            product_data: { name: "pay1 — Your name. Forever." },
          },
          quantity: 1,
        },
      ],
      metadata: { name: cleanName },
      success_url: `${req.headers.origin}/?success=1`,
      cancel_url: `${req.headers.origin}/?canceled=1`,
    });

    return res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Stripe error" });
  }
}
