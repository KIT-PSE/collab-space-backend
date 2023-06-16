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
import * as process from 'process';
import { BrowserService } from '../browser/browser.service';

const WEB_SOCKET_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? {}
    : { cors: { origin: process.env.FRONTEND_URL } };

@WebSocketGateway(WEB_SOCKET_OPTIONS)
export class ChannelGateway implements OnGatewayConnection {
  @WebSocketServer()
  public server: Server;

  constructor(
    private orm: MikroORM,
    private channels: ChannelService,
    private browserService: BrowserService,
  ) {}

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
      payload.channelId,
      payload.name,
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
      video: channel.teacher.video,
      audio: channel.teacher.audio,
    };

    const students = channel.students.map((student) => ({
      id: student.client.id,
      name: student.name,
      video: student.video,
      audio: student.audio,
    }));

    return {
      room: channel.room,
      teacher,
      students,
    };
  }

  @SubscribeMessage('leave-room')
  @UseRequestContext()
  public async leaveRoom(@ConnectedSocket() client: Socket) {
    for (const room of client.rooms) {
      if (room !== client.id) {
        client.leave(room);
        await this.channels.leave(client, room);
      }
    }
  }

  @SubscribeMessage('change-name')
  @UseRequestContext()
  public async changeName(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { name: string },
  ) {
    const channel = await this.channels.fromClientOrFail(client);
    channel.changeName(client, payload.name);

    this.server.to(channel.id).emit('change-name', {
      id: client.id,
      name: payload.name,
    });

    return true;
  }

  @SubscribeMessage('connect-webcam')
  @UseRequestContext()
  public async addWebcam(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string; peerId: string },
  ) {
    const otherClient = await this.channels.getOtherClient(
      client,
      payload.userId,
    );

    otherClient.emit('connect-webcam', {
      userId: client.id,
      peerId: payload.peerId,
    });

    return true;
  }

  @SubscribeMessage('update-webcam')
  @UseRequestContext()
  public async updateWebcam(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { video: boolean; audio: boolean },
  ) {
    const channel = await this.channels.fromClientOrFail(client);
    channel.updateWebcam(client, payload.video, payload.audio);

    this.server.to(channel.id).emit('update-webcam', {
      id: client.id,
      video: payload.video,
      audio: payload.audio,
    });

    return true;
  }

  @SubscribeMessage('open-website')
  @UseRequestContext()
  public async openWebsite(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { url: string },
  ) {
    const channel = await this.channels.fromClientOrFail(client);
    // await channel.openWebsite(payload.url);
    const peerId = await this.browserService.openBrowser(payload.url);
    this.server.to(channel.id).emit('open-website', peerId);

    return true;
  }

  public async handleConnection(client: Socket) {
    /*
     * This is a workaround for getting the client's rooms in the disconnecting event.
     * The client's rooms are not available in the disconnecting event when
     * using nest.js' @SubscribeMessage('disconnecting') decorator.
     */
    client.on('disconnecting', () => this.leaveRoom(client));
  }
}
