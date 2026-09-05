import { Request, Response } from 'express';
import * as salaryService from './salary.service';

// ──────────────────────────────────────────────
// SALARY STRUCTURES
// ──────────────────────────────────────────────

export async function listStructuresHandler(req: Request, res: Response): Promise<void> {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await salaryService.listSalaryStructures(page, limit);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to list salary structures' });
  }
}

export async function getStructureByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const structure = await salaryService.getSalaryStructureById(id);
    res.status(200).json(structure);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to get salary structure' });
  }
}

export async function createStructureHandler(req: Request, res: Response): Promise<void> {
  try {
    const structure = await salaryService.createSalaryStructure(req.body);
    res.status(201).json(structure);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create salary structure' });
  }
}

export async function updateStructureHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const structure = await salaryService.updateSalaryStructure(id, req.body);
    res.status(200).json(structure);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update salary structure' });
  }
}

export async function deleteStructureHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await salaryService.deleteSalaryStructure(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to delete salary structure' });
  }
}

// ──────────────────────────────────────────────
// SALARY RULES
// ──────────────────────────────────────────────

export async function listRulesHandler(req: Request, res: Response): Promise<void> {
  try {
    const structureId = req.query.structureId as string | undefined;
    const rules = await salaryService.listSalaryRules(structureId);
    res.status(200).json(rules);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to list salary rules' });
  }
}

export async function getRuleByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const rule = await salaryService.getSalaryRuleById(id);
    res.status(200).json(rule);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to get salary rule' });
  }
}

export async function createRuleHandler(req: Request, res: Response): Promise<void> {
  try {
    const rule = await salaryService.createSalaryRule(req.body);
    res.status(201).json(rule);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create salary rule' });
  }
}

export async function updateRuleHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const rule = await salaryService.updateSalaryRule(id, req.body);
    res.status(200).json(rule);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update salary rule' });
  }
}

export async function deleteRuleHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await salaryService.deleteSalaryRule(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to delete salary rule' });
  }
}
