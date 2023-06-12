import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './channel.service';
import { Channel } from './channel';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})
export class ChannelGateway implements OnGatewayConnection {
  @WebSocketServer()
  public server: Server;

  constructor(private orm: MikroORM, private channels: ChannelService) {}

  // todo: add authentication - only a logged in teacher should be able to open a room
  @SubscribeMessage('open-room')
  @UseRequestContext()
  public async openRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: number; roomId: number },
  ) {
    const channel = await this.channels.open(
      client,
      this.server,
      payload.userId,
      payload.roomId,
    );

    return {
      id: channel.id,
    };
  }

  @SubscribeMessage('join-room-as-student')
  @UseRequestContext()
  public async joinChannelAsStudent(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      name: string;
      channelId: string;
    },
  ) {
    if (!this.channels.exists(payload.channelId)) {
      return { error: 'Der Raum konnte nicht gefunden werden' };
    }

    const channel = await this.channels.joinAsStudent(
      client,
      payload.name,
      payload.channelId,
    );

    return this.channelState(channel);
  }

  @SubscribeMessage('join-room-as-teacher')
  @UseRequestContext()
  public async joinChannelAsTeacher(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      channelId: string;
      userId: number;
    },
  ) {
    if (!this.channels.exists(payload.channelId)) {
      return { error: 'Der Raum konnte nicht gefunden werden' };
    }

    const channel = await this.channels.joinAsTeacher(
      client,
      payload.channelId,
      payload.userId,
    );

    return this.channelState(channel);
  }

  private channelState(channel: Channel) {
    const teacher = {
      id: channel.teacher.client.id,
      user: channel.teacher.user,
    };

    const students = channel.students.map((student) => ({
      id: student.id,
      name: student.name,
    }));

    return {
      room: channel.room,
      teacher,
      students,
    };
  }

  public async handleConnection(client: Socket) {
    /*
     * This is a workaround for getting the client's rooms in the disconnecting event.
     * The client's rooms are not available in the disconnecting event when
     * using nest.js' @SubscribeMessage('disconnecting') decorator.
     */
    client.on('disconnecting', () => this.disconnecting(client));
  }

  @UseRequestContext()
  public async disconnecting(@ConnectedSocket() client: Socket) {
    for (const room of client.rooms) {
      if (room !== client.id) {
        client.leave(room);
        await this.channels.leave(client, room);
      }
    }
  }
}
