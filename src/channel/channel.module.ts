import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { BrowserGateway } from './browser.gateway';
import { NotesGateway } from './notes.gateway';
import { NoteModule } from '../note/note.module';
import { WhiteboardGateway } from './whiteboard.gateway';

/**
 * Module for handling real-time communication and operations related to channels.
 */
@Module({
  imports: [NoteModule],
  providers: [
    ChannelGateway,
    NotesGateway,
    BrowserGateway,
    WhiteboardGateway,
    ChannelService,
  ],
  exports: [ChannelService],
})
export class ChannelModule {}
