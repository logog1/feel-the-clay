import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Terraria Workshops'

export interface AttachmentRef {
  url: string
  name?: string
  kind?: 'image' | 'file'
}

interface CustomerUpdateProps {
  name?: string
  subject?: string
  intro?: string
  body?: string
  signoff?: string
  attachments?: AttachmentRef[]
}

// Split body on blank lines into paragraphs
const toParagraphs = (input?: string): string[] => {
  if (!input) return []
  return input.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean)
}

// Inline renderer: supports [text](url) markdown + auto-links bare URLs.
// Returns React nodes — text is auto-escaped by React.
const renderInline = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = []
  // Combined regex: [text](url)  OR  bare http(s)://url
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) nodes.push(text.slice(lastIndex, m.index))
    if (m[1] && m[2]) {
      nodes.push(<Link key={key++} href={m[2]} style={linkStyle}>{m[1]}</Link>)
    } else if (m[3]) {
      nodes.push(<Link key={key++} href={m[3]} style={linkStyle}>{m[3]}</Link>)
    }
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

const isImageUrl = (url: string): boolean =>
  /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url)

const CustomerUpdateEmail = ({
  name, subject, intro, body, signoff, attachments = [],
}: CustomerUpdateProps) => {
  const paragraphs = toParagraphs(body)
  const images = attachments.filter((a) => a.kind === 'image' || isImageUrl(a.url))
  const files = attachments.filter((a) => !(a.kind === 'image' || isImageUrl(a.url)))

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{subject || `An update from ${SITE_NAME}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{name ? `Hi ${name},` : 'Hello,'}</Heading>
          {intro && <Text style={text}>{renderInline(intro)}</Text>}

          {paragraphs.length > 0 && (
            <Section style={card}>
              {paragraphs.map((p, i) => (
                <Text key={i} style={paragraph}>{renderInline(p)}</Text>
              ))}
            </Section>
          )}

          {images.length > 0 && (
            <Section style={imageSection}>
              {images.map((img, i) => (
                <Img
                  key={i}
                  src={img.url}
                  alt={img.name || 'Attachment'}
                  style={imageStyle}
                />
              ))}
            </Section>
          )}

          {files.length > 0 && (
            <Section style={filesSection}>
              <Text style={filesHeading}>Attachments</Text>
              {files.map((f, i) => (
                <Text key={i} style={fileRow}>
                  <Link href={f.url} style={fileLink}>
                    {f.name || f.url.split('/').pop() || 'Download file'}
                  </Link>
                </Text>
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
    body: 'We\'re moving the start time from 10:00 to 10:30 to allow extra setup.\n\nEverything else stays the same. More info: [view the schedule](https://feel-the-clay.lovable.app)',
    signoff: 'Thanks for your flexibility.',
    attachments: [
      { url: 'https://feel-the-clay.lovable.app/placeholder.svg', name: 'preview.png', kind: 'image' },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Rubik, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#fff5ec', borderRadius: '12px', padding: '20px', margin: '20px 0' }
const paragraph = { fontSize: '15px', color: '#1a1a1a', lineHeight: '1.6', margin: '0 0 12px' }
const linkStyle = { color: '#c2410c', textDecoration: 'underline' }
const imageSection = { margin: '20px 0' }
const imageStyle = { width: '100%', maxWidth: '512px', height: 'auto', borderRadius: '12px', margin: '0 0 12px', display: 'block' }
const filesSection = { margin: '20px 0', padding: '16px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #eee' }
const filesHeading = { fontSize: '13px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 8px' }
const fileRow = { fontSize: '14px', margin: '0 0 6px' }
const fileLink = { color: '#c2410c', textDecoration: 'none', fontWeight: 500 }
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#888', margin: '0' }
