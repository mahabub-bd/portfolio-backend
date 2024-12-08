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
      throw new InternalServerErrorException({
        message: 'User Already Exist',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<{ message: string; name: string; email: string; token: string }> {
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
          message: 'Invalid login credentials',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      }

      const payload = { userId: user._id, email: user.email, name: user.name };
      const token = this.jwtService.sign(payload);

      return {
        message: 'Login successful',
        name: user.name,
        email: user.email,
        token,
      };
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error);

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

  async getLoggedInUserById(userId: string): Promise<User> {
    try {
      const user = await this.userModel.findById(userId).select('-password');
      return user;
    } catch (error) {
      this.logger.error(
        `Error fetching user by ID (${userId}): ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to fetch user by ID');
    }
  }

  async deleteUserById(userId: string): Promise<User | null> {
    try {
      const user = await this.userModel.findByIdAndDelete(userId);
      return user;
    } catch (error) {
      this.logger.error(
        `An error occurred while deleting the user by ID (${userId}): ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
