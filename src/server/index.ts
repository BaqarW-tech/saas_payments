import { serve } from "inngest/bun";
import { stripeFunctions } from "@/lib/payments/stripe";
export default serve({ functions: stripeFunctions, client: (await import("../client")).inngest });
