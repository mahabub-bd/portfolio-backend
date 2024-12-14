import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './createBlog.Dto';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
