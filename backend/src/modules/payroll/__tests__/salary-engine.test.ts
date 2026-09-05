import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  computeSalaryFromRules,
  evaluateFormula,
  SalaryRuleExecutable,
} from '../salary-engine';
import { ComputationType, RuleCategory } from '@prisma/client';

describe('Salary Computation Engine', () => {
  it('should accurately compute Basic → HRA% → Gross → PF% → Net', () => {
    const rules: SalaryRuleExecutable[] = [
      {
        name: 'Basic Salary',
        code: 'BASIC',
        category: RuleCategory.BASIC,
        sequence: 10,
        computation: ComputationType.FIXED,
        amount: 50000,
      },
      {
        name: 'House Rent Allowance',
        code: 'HRA',
        category: RuleCategory.ALLOWANCE,
        sequence: 20,
        computation: ComputationType.PERCENTAGE,
        percentage: 40,
        percentageBaseCode: 'BASIC',
      },
      {
        name: 'Gross Salary',
        code: 'GROSS',
        category: RuleCategory.GROSS,
        sequence: 30,
        computation: ComputationType.FORMULA,
        formula: 'BASIC + HRA',
      },
      {
        name: 'Provident Fund',
        code: 'PF',
        category: RuleCategory.DEDUCTION,
        sequence: 40,
        computation: ComputationType.PERCENTAGE,
        percentage: 12,
        percentageBaseCode: 'BASIC',
      },
      {
        name: 'Net Salary',
        code: 'NET',
        category: RuleCategory.NET,
        sequence: 50,
        computation: ComputationType.FORMULA,
        formula: 'GROSS - PF',
      },
    ];

    const wage = 50000;
    const result = computeSalaryFromRules(rules, wage);

    // Verify line count and values
    assert.strictEqual(result.lines.length, 5);

    const basicLine = result.lines.find((l) => l.ruleCode === 'BASIC');
    assert.ok(basicLine);
    assert.strictEqual(basicLine.amount, 50000);

    const hraLine = result.lines.find((l) => l.ruleCode === 'HRA');
    assert.ok(hraLine);
    assert.strictEqual(hraLine.amount, 20000); // 40% of 50000

    const grossLine = result.lines.find((l) => l.ruleCode === 'GROSS');
    assert.ok(grossLine);
    assert.strictEqual(grossLine.amount, 70000); // 50000 + 20000

    const pfLine = result.lines.find((l) => l.ruleCode === 'PF');
    assert.ok(pfLine);
    assert.strictEqual(pfLine.amount, 6000); // 12% of 50000

    const netLine = result.lines.find((l) => l.ruleCode === 'NET');
    assert.ok(netLine);
    assert.strictEqual(netLine.amount, 64000); // 70000 - 6000

    // Verify Totals
    assert.strictEqual(result.totals.basic, 50000);
    assert.strictEqual(result.totals.allowances, 20000);
    assert.strictEqual(result.totals.gross, 70000);
    assert.strictEqual(result.totals.deductions, 6000);
    assert.strictEqual(result.totals.net, 64000);
  });

  it('should fallback to contract wage for BASIC if amount is not specified', () => {
    const rules: SalaryRuleExecutable[] = [
      {
        name: 'Basic Salary',
        code: 'BASIC',
        category: RuleCategory.BASIC,
        sequence: 1,
        computation: ComputationType.FIXED,
      },
      {
        name: 'Transport Allowance',
        code: 'TA',
        category: RuleCategory.ALLOWANCE,
        sequence: 2,
        computation: ComputationType.PERCENTAGE,
        percentage: 10,
        percentageBaseCode: 'BASIC',
      },
    ];

    const wage = 60000;
    const result = computeSalaryFromRules(rules, wage);

    const basicLine = result.lines.find((l) => l.ruleCode === 'BASIC');
    assert.strictEqual(basicLine?.amount, 60000);

    const taLine = result.lines.find((l) => l.ruleCode === 'TA');
    assert.strictEqual(taLine?.amount, 6000);
  });

  it('should support complex formula expressions with Math functions and parentheses', () => {
    const context = {
      BASIC: 50000,
      HRA: 20000,
      GROSS: 70000,
    };

    // Cap deduction using Math.min
    const cappedPF = evaluateFormula('Math.min(BASIC * 0.12, 1800)', context);
    assert.strictEqual(cappedPF, 1800);

    // Compound formula
    const specialAllowance = evaluateFormula('(GROSS - BASIC) * 0.5 + 500', context);
    assert.strictEqual(specialAllowance, 10500); // (20000 * 0.5) + 500
  });

  it('should safely block attempts to execute malicious formula code', () => {
    const context = { BASIC: 50000 };

    assert.throws(
      () => evaluateFormula('process.exit(1)', context),
      /Invalid or unsafe token/
    );

    assert.throws(
      () => evaluateFormula('require("fs")', context),
      /Invalid or unsafe token/
    );

    assert.throws(
      () => evaluateFormula('Function("return 1")()', context),
      /Invalid or unsafe token/
    );
  });

  it('should throw an error if a percentage rule references an uncomputed base rule', () => {
    const rules: SalaryRuleExecutable[] = [
      {
        name: 'HRA',
        code: 'HRA',
        category: RuleCategory.ALLOWANCE,
        sequence: 1,
        computation: ComputationType.PERCENTAGE,
        percentage: 20,
        percentageBaseCode: 'NON_EXISTENT',
      },
    ];

    assert.throws(
      () => computeSalaryFromRules(rules, 40000),
      /references base rule "NON_EXISTENT"/
    );
  });
});
