import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BookingAdminProps {
  name?: string
  email?: string
  phone?: string
  workshop?: string
  date?: string
  participants?: number
  city?: string
  sessionInfo?: string
  notes?: string
}

const BookingAdminNotificationEmail = ({
  name, email, phone, workshop, date, participants, city, sessionInfo, notes,
}: BookingAdminProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New booking request from {name || 'a customer'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📅 New booking request</Heading>
        <Text style={text}>
          A new booking just came in from the website.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>Customer</Text>
          {name && <Text style={detail}><strong>Name:</strong> {name}</Text>}
          {email && <Text style={detail}><strong>Email:</strong> {email}</Text>}
          {phone && <Text style={detail}><strong>Phone:</strong> {phone}</Text>}
          {city && <Text style={detail}><strong>City:</strong> {city}</Text>}
        </Section>

        <Section style={card}>
          <Text style={cardTitle}>Booking</Text>
          {workshop && <Text style={detail}><strong>Workshop:</strong> {workshop}</Text>}
          {date && <Text style={detail}><strong>Date:</strong> {date}</Text>}
          {participants && <Text style={detail}><strong>Participants:</strong> {participants}</Text>}
          {sessionInfo && <Text style={detail}><strong>Session:</strong> {sessionInfo}</Text>}
          {notes && <Text style={detail}><strong>Notes:</strong> {notes}</Text>}
        </Section>

        <Hr style={hr} />
        <Text style={footer}>Sent automatically from terrariaworkshops.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingAdminNotificationEmail,
  subject: (data: Record<string, any>) => `New booking — ${data.name || 'customer'} (${data.workshop || 'workshop'})`,
  displayName: 'Booking notification (admin)',
  previewData: {
    name: 'Sara El Amrani',
    email: 'sara@example.com',
    phone: '+212600000000',
    workshop: 'Pottery Experience',
    date: '2026-05-12',
    participants: 2,
    city: 'Tetouan',
    sessionInfo: 'Open Session',
    notes: 'First time trying pottery!',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Rubik, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#fff5ec', borderRadius: '12px', padding: '20px', margin: '16px 0' }
const cardTitle = { fontSize: '13px', fontWeight: 'bold', color: '#c2410c', textTransform: 'uppercase' as const, margin: '0 0 12px', letterSpacing: '0.5px' }
const detail = { fontSize: '14px', color: '#1a1a1a', margin: '0 0 6px' }
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#888', margin: '0' }
