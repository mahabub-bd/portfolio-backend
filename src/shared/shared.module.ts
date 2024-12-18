import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { secretKey } from './config';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: secretKey.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [JwtModule],
})
export class SharedModule {}
