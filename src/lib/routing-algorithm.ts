/**
 * Smart Order Routing Algorithm
 *
 * Selects the optimal vendor for an order based on:
 *  1. HQ preference (always checked first)
 *  2. Distance from customer
 *  3. Stock availability for all items
 *  4. Current vendor load (active orders today)
 *  5. Service radius coverage
 */

export interface VendorCandidate {
  id: string;
  name: string;
  lat: number;
  lng: number;
  serviceRadius: number;
  isHQ: boolean;
  isActive: boolean;
  capacity: number;
  currentLoad: number; // active orders today
}

export interface InventoryItem {
  vendorId: string;
  productId: string;
  stock: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface RoutingInput {
  customerLat: number;
  customerLng: number;
  items: OrderItem[];
  vendors: VendorCandidate[];
  inventory: InventoryItem[];
  isExpressDelivery?: boolean;
}

export interface RoutingResult {
  vendorId: string;
  vendorName: string;
  distanceKm: number;
  estimatedDeliveryDays: number;
  score: number;
  reason: string;
}

// Haversine formula – great-circle distance between two lat/lng points in kilometres
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Check whether a vendor has sufficient stock for all items in the order
function hasStock(
  vendorId: string,
  items: OrderItem[],
  inventory: InventoryItem[]
): boolean {
  for (const item of items) {
    const inv = inventory.find(
      (i) => i.vendorId === vendorId && i.productId === item.productId
    );
    if (!inv || inv.stock < item.quantity) return false;
  }
  return true;
}

// Estimate delivery days based on distance and whether delivery is express
function estimateDeliveryDays(distanceKm: number, isExpress: boolean): number {
  if (isExpress) return 1;
  if (distanceKm < 100)  return 1;
  if (distanceKm < 500)  return 2;
  if (distanceKm < 1500) return 3;
  return 5;
}

// Scoring: lower is better (combines distance + load penalty)
function scoreVendor(
  vendor: VendorCandidate,
  distanceKm: number,
  isExpress: boolean
): number {
  // Distance component (0–100 normalised to ~3000 km max)
  const distanceScore = Math.min(distanceKm / 30, 100);

  // Load component: penalise vendors near capacity
  const loadRatio = vendor.currentLoad / Math.max(vendor.capacity, 1);
  const loadScore = loadRatio * 50;

  // Express bonus: prefer closer vendors heavily for express
  const expressFactor = isExpress ? 2 : 1;

  return distanceScore * expressFactor + loadScore;
}

export function routeOrder(input: RoutingInput): RoutingResult | null {
  const { customerLat, customerLng, items, vendors, inventory, isExpressDelivery = false } = input;

  const activeVendors = vendors.filter((v) => v.isActive);

  // ── Step 1: Try HQ first ───────────────────────────────────────────────
  const hqVendor = activeVendors.find((v) => v.isHQ);
  if (hqVendor && hasStock(hqVendor.id, items, inventory)) {
    const dist = haversineDistance(customerLat, customerLng, hqVendor.lat, hqVendor.lng);
    const loadRatio = hqVendor.currentLoad / hqVendor.capacity;

    // Use HQ unless it's near capacity AND there's a closer alternative
    if (loadRatio < 0.85 || !isExpressDelivery) {
      return {
        vendorId: hqVendor.id,
        vendorName: hqVendor.name,
        distanceKm: dist,
        estimatedDeliveryDays: estimateDeliveryDays(dist, isExpressDelivery),
        score: scoreVendor(hqVendor, dist, isExpressDelivery),
        reason: 'HQ fulfillment center has stock and capacity',
      };
    }
  }

  // ── Step 2: Score all partner vendors with stock ───────────────────────
  const candidates: Array<{ vendor: VendorCandidate; dist: number; score: number }> = [];

  for (const vendor of activeVendors) {
    if (vendor.isHQ) continue;
    if (!hasStock(vendor.id, items, inventory)) continue;
    if (vendor.currentLoad >= vendor.capacity) continue;

    const dist = haversineDistance(customerLat, customerLng, vendor.lat, vendor.lng);

    // Respect service radius (skip vendors that are too far out)
    if (dist > vendor.serviceRadius && !isExpressDelivery) continue;

    candidates.push({ vendor, dist, score: scoreVendor(vendor, dist, isExpressDelivery) });
  }

  if (candidates.length === 0) {
    // Fallback: try HQ even if at capacity
    if (hqVendor && hasStock(hqVendor.id, items, inventory)) {
      const dist = haversineDistance(customerLat, customerLng, hqVendor.lat, hqVendor.lng);
      return {
        vendorId: hqVendor.id,
        vendorName: hqVendor.name,
        distanceKm: dist,
        estimatedDeliveryDays: estimateDeliveryDays(dist, isExpressDelivery),
        score: scoreVendor(hqVendor, dist, isExpressDelivery),
        reason: 'Fallback to HQ – no partner vendors available',
      };
    }
    return null; // No vendor can fulfil this order
  }

  // Sort by score ascending (lowest = best)
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];

  return {
    vendorId: best.vendor.id,
    vendorName: best.vendor.name,
    distanceKm: best.dist,
    estimatedDeliveryDays: estimateDeliveryDays(best.dist, isExpressDelivery),
    score: best.score,
    reason: `Best partner vendor by distance (${best.dist.toFixed(0)} km) and capacity`,
  };
}
