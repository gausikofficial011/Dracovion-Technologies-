import { Response, NextFunction } from 'express';
import { ServiceCatalog } from '../models/ServiceCatalog';
import { PortfolioItem } from '../models/PortfolioItem';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../types';
import { NotFoundError } from '../utils/errors';

export async function getServices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const forStudents = req.query.forStudents;
    const filter: any = { isActive: true };
    if (forStudents !== undefined) {
      filter.forStudents = forStudents === 'true';
    }

    const services = await ServiceCatalog.find(filter).sort({ indicativeStartingPriceMinor: 1 });
    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
}

export async function getServiceBySlug(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await ServiceCatalog.findOne({ slug: req.params.slug, isActive: true });
    if (!service) {
      throw new NotFoundError('Service not found in catalog');
    }
    res.json({ success: true, service });
  } catch (err) {
    next(err);
  }
}

export async function getPortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = req.query.category as string;
    const filter: any = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const portfolio = await PortfolioItem.find(filter).sort({ publishedAt: -1 });
    res.json({ success: true, portfolio });
  } catch (err) {
    next(err);
  }
}

export async function getPortfolioBySlug(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await PortfolioItem.findOne({ slug: req.params.slug });
    if (!item) {
      throw new NotFoundError('Portfolio project not found');
    }
    res.json({ success: true, portfolioItem: item });
  } catch (err) {
    next(err);
  }
}

export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    const notifications = await Notification.find({ userId: sessionUser.userId }).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: sessionUser.userId }, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    await Notification.updateMany({ userId: sessionUser.userId, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}
