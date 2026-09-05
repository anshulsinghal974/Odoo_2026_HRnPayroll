import { Request, Response } from 'express';
import * as timeoffService from './timeoff.service';
import { AuthRequest } from '../../middleware/jwt.middleware';

// ──────────────────────────────────────────────
// TIME OFF TYPES
// ──────────────────────────────────────────────
export async function listTypesHandler(req: Request, res: Response) {
  try {
    const types = await timeoffService.listTimeOffTypes();
    res.status(200).json(types);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function createTypeHandler(req: Request, res: Response) {
  try {
    const type = await timeoffService.createTimeOffType(req.body);
    res.status(201).json(type);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function updateTypeHandler(req: Request, res: Response) {
  try {
    const type = await timeoffService.updateTimeOffType(req.params.id as string, req.body);
    res.status(200).json(type);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function deleteTypeHandler(req: Request, res: Response) {
  try {
    await timeoffService.deleteTimeOffType(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

// ──────────────────────────────────────────────
// ALLOCATIONS
// ──────────────────────────────────────────────
export async function listAllocationsHandler(req: Request, res: Response) {
  try {
    const query = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      employeeId: req.query.employeeId as string | undefined,
      typeId: req.query.typeId as string | undefined,
      status: req.query.status as string | undefined,
    };
    const result = await timeoffService.listAllocations(query);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function getAllocationHandler(req: Request, res: Response) {
  try {
    const allocation = await timeoffService.getAllocationById(req.params.id as string);
    res.status(200).json(allocation);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function createAllocationHandler(req: Request, res: Response) {
  try {
    const allocation = await timeoffService.createAllocation(req.body);
    res.status(201).json(allocation);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function approveAllocationHandler(req: Request, res: Response) {
  try {
    const allocation = await timeoffService.approveAllocation(req.params.id as string);
    res.status(200).json(allocation);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function refuseAllocationHandler(req: Request, res: Response) {
  try {
    const allocation = await timeoffService.refuseAllocation(req.params.id as string);
    res.status(200).json(allocation);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

// ──────────────────────────────────────────────
// LEAVE REQUESTS
// ──────────────────────────────────────────────
export async function listLeaveRequestsHandler(req: Request, res: Response) {
  try {
    const query = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      employeeId: req.query.employeeId as string | undefined,
      status: req.query.status as string | undefined,
    };
    const result = await timeoffService.listLeaveRequests(query);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function getLeaveRequestHandler(req: Request, res: Response) {
  try {
    const request = await timeoffService.getLeaveRequestById(req.params.id as string);
    res.status(200).json(request);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function createLeaveRequestHandler(req: Request, res: Response) {
  try {
    const request = await timeoffService.createLeaveRequest(req.body);
    res.status(201).json(request);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function approveLeaveRequestHandler(req: Request, res: Response) {
  try {
    const authReq = req as AuthRequest;
    const request = await timeoffService.approveLeaveRequest(req.params.id as string, authReq.user.userId);
    res.status(200).json(request);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
export async function refuseLeaveRequestHandler(req: Request, res: Response) {
  try {
    const request = await timeoffService.refuseLeaveRequest(req.params.id as string);
    res.status(200).json(request);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}
