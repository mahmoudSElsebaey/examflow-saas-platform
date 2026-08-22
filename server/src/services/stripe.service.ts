import Stripe from 'stripe'
import { config } from '../config/index.js'
import { Organization } from '../models/Organization.js'
import type { OrgPlan } from '../types/organization.js'

export type BillingMode = 'mock' | 'stripe'

export function resolveBillingMode(): BillingMode {
  if (config.billing.mode === 'mock') return 'mock'
  if (config.billing.mode === 'stripe') return 'stripe'
  return config.billing.stripeSecretKey ? 'stripe' : 'mock'
}

export function isStripeConfigured(): boolean {
  return !!config.billing.stripeSecretKey
}

let stripeClient: Stripe | null = null

export function getStripe(): Stripe | null {
  if (!config.billing.stripeSecretKey) return null
  if (!stripeClient) {
    stripeClient = new Stripe(config.billing.stripeSecretKey)
  }
  return stripeClient
}

export const getStripeSafe = getStripe

export function priceIdForPlan(plan: OrgPlan): string | null {
  if (plan === 'professional') return config.billing.priceProfessional || null
  if (plan === 'enterprise') return config.billing.priceEnterprise || null
  return null
}

export function planFromPriceId(priceId: string | undefined | null): OrgPlan | null {
  if (!priceId) return null
  if (priceId === config.billing.priceProfessional) return 'professional'
  if (priceId === config.billing.priceEnterprise) return 'enterprise'
  return null
}

export async function ensureStripeCustomer(
  orgId: string,
  email: string,
  orgName: string
): Promise<string> {
  const stripe = getStripeSafe()
  if (!stripe) throw new Error('Stripe not configured')

  const org = await Organization.findById(orgId)
  if (!org) throw new Error('Organization not found')
  if (org.stripeCustomerId) return org.stripeCustomerId

  const customer = await stripe.customers.create({
    email,
    name: orgName,
    metadata: { organizationId: orgId },
  })
  org.stripeCustomerId = customer.id
  await org.save()
  return customer.id
}

export async function createCheckoutSession(input: {
  orgId: string
  plan: Exclude<OrgPlan, 'free'>
  customerEmail: string
  orgName: string
}): Promise<{ url: string }> {
  const stripe = getStripeSafe()
  if (!stripe) throw new Error('Stripe not configured')

  const priceId = priceIdForPlan(input.plan)
  if (!priceId) {
    throw new Error(`Missing Stripe price id for plan ${input.plan}`)
  }

  const customerId = await ensureStripeCustomer(
    input.orgId,
    input.customerEmail,
    input.orgName
  )

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.clientUrl}/app/organizations/${input.orgId}/billing?checkout=success`,
    cancel_url: `${config.clientUrl}/app/organizations/${input.orgId}/billing?checkout=cancel`,
    metadata: {
      organizationId: input.orgId,
      plan: input.plan,
    },
    subscription_data: {
      metadata: {
        organizationId: input.orgId,
        plan: input.plan,
      },
    },
  })

  if (!session.url) throw new Error('Stripe did not return a checkout URL')
  return { url: session.url }
}

export async function createBillingPortalSession(orgId: string): Promise<{ url: string }> {
  const stripe = getStripeSafe()
  if (!stripe) throw new Error('Stripe not configured')

  const org = await Organization.findById(orgId)
  if (!org?.stripeCustomerId) {
    throw new Error('No Stripe customer for this organization')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${config.clientUrl}/app/organizations/${orgId}/billing`,
  })
  return { url: session.url }
}

export async function cancelSubscriptionIfAny(orgId: string): Promise<void> {
  const stripe = getStripeSafe()
  const org = await Organization.findById(orgId)
  if (!stripe || !org?.stripeSubscriptionId) return
  try {
    await stripe.subscriptions.cancel(org.stripeSubscriptionId)
  } catch {
    // ignore
  }
  org.stripeSubscriptionId = null
  await org.save()
}

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orgId = session.metadata?.organizationId
    const plan = (session.metadata?.plan as OrgPlan | undefined) || null
    if (!orgId || !plan || plan === 'free') return
    const org = await Organization.findById(orgId)
    if (!org) return
    org.plan = plan
    if (session.customer && typeof session.customer === 'string') {
      org.stripeCustomerId = session.customer
    }
    if (session.subscription && typeof session.subscription === 'string') {
      org.stripeSubscriptionId = session.subscription
    }
    await org.save()
    return
  }

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const sub = event.data.object as Stripe.Subscription
    const orgId = sub.metadata?.organizationId
    const org = orgId
      ? await Organization.findById(orgId)
      : await Organization.findOne({ stripeSubscriptionId: sub.id })
    if (!org) return

    if (event.type === 'customer.subscription.deleted' || sub.status === 'canceled') {
      org.plan = 'free'
      org.stripeSubscriptionId = null
      await org.save()
      return
    }

    const priceId = sub.items?.data?.[0]?.price?.id
    const plan = planFromPriceId(priceId) || (sub.metadata?.plan as OrgPlan | undefined)
    if (plan && plan !== 'free') {
      org.plan = plan
      org.stripeSubscriptionId = sub.id
      await org.save()
    }
  }
}
