import QueryBuilder from '../builders/QueryBuilder';
import ActivityLog, { IActivityLogDocument } from '../models/activity-log.model';
import User from '../models/user.model';

export const getAllActivityLogsFromDB = async (query: Record<string, unknown>) => {
  const queryObj = { ...query };

  // If role is provided, find users with that role and filter by their IDs
  if (queryObj.role) {
    const usersWithRole = await User.find({ role: queryObj.role }).select('_id');
    const userIds = usersWithRole.map((u) => u._id);
    queryObj.user_id = { $in: userIds };
    delete queryObj.role;
  }

  const activityLogQuery = new QueryBuilder<IActivityLogDocument>(
    ActivityLog.find().populate('user_id', 'email role name'),
    queryObj,
  )
    .search(['action_text'])
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
