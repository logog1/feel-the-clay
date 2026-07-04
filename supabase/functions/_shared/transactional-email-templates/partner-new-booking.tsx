import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface PartnerNewBookingProps {
  partnerName?: string
  brandColor?: string
  guestName?: string
  roomNumber?: string
  guestEmail?: string
  guestPhone?: string
  experience?: string
  scheduledAt?: string
  participants?: number
  grossAmount?: string
  commissionRate?: number
  commissionAmount?: string
  currency?: string
  source?: string
  conciergeUrl?: string
}

const PartnerNewBookingEmail = ({
  partnerName, brandColor, guestName, roomNumber, guestEmail, guestPhone,
  experience, scheduledAt, participants, grossAmount, commissionRate,
  commissionAmount, currency, source, conciergeUrl,
}: PartnerNewBookingProps) => {
  const accent = brandColor || '#c2410c'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New booking at {partnerName || 'your property'} — {guestName || 'a guest'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={{ height: 4, background: accent, borderRadius: 2, margin: '0 0 20px' }} />
          <Heading style={h1}>New booking at {partnerName}</Heading>
          <Text style={text}>
            A guest just booked an experience through your concierge channel.
          </Text>

          <Section style={{ ...card, background: '#fff5ec' }}>
            <Text style={{ ...cardTitle, color: accent }}>Guest</Text>
            {guestName && <Text style={detail}><strong>Name:</strong> {guestName}</Text>}
            {roomNumber && <Text style={detail}><strong>Room:</strong> {roomNumber}</Text>}
            {guestEmail && <Text style={detail}><strong>Email:</strong> {guestEmail}</Text>}
            {guestPhone && <Text style={detail}><strong>Phone:</strong> {guestPhone}</Text>}
            {source && <Text style={detail}><strong>Source:</strong> {source}</Text>}
          </Section>

          <Section style={card}>
            <Text style={{ ...cardTitle, color: accent }}>Experience</Text>
            {experience && <Text style={detail}><strong>Workshop:</strong> {experience}</Text>}
            {scheduledAt && <Text style={detail}><strong>When:</strong> {scheduledAt}</Text>}
            {participants && <Text style={detail}><strong>Participants:</strong> {participants}</Text>}
          </Section>

          {(grossAmount || commissionAmount) && (
            <Section style={{ ...card, background: '#f0fdf4' }}>
              <Text style={{ ...cardTitle, color: '#059669' }}>Estimated commission</Text>
              {grossAmount && <Text style={detail}><strong>Gross:</strong> {grossAmount} {currency}</Text>}
              {commissionRate != null && <Text style={detail}><strong>Rate:</strong> {commissionRate}%</Text>}
              {commissionAmount && <Text style={{ ...detail, fontSize: 16, color: '#059669' }}><strong>Your commission:</strong> {commissionAmount} {currency}</Text>}
              <Text style={{ ...detail, fontSize: 12, color: '#666', marginTop: 8 }}>
                Confirmed once the guest attends the experience.
              </Text>
            </Section>
          )}

          {conciergeUrl && (
            <Text style={text}>
              <a href={conciergeUrl} style={{ color: accent, fontWeight: 600 }}>Open concierge dashboard →</a>
            </Text>
          )}

          <Hr style={hr} />
          <Text style={footer}>Terraria Workshops · partner notifications</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PartnerNewBookingEmail,
  subject: (data: Record<string, any>) =>
    `New booking at ${data.partnerName || 'your property'} — ${data.guestName || 'guest'}`,
  displayName: 'Partner new booking notification',
  previewData: {
    partnerName: 'Riad Andalus',
    brandColor: '#c2410c',
    guestName: 'Sara El Amrani',
    roomNumber: '204',
    guestEmail: 'sara@example.com',
    guestPhone: '+212600000000',
    experience: 'Zellige Workshop',
    scheduledAt: '2026-05-12 15:00',
    participants: 2,
    grossAmount: '900',
    commissionRate: 15,
    commissionAmount: '135',
    currency: 'MAD',
    source: 'QR (Room 204)',
    conciergeUrl: 'https://terrariaworkshops.com/partners/riad-andalus/concierge',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Rubik, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#fafafa', borderRadius: '12px', padding: '20px', margin: '16px 0' }
const cardTitle = { fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' as const, margin: '0 0 12px', letterSpacing: '0.5px' }
const detail = { fontSize: '14px', color: '#1a1a1a', margin: '0 0 6px' }
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#888', margin: '0' }
