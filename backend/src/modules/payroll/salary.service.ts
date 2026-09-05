import { prisma } from '../../db/prisma';
import { ComputationType, Prisma, RuleCategory } from '@prisma/client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface CreateSalaryStructureInput {
  name: string;
  isActive?: boolean;
}

export interface UpdateSalaryStructureInput {
  name?: string;
  isActive?: boolean;
}

export interface CreateSalaryRuleInput {
  structureId: string;
  name: string;
  code: string;
  category: RuleCategory;
  sequence: number;
  computation?: ComputationType;
  amount?: number;
  percentage?: number;
  percentageBaseCode?: string;
  formula?: string;
}

export interface UpdateSalaryRuleInput {
  name?: string;
  code?: string;
  category?: RuleCategory;
  sequence?: number;
  computation?: ComputationType;
  amount?: number | null;
  percentage?: number | null;
  percentageBaseCode?: string | null;
  formula?: string | null;
}

// ──────────────────────────────────────────────
// SALARY STRUCTURE SERVICES
// ──────────────────────────────────────────────

/**
 * List all salary structures (paginated, ordered by name)
 */
export async function listSalaryStructures(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.salaryStructure.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        rules: {
          orderBy: { sequence: 'asc' },
        },
        _count: {
          select: { contracts: true, payruns: true },
        },
      },
    }),
    prisma.salaryStructure.count(),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get salary structure by ID with rules ordered by sequence
 */
export async function getSalaryStructureById(id: string) {
  const structure = await prisma.salaryStructure.findUnique({
    where: { id },
    include: {
      rules: {
        orderBy: { sequence: 'asc' },
      },
      _count: {
        select: { contracts: true, payruns: true },
      },
    },
  });

  if (!structure) {
    throw { statusCode: 404, message: 'Salary structure not found' };
  }

  return structure;
}

/**
 * Create a new salary structure
 */
export async function createSalaryStructure(input: CreateSalaryStructureInput) {
  if (!input.name || input.name.trim() === '') {
    throw { statusCode: 400, message: 'Salary structure name is required' };
  }

  const existing = await prisma.salaryStructure.findUnique({
    where: { name: input.name.trim() },
  });
  if (existing) {
    throw { statusCode: 409, message: `Salary structure "${input.name.trim()}" already exists` };
  }

  return prisma.salaryStructure.create({
    data: {
      name: input.name.trim(),
      isActive: input.isActive ?? true,
    },
    include: {
      rules: {
        orderBy: { sequence: 'asc' },
      },
    },
  });
}

/**
 * Update an existing salary structure
 */
export async function updateSalaryStructure(id: string, input: UpdateSalaryStructureInput) {
  const existing = await prisma.salaryStructure.findUnique({ where: { id } });
  if (!existing) {
    throw { statusCode: 404, message: 'Salary structure not found' };
  }

  if (input.name && input.name.trim() !== existing.name) {
    const duplicate = await prisma.salaryStructure.findUnique({
      where: { name: input.name.trim() },
    });
    if (duplicate) {
      throw { statusCode: 409, message: `Salary structure "${input.name.trim()}" already exists` };
    }
  }

  return prisma.salaryStructure.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    include: {
      rules: {
        orderBy: { sequence: 'asc' },
      },
    },
  });
}

/**
 * Delete a salary structure (guarded if in active use by contracts or payruns)
 */
export async function deleteSalaryStructure(id: string) {
  const existing = await prisma.salaryStructure.findUnique({
    where: { id },
    include: {
      _count: {
        select: { contracts: true, payruns: true },
      },
    },
  });

  if (!existing) {
    throw { statusCode: 404, message: 'Salary structure not found' };
  }

  if (existing._count.contracts > 0 || existing._count.payruns > 0) {
    throw {
      statusCode: 409,
      message: `Cannot delete salary structure. It is currently referenced by ${existing._count.contracts} contract(s) and ${existing._count.payruns} payrun(s).`,
    };
  }

  return prisma.salaryStructure.delete({ where: { id } });
}

// ──────────────────────────────────────────────
// SALARY RULE SERVICES
// ──────────────────────────────────────────────

/**
 * Validate rule inputs based on computation type
 */
function validateRuleComputation(
  computation: ComputationType,
  amount?: number | null,
  percentage?: number | null,
  percentageBaseCode?: string | null,
  formula?: string | null
) {
  if (computation === ComputationType.FIXED) {
    if (amount === undefined || amount === null || isNaN(amount)) {
      throw { statusCode: 400, message: 'A valid amount is required for FIXED computation type' };
    }
  } else if (computation === ComputationType.PERCENTAGE) {
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      throw { statusCode: 400, message: 'A valid percentage is required for PERCENTAGE computation type' };
    }
    if (!percentageBaseCode || percentageBaseCode.trim() === '') {
      throw { statusCode: 400, message: 'percentageBaseCode is required for PERCENTAGE computation type' };
    }
  } else if (computation === ComputationType.FORMULA) {
    if (!formula || formula.trim() === '') {
      throw { statusCode: 400, message: 'A valid formula string is required for FORMULA computation type' };
    }
  }
}

/**
 * List salary rules, filterable by structureId
 */
