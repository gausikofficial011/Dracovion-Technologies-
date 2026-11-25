import { Response, NextFunction } from 'express';
import { storageService } from '../services/storageService';
import { FileRecord } from '../models/FileRecord';
import { Project } from '../models/Project';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';

export async function uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const file = req.file;
    const projectId = req.body.projectId;
    const isDeliverable = req.body.isDeliverable === 'true';

    if (!file) {
      throw new BadRequestError('No file provided for upload');
    }

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new NotFoundError('Associated project not found');
      }

      const isClient = project.clientId.toString() === sessionUser.userId;
      const isOwnerOrAdmin = sessionUser.role === 'owner' || sessionUser.role === 'admin';
      const isAssigned = project.assignedTeam.some(t => t.userId.toString() === sessionUser.userId);

      if (!isClient && !isOwnerOrAdmin && !isAssigned) {
        throw new ForbiddenError('Unauthorized to upload files to this project');
      }

      // Only admins/team can upload marked deliverables
      if (isDeliverable && !isOwnerOrAdmin && !isAssigned) {
        throw new ForbiddenError('Only project managers and team engineers can upload deliverables.');
      }
    }

    const saved = await storageService.saveBuffer(file.buffer, file.originalname, file.mimetype);

    const record = await FileRecord.create({
      fileKey: saved.fileKey,
      originalName: saved.originalName,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      storageDriver: saved.storageDriver,
      storagePath: saved.storagePath,
      uploadedBy: sessionUser.userId as any,
      projectId: projectId ? (projectId as any) : undefined,
      isDeliverable,
    });

    // If marked deliverable, append to project deliverables list
    if (projectId && isDeliverable) {
      await Project.findByIdAndUpdate(projectId, {
        $push: {
          deliverables: {
            title: req.body.title || saved.originalName,
            fileKey: saved.fileKey,
            originalName: saved.originalName,
            sizeBytes: saved.sizeBytes,
            uploadedAt: new Date(),
            isApproved: false,
          },
        },
      });
    }

    await recordAuditLog({
      userId: sessionUser.userId,
      action: 'FILE_UPLOADED',
      entityType: 'FileRecord',
      entityId: record._id.toString(),
      ipAddress: req.ip,
      details: { fileKey: saved.fileKey, originalName: saved.originalName, sizeBytes: saved.sizeBytes },
    });

    res.status(201).json({
      success: true,
      message: 'File securely uploaded',
      file: record,
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const fileKey = req.params.fileKey;

    const record = await FileRecord.findOne({ fileKey }).populate('projectId');
    if (!record) {
      throw new NotFoundError('File record not found');
    }

    // Authorization check
    if (record.projectId) {
      const project: any = record.projectId;
      const isClient = project.clientId?.toString() === sessionUser.userId;
      const isOwnerOrAdmin = sessionUser.role === 'owner' || sessionUser.role === 'admin';
      const isAssigned = project.assignedTeam?.some((t: any) => t.userId?.toString() === sessionUser.userId);

      if (!isClient && !isOwnerOrAdmin && !isAssigned) {
        throw new ForbiddenError('You are not authorized to download this project deliverable or asset.');
      }
    } else if (
      record.uploadedBy.toString() !== sessionUser.userId &&
      sessionUser.role !== 'owner' &&
      sessionUser.role !== 'admin'
    ) {
      throw new ForbiddenError('Access forbidden to this file');
    }

    const localPath = await storageService.getLocalFilePath(fileKey);

    record.downloadCount += 1;
    await record.save();

    res.setHeader('Content-Disposition', `attachment; filename="${record.originalName}"`);
    res.setHeader('Content-Type', record.mimeType);
    res.sendFile(localPath);
  } catch (err) {
    next(err);
  }
}

export async function getProjectFiles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isClient = project.clientId.toString() === sessionUser.userId;
    const isOwnerOrAdmin = sessionUser.role === 'owner' || sessionUser.role === 'admin';
    const isAssigned = project.assignedTeam.some(t => t.userId.toString() === sessionUser.userId);

    if (!isClient && !isOwnerOrAdmin && !isAssigned) {
      throw new ForbiddenError('Unauthorized to view files for this project');
    }

    const files = await FileRecord.find({ projectId }).sort({ createdAt: -1 }).populate('uploadedBy', 'fullName email role');
    res.json({ success: true, files });
  } catch (err) {
    next(err);
  }
}
