import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as dotenv from 'dotenv';
import { ChannelService } from './channel.service';
import { Logger } from '@nestjs/common';
import { fabric } from 'fabric';

dotenv.config();

const WEB_SOCKET_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? {}
    : { cors: { origin: process.env.FRONTEND_URL } };

@WebSocketGateway(WEB_SOCKET_OPTIONS)
export class WhiteboardGateway {
  private readonly logger = new Logger(WhiteboardGateway.name);

  @WebSocketServer()
  public server: Server;

  constructor(private channels: ChannelService) {}

  @SubscribeMessage('whiteboard-change')
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
  }
}
