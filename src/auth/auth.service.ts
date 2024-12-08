import {
  ConflictException,
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
  ): Promise<{ message: string }> {
    try {
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hash = await bcrypt.hash(password, 10);
      await this.userModel.create({ name, email, password: hash });

      return { message: 'User registered successfully' };
    } catch (error) {
      this.logger.error(`Error during registration: ${error.message}`, error);

      if (error.code === 11000 || error.name === 'MongoServerError') {
        throw new ConflictException('User with this email already exists');
      }

      throw new InternalServerErrorException(
        'An error occurred while registering the user',
      );
    }
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<{ message: string; name: string; email: string; token: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid login credentials');
    }
    const payload = { userId: user._id, email: user.email, name: user.name };
    const token = this.jwtService.sign(payload);
    return {
      message: 'Login successful',
      name: user.name,
      email: user.email,
      token,
    };
  }

  async getUsers(): Promise<User[]> {
    try {
      const users = await this.userModel.find({});
      return users;
    } catch (error) {
      this.logger.error(
        `An error occurred while retrieving users: ${error.message}`,
      );
      throw new Error('An error occurred while retrieving users');
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
