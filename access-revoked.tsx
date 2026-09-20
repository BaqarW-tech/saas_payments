import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import * as s from "./shared-styles";

interface AccessRevokedEmailProps {
  customerEmail: string;
  refundAmount: number;
  currency: string;
}

export default function AccessRevokedEmail({ refundAmount, currency }: AccessRevokedEmailProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(refundAmount / 100);

  return (
    <Html>
      <Head />
      <Preview>Your refund has been processed</Preview>
      <Body style={s.main}>
        <Container style={s.container}>
          <Section style={s.header}>
            <Text style={s.logoText}>Your App</Text>
          </Section>
          <Hr style={s.divider} />
          <Heading style={s.h1}>Refund processed</Heading>
          <Text style={s.text}>
            Your refund of {formatted} has been processed. Your access has also been removed.
          </Text>
          <Hr style={s.divider} />
          <Text style={s.footer}>Questions? Reply to this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}

AccessRevokedEmail.PreviewProps = {
  customerEmail: "customer@example.com",
  refundAmount: 19900,
  currency: "usd",
} satisfies AccessRevokedEmailProps;
