import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBlogDto } from './dto/createBlog.Dto';
import { UpdateBlogDto } from './dto/updateBlog.Dto';
import { Blog } from './schemas/blog.schema';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
  ) {}

  async getBlogs(query: any): Promise<{
    message: string;
    statusCode: number;
    data: Blog[];
  }> {
    try {
      const { limit, category } = query;

      const filter: any = {};
      if (category) {
        filter.category = category;
      }

      const blogs = await this.blogModel
        .find(filter)
        .limit(limit ? parseInt(limit, 10) : 10)
        .exec();
      return {
        message: 'Blogs retrieved successfully',
        statusCode: HttpStatus.OK,
        data: blogs,
      };
    } catch (error) {
      return {
        message: 'Failed to retrieve blogs',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        data: [],
      };
    }
  }

  // getBlogBySlug

  async getBlogBySlug(slug: string): Promise<{
    message: string;
    statusCode: number;
    data: Blog | null;
  }> {
    try {
      const blog = await this.blogModel.findOne({ slug }).exec();
      if (!blog) {
        return {
          message: 'Blog not found',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }
      return {
        message: 'Blog retrieved successfully',
        statusCode: HttpStatus.OK,
        data: blog,
      };
    } catch (error) {
      return {
        message: 'Failed to retrieve blog',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
      };
    }
  }

  //Create Blog

  async createBlog(createBlogDto: CreateBlogDto): Promise<{
    message: string;
    statusCode: number;
    data: Blog;
  }> {
    try {
      const newBlog = new this.blogModel(createBlogDto);
      const savedBlog = await newBlog.save();

      return {
        message: 'Blog created successfully',
        statusCode: HttpStatus.CREATED,
        data: savedBlog,
      };
    } catch (error) {
      return {
        message: 'Failed to create blog',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
      };
    }
  }
  // Update Blog

  async updateBlog(
    id: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<{
    message: string;
    statusCode: number;
    data: Blog | null;
  }> {
    try {
      const updatedBlog = await this.blogModel.findByIdAndUpdate(
        id,
        { $set: updateBlogDto },
        { new: true },
      );

      if (!updatedBlog) {
        return {
          message: 'Blog not found',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        message: 'Blog updated successfully',
        statusCode: HttpStatus.OK,
        data: updatedBlog,
      };
    } catch (error) {
      return {
        message: 'Failed to update blog',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
      };
    }
  }

  //delete A Blog data

  async deleteBlog(blogId: string): Promise<{
    message: string;
    statusCode: number;
    data: any;
  }> {
    try {
      const blog = await this.blogModel.findByIdAndDelete(blogId);

      if (!blog) {
        return {
          message: 'Blog not found',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        message: 'Blog deleted successfully',
        statusCode: HttpStatus.OK,
        data: blog,
      };
    } catch (error) {
      return {
        message: 'Failed to delete blog',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
      };
    }
  }
}
