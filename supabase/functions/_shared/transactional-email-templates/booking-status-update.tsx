import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Terraria Workshops'

interface BookingStatusUpdateProps {
  name?: string
  workshop?: string
  date?: string
  city?: string
  sessionInfo?: string
  status?: 'confirmed' | 'rescheduled' | 'cancelled' | string
  message?: string
}

const STATUS_HEADLINES: Record<string, string> = {
  confirmed: 'Your booking is confirmed',
  rescheduled: 'Your booking has been rescheduled',
  cancelled: 'Your booking has been cancelled',
}

const STATUS_INTRO: Record<string, string> = {
  confirmed: "Great news — we've confirmed your spot. We're looking forward to having you with us.",
  rescheduled: "We've updated the date for your workshop. The new details are below.",
  cancelled: "Your booking has been cancelled. If this wasn't expected, just reply and we'll help you re-book.",
}

const BookingStatusUpdateEmail = ({
  name, workshop, date, city, sessionInfo, status = 'confirmed', message,
}: BookingStatusUpdateProps) => {
  const headline = STATUS_HEADLINES[status] || 'An update on your booking'
  const intro = STATUS_INTRO[status] || "Here's an update on your workshop booking."
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{headline} — {SITE_NAME}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {name ? `Hi ${name},` : 'Hello,'}
          </Heading>
          <Text style={text}>{intro}</Text>

          <Section style={card}>
            <Text style={cardTitle}>{headline}</Text>
            {workshop && <Text style={detail}><strong>Workshop:</strong> {workshop}</Text>}
            {date && <Text style={detail}><strong>Date:</strong> {date}</Text>}
            {city && <Text style={detail}><strong>City:</strong> {city}</Text>}
            {sessionInfo && <Text style={detail}><strong>Session:</strong> {sessionInfo}</Text>}
          </Section>

          {message && (
            <Section style={noteBox}>
              <Text style={detail}>{message}</Text>
            </Section>
          )}

          <Text style={text}>
            If you have any questions, just reply to this email — we read every message.
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
  component: BookingStatusUpdateEmail,
  subject: (data: Record<string, any>) => {
    const s = data.status || 'updated'
    return STATUS_HEADLINES[s] || `An update on your booking — ${SITE_NAME}`
  },
  displayName: 'Booking status update',
  previewData: {
    name: 'Sara',
    workshop: 'Pottery Experience',
    date: '2026-05-12',
    city: 'Tetouan',
    sessionInfo: 'Open Session',
    status: 'confirmed',
    message: 'Looking forward to seeing you on Saturday at 10am.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Rubik, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#fff5ec', borderRadius: '12px', padding: '20px', margin: '20px 0' }
const noteBox = { backgroundColor: '#f7f7f5', borderLeft: '3px solid #c2410c', borderRadius: '6px', padding: '14px 16px', margin: '12px 0 20px' }
const cardTitle = { fontSize: '13px', fontWeight: 'bold', color: '#c2410c', textTransform: 'uppercase' as const, margin: '0 0 12px', letterSpacing: '0.5px' }
const detail = { fontSize: '14px', color: '#1a1a1a', margin: '0 0 6px' }
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#888', margin: '0' }
