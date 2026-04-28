import { randomUUID } from "crypto";
import CryptoJS from "crypto-js";
import { getRestaurantByEmail, setRestaurant } from "./redis";
import { createRootPayer } from "./root-api";

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

  // Create payer (restaurant) in Root
  const rootPayer = await createRootPayer({
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

/**
 * Login restaurant (email-only verification)
 * In production, this should use proper verification links or OTP
 */
export async function loginRestaurant(email: string) {
  if (!validateEmail(email)) {
    throw new Error("Invalid email format");
  }

  const restaurant = await getRestaurantByEmail(email);
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  return restaurant;
}
