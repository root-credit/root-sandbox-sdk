#!/usr/bin/env node

/**
 * Generic Root Payouts End-to-End Test Script
 *
 * Walks through the full payout flow against a running dev server:
 *   1. Create merchant account (signup)
 *   2. Link merchant funding bank account
 *   3. Add two payees (one debit card, one bank account)
 *   4. Process a payout batch
 *   5. Read transaction history
 *
 * Run with: node e2e-test.js --baseUrl http://localhost:3000
 */

const BASE_URL = process.argv[2]?.replace('--baseUrl', '').trim() || 'http://localhost:3000';

console.log('[e2e] Starting payouts E2E test');
console.log(`[e2e] Base URL: ${BASE_URL}`);
console.log('[e2e] ============================================\n');

const testMerchant = {
  email: `merchant-${Date.now()}@example.com`,
  password: '1234567890',
  merchantName: 'Test Merchant',
  phone: '555-123-4567',
};

const testPayee1 = {
  name: 'John Smith',
  email: `payee1-${Date.now()}@test.com`,
  phone: '555-456-7890',
  paymentMethodType: 'debit_card',
  cardNumber: '4111111111111111',
  expiryMonth: 12,
  expiryYear: 2030,
};

const testPayee2 = {
  name: 'Jane Doe',
  email: `payee2-${Date.now()}@test.com`,
  phone: '555-456-7891',
  paymentMethodType: 'bank_account',
  accountNumber: '121000248',
  routingNumber: '021000021',
};

const testBankAccount = {
  accountNumber: '121000248',
  routingNumber: '021000021',
};

const testAmounts = {
  [testPayee1.email]: 15.5,
  [testPayee2.email]: 22.75,
};

async function fetchWithLogging(url, options = {}) {
  console.log(`[e2e] ${options.method || 'GET'} ${url}`);
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json();
    console.log(`[e2e] Status: ${response.status}`);
    if (!response.ok) {
      console.error(`[e2e] Error: ${data.error}`);
      return null;
    }
    return { status: response.status, data };
  } catch (error) {
    console.error(`[e2e] Exception: ${error.message}`);
    return null;
  }
}

async function runTests() {
  try {
    console.log('\n[e2e] TEST 1: Merchant signup');
    console.log('------');
    const signupRes = await fetchWithLogging(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(testMerchant),
    });
    if (!signupRes) throw new Error('Signup failed');

    const { merchantId, sessionToken } = signupRes.data;
    console.log(`[e2e] ✓ Signup successful. Merchant ID: ${merchantId}`);

    const headers = { Cookie: `session=${sessionToken}` };

    console.log('\n[e2e] TEST 2: Link merchant bank account');
    console.log('------');
    const bankRes = await fetchWithLogging(`${BASE_URL}/api/merchant/bank-account`, {
      method: 'POST',
      body: JSON.stringify({ ...testBankAccount, merchantId }),
      headers,
    });
    if (!bankRes) throw new Error('Bank account linking failed');
    console.log('[e2e] ✓ Bank account linked successfully');

    console.log('\n[e2e] TEST 3: Add payee 1 (debit card)');
    console.log('------');
    const payee1Res = await fetchWithLogging(`${BASE_URL}/api/payees`, {
      method: 'POST',
      body: JSON.stringify({ ...testPayee1, merchantId }),
      headers,
    });
    if (!payee1Res) throw new Error('Payee 1 creation failed');
    const payeeId1 = payee1Res.data.payeeId;
    console.log(`[e2e] ✓ Payee 1 added. ID: ${payeeId1}`);

    console.log('\n[e2e] TEST 4: Add payee 2 (bank account)');
    console.log('------');
    const payee2Res = await fetchWithLogging(`${BASE_URL}/api/payees`, {
      method: 'POST',
      body: JSON.stringify({ ...testPayee2, merchantId }),
      headers,
    });
    if (!payee2Res) throw new Error('Payee 2 creation failed');
    const payeeId2 = payee2Res.data.payeeId;
    console.log(`[e2e] ✓ Payee 2 added. ID: ${payeeId2}`);

    console.log('\n[e2e] TEST 5: Process payout batch');
    console.log('------');
    const payoutsData = {
      merchantId,
      lineItems: [
        { payeeId: payeeId1, amount: testAmounts[testPayee1.email] },
        { payeeId: payeeId2, amount: testAmounts[testPayee2.email] },
      ],
      totalAmount: Object.values(testAmounts).reduce((a, b) => a + b, 0),
    };

    const payoutsRes = await fetchWithLogging(`${BASE_URL}/api/payouts`, {
      method: 'POST',
      body: JSON.stringify(payoutsData),
      headers,
    });
    if (!payoutsRes) throw new Error('Payouts execution failed');
    console.log('[e2e] ✓ Payouts executed successfully');
    console.log(`[e2e] Total amount: $${payoutsData.totalAmount.toFixed(2)}`);

    console.log('\n[e2e] TEST 6: Read transaction history');
    console.log('------');
    const transactionsRes = await fetchWithLogging(
      `${BASE_URL}/api/payouts?merchantId=${merchantId}`,
      { headers }
    );
    if (!transactionsRes) throw new Error('Failed to fetch transactions');

    const { transactions } = transactionsRes.data;
    console.log(`[e2e] ✓ Retrieved ${transactions?.length || 0} transactions`);
    if (transactions?.length > 0) {
      transactions.slice(0, 2).forEach((tx, i) => {
        console.log(
          `[e2e]   Transaction ${i + 1}: $${(tx.amountCents / 100).toFixed(2)} - Status: ${tx.status}`
        );
      });
    }

    console.log('\n[e2e] ============================================');
    console.log('[e2e] ✓ END-TO-END TEST COMPLETED SUCCESSFULLY');
    console.log('[e2e] ============================================\n');

    console.log('[e2e] Summary:');
    console.log(`[e2e] • Merchant created: ${testMerchant.email}`);
    console.log(`[e2e] • Bank account linked`);
    console.log(`[e2e] • 2 payees added (1 card, 1 bank)`);
    console.log(`[e2e] • Payouts executed: $${payoutsData.totalAmount.toFixed(2)}`);
    console.log(`[e2e] • Transactions recorded: ${transactions?.length || 0}`);
  } catch (error) {
    console.error('\n[e2e] ✗ TEST FAILED');
    console.error(`[e2e] Error: ${error.message}`);
    process.exit(1);
  }
}

runTests().catch(console.error);
