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

  constructor(private channels: ChannelService) {}

  @SubscribeMessage('whiteboard-change')
  public async whiteboardChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { canvas: string },
  ) {
    const channel = await this.channels.fromClientOrFail(client);

    channel.canvasJSON = payload.canvas;

    client.broadcast.to(channel.id).emit('whiteboard-change', payload);
  }
}
