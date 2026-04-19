import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Terraria Workshops'

interface CustomerUpdateProps {
  name?: string
  subject?: string
  intro?: string
  body?: string
  signoff?: string
}

// Split body on blank lines into paragraphs to preserve basic line breaks
const toParagraphs = (input?: string): string[] => {
  if (!input) return []
  return input
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean)
}

const CustomerUpdateEmail = ({
  name, subject, intro, body, signoff,
}: CustomerUpdateProps) => {
  const paragraphs = toParagraphs(body)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{subject || `An update from ${SITE_NAME}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {name ? `Hi ${name},` : 'Hello,'}
          </Heading>
          {intro && <Text style={text}>{intro}</Text>}

          {paragraphs.length > 0 && (
            <Section style={card}>
              {paragraphs.map((p, i) => (
                <Text key={i} style={paragraph}>{p}</Text>
              ))}
            </Section>
          )}

          <Text style={text}>
            {signoff || 'If you have any questions, just reply to this email.'}
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            With clay and care,<br />
            The {SITE_NAME} team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CustomerUpdateEmail,
  subject: (data: Record<string, any>) => data.subject || `An update from ${SITE_NAME}`,
  displayName: 'Customer update (operational)',
  previewData: {
    name: 'Sara',
    subject: 'Small change to Saturday\'s pottery workshop',
    intro: 'A quick heads-up about your upcoming workshop.',
    body: 'We\'re moving the start time from 10:00 to 10:30 to allow extra setup.\n\nEverything else stays the same — same location, same group, same instructor. See you Saturday!',
    signoff: 'Thanks for your flexibility.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Rubik, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#fff5ec', borderRadius: '12px', padding: '20px', margin: '20px 0' }
const paragraph = { fontSize: '15px', color: '#1a1a1a', lineHeight: '1.6', margin: '0 0 12px' }
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#888', margin: '0' }
