import { ComputationType, RuleCategory } from '@prisma/client';
import { resolveContractForPeriod } from '../contracts/contract.service';
import { prisma } from '../../db/prisma';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface SalaryRuleExecutable {
  id?: string;
  name: string;
  code: string;
  category: RuleCategory;
  sequence: number;
  computation: ComputationType;
  amount?: number | null;
  percentage?: number | null;
  percentageBaseCode?: string | null;
  formula?: string | null;
}

export interface ComputedPayslipLine {
  ruleId?: string;
  ruleName: string;
  ruleCode: string;
  category: RuleCategory;
  sequence: number;
  amount: number;
}

export interface SalaryComputationTotals {
  basic: number;
  allowances: number;
  gross: number;
  deductions: number;
  net: number;
}

export interface ComputedSalaryResult {
  employeeId?: string;
  contractId?: string;
  structureId?: string;
  structureName?: string;
  contractWage: number;
  periodStart?: Date;
  periodEnd?: Date;
  lines: ComputedPayslipLine[];
  totals: SalaryComputationTotals;
  context: Record<string, number>;
}

// ──────────────────────────────────────────────
// Safe Formula Evaluator
// ──────────────────────────────────────────────

/**
 * Safely evaluates a formula expression using the current computation context.
 * Can reference any previously computed rule codes (e.g. "BASIC + HRA", "GROSS - PF").
 */
export function evaluateFormula(formula: string, context: Record<string, number>): number {
  if (!formula || formula.trim() === '') {
    return 0;
  }

  // Disallow any unsafe global access or injection
  const forbiddenPatterns = [
    /\bprocess\b/i,
    /\bglobal\b/i,
    /\brequire\b/i,
    /\beval\b/i,
    /\bFunction\b/i,
    /\bwindow\b/i,
    /\bdocument\b/i,
    /\bimport\b/i,
    /\bconstructor\b/i,
    /\bprototype\b/i,
    /__proto__/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(formula)) {
      throw new Error(`Invalid or unsafe token in formula: ${formula}`);
    }
  }

  // Normalize context keys to uppercase
  const normalizedContext: Record<string, number> = {};
  for (const [k, v] of Object.entries(context)) {
    normalizedContext[k.toUpperCase()] = Number(v) || 0;
  }

  const varNames = Object.keys(normalizedContext);
  const varValues = varNames.map((k) => normalizedContext[k]);

  try {
    // Execute formula with isolated arguments and strict mode
    const fn = new Function('Math', ...varNames, `'use strict'; return (${formula});`);
    const result = fn(Math, ...varValues);

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      throw new Error(`Formula evaluation did not produce a valid finite number. Result: ${result}`);
    }

    return Number(result.toFixed(2));
  } catch (err: any) {
    throw new Error(`Error evaluating formula "${formula}": ${err.message}`);
  }
}

// ──────────────────────────────────────────────
// Pure Rule-Set Computation Engine
// ──────────────────────────────────────────────

/**
 * Executes a list of rules in ascending sequence order.
 * Pure function: perfect for unit testing and payrun calculations.
 */
