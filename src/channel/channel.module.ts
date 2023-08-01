import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { NotesGateway } from './notes.gateway';
import { NoteModule } from '../note/note.module';
import { WhiteboardGateway } from './whiteboard.gateway';

@Module({
  imports: [NoteModule],
  providers: [ChannelGateway, NotesGateway, WhiteboardGateway, ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
