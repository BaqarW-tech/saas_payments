import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import * as s from "./shared-styles";

interface PurchaseConfirmationEmailProps {
  amount: number;
  currency: string;
  customerEmail: string;
}

export default function PurchaseConfirmationEmail({ amount, currency, customerEmail }: PurchaseConfirmationEmailProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  return (
    <Html>
      <Head />
      <Preview>Your purchase is confirmed!</Preview>
      <Body style={s.main}>
        <Container style={s.container}>
          <Section style={s.header}>
            <Text style={s.logoText}>Your App</Text>
          </Section>
          <Hr style={s.divider} />
          <Heading style={s.h1}>Thank you for your purchase!</Heading>
          <Text style={s.text}>
            Your payment has been processed successfully. We're now setting up your access.
            You'll receive another email shortly.
          </Text>
          <Section style={s.detailsBox}>
            <Text style={s.detailsTitle}>Order Details</Text>
            <Section style={s.detailRow}>
              <Text style={s.detailLabel}>Amount</Text>
              <Text style={s.detailValue}>{formattedAmount}</Text>
            </Section>
            <Section style={s.detailRow}>
              <Text style={s.detailLabel}>Email</Text>
              <Text style={s.detailValue}>{customerEmail}</Text>
            </Section>
          </Section>
          <Text style={s.text}>This is a one-time purchase. No recurring charges will be made.</Text>
          <Hr style={s.divider} />
          <Text style={s.footer}>
            Questions? Reply to this email or reach out at{" "}
            <Link href="mailto:support@example.com" style={s.link}>support@example.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PurchaseConfirmationEmail.PreviewProps = {
  amount: 19900,
  currency: "usd",
  customerEmail: "customer@example.com",
} satisfies PurchaseConfirmationEmailProps;