export function computeSalaryFromRules(
  rules: SalaryRuleExecutable[],
  wage: number,
  initialContext: Record<string, number> = {}
): { lines: ComputedPayslipLine[]; totals: SalaryComputationTotals; context: Record<string, number> } {
  // Sort rules strictly by sequence ascending
  const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);

  // Initialize context with contract wage and default identifiers
  const context: Record<string, number> = {
    WAGE: Number(wage) || 0,
    CONTRACT_WAGE: Number(wage) || 0,
    ...initialContext,
  };

  const lines: ComputedPayslipLine[] = [];

  for (const rule of sortedRules) {
    const code = rule.code.trim().toUpperCase();
    let amount = 0;

    switch (rule.computation) {
      case ComputationType.FIXED: {
        if (rule.amount !== undefined && rule.amount !== null) {
          amount = Number(rule.amount);
        } else if (code === 'BASIC') {
          // If BASIC rule has no explicit fixed amount, default to contract wage
          amount = Number(wage);
        } else {
          amount = 0;
        }
        break;
      }

      case ComputationType.PERCENTAGE: {
        const baseCode = (rule.percentageBaseCode || 'BASIC').trim().toUpperCase();
        if (!(baseCode in context)) {
          throw new Error(
            `Rule "${rule.name}" (${code}) references base rule "${baseCode}", which has not been computed yet. Ensure sequence ordering is correct.`
          );
        }
        const baseAmount = context[baseCode];
        const percentage = Number(rule.percentage) || 0;
        amount = baseAmount * (percentage / 100);
        break;
      }

      case ComputationType.FORMULA: {
        if (!rule.formula) {
          throw new Error(`Rule "${rule.name}" (${code}) has computation type FORMULA but no formula was provided.`);
        }
        amount = evaluateFormula(rule.formula, context);
        break;
      }

      default:
        throw new Error(`Unsupported computation type: ${(rule as any).computation}`);
    }

    amount = Number(amount.toFixed(2));
    context[code] = amount;

    lines.push({
      ruleId: rule.id,
      ruleName: rule.name,
      ruleCode: code,
      category: rule.category,
      sequence: rule.sequence,
      amount,
    });
  }

  // Calculate totals
  let basic = 0;
  let allowances = 0;
  let gross = 0;
  let deductions = 0;
  let net = 0;

  for (const line of lines) {
    switch (line.category) {
      case RuleCategory.BASIC:
        basic += line.amount;
        break;
      case RuleCategory.ALLOWANCE:
        allowances += line.amount;
        break;
      case RuleCategory.GROSS:
        // Use GROSS rule amount directly if defined
        gross = line.amount;
        break;
      case RuleCategory.DEDUCTION:
        deductions += line.amount;
        break;
      case RuleCategory.NET:
        // Use NET rule amount directly if defined
        net = line.amount;
        break;
    }
  }

  // If GROSS was not explicitly computed by a GROSS category rule, fallback to BASIC + ALLOWANCES
  if (gross === 0 && (basic > 0 || allowances > 0)) {
    gross = Number((basic + allowances).toFixed(2));
  }

  // If NET was not explicitly computed by a NET category rule, fallback to GROSS - DEDUCTIONS
  if (net === 0) {
    net = Number((gross - deductions).toFixed(2));
  }

  const totals: SalaryComputationTotals = {
    basic: Number(basic.toFixed(2)),
    allowances: Number(allowances.toFixed(2)),
    gross: Number(gross.toFixed(2)),
    deductions: Number(deductions.toFixed(2)),
    net: Number(net.toFixed(2)),
  };

  return { lines, totals, context };
}

// ──────────────────────────────────────────────
// Employee Period Salary Computation
// ──────────────────────────────────────────────

/**
 * Given an employee + period, resolves the period-valid contract,
 * fetches ordered salary rules, executes each rule in sequence, and returns
 * computed payslip lines and totals.
 */
export async function computeSalaryForEmployee(
  employeeId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<ComputedSalaryResult> {
  // Step 1: Resolve valid contract for this period
  const contract = await resolveContractForPeriod(employeeId, periodStart);

  if (!contract) {
    throw {
      statusCode: 404,
      message: `No active contract found for employee covering period starting ${periodStart.toISOString().split('T')[0]}`,
    };
  }

  if (!contract.salaryStructureId) {
    throw {
      statusCode: 400,
      message: `Contract "${contract.name}" has no salary structure assigned`,
    };
  }

  // Step 2: Fetch ordered salary rules
  const structure = await prisma.salaryStructure.findUnique({
    where: { id: contract.salaryStructureId },
    include: {
      rules: {
        orderBy: { sequence: 'asc' },
      },
    },
  });

  if (!structure) {
    throw { statusCode: 404, message: 'Assigned salary structure not found' };
  }

  if (!structure.rules || structure.rules.length === 0) {
    throw {
      statusCode: 400,
      message: `Salary structure "${structure.name}" has no salary rules configured`,
    };
  }

  // Map Prisma rules to executable rules
  const executableRules: SalaryRuleExecutable[] = structure.rules.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    category: r.category,
    sequence: r.sequence,
    computation: r.computation,
    amount: r.amount ? Number(r.amount) : null,
    percentage: r.percentage ? Number(r.percentage) : null,
    percentageBaseCode: r.percentageBaseCode,
    formula: r.formula,
  }));

  const wage = Number(contract.wage);

  // Step 3: Execute computation engine
  const { lines, totals, context } = computeSalaryFromRules(executableRules, wage);

  return {
    employeeId,
    contractId: contract.id,
    structureId: structure.id,
    structureName: structure.name,
    contractWage: wage,
    periodStart,
    periodEnd,
    lines,
    totals,
    context,
  };
}
