import { env } from "$env/dynamic/private";
import { Hono } from "hono";
import Stripe from "stripe";

export const stripe = new Stripe(env.SECRET_STRIPE_KEY || "");

const app = new Hono();
app.post("/checkout", async (c) => {
	const { lookup_key } = await c.req.json();
	const url = new URL(c.req.url);
	const protocol = url.protocol;
	const host = url.host;

	const prices = await stripe.prices.list({
		lookup_keys: [lookup_key],
	});
	const priceId = prices.data[0].id;

	const email = "nokonoko@example.com";
	let customerId = "dummy_user";

	try {
		await stripe.customers.retrieve(customerId);
	} catch {
		const customer = await stripe.customers.create({
			email,
		});
		customerId = customer.id;
	}

	try {
		const session = await stripe.checkout.sessions.create({
			ui_mode: "embedded",
			customer: customerId,
			payment_method_types: ["card"],
			client_reference_id: "dummy_user",
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: "subscription",
			return_url: `${protocol}//${host}/success?session_id={CHECKOUT_SESSION_ID}`,
		});

		return c.json({ clientSecret: session.client_secret! });
	} catch (err) {
		console.error(err);
		return c.json({ message: "error" });
	}
});

app.post("/webhook", async (c) => {
	const sig = c.req.header("stripe-signature");
	const body = await c.req.text();

	if (!sig) {
		return c.json({ message: "" }, { status: 400 });
	}

	try {
		// `/webhook`は誰でもリクエストできるので、stripeからのリクエストであることを検証する
		const event = stripe.webhooks.constructEvent(
			body,
			sig,
			env.STRIPE_WEBHOOK_SECRET,
		);

		switch (event.type) {
			case "payment_intent.created": {
				console.log(event.data.object);
				break;
			}
			default:
				break;
		}
		return c.json({ message: "" }, { status: 200 });
	} catch (err) {
		const errorMessage = `Webhook signature verification failed. ${
			err instanceof Error ? err.message : "Internal server error"
		}`;
		console.log(errorMessage);
		return c.json({ message: "" }, { status: 400 });
	}
});

export default app;
