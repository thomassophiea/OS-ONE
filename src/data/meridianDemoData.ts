/**
 * Meridian Retail Group — Demo Mock Data (backward-compat re-exports)
 *
 * Data has moved to demoVerticals/retail.ts.
 * This shim keeps existing consumers (demoSeed.ts, demoInterceptor.ts) working
 * without modification.
 *
 * TODO: Remove once demoSeed.ts and demoInterceptor.ts consume verticals directly
 * (Tasks 6 & 7).
 */

import { RETAIL_VERTICAL } from './demoVerticals/retail';
import {
  getAPsForSiteGroup as _getAPsForSiteGroup,
  getAllAPs as _getAllAPs,
  getStationsForAP as _getStationsForAP,
  getAllStationsForSiteGroup as _getAllStationsForSiteGroup,
  getSLEForSiteGroup as _getSLEForSiteGroup,
  getSLEForSite as _getSLEForSite,
  getEvents as _getEvents,
  getAlarms as _getAlarms,
  getSecurityData as _getSecurityData,
} from './demoVerticalGen';
export type { MockAP } from './demoVerticalGen';

// ── Static data ───────────────────────────────────────────────────────────────

export const DEMO_ORG = RETAIL_VERTICAL.org;
export const DEMO_SITE_GROUPS = RETAIL_VERTICAL.siteGroups;
export const DEMO_SITES = RETAIL_VERTICAL.sites;
export const DEMO_TEMPLATES = RETAIL_VERTICAL.templates;
export const DEMO_VARIABLE_DEFINITIONS = RETAIL_VERTICAL.variableDefinitions;
export const DEMO_VARIABLE_VALUES = RETAIL_VERTICAL.variableValues;
export const DEMO_TEMPLATE_ASSIGNMENTS = RETAIL_VERTICAL.templateAssignments;

// ── Generator wrappers ────────────────────────────────────────────────────────

export function getAPsForSiteGroup(siteGroupId: string) {
  return _getAPsForSiteGroup(siteGroupId, RETAIL_VERTICAL);
}

export function getAllAPs() {
  return _getAllAPs(RETAIL_VERTICAL);
}

export function getStationsForAP(ap: import('./demoVerticalGen').MockAP): object[] {
  return _getStationsForAP(ap, RETAIL_VERTICAL, RETAIL_VERTICAL.sites);
}

export function getAllStationsForSiteGroup(siteGroupId: string): object[] {
  return _getAllStationsForSiteGroup(siteGroupId, RETAIL_VERTICAL);
}

export function getSLEForSiteGroup(siteGroupId: string): object {
  return _getSLEForSiteGroup(siteGroupId, RETAIL_VERTICAL);
}

export function getSLEForSite(siteId: string): Record<string, number> {
  return _getSLEForSite(siteId, RETAIL_VERTICAL);
}

export function getEvents(siteGroupId?: string): object[] {
  return _getEvents(siteGroupId, RETAIL_VERTICAL);
}

export function getAlarms(siteGroupId?: string): object[] {
  return _getAlarms(siteGroupId, RETAIL_VERTICAL);
}

/** siteGroupId is accepted for call-site compatibility but not used by the generator. */
export function getSecurityData(_siteGroupId?: string): object {
  return _getSecurityData(RETAIL_VERTICAL);
}
