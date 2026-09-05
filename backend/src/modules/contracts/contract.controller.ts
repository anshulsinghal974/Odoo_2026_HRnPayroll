import { Request, Response } from 'express';
import * as contractService from './contract.service';

/**
 * GET /api/contracts
 * List contracts (paginated, filterable by employeeId, status)
 */
export async function listHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await contractService.listContracts({
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      employeeId: req.query.employeeId as string | undefined,
      status: req.query.status as string | undefined,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * GET /api/contracts/:id
 * Get contract by ID
 */
export async function getByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const contract = await contractService.getContractById(req.params.id as string);
    res.status(200).json(contract);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * POST /api/contracts
 * Create a new contract
 */
export async function createHandler(req: Request, res: Response): Promise<void> {
  try {
    const contract = await contractService.createContract(req.body);
    res.status(201).json(contract);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * PUT /api/contracts/:id
 * Update a contract
 */
export async function updateHandler(req: Request, res: Response): Promise<void> {
  try {
    const contract = await contractService.updateContract(req.params.id as string, req.body);
    res.status(200).json(contract);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * DELETE /api/contracts/:id
 * Delete a contract (only DRAFT)
 */
export async function deleteHandler(req: Request, res: Response): Promise<void> {
  try {
    await contractService.deleteContract(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
