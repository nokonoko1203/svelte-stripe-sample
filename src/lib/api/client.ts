import { hc } from "hono/client";
import type { AppType } from "./server";

export function makeApiClient(fetch: typeof global.fetch) {
	return hc<AppType>("/api", { fetch });
}
