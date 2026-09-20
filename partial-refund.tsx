import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import * as s from "./shared-styles";

interface PartialRefundEmailProps {
  customerEmail: string;
  refundAmount: number;
  originalAmount: number;
  currency: string;
}

export default function PartialRefundEmail({ refundAmount, originalAmount, currency }: PartialRefundEmailProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(n / 100);

  return (
    <Html>
      <Head />
      <Preview>Your partial refund has been processed</Preview>
      <Body style={s.main}>
        <Container style={s.container}>
          <Section style={s.header}>
            <Text style={s.logoText}>Your App</Text>
          </Section>
          <Hr style={s.divider} />
          <Heading style={s.h1}>Partial refund processed</Heading>
          <Text style={s.text}>
            You've been refunded {fmt(refundAmount)} of your original {fmt(originalAmount)} purchase.
            Your access remains active.
          </Text>
          <Hr style={s.divider} />
          <Text style={s.footer}>Questions? Reply to this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}

PartialRefundEmail.PreviewProps = {
  customerEmail: "customer@example.com",
  refundAmount: 5000,
  originalAmount: 19900,
  currency: "usd",
} satisfies PartialRefundEmailProps;
