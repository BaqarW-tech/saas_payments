import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import * as s from "./shared-styles";

interface RepoAccessGrantedEmailProps {
  repoUrl: string;
}

export default function RepoAccessGrantedEmail({ repoUrl }: RepoAccessGrantedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your access is ready!</Preview>
      <Body style={s.main}>
        <Container style={s.container}>
          <Section style={s.header}>
            <Text style={s.logoText}>Your App</Text>
          </Section>
          <Hr style={s.divider} />
          <Heading style={s.h1}>You're in!</Heading>
          <Text style={s.text}>Your access has been granted. You now have full access.</Text>
          <Section style={s.buttonContainer}>
            <Button style={s.button} href={repoUrl}>Open Repository</Button>
          </Section>
          <Hr style={s.divider} />
          <Text style={s.footer}>
            Need help? Reply to this email or reach out at{" "}
            <Link href="mailto:support@example.com" style={s.link}>support@example.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

RepoAccessGrantedEmail.PreviewProps = { repoUrl: "https://github.com/example/repo" } satisfies RepoAccessGrantedEmailProps;
