import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './schemas/user-auth.schema';
import { AuthService } from './user-auth.service';

@Controller('/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  async registerUser(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string }> {
    try {
      const { name, email, password } = registerDto;
      await this.AuthService.registerUser(name, email, password);
      return { message: 'User registered successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async loginUser(
    @Body() loginDto: LoginDto,
  ): Promise<{ message: string; token: string }> {
    try {
      const { email, password } = loginDto;
      return await this.AuthService.loginUser(email, password);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async getUsers(): Promise<User[]> {
    return this.AuthService.getUsers();
  }

  @Get('user/:id')
  @UseGuards(AuthGuard)
  async getUserById(@Param('id') userId: string): Promise<User> {
    try {
      const user = await this.AuthService.getLoggedInUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(
        `An error occurred while retrieving the user by ID (${userId}): ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to retrieve user data');
    }
  }

  @Delete('user/:id')
  @UseGuards(AuthGuard)
  async deleteUserById(
    @Param('id') userId: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.AuthService.deleteUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error(
        `An error occurred while deleting the user by ID (${userId}): ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}