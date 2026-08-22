import type { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import type { AuthenticatedRequest } from '../types/auth.js'
import * as billing from '../services/billing.service.js'
import { getStripeSafe, handleStripeWebhookEvent } from '../services/stripe.service.js'
import { config } from '../config/index.js'
import { AppError } from '../middlewares/errorHandler.js'

export async function listPlans(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, { plans: billing.listPlans() })
  } catch (e) {
    next(e)
  }
}

export async function getOrgBilling(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const data = await billing.getOrgBilling(req.params.orgId as string, req.user!.id)
    return sendSuccess(res, data)
  } catch (e) {
    next(e)
  }
}

export async function changePlan(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const result = await billing.changePlan(
      req.params.orgId as string,
      req.user!.id,
      req.body.plan
    )
    return sendSuccess(res, result, result.checkoutUrl ? 'Checkout session created' : 'Plan updated')
  } catch (e) {
    next(e)
  }
}

export async function billingPortal(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const result = await billing.openBillingPortal(req.params.orgId as string, req.user!.id)
    return sendSuccess(res, result)
  } catch (e) {
    next(e)
  }
}

export async function stripeWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const stripe = getStripeSafe()
    const secret = config.billing.stripeWebhookSecret
    if (!stripe || !secret) {
      throw new AppError('Stripe webhook not configured', 503, 'STRIPE_WEBHOOK_DISABLED')
    }
    const sig = req.headers['stripe-signature']
    if (!sig || typeof sig !== 'string') {
      throw new AppError('Missing stripe-signature', 400, 'INVALID_SIGNATURE')
    }
    const raw = req.body
    const event = stripe.webhooks.constructEvent(raw, sig, secret)
    await handleStripeWebhookEvent(event)
    return res.json({ received: true })
  } catch (e) {
    next(e)
  }
}
