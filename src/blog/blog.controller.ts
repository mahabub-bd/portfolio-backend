import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/createBlog.Dto';

@Controller('/blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Get all blogs
  @Get()
  async getBlogs() {
    return this.blogService.getBlogs();
  }

  // Get a single blog by slug
  @Get('/:slug')
  async getBlogBySlug(@Param('slug') slug: string) {
    return this.blogService.getBlogBySlug(slug);
  }

  // Create a new blog

  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.createBlog(createBlogDto);
  }

  // Delete a blog by slug
  @Delete('/:id')
  async deleteBlog(@Param('id') blogId: string) {
    return this.blogService.deleteBlog(blogId);
  }
}
