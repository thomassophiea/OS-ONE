/**
 * Demo Vertical Registry
 * Maps each VerticalKey to its full VerticalDemoProfile.
 */

import type { VerticalKey, VerticalDemoProfile } from '../demoVerticalTypes';
import { RETAIL_VERTICAL } from './retail';
import { ENTERPRISE_VERTICAL } from './enterprise';
import { HEALTHCARE_VERTICAL } from './healthcare';
import { EDUCATION_VERTICAL } from './education';
import { HOSPITALITY_VERTICAL } from './hospitality';
import { GOVERNMENT_VERTICAL } from './government';
import { MANUFACTURING_VERTICAL } from './manufacturing';
import { LOGISTICS_VERTICAL } from './logistics';

export const VERTICAL_REGISTRY: Record<VerticalKey, VerticalDemoProfile> = {
  Retail: RETAIL_VERTICAL,
  Enterprise: ENTERPRISE_VERTICAL,
  Healthcare: HEALTHCARE_VERTICAL,
  Education: EDUCATION_VERTICAL,
  Hospitality: HOSPITALITY_VERTICAL,
  Government: GOVERNMENT_VERTICAL,
  Manufacturing: MANUFACTURING_VERTICAL,
  Logistics: LOGISTICS_VERTICAL,
};

export function getVerticalProfile(key: VerticalKey): VerticalDemoProfile {
  return VERTICAL_REGISTRY[key] ?? VERTICAL_REGISTRY['Retail'];
}

export type { VerticalKey, VerticalDemoProfile };
