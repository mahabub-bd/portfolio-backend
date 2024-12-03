import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './schemas/user-auth.schema';
import { UserAuthService } from './user-auth.service';

@Controller('api/auth')
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
      const token = await this.userAuthService.loginUser(email, password);
      return { message: 'Login successful', token };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async getUsers(): Promise<User[]> {
    return this.userAuthService.getUsers();
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async getLoggedInUser(@Request() req): Promise<User> {
    try {
      const email = req.body.email;
      const user = await this.userAuthService.getLoggedInUserByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(
        `An error occurred while retrieving the logged-in user's data: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to retrieve user data');
    }
  }
}
