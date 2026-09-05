import { Request, Response } from 'express';
import * as scheduleService from './schedule.service';

/**
 * GET /api/schedules
 */
export async function listHandler(req: Request, res: Response): Promise<void> {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    
    const result = await scheduleService.listSchedules(page, limit);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * GET /api/schedules/:id
 */
export async function getByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const schedule = await scheduleService.getScheduleById(req.params.id as string);
    res.status(200).json(schedule);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * POST /api/schedules
 */
export async function createHandler(req: Request, res: Response): Promise<void> {
  try {
    const schedule = await scheduleService.createSchedule(req.body);
    res.status(201).json(schedule);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * PUT /api/schedules/:id
 */
export async function updateHandler(req: Request, res: Response): Promise<void> {
  try {
    const schedule = await scheduleService.updateSchedule(req.params.id as string, req.body);
    res.status(200).json(schedule);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

/**
 * DELETE /api/schedules/:id
 */
export async function deleteHandler(req: Request, res: Response): Promise<void> {
  try {
    await scheduleService.deleteSchedule(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
