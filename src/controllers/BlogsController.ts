import { Request, Response } from "express";
import Blog from "../models/blog";
import { IBlog } from "../typs/blog.interface";
import Pagination from "../helpers/pagination";
import { sendResponse } from "../helpers/function";

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, author, category_id } = req.body;
    if (!title || !content || !author || !category_id) {
      return sendResponse(res, 400, "All fields are required");
    }
    // Validate category_id format (assuming it's a valid ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(category_id)) {
      return sendResponse(res, 400, "Invalid category ID format");
    }
    const blog = new Blog({ title, content, author, category: category_id });
    await blog.save();
    return sendResponse(res, 201, "Blog created successfully");
  } catch (err) {
    console.error("Error creating blog:", err);
    return sendResponse(res, 500, "Failed to create blog");
  }
};

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const result = await Pagination(
      Blog,
      {},
      page,
      limit,
      "title content author createdAt numberLikes"
    );

    const formatted = result.data.map((blog: any) => ({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      author: blog.author,
      createdAt: blog.createdAt,
      numberLikes: blog.numberLikes,
    }));

    res.status(200).json({
      blogs: formatted,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    return sendResponse(res, 500, "Failed to fetch blogs");
  }
};

export const likeBlog = async (req: Request, res: Response) => {
  try {
    const blogId: string = req.params.id;
    const updatedBlog: IBlog | null = await Blog.findOneAndUpdate(
      { _id: blogId },
      { $inc: { numberLikes: 1 } },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({
      message: "Blog updated successfully",
    });
    return sendResponse(res, 200, "Blog liked successfully", {
      blog: updatedBlog,
    });
  } catch (err) {
    console.error("Error updating blog:", err);
    return sendResponse(res, 500, "Failed to update blog");
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blogId: string = req.params.id;
    const deletedBlog: IBlog | null = await Blog.findOneAndDelete({
      _id: blogId,
    });

    if (!deletedBlog) {
      return sendResponse(res, 404, "Blog not found");
    }

    return sendResponse(res, 200, "Blog deleted successfully", {
      blog: deletedBlog,
    });
  } catch (err: any) {
    console.error("Error deleting blog:", err);
    return sendResponse(res, 500, "Failed to delete blog");
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const blogId: string = req.params.id;
    const { title, content, author, category_id } = req.body;

    if (!title || !content || !author || !category_id) {
      return sendResponse(res, 400, "All fields are required");
    }

    // Validate category_id format (assuming it's a valid ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(category_id)) {
      return sendResponse(res, 400, "Invalid category ID format");
    }

    const updatedBlog: IBlog | null = await Blog.findOneAndUpdate(
      { _id: blogId },
      { title, content, author, category: category_id },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return sendResponse(res, 404, "Blog not found");
    }

    return sendResponse(res, 200, "Blog updated successfully", {
      blog: updatedBlog,
    });
  } catch (err) {
    console.error("Error updating blog:", err);
    return sendResponse(res, 500, "Failed to update blog");
  }
};
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blogId: string = req.params.id;
    const blog: IBlog | null = await Blog.findById(blogId).populate(
      "category",
      "name"
    );
    if (!blog) {
      return sendResponse(res, 404, "Blog not found");
    }

    return sendResponse(res, 200, "Blog fetched successfully", { blog });
  } catch (err) {
    console.error("Error fetching blog:", err);
    return sendResponse(res, 500, "Failed to fetch blog");
  }
};
export const getBlogsByCategory = async (req: Request, res: Response) => {
  try {
    const categoryId: string = req.params.categoryId;
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const result = await Pagination(
      Blog,
      { category: categoryId },
      page,
      limit,
      "title content author createdAt numberLikes"
    );

    const formatted = result.data.map((blog: any) => ({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      author: blog.author,
      createdAt: blog.createdAt,
      numberLikes: blog.numberLikes,
    }));

    return sendResponse(res, 200, "Blogs fetched successfully", {
      blogs: formatted,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    });
  } catch (err) {
    console.error("Error fetching blogs by category:", err);
    return sendResponse(res, 500, "Failed to fetch blogs by category");
  }
};
export const getBlogsByAuthor = async (req: Request, res: Response) => {
  try {
    const author: string = req.params.author;
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const result = await Pagination(
      Blog,
      { author },
      page,
      limit,
      "title content author createdAt numberLikes"
    );

    const formatted = result.data.map((blog: any) => ({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      author: blog.author,
      numberLikes: blog.numberLikes,
      createdAt: blog.createdAt,
    }));

    return sendResponse(res, 200, "Blogs fetched successfully", {
      blogs: formatted,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    });
  } catch (err) {
    console.error("Error fetching blogs by author:", err);
    return sendResponse(res, 500, "Failed to fetch blogs by author");
  }
};
export const searchBlogs = async (req: Request, res: Response) => {
  try {
    const query: string = (req.query.q as string) || "";
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const result = await Pagination(
      Blog,
      {
        title: { $regex: query, $options: "i" },
        content: { $regex: query, $options: "i" },
      },

      page,
      limit,
      "title content author createdAt numberLikes"
    );

    const formatted = result.data.map((blog: any) => ({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      author: blog.author,
      createdAt: blog.createdAt,
      numberLikes: blog.numberLikes,
    }));

    return sendResponse(res, 200, "Blogs fetched successfully", {
      blogs: formatted,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    });
  } catch (err) {
    console.error("Error fetching blogs by author:", err);
    return sendResponse(res, 500, "Failed to fetch blogs by author");
  }
};
export const getLatestBlogs = async (req: Request, res: Response) => {
  try {
    const limit: number = parseInt(req.query.limit as string) || 5;

    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title content author createdAt numberLikes");

    const formatted = blogs.map((blog: any) => ({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      author: blog.author,
      createdAt: blog.createdAt,
      numberLikes: blog.numberLikes,
    }));

    return sendResponse(res, 200, "Latest blogs fetched successfully", {
      blogs: formatted,
    });
  } catch (err) {
    console.error("Error fetching latest blogs:", err);
    return sendResponse(res, 500, "Failed to fetch latest blogs");
  }
};

export const getTopBalogsForNumberLikes = async (
  req: Request,
  res: Response
) => {
  try {
    const limit: number = parseInt(req.query.limit as string) || 5;

    const blogs = await Blog.find({})
      .sort({ numberLikes: -1 })
      .limit(limit)
      .select("title content author createdAt numberLikes");

    const formatted = blogs.map((blog: any) => ({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      author: blog.author,
      createdAt: blog.createdAt,
      numberLikes: blog.numberLikes,
    }));

    return sendResponse(res, 200, "Top blogs fetched successfully", {
      blogs: formatted,
    });
  } catch (err) {
    console.error("Error fetching top blogs:", err);
    return sendResponse(res, 500, "Failed to fetch top blogs");
  }
};