export async function listSalaryRules(structureId?: string) {
  const where: Prisma.SalaryRuleWhereInput = {};
  if (structureId) {
    where.structureId = structureId;
  }

  return prisma.salaryRule.findMany({
    where,
    orderBy: { sequence: 'asc' },
    include: {
      structure: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Get salary rule by ID
 */
export async function getSalaryRuleById(id: string) {
  const rule = await prisma.salaryRule.findUnique({
    where: { id },
    include: {
      structure: {
        select: { id: true, name: true },
      },
    },
  });

  if (!rule) {
    throw { statusCode: 404, message: 'Salary rule not found' };
  }

  return rule;
}

/**
 * Create a new salary rule:
 * - Enforces unique code within structure
 * - Enforces unique sequence within structure
 * - Validates computation type specific fields
 */
export async function createSalaryRule(input: CreateSalaryRuleInput) {
  const structure = await prisma.salaryStructure.findUnique({
    where: { id: input.structureId },
  });
  if (!structure) {
    throw { statusCode: 404, message: 'Salary structure not found' };
  }

  const code = input.code.trim().toUpperCase();
  const sequence = input.sequence;
  const computation = input.computation || ComputationType.FIXED;

  // Enforce unique sequence within structure
  const duplicateSeq = await prisma.salaryRule.findFirst({
    where: {
      structureId: input.structureId,
      sequence,
    },
  });
  if (duplicateSeq) {
    throw {
      statusCode: 409,
      message: `Sequence ${sequence} already exists in salary structure "${structure.name}". Sequences must be unique.`,
    };
  }

  // Enforce unique code within structure
  const duplicateCode = await prisma.salaryRule.findUnique({
    where: {
      structureId_code: {
        structureId: input.structureId,
        code,
      },
    },
  });
  if (duplicateCode) {
    throw {
      statusCode: 409,
      message: `Rule code "${code}" already exists in salary structure "${structure.name}".`,
    };
  }

  // Validate computation fields
  validateRuleComputation(
    computation,
    input.amount,
    input.percentage,
    input.percentageBaseCode?.trim().toUpperCase(),
    input.formula
  );

  return prisma.salaryRule.create({
    data: {
      structureId: input.structureId,
      name: input.name.trim(),
      code,
      category: input.category,
      sequence,
      computation,
      amount: input.amount !== undefined && input.amount !== null ? new Prisma.Decimal(input.amount) : null,
      percentage: input.percentage !== undefined && input.percentage !== null ? new Prisma.Decimal(input.percentage) : null,
      percentageBaseCode: input.percentageBaseCode ? input.percentageBaseCode.trim().toUpperCase() : null,
      formula: input.formula ? input.formula.trim() : null,
    },
  });
}

/**
 * Update salary rule:
 * - Re-enforces unique code and unique sequence within structure
 * - Re-validates computation fields
 */
export async function updateSalaryRule(id: string, input: UpdateSalaryRuleInput) {
  const existing = await prisma.salaryRule.findUnique({
    where: { id },
  });
  if (!existing) {
    throw { statusCode: 404, message: 'Salary rule not found' };
  }

  const code = input.code ? input.code.trim().toUpperCase() : existing.code;
  const sequence = input.sequence !== undefined ? input.sequence : existing.sequence;
  const computation = input.computation || existing.computation;

  // If sequence changed, check for conflicts
  if (sequence !== existing.sequence) {
    const duplicateSeq = await prisma.salaryRule.findFirst({
      where: {
        structureId: existing.structureId,
        sequence,
        NOT: { id },
      },
    });
    if (duplicateSeq) {
      throw {
        statusCode: 409,
        message: `Sequence ${sequence} already exists in this salary structure. Sequences must be unique.`,
      };
    }
  }

  // If code changed, check for conflicts
  if (code !== existing.code) {
    const duplicateCode = await prisma.salaryRule.findUnique({
      where: {
        structureId_code: {
          structureId: existing.structureId,
          code,
        },
      },
    });
    if (duplicateCode) {
      throw {
        statusCode: 409,
        message: `Rule code "${code}" already exists in this salary structure.`,
      };
    }
  }

  // Determine effective values for validation
  const amount = input.amount !== undefined ? input.amount : (existing.amount ? Number(existing.amount) : null);
  const percentage = input.percentage !== undefined ? input.percentage : (existing.percentage ? Number(existing.percentage) : null);
  const percentageBaseCode = input.percentageBaseCode !== undefined ? input.percentageBaseCode : existing.percentageBaseCode;
  const formula = input.formula !== undefined ? input.formula : existing.formula;

  validateRuleComputation(
    computation,
    amount,
    percentage,
    percentageBaseCode ? percentageBaseCode.trim().toUpperCase() : null,
    formula
  );

  return prisma.salaryRule.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.code !== undefined && { code }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.sequence !== undefined && { sequence }),
      ...(input.computation !== undefined && { computation }),
      amount: amount !== null && amount !== undefined ? new Prisma.Decimal(amount) : null,
      percentage: percentage !== null && percentage !== undefined ? new Prisma.Decimal(percentage) : null,
      percentageBaseCode: percentageBaseCode ? percentageBaseCode.trim().toUpperCase() : null,
      formula: formula ? formula.trim() : null,
    },
  });
}

/**
 * Delete a salary rule
 */
export async function deleteSalaryRule(id: string) {
  const existing = await prisma.salaryRule.findUnique({
    where: { id },
    include: {
      _count: {
        select: { payslipLines: true },
      },
    },
  });

  if (!existing) {
    throw { statusCode: 404, message: 'Salary rule not found' };
  }

  if (existing._count.payslipLines > 0) {
    throw {
      statusCode: 409,
      message: `Cannot delete salary rule "${existing.code}". It is referenced by ${existing._count.payslipLines} payslip line(s).`,
    };
  }

  return prisma.salaryRule.delete({ where: { id } });
}
