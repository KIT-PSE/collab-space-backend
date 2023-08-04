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

/**
 * WebSocket gateway for managing notes-related communication.
 */
@WebSocketGateway(WEB_SOCKET_OPTIONS)
export class NotesGateway {
  @WebSocketServer()
  public server: Server;

  /**
   * Constructor of NotesGateway.
   * @param orm - MikroORM instance for database interactions.
   * @param channels - Instance of ChannelService for managing channels.
   * @param notes - Instance of NoteService for managing notes.
   */
  constructor(
    private orm: MikroORM,
    private channels: ChannelService,
    private notes: NoteService,
  ) {}

  /**
   * Subscribe to the 'add-note' event to add a new note.
   * @param client - The connected socket client.
   * @param payload - The message body containing the note's name.
   * @returns The newly added note.
   */
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

  /**
   * Subscribe to the 'update-note' event to update an existing note.
   * @param client - The connected socket client.
   * @param payload - The message body containing the note's ID and updated content.
   * @returns `true` if the note was successfully updated.
   */
  @SubscribeMessage('update-note')
  @UseRequestContext()
  public async updateNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { noteId: number; content: string },
  ) {
    const channel = this.channels.fromClientOrFail(client);
    await this.notes.updateNote(payload.noteId, payload.content);

    client.broadcast.to(channel.id).emit('note-updated', {
      noteId: payload.noteId,
      content: payload.content,
    });

    return true;
  }

  /**
   * Subscribe to the 'delete-note' event to delete a note.
   * @param client - The connected socket client.
   * @param payload - The message body containing the note's ID.
   * @returns `true` if the note was successfully deleted.
   */
  @SubscribeMessage('delete-note')
  @UseRequestContext()
  public async deleteNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { noteId: number },
  ) {
    const channel = this.channels.fromClientOrFail(client);
    await this.notes.deleteNoteById(payload.noteId);

    this.server.to(channel.id).emit('note-deleted', {
      noteId: payload.noteId,
    });

    return true;
  }
}
