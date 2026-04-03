import { Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // ─── Search ─────────────────────────────────────────────────────────────
  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as any,
        ),
      } as any);
    }

    return this;
  }

  // ─── Filter ─────────────────────────────────────────────────────────────
  filter() {
    const queryObj = { ...this.query }; // copy query

    // Filtering
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    this.modelQuery = this.modelQuery.find(queryObj as any);

    return this;
  }

  // ─── Sort ─────────────────────────────────────────────────────────────
  sort() {
    const sort = (this.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }

  // ─── Paginate ──────────────────────────────────────────────────────────
  paginate() {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 20;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  // ─── Fields ────────────────────────────────────────────────────────────
  fields() {
    const fields = (this.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }

  // ─── Count Total ───────────────────────────────────────────────────────
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 20;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
