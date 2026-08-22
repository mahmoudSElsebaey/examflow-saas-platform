import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  isOrgStaff,
  isOrgAdmin,
  canManageContent,
  canManageMembers,
  canViewAnalytics,
  isPlatformSuperAdmin,
  effectiveOrgRole,
} from './permissions.js'

describe('permissions', () => {
  it('staff roles can manage content and analytics', () => {
    for (const r of ['owner', 'admin', 'teacher', 'examiner'] as const) {
      assert.equal(isOrgStaff(r), true)
      assert.equal(canManageContent(r), true)
      assert.equal(canViewAnalytics(r), true)
    }
  })

  it('student cannot manage content or members', () => {
    assert.equal(isOrgAdmin('owner'), true)
    assert.equal(isOrgAdmin('teacher'), false)
    assert.equal(isOrgStaff('student'), false)
    assert.equal(canManageContent('student'), false)
    assert.equal(canManageMembers('student'), false)
    assert.equal(canViewAnalytics('student'), false)
  })

  it('only owner/admin manage members', () => {
    assert.equal(canManageMembers('owner'), true)
    assert.equal(canManageMembers('admin'), true)
    assert.equal(canManageMembers('teacher'), false)
    assert.equal(canManageMembers('examiner'), false)
  })

  it('super_admin is platform-only flag', () => {
    assert.equal(isPlatformSuperAdmin('super_admin'), true)
    assert.equal(isPlatformSuperAdmin('student'), false)
  })

  it('effectiveOrgRole prefers membership', () => {
    assert.equal(effectiveOrgRole('teacher'), 'teacher')
    assert.equal(effectiveOrgRole(null), null)
  })
})
