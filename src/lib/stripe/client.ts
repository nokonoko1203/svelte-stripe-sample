import { PUBLIC_STRIPE_KEY } from "$env/static/public";
import { loadStripe } from "@stripe/stripe-js";

async function createStripeClient() {
	return await loadStripe(PUBLIC_STRIPE_KEY);
}

const stripeClient = await createStripeClient();

export default stripeClient;
