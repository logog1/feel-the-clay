import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BookingAdminReminderProps {
  date?: string
  mode?: 'evening_before' | 'morning_of'
  bookings?: Array<{
    name: string
    workshop: string
    participants?: number
    phone?: string
    email?: string
    city?: string
    sessionInfo?: string
  }>
}

const BookingAdminReminderEmail = ({ date, mode, bookings = [] }: BookingAdminReminderProps) => {
  const isEvening = mode === 'evening_before'
  const headline = isEvening ? '🌙 Bookings for tomorrow' : "⏰ Tomorrow's bookings"
  const intro = isEvening
    ? `Heads up before tonight: you have ${bookings.length} confirmed booking${bookings.length === 1 ? '' : 's'} for ${date || 'tomorrow'}.`
    : `You have ${bookings.length} confirmed booking${bookings.length === 1 ? '' : 's'} for ${date || 'tomorrow'}.`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{bookings.length} workshop booking(s) tomorrow</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{headline}</Heading>
          <Text style={text}>{intro}</Text>

          {bookings.map((b, i) => (
            <Section key={i} style={card}>
              <Text style={cardTitle}>{b.workshop}</Text>
              <Text style={detail}><strong>Customer:</strong> {b.name}</Text>
              {b.participants && <Text style={detail}><strong>Participants:</strong> {b.participants}</Text>}
              {b.city && <Text style={detail}><strong>City:</strong> {b.city}</Text>}
              {b.sessionInfo && <Text style={detail}><strong>Session:</strong> {b.sessionInfo}</Text>}
              {b.phone && <Text style={detail}><strong>Phone:</strong> {b.phone}</Text>}
              {b.email && <Text style={detail}><strong>Email:</strong> {b.email}</Text>}
            </Section>
          ))}

          <Hr style={hr} />
          <Text style={footer}>Auto-reminder from terrariaworkshops.com</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BookingAdminReminderEmail,
  subject: (data: Record<string, any>) => `⏰ ${(data.bookings?.length ?? 0)} booking(s) tomorrow — ${data.date || ''}`,
  displayName: 'Booking reminder (admin recap)',
  previewData: {
    date: '2026-05-12',
    bookings: [
      { name: 'Sara El Amrani', workshop: 'Pottery Experience', participants: 2, phone: '+212600000000', email: 'sara@example.com', city: 'Tetouan', sessionInfo: 'Open Session' },
      { name: 'Yassine B.', workshop: 'Embroidery Workshop', participants: 4, phone: '+212611111111', city: 'Tetouan' },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Rubik, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#fff5ec', borderRadius: '12px', padding: '20px', margin: '12px 0' }
const cardTitle = { fontSize: '13px', fontWeight: 'bold', color: '#c2410c', textTransform: 'uppercase' as const, margin: '0 0 12px', letterSpacing: '0.5px' }
const detail = { fontSize: '14px', color: '#1a1a1a', margin: '0 0 6px' }
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#888', margin: '0' }
