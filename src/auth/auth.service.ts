import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from './schemas/auth.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(
    name: string,
    email: string,
    password: string,
  ): Promise<{ message: string; statusCode: number }> {
    try {
      const existingUser = await this.userModel.findOne({ email });

      if (existingUser) throw new ConflictException('User Already Exist');

      const hash = await bcrypt.hash(password, 10);
      await this.userModel.create({ name, email, password: hash });

      return {
        message: 'User registered successfully',
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      this.logger.error(`Full error object: ${JSON.stringify(error)}`);

      throw new InternalServerErrorException({
        message: 'User Already Exist',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<{
    message: string;
    data: {
      name: string;
      email: string;
      token: string;
    };
    statusCode: number;
  }> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid login credentials',
        });
      }

      const payload = { userId: user._id, email: user.email, name: user.name };
      const token = this.jwtService.sign(payload);

      return {
        message: 'Login successful',
        statusCode: HttpStatus.OK,
        data: {
          name: user.name,
          email: user.email,
          token,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error during login: ${error instanceof Error ? error.message : error}`,
        error,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new UnauthorizedException({
        message: 'An error occurred during login',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
  }
}
