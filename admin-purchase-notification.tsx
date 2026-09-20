import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import * as s from "./shared-styles";

interface AdminPurchaseNotificationEmailProps {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string | null;
  stripeSessionId: string;
}

export default function AdminPurchaseNotificationEmail({
  amount,
  currency,
  customerEmail,
  customerName,
  stripeSessionId,
}: AdminPurchaseNotificationEmailProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  return (
    <Html>
      <Head />
      <Preview>New sale: {customerEmail}</Preview>
      <Body style={s.main}>
        <Container style={s.container}>
          <Heading style={s.h1}>New sale</Heading>
          <Text style={s.text}>
            {customerName ?? customerEmail} just paid {formatted}.
          </Text>
          <Hr style={s.divider} />
          <Text style={s.textSmall}>Stripe reference: {stripeSessionId}</Text>
        </Container>
      </Body>
    </Html>
  );
}

AdminPurchaseNotificationEmail.PreviewProps = {
  amount: 19900,
  currency: "usd",
  customerEmail: "customer@example.com",
  customerName: "Jane Doe",
  stripeSessionId: "pi_123",
} satisfies AdminPurchaseNotificationEmailProps;
