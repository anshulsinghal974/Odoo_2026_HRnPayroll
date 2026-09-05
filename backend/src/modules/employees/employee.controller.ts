import { Request, Response } from 'express';
import * as employeeService from './employee.service';

/**
 * GET /api/employees
 * List employees (paginated, filterable)
 */
export async function listHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await employeeService.listEmployees({
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      search: req.query.search as string | undefined,
      department: req.query.department as string | undefined,
      status: req.query.status as string | undefined,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * GET /api/employees/:id
 * Get employee by ID with smart-button counts
 */
export async function getByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id as string);
    res.status(200).json(employee);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * POST /api/employees
 * Create a new employee
 */
export async function createHandler(req: Request, res: Response): Promise<void> {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * PUT /api/employees/:id
 * Update an employee
 */
export async function updateHandler(req: Request, res: Response): Promise<void> {
  try {
    const employee = await employeeService.updateEmployee(req.params.id as string, req.body);
    res.status(200).json(employee);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * DELETE /api/employees/:id
 * Delete an employee
 */
export async function deleteHandler(req: Request, res: Response): Promise<void> {
  try {
    await employeeService.deleteEmployee(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
