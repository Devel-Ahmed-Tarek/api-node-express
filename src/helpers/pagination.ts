// helpers/paginationHelper.js
import { Model, Document, FilterQuery, SortOrder } from "mongoose";

interface PaginationResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const Pagination = async <T extends Document>(
  model: Model<T>,
  query: FilterQuery<T>,
  page = 1,
  limit = 10,
  selectFields: string = "",
  sort: Record<string, SortOrder> = { createdAt: -1 }
): Promise<PaginationResult<T>> => {
  try {
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      model.countDocuments(query),
      model.find(query).sort(sort).skip(skip).limit(limit).select(selectFields),
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  } catch (error) {
    throw error;
  }
};

export default Pagination;
