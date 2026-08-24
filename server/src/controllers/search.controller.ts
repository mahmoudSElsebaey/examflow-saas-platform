import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import * as searchService from '../services/search.service.js'
import type { SearchResultType } from '../services/search.service.js'

function param(req: TenantRequest, key: string): string {
  const v = req.params[key]
  return Array.isArray(v) ? v[0]! : v!
}

function orgId(req: TenantRequest): string {
  return req.organizationId || param(req, 'orgId')
}

export async function orgSearch(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : ''
    let types: SearchResultType[] | undefined
    if (typeof req.query.types === 'string' && req.query.types.trim()) {
      types = req.query.types
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean) as SearchResultType[]
    }
    const data = await searchService.searchOrganization(orgId(req), q, types)
    return sendSuccess(res, { search: data })
  } catch (e) {
    next(e)
  }
}
