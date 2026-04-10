/**
 * Demo Mode — localStorage Bootstrap
 *
 * Seeds all tenant, org, site-group, template, and variable data into the
 * localStorage keys that AURA already reads from. Called once on demo login.
 *
 * TODO: Remove this file when connecting to a real Supabase + controller.
 */

import { getVerticalProfile } from '@/data/demoVerticals/index';
import type { VerticalKey } from '@/data/demoVerticalTypes';
import type { VerticalDemoProfile } from '@/data/demoVerticalTypes';

/** Seed everything and mark demo mode active. */
export function bootstrapDemo(verticalKey: VerticalKey = 'Retail'): void {
  const profile = getVerticalProfile(verticalKey);
  localStorage.setItem('demo_active_vertical', verticalKey);
  seedTenant(profile);
  seedGlobalElements(profile);
  localStorage.setItem('demo_mode_active', 'true');
  localStorage.setItem('user_email', 'demo@meridian.com');
  localStorage.setItem('admin_role', 'READ_WRITE_GUEST_MGMT');
  // Synthetic auth tokens — interceptor validates these
  localStorage.setItem('access_token', 'demo-access-token-meridian');
  localStorage.setItem('refresh_token', 'demo-refresh-token-meridian');
}

/** Remove all demo data from localStorage. */
export function teardownDemo(): void {
  // Determine which org was active so we can remove org-keyed GE entries
  const activeVertical = (localStorage.getItem('demo_active_vertical') ?? 'Retail') as VerticalKey;
  const profile = getVerticalProfile(activeVertical);
  const orgId = profile.org.id;

  const keysToRemove = [
    'demo_mode_active',
    'demo_active_vertical',
    'user_email',
    'admin_role',
    'access_token',
    'refresh_token',
    'api_current_org',
    'api_controllers',
    'api_current_controller',
    `ge_templates:${orgId}`,
    `ge_variable_defs:${orgId}`,
    `ge_variable_vals:${orgId}`,
    `ge_template_assignments:${orgId}`,
  ];
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export function isDemoActive(): boolean {
  return localStorage.getItem('demo_mode_active') === 'true';
}

// ── Tenant ────────────────────────────────────────────────────────────────────

function seedTenant(profile: VerticalDemoProfile): void {
  localStorage.setItem('api_current_org', JSON.stringify(profile.org));

  const controllers = profile.siteGroups.map(sg => ({
    id: sg.id,
    org_id: sg.org_id,
    name: sg.name,
    description: sg.description,
    url: sg.controller_url,
    port: sg.controller_port,
    is_active: true,
    is_default: sg.is_default,
    connection_status: sg.connection_status,
    last_connected_at: sg.last_connected_at,
    settings: {},
    created_at: sg.created_at,
  }));

  localStorage.setItem('api_controllers', JSON.stringify(controllers));
  // Default to the first site group's controller
  localStorage.setItem('api_current_controller', JSON.stringify(controllers[0]));
}

// ── Global Elements (templates, variables) ─────────────────────────────────

function seedGlobalElements(profile: VerticalDemoProfile): void {
  const orgId = profile.org.id;
  localStorage.setItem(`ge_templates:${orgId}`, JSON.stringify(profile.templates));
  localStorage.setItem(`ge_variable_defs:${orgId}`, JSON.stringify(profile.variableDefinitions));
  localStorage.setItem(`ge_variable_vals:${orgId}`, JSON.stringify(profile.variableValues));
  localStorage.setItem(
    `ge_template_assignments:${orgId}`,
    JSON.stringify(profile.templateAssignments)
  );
}
