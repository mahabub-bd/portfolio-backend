import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from 'src/auth/auth.guard';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/createBlog.Dto';
import { UpdateBlogDto } from './dto/updateBlog.Dto';

@Controller('/blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Get all blogs
  @Get()
  async getBlogs(@Query() query: any) {
    return this.blogService.getBlogs(query);
  }

  // Get a single blog by slug
  @Get('/:slug')
  async getBlogBySlug(@Param('slug') slug: string) {
    return this.blogService.getBlogBySlug(slug);
  }

  // Create a new blog
  @UseGuards(AuthGuard)
  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.createBlog(createBlogDto);
  }

  //Update a Blog
  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.updateBlog(blogId, updateBlogDto);
  }

  // Delete a blog by slug
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteBlog(@Param('id') blogId: string) {
    return this.blogService.deleteBlog(blogId);
  }
}
