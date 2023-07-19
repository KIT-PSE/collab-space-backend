import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './channel.service';
import * as dotenv from 'dotenv';
import { NoteService } from '../note/note.service';

dotenv.config();

const WEB_SOCKET_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? {}
    : { cors: { origin: process.env.FRONTEND_URL } };

@WebSocketGateway(WEB_SOCKET_OPTIONS)
export class NotesGateway {
  @WebSocketServer()
  public server: Server;

  constructor(
    private orm: MikroORM,
    private channels: ChannelService,
    private notes: NoteService,
  ) {}

  @SubscribeMessage('add-note')
  @UseRequestContext()
  public async addNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { name: string },
  ) {
    const channel = this.channels.fromClientOrFail(client);
    const note = await this.notes.addNote(channel.room, payload.name);

    client.broadcast.to(channel.id).emit('note-added', note);

    return note;
  }

  @SubscribeMessage('update-note')
  @UseRequestContext()
  public async updateNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { noteId: number; content: string },
  ) {
    const channel = this.channels.fromClientOrFail(client);
    const note = await this.notes.updateNote(payload.noteId, payload.content);

    client.broadcast.to(channel.id).emit('note-updated', note);

    return true;
  }
}
