import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { UserModule } from './user.module';
import { EventsModule } from './events.module';

@Module({
  imports: [UserModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})


export class AppModule {}
