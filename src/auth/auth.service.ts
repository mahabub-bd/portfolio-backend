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

  async getUsers(): Promise<{
    message: string;
    statusCode: number;
    data: User[];
  }> {
    try {
      const users = await this.userModel.find({});
      return {
        message: 'Users retrieved successfully',
        statusCode: HttpStatus.OK,
        data: users,
      };
    } catch (error) {
      this.logger.error(
        `An error occurred while retrieving users: ${error.message}`,
      );
      throw new InternalServerErrorException({
        message: 'An error occurred while retrieving users',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getLoggedInUserById(userId: string): Promise<{
    message: string;
    data: any;
    statusCode: number;
  }> {
    try {
      const user = await this.userModel.findById(userId).select('-password');
      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      return {
        message: 'User fetched successfully',
        statusCode: HttpStatus.OK,
        data: user,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching user by ID (${userId}): ${
          error instanceof Error ? error.message : error
        }`,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Failed to fetch user by ID',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async deleteUserById(
    userId: string,
  ): Promise<{ message: string; statusCode: number }> {
    try {
      const user = await this.userModel.findByIdAndDelete(userId);
      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      return {
        message: 'User deleted successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.logger.error(
        `An error occurred while deleting the user by ID (${userId}): ${
          error instanceof Error ? error.message : error
        }`,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Failed to delete user',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
