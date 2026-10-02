import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tools = require('../src/assets/financial-tools.js');
const closeTo = (actual, expected, tolerance = 0.000001) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} to be within ${tolerance} of ${expected}`);
const rejected = (callback, field) => {
  assert.throws(callback, (error) => error instanceof Error && error.fields?.includes(field));
};

assert.equal(tools.parseLocalizedNumber('1.234,56'), 1234.56);
assert.equal(tools.parseLocalizedNumber('1234,56'), 1234.56);
assert.equal(tools.parseLocalizedNumber('1234.56'), 1234.56);
assert.equal(tools.parseLocalizedNumber('1.234'), 1234);
assert.ok(Number.isNaN(tools.parseLocalizedNumber('')));
assert.ok(Number.isNaN(tools.parseLocalizedNumber('1,2,3')));

const discount = tools.calculateDiscount(3200, 45);
assert.equal(discount.savings, 1440);
assert.equal(discount.finalAmount, 1760);
assert.deepEqual(tools.calculateDiscount(1000, 0), { savings: 0, finalAmount: 1000 });
assert.deepEqual(tools.calculateDiscount(1000, 100), { savings: 1000, finalAmount: 0 });
rejected(() => tools.calculateDiscount(NaN, 10), 'debt');
rejected(() => tools.calculateDiscount(0, 10), 'debt');
rejected(() => tools.calculateDiscount(-1, 10), 'debt');
rejected(() => tools.calculateDiscount(100, -0.01), 'discount');
rejected(() => tools.calculateDiscount(100, 100.01), 'discount');
rejected(() => tools.calculateDiscount(1.001, 10), 'debt');
rejected(() => tools.calculateDiscount(1_000_000_000.01, 10), 'debt');

assert.deepEqual(tools.calculateBudget(5000, 2200, 700, 900), { availableBalance: 1200 });
assert.deepEqual(tools.calculateBudget(2500, 2100, 300, 400), { availableBalance: -300 });
assert.deepEqual(tools.calculateBudget(0, 0, 0, 0), { availableBalance: 0 });
rejected(() => tools.calculateBudget(NaN, 0, 0, 0), 'income');
rejected(() => tools.calculateBudget(1000, -1, 0, 0), 'essentials');
rejected(() => tools.calculateBudget(1000, 0, -1, 0), 'variable');
rejected(() => tools.calculateBudget(1000, 0, 0, -1), 'commitments');
rejected(() => tools.calculateBudget(1000, 0, 0.001, 0), 'variable');

const zeroRate = tools.calculateInstallment(1200, 12, 0);
assert.equal(zeroRate.monthlyInstallment, 100);
assert.equal(zeroRate.totalPaid, 1200);
assert.equal(zeroRate.interestCost, 0);
const priceExample = tools.calculateInstallment(1000, 12, 1);
closeTo(priceExample.monthlyInstallment, 88.8487886783417);
closeTo(priceExample.totalPaid, 1066.1854641401004);
closeTo(priceExample.interestCost, 66.1854641401004);
const extreme = tools.calculateInstallment(1_000_000_000, 600, 100);
assert.ok(Number.isFinite(extreme.monthlyInstallment));
assert.ok(Number.isFinite(extreme.totalPaid));
assert.ok(extreme.interestCost > 0);
rejected(() => tools.calculateInstallment(NaN, 12, 1), 'principal');
rejected(() => tools.calculateInstallment(-100, 12, 1), 'principal');
rejected(() => tools.calculateInstallment(1000, 0, 1), 'periods');
rejected(() => tools.calculateInstallment(1000, 2.5, 1), 'periods');
rejected(() => tools.calculateInstallment(1000, 601, 1), 'periods');
rejected(() => tools.calculateInstallment(1000, 12, -0.01), 'monthlyRate');
rejected(() => tools.calculateInstallment(1000, 12, 100.01), 'monthlyRate');
rejected(() => tools.calculateInstallment(1000, 12, NaN), 'monthlyRate');
rejected(() => tools.calculateInstallment(1_000_000_000.01, 12, 1), 'principal');

assert.equal(tools.formatMoney(1234.5), 'R$ 1.234,50');
console.log('Calculator math checks passed: discount, monthly budget, Price installments, validation and limits.');
