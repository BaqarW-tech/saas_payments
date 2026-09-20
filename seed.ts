import { stripe } from "./index";

const PRODUCTS = [
  {
    name: "My SaaS Product",
    description: "Full access, one-time purchase",
    features: ["Full source code access", "Production-ready infrastructure", "Lifetime updates"],
    metadata: { tier: "pro" },
    prices: [
      {
        lookupKey: "pro_one_time",
        unitAmount: 19900,
        currency: "usd",
        nickname: "Pro One-Time",
      },
    ],
  },
];

async function main() {
  console.log("Seeding Stripe products and prices...\n");

  for (const config of PRODUCTS) {
    const products = await stripe.products.list({ active: true, limit: 100 });
    let product = products.data.find((p) => p.name === config.name);

    if (!product) {
      product = await stripe.products.create({
        name: config.name,
        description: config.description,
        marketing_features: config.features.map((f) => ({ name: f })),
        metadata: config.metadata,
      });
      console.log(`Created product "${config.name}" (${product.id})`);
    }

    for (const priceConfig of config.prices) {
      const existing = await stripe.prices.list({
        lookup_keys: [priceConfig.lookupKey],
        active: true,
        limit: 1,
      });

      if (existing.data[0]) {
        console.log(`Price "${priceConfig.lookupKey}" already exists`);
        continue;
      }

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceConfig.unitAmount,
        currency: priceConfig.currency,
        nickname: priceConfig.nickname,
        lookup_key: priceConfig.lookupKey,
        transfer_lookup_key: true,
      });

      console.log(`Created price "${priceConfig.lookupKey}" (${price.id})`);
    }
  }

  console.log("\nDone! Add the price ID to your .env as STRIPE_PRO_PRICE_ID");
}

main().catch(console.error);
