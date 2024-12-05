import { Hono } from "hono";
import stripe from "./stripe.server";

const health = new Hono().get("/", async (c) => {
	return c.text("OK!");
});

const api = new Hono().route("", health).route("/stripe", stripe);

export default api;
