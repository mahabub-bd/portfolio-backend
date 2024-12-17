import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  async registerUser(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string }> {
    const { name, email, password } = registerDto;
    return this.AuthService.registerUser(name, email, password);
  }

  @Post('login')
  async loginUser(@Body() loginDto: LoginDto): Promise<{
    message: string;
    data: {
      name: string;
      email: string;
      token: string;
    };
    statusCode: number;
  }> {
    const { email, password } = loginDto;
    return await this.AuthService.loginUser(email, password);
  }
}
