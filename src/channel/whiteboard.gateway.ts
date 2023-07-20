import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as LZString from 'lz-string';
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

    const json = channel.canvas.toJSON();
    /*const copy = { ...json, objects: [] };

    (json.objects || []).map((object) => {
      const objectCopy = {};
      for (const key in object) {
        const val = object[key];
        if (val !== null && val !== 0) {
          objectCopy[key] = object[key];
        }
      }
      copy.objects.push(objectCopy);
    });*/

    const compressed = LZString.compressToUTF16(JSON.stringify(json));

    await this.rooms.updateWhiteboard(channel.room.id, compressed);
  }
}
