import QueryBuilder from '../QueryBuilder';

describe('QueryBuilder', () => {
  let mockQuery: any;
  let queryObj: Record<string, unknown>;

  beforeEach(() => {
    mockQuery = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getFilter: jest.fn().mockReturnValue({}),
      model: {
        countDocuments: jest.fn().mockResolvedValue(100),
      },
    };
    queryObj = {};
  });

  describe('search', () => {
    it('should add search criteria to modelQuery if searchTerm is provided', () => {
      queryObj = { searchTerm: 'test' };
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.search(['name', 'description']);

      expect(mockQuery.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'test', $options: 'i' } },
          { description: { $regex: 'test', $options: 'i' } },
        ],
      });
    });

    it('should not add search criteria if searchTerm is missing', () => {
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.search(['name']);
      expect(mockQuery.find).not.toHaveBeenCalled();
    });
  });

  describe('filter', () => {
    it('should exclude reserved keywords from filtering', () => {
      queryObj = { name: 'P1', page: 1, limit: 10, sort: 'name' };
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.filter();

      expect(mockQuery.find).toHaveBeenCalledWith({ name: 'P1' });
    });

    it('should handle date range filtering if startDate/endDate is provided', () => {
      queryObj = { startDate: '2023-01-01', endDate: '2023-01-31' };
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.filter();

      expect(mockQuery.find).toHaveBeenCalledWith({
        createdAt: {
          $gte: new Date('2023-01-01'),
          $lte: new Date('2023-01-31'),
        },
      });
    });
  });

  describe('sort', () => {
    it('should apply custom sort if provided', () => {
      queryObj = { sort: 'price,-name' };
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.sort();
      expect(mockQuery.sort).toHaveBeenCalledWith('price -name');
    });

    it('should apply default sort if not provided', () => {
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.sort();
      expect(mockQuery.sort).toHaveBeenCalledWith('-createdAt');
    });
  });

  describe('paginate', () => {
    it('should apply skip and limit based on page and limit params', () => {
      queryObj = { page: '2', limit: '10' };
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.paginate();

      expect(mockQuery.skip).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });

    it('should use default values if not provided', () => {
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.paginate();
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
    });
  });

  describe('fields', () => {
    it('should apply field selection', () => {
      queryObj = { fields: 'name,price' };
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.fields();
      expect(mockQuery.select).toHaveBeenCalledWith('name price');
    });

    it('should exclude __v by default', () => {
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      qb.fields();
      expect(mockQuery.select).toHaveBeenCalledWith('-__v');
    });
  });

  describe('countTotal', () => {
    it('should calculate pagination metadata correctly', async () => {
      queryObj = { page: '2', limit: '10' };
      const qb = new QueryBuilder(mockQuery as any, queryObj);
      const meta = await qb.countTotal();

      expect(meta).toEqual({
        page: 2,
        limit: 10,
        total: 100,
        totalPage: 10,
      });
    });
  });
});
