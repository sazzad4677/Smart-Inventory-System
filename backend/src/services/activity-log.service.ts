import QueryBuilder from '../builders/QueryBuilder';
import ActivityLog, { IActivityLogDocument } from '../models/activity-log.model';
import User from '../models/user.model';
import Product from '../models/product.model';
import { AppError } from '../utils/AppError';
import { ActivityType } from '../types';

export const getAllActivityLogsFromDB = async (
  query: Record<string, unknown>,
  requestingUser?: { _id: string; role: string },
) => {
  const queryObj = { ...query };

  // Enforce role-based visibility if not Admin
  if (requestingUser && requestingUser.role !== 'Admin') {
    queryObj.user_id = requestingUser._id;
  }

  // If role is provided (for admins searching), find users with that role
  if (queryObj.role && requestingUser?.role === 'Admin') {
    const usersWithRole = await User.find({ role: queryObj.role }).select('_id');
    const userIds = usersWithRole.map((u) => u._id);
    queryObj.user_id = { $in: userIds };
    delete queryObj.role;
  }

  const activityLogQuery = new QueryBuilder<IActivityLogDocument>(
    ActivityLog.find().populate('user_id', 'email role name'),
    queryObj,
  )
    .search(['action_text', 'type', 'resource'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await activityLogQuery.modelQuery;
  const meta = await activityLogQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const undoActivityInDB = async (logId: string) => {
  const log = await ActivityLog.findById(logId);
  if (!log) throw new AppError('Activity log not found', 404);

  if (log.type === ActivityType.Delete && log.resource === 'PRODUCT' && log.resource_id) {
    const product = await Product.findById(log.resource_id);
    if (!product) throw new AppError('Original product not found', 404);

    product.is_deleted = false;
    await product.save();

    log.is_undone = true;
    await log.save();

    return {
      message: `Product "${product.name}" has been restored successfully.`,
      product,
    };
  }

  throw new AppError('This action cannot be undone.', 400);
};

export const redoActivityInDB = async (logId: string) => {
  const log = await ActivityLog.findById(logId);
  if (!log) throw new AppError('Activity log not found', 404);

  if (!log.is_undone) {
    throw new AppError('This action has not been undone, so it cannot be redone.', 400);
  }

  if (log.type === ActivityType.Delete && log.resource === 'PRODUCT' && log.resource_id) {
    const product = await Product.findById(log.resource_id);
    if (!product) throw new AppError('Original product not found', 404);

    product.is_deleted = true;
    await product.save();

    log.is_undone = false;
    await log.save();

    return {
      message: `Product "${product.name}" has been deleted again (Redo).`,
      product,
    };
  }

  throw new AppError('This action cannot be redone.', 400);
};
