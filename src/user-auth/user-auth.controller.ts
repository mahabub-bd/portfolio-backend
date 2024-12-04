import {
  Body,
  Controller,
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
import { UserAuthService } from './user-auth.service';

@Controller('/auth')
export class UserAuthController {
  private readonly logger = new Logger(UserAuthController.name);

  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('register')
  async registerUser(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string }> {
    try {
      const { name, email, password } = registerDto;
      await this.userAuthService.registerUser(name, email, password);
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
      return await this.userAuthService.loginUser(email, password);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async getUsers(): Promise<User[]> {
    return this.userAuthService.getUsers();
  }

  @Get('user/:id')
  @UseGuards(AuthGuard)
  async getUserById(@Param('id') userId: string): Promise<User> {
    try {
      const user = await this.userAuthService.getLoggedInUserById(userId);
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
}
