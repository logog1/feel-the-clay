import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Terraria Workshops'

interface BookingReminderProps {
  name?: string
  workshop?: string
  date?: string
  participants?: number
  city?: string
  sessionInfo?: string
}

const BookingReminderEmail = ({
  name, workshop, date, participants, city, sessionInfo,
}: BookingReminderProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reminder: your workshop with {SITE_NAME} is tomorrow</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `See you tomorrow, ${name}!` : 'See you tomorrow!'}
        </Heading>
        <Text style={text}>
          Just a friendly reminder that your workshop with us is happening tomorrow.
          We can't wait to welcome you and create something beautiful together.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>Your workshop</Text>
          {workshop && <Text style={detail}><strong>Workshop:</strong> {workshop}</Text>}
          {date && <Text style={detail}><strong>Date:</strong> {date}</Text>}
          {city && <Text style={detail}><strong>City:</strong> {city}</Text>}
          {participants && <Text style={detail}><strong>Participants:</strong> {participants}</Text>}
          {sessionInfo && <Text style={detail}><strong>Session:</strong> {sessionInfo}</Text>}
        </Section>

        <Text style={text}>
          A few small tips: come in clothes you don't mind getting a little clay on,
          and arrive 5 minutes early so we can start on time.
        </Text>
        <Text style={text}>
          If anything has changed on your side, just reply to this email and we'll sort it out.
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

export const template = {
  component: BookingReminderEmail,
  subject: 'Reminder: your workshop is tomorrow',
  displayName: 'Booking reminder (24h)',
  previewData: {
    name: 'Sara',
    workshop: 'Pottery Experience',
    date: '2026-05-12',
    participants: 2,
    city: 'Tetouan',
    sessionInfo: 'Open Session',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Rubik, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#fff5ec', borderRadius: '12px', padding: '20px', margin: '20px 0' }
const cardTitle = { fontSize: '13px', fontWeight: 'bold', color: '#c2410c', textTransform: 'uppercase' as const, margin: '0 0 12px', letterSpacing: '0.5px' }
const detail = { fontSize: '14px', color: '#1a1a1a', margin: '0 0 6px' }
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#888', margin: '0' }
