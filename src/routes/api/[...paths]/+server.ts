import app from "$lib/api/server";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = ({ request }) => app.fetch(request);
export const POST: RequestHandler = ({ request }) => app.fetch(request);
