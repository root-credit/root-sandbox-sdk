#!/usr/bin/env node

/**
 * Roosterwise End-to-End Test Script
 * 
 * This script simulates the complete payment flow:
 * 1. Create restaurant account
 * 2. Link bank account
 * 3. Add workers
 * 4. Execute payouts
 * 5. Check transaction history
 * 
 * Run with: node e2e-test.js --baseUrl http://localhost:3000
 */

const BASE_URL = process.argv[2]?.replace('--baseUrl', '').trim() || 'http://localhost:3000';

console.log('[v0] Starting Roosterwise E2E Test');
console.log(`[v0] Base URL: ${BASE_URL}`);
console.log('[v0] ============================================\n');

// Test data
const testRestaurant = {
  email: `admin-${Date.now()}@testrestaurant.com`,
  password: 'TestPassword123!',
  restaurantName: 'Test Restaurant',
  phone: '555-123-4567',
};

const testWorker1 = {
  name: 'John Smith',
  email: `worker1-${Date.now()}@test.com`,
  phone: '555-456-7890',
  paymentMethodType: 'debit_card',
  cardNumber: '4111111111111111',
  expiryMonth: 12,
  expiryYear: 2025,
};

const testWorker2 = {
  name: 'Jane Doe',
  email: `worker2-${Date.now()}@test.com`,
  phone: '555-456-7891',
  paymentMethodType: 'bank_account',
  accountNumber: '121000248',
  routingNumber: '021000021',
};

const testBankAccount = {
  accountNumber: '121000248',
  routingNumber: '021000021',
};

const testTips = {
  [testWorker1.email]: 15.50,
  [testWorker2.email]: 22.75,
};

// Helper functions
async function fetch_with_logging(url, options = {}) {
  console.log(`[v0] ${options.method || 'GET'} ${url}`);
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json();
    console.log(`[v0] Status: ${response.status}`);
    if (!response.ok) {
      console.error(`[v0] Error: ${data.error}`);
      return null;
    }
    return { status: response.status, data };
  } catch (error) {
    console.error(`[v0] Exception: ${error.message}`);
    return null;
  }
}

async function runTests() {
  try {
    // Test 1: Signup
    console.log('\n[v0] TEST 1: Restaurant Signup');
    console.log('------');
    const signupRes = await fetch_with_logging(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(testRestaurant),
    });
    if (!signupRes) throw new Error('Signup failed');
    
    const { restaurantId, sessionToken } = signupRes.data;
    console.log(`[v0] ✓ Signup successful. Restaurant ID: ${restaurantId}`);
    
    const headers = { 
      Cookie: `session=${sessionToken}`,
    };

    // Test 2: Link Bank Account
    console.log('\n[v0] TEST 2: Link Bank Account');
    console.log('------');
    const bankRes = await fetch_with_logging(`${BASE_URL}/api/restaurant/bank-account`, {
      method: 'POST',
      body: JSON.stringify({
        ...testBankAccount,
        restaurantId,
      }),
      headers,
    });
    if (!bankRes) throw new Error('Bank account linking failed');
    console.log('[v0] ✓ Bank account linked successfully');

    // Test 3: Add Worker 1 (Debit Card)
    console.log('\n[v0] TEST 3: Add Worker 1 (Debit Card)');
    console.log('------');
    const worker1Res = await fetch_with_logging(`${BASE_URL}/api/workers`, {
      method: 'POST',
      body: JSON.stringify({
        ...testWorker1,
        restaurantId,
      }),
      headers,
    });
    if (!worker1Res) throw new Error('Worker 1 creation failed');
    const workerId1 = worker1Res.data.workerId;
    console.log(`[v0] ✓ Worker 1 added. ID: ${workerId1}`);

    // Test 4: Add Worker 2 (Bank Account)
    console.log('\n[v0] TEST 4: Add Worker 2 (Bank Account)');
    console.log('------');
    const worker2Res = await fetch_with_logging(`${BASE_URL}/api/workers`, {
      method: 'POST',
      body: JSON.stringify({
        ...testWorker2,
        restaurantId,
      }),
      headers,
    });
    if (!worker2Res) throw new Error('Worker 2 creation failed');
    const workerId2 = worker2Res.data.workerId;
    console.log(`[v0] ✓ Worker 2 added. ID: ${workerId2}`);

    // Test 5: Execute Payouts
    console.log('\n[v0] TEST 5: Execute Tip Payouts');
    console.log('------');
    const payoutsData = {
      restaurantId,
      tips: [
        { workerId: workerId1, amount: testTips[testWorker1.email] },
        { workerId: workerId2, amount: testTips[testWorker2.email] },
      ],
      totalAmount: Object.values(testTips).reduce((a, b) => a + b, 0),
    };
    
    const payoutsRes = await fetch_with_logging(`${BASE_URL}/api/payouts`, {
      method: 'POST',
      body: JSON.stringify(payoutsData),
      headers,
    });
    if (!payoutsRes) throw new Error('Payouts execution failed');
    console.log('[v0] ✓ Payouts executed successfully');
    console.log(`[v0] Total amount: $${payoutsData.totalAmount.toFixed(2)}`);

    // Test 6: Get Transaction History
    console.log('\n[v0] TEST 6: View Transaction History');
    console.log('------');
    const transactionsRes = await fetch_with_logging(
      `${BASE_URL}/api/payouts?restaurantId=${restaurantId}`,
      { headers }
    );
    if (!transactionsRes) throw new Error('Failed to fetch transactions');
    
    const { transactions } = transactionsRes.data;
    console.log(`[v0] ✓ Retrieved ${transactions?.length || 0} transactions`);
    if (transactions?.length > 0) {
      transactions.slice(0, 2).forEach((tx, i) => {
        console.log(`[v0]   Transaction ${i + 1}: $${(tx.amountCents / 100).toFixed(2)} - Status: ${tx.status}`);
      });
    }

    // Summary
    console.log('\n[v0] ============================================');
    console.log('[v0] ✓ END-TO-END TEST COMPLETED SUCCESSFULLY');
    console.log('[v0] ============================================\n');
    
    console.log('[v0] Test Summary:');
    console.log(`[v0] • Restaurant created: ${testRestaurant.email}`);
    console.log(`[v0] • Bank account linked`);
    console.log(`[v0] • 2 workers added (1 card, 1 bank)`);
    console.log(`[v0] • Payouts executed: $${payoutsData.totalAmount.toFixed(2)}`);
    console.log(`[v0] • Transactions recorded: ${transactions?.length || 0}`);
    
  } catch (error) {
    console.error('\n[v0] ✗ TEST FAILED');
    console.error(`[v0] Error: ${error.message}`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
