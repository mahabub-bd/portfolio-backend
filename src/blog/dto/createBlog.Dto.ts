import { IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  seoMeta?: string;

  @IsOptional()
  @IsString()
  attachment?: string;
}
