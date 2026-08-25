# Organization creation policy

## Current policy (default SaaS)

Any **authenticated** user may create an organization and becomes its **owner**.

This matches multi-tenant SaaS products (Notion, Slack workspaces, LMS tenants):

- Teachers / trainers sign up → create their school/academy workspace.
- Students usually **join via invite**, not create orgs.

## Alternatives (not enabled)

| Policy | When to use |
|--------|-------------|
| Only `super_admin` creates orgs | Closed enterprise deployments |
| Require email verification before create | Reduce spam |
| Limit free-plan org count per user | Anti-abuse |

To change policy later: gate `POST /organizations` in `organization.controller` / service and hide the create button on the client when denied.
