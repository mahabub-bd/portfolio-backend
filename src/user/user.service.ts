import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/auth.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getUsers(): Promise<{
    message: string;
    statusCode: number;
    data: User[];
  }> {
    try {
      const users = await this.userModel.find().exec();

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
