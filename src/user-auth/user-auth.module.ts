import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { secretKey } from './config';
import { UserSchema } from './schemas/user-auth.schema';
import { UserAuthController } from './user-auth.controller';
import { UserAuthService } from './user-auth.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.register({
      secret: secretKey.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService],
})
export class UserAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
