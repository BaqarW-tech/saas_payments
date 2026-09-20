import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import * as s from "./shared-styles";

interface AbandonedCartEmailProps {
  customerEmail: string;
  checkoutUrl: string;
}

export default function AbandonedCartEmail({ customerEmail, checkoutUrl }: AbandonedCartEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your checkout is waiting for you</Preview>
      <Body style={s.main}>
        <Container style={s.container}>
          <Section style={s.header}>
            <Text style={s.logoText}>Your App</Text>
          </Section>
          <Hr style={s.divider} />
          <Heading style={s.h1}>You left something behind</Heading>
          <Text style={s.text}>
            We noticed you started a checkout but didn't complete your purchase. No worries — your cart is still waiting.
          </Text>
          <Section style={s.buttonContainer}>
            <Button style={s.button} href={checkoutUrl}>Complete Your Purchase</Button>
          </Section>
          <Text style={s.textSmall}>Ran into an issue during checkout? Just reply to this email.</Text>
          <Hr style={s.divider} />
          <Text style={s.footer}>
            This email was sent to {customerEmail} because you started a checkout. If this wasn't you, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

AbandonedCartEmail.PreviewProps = {
  customerEmail: "customer@example.com",
  checkoutUrl: "https://example.com/pricing",
} satisfies AbandonedCartEmailProps;
