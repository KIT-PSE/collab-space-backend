import { Global, Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Note } from './note.entity';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([Note])],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
