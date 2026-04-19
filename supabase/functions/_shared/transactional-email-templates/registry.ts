/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as bookingAdminNotification } from './booking-admin-notification.tsx'
import { template as bookingReminder } from './booking-reminder.tsx'
import { template as bookingStatusUpdate } from './booking-status-update.tsx'
import { template as customerUpdate } from './customer-update.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmation': bookingConfirmation,
  'booking-admin-notification': bookingAdminNotification,
  'booking-reminder': bookingReminder,
  'booking-status-update': bookingStatusUpdate,
  'customer-update': customerUpdate,
}
