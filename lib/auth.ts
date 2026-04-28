import { randomUUID } from "crypto";
import CryptoJS from "crypto-js";
import { getRestaurantByEmail, setRestaurant } from "./redis";
import { getOrCreateRootPayer } from "./root-api";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-key-change-in-production";

/**
 * Generate a session token
 */
export function generateSessionToken(): string {
  return randomUUID();
}

/**
 * Hash an email for validation
 */
export function hashEmail(email: string): string {
  return CryptoJS.SHA256(email + AUTH_SECRET).toString();
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Register a new restaurant
 */
export async function registerRestaurant(restaurantData: {
  email: string;
  restaurantName: string;
  phone: string;
}) {
  // Validate email
  if (!validateEmail(restaurantData.email)) {
    throw new Error("Invalid email format");
  }

  // Check if restaurant already exists
  const existing = await getRestaurantByEmail(restaurantData.email);
  if (existing) {
    throw new Error("Restaurant with this email already exists");
  }

  // Resolve Root payer: create or reuse if sandbox already has this email (Redis cleared).
  const rootPayer = await getOrCreateRootPayer({
    email: restaurantData.email,
    name: restaurantData.restaurantName,
    phone: restaurantData.phone,
  });

  // Generate restaurant ID
  const restaurantId = randomUUID();

  // Store restaurant in Redis
  await setRestaurant(restaurantId, {
    id: restaurantId,
    adminEmail: restaurantData.email,
    restaurantName: restaurantData.restaurantName,
    phone: restaurantData.phone,
    rootCustomerId: rootPayer.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    restaurantId,
    rootCustomerId: rootPayer.id,
  };
}
