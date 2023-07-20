import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as dotenv from 'dotenv';
import { ChannelService } from './channel.service';
import { fabric } from 'fabric';
import { RoomService } from '../room/room.service';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';

dotenv.config();

const WEB_SOCKET_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? {}
    : { cors: { origin: process.env.FRONTEND_URL } };

@WebSocketGateway(WEB_SOCKET_OPTIONS)
export class WhiteboardGateway {
  @WebSocketServer()
  public server: Server;

  constructor(
    private orm: MikroORM,
    private channels: ChannelService,
    private rooms: RoomService,
  ) {}

  @SubscribeMessage('whiteboard-change')
  @UseRequestContext()
  public async whiteboardChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { path: fabric.Path },
  ) {
    const channel = await this.channels.fromClientOrFail(client);

    client.broadcast.to(channel.id).emit('whiteboard-change', payload);

    channel.canvas.add(
      new fabric.Path(payload.path.path, {
        ...payload.path,
      }),
    );

    const json = JSON.stringify(channel.canvas.toJSON());
    await this.rooms.updateWhiteboard(channel.room.id, json);
  }
}
