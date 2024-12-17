import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/schemas/auth.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(AuthGuard)
  @Get('')
  async getUsers(): Promise<{
    message: string;
    statusCode: number;
    data: User[];
  }> {
    return this.userService.getUsers();
  }

  @Get('user/:id')
  async getUserById(@Param('id') userId: string): Promise<{
    message: string;
    data: any;
    statusCode: number;
  }> {
    return await this.userService.getLoggedInUserById(userId);
  }

  @Delete('user/:id')
  async deleteUserById(
    @Param('id') userId: string,
  ): Promise<{ message: string; statusCode: number }> {
    return await this.userService.deleteUserById(userId);
  }
}
