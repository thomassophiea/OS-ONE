/**
 * Demo Mode — localStorage Bootstrap
 *
 * Seeds all tenant, org, site-group, template, and variable data into the
 * localStorage keys that AURA already reads from. Called once on demo login.
 *
 * TODO: Remove this file when connecting to a real Supabase + controller.
 */

import {
  DEMO_ORG,
  DEMO_SITE_GROUPS,
  DEMO_TEMPLATES,
  DEMO_VARIABLE_DEFINITIONS,
  DEMO_VARIABLE_VALUES,
  DEMO_TEMPLATE_ASSIGNMENTS,
} from '@/data/meridianDemoData';

const ORG_ID = 'meridian-org';

/** Seed everything and mark demo mode active. */
export function bootstrapDemo(): void {
  seedTenant();
  seedGlobalElements();
  localStorage.setItem('demo_mode_active', 'true');
  localStorage.setItem('user_email', 'demo@meridian.com');
  localStorage.setItem('admin_role', 'READ_WRITE_GUEST_MGMT');
  // Synthetic auth tokens — interceptor validates these
  localStorage.setItem('access_token', 'demo-access-token-meridian');
  localStorage.setItem('refresh_token', 'demo-refresh-token-meridian');
}

/** Remove all demo data from localStorage. */
export function teardownDemo(): void {
  const keysToRemove = [
    'demo_mode_active',
    'user_email',
    'admin_role',
    'access_token',
    'refresh_token',
    'api_current_org',
    'api_controllers',
    'api_current_controller',
    `ge_templates:${ORG_ID}`,
    `ge_variable_defs:${ORG_ID}`,
    `ge_variable_vals:${ORG_ID}`,
    `ge_template_assignments:${ORG_ID}`,
  ];
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export function isDemoActive(): boolean {
  return localStorage.getItem('demo_mode_active') === 'true';
}

// ── Tenant ────────────────────────────────────────────────────────────────────

function seedTenant(): void {
  localStorage.setItem('api_current_org', JSON.stringify(DEMO_ORG));

  const controllers = DEMO_SITE_GROUPS.map(sg => ({
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
  // Default to Northeast Region
  localStorage.setItem('api_current_controller', JSON.stringify(controllers[0]));
}

// ── Global Elements (templates, variables) ─────────────────────────────────

function seedGlobalElements(): void {
  localStorage.setItem(`ge_templates:${ORG_ID}`, JSON.stringify(DEMO_TEMPLATES));
  localStorage.setItem(`ge_variable_defs:${ORG_ID}`, JSON.stringify(DEMO_VARIABLE_DEFINITIONS));
  localStorage.setItem(`ge_variable_vals:${ORG_ID}`, JSON.stringify(DEMO_VARIABLE_VALUES));
  localStorage.setItem(`ge_template_assignments:${ORG_ID}`, JSON.stringify(DEMO_TEMPLATE_ASSIGNMENTS));
}
