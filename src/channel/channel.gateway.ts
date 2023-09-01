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
import * as dotenv from 'dotenv';
import { BrowserService } from '../browser/browser.service';
import { UnauthorizedException } from '@nestjs/common';

dotenv.config();

const WEB_SOCKET_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? {}
    : { cors: { origin: process.env.FRONTEND_URL } };

/**
 * WebSocket gateway for handling real-time communication related to channels.
 */
@WebSocketGateway({
  ...WEB_SOCKET_OPTIONS,
  maxHttpBufferSize: 1e8,
})
export class ChannelGateway implements OnGatewayConnection {
  @WebSocketServer()
  public server: Server;

  constructor(
    private orm: MikroORM,
    private channels: ChannelService,
    private browsers: BrowserService,
  ) {}

  // todo: add authentication - only a logged in teacher should be able to open a room
  /**
   * Handle an 'open-room' event to open a room.
   *
   * @param client The connected socket client.
   * @param payload The payload containing userId and roomId.
   * @returns The channel state.
   */
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

    return this.channelState(channel);
  }

  /**
   * Handle a 'join-room-as-student' event to join a room as a student.
   *
   * @param client The connected socket client.
   * @param payload The payload containing name, channelId, and password (optional).
   * @returns The channel state or an error object.
   */
  @SubscribeMessage('join-room-as-student')
  @UseRequestContext()
  public async joinChannelAsStudent(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      name: string;
      channelId: string;
      password?: string;
    },
  ) {
    if (!this.channels.exists(payload.channelId)) {
      return { error: 'Der Raum konnte nicht gefunden werden' };
    }

    let channel;
    try {
      channel = await this.channels.joinAsStudent(
        client,
        payload.channelId,
        payload.name,
        payload.password,
      );
    } catch (e) {
      return { error: e.message };
    }

    return this.channelState(channel);
  }

  /**
   * Handle a 'join-room-as-teacher' event to join a room as a teacher.
   *
   * @param client The connected socket client.
   * @param payload The payload containing channelId and userId.
   * @returns The channel state.
   */
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
      return { error: 'Not found' };
    }

    try {
      const channel = await this.channels.joinAsTeacher(
        client,
        payload.channelId,
        payload.userId,
      );

      return this.channelState(channel);
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        return { error: 'Not authorized' };
      }

      throw e;
    }
  }

  private channelState(channel: Channel) {
    const teacher = channel.teacher && {
      id: channel.teacher.client.id,
      user: channel.teacher.user,
      video: channel.teacher.video,
      audio: channel.teacher.audio,
    };

    const students = Array.from(channel.students.values()).map((student) => ({
      id: student.client?.id,
      name: student.name,
      video: student.video,
      audio: student.audio,
      handSignal: student.handSignal,
      permission: student.permission,
    }));

    const browserPeerId = this.browsers.getPeerId(channel.id);
    const browser = this.browsers.getFromChannel(channel);

    return {
      browserPeerId: browserPeerId || '',
      browserUrl: browser?.url || 'https://www.google.com',
      room: {
        ...channel.room,
        category: channel.room.category.id,
        channelId: channel.id,
        whiteboardCanvas: channel.canvasJSON,
      },
      teacher,
      students,
    };
  }

  /**
   * Handle a 'leave-room' event to allow a user to leave a room.
   *
   * @param client The connected socket client.
   */
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

  /**
   * Handle a 'change-name' event to change a user's name.
   *
   * @param client The connected socket client.
   * @param payload The payload containing the new name.
   * @returns A boolean indicating success.
   */
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

  /**
   * Handle a 'connect-webcam' event to add a webcam connection.
   *
   * @param client The connected socket client.
   * @param payload The payload containing userId and peerId.
   * @returns A boolean indicating success.
   */
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

  /**
   * Handle an 'update-webcam' event to update webcam settings.
   *
   * @param client The connected socket client.
   * @param payload The payload containing video and audio settings.
   * @returns A boolean indicating success.
   */
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

  /**
   * Handle an 'update-handSignal' event to update hand signal.
   *
   * @param client The connected socket client.
   * @param payload The payload containing hand signal setting.
   * @returns A boolean indicating success.
   */
  @SubscribeMessage('update-handSignal')
  @UseRequestContext()
  public async updateHandSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { handSignal: boolean },
  ) {
    const channel = await this.channels.fromClientOrFail(client);
    channel.updateHandSignal(client, payload.handSignal);

    this.server.to(channel.id).emit('update-handSignal', {
      id: client.id,
      handSignal: payload.handSignal,
    });

    return true;
  }

  /**
   * Handle an 'update-permission' event to update student permission.
   *
   * @param client The connected socket client.
   * @param payload The payload containing studentId and permission setting.
   * @returns A boolean indicating success.
   */
  @SubscribeMessage('update-permission')
  @UseRequestContext()
  public async updatePermission(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { studentId: string; permission: boolean },
  ) {
    const channel = await this.channels.fromClientOrFail(client);
    channel.updatePermission(payload.studentId, payload.permission);

    this.server.to(channel.id).emit('update-permission', {
      id: payload.studentId,
      permission: payload.permission,
    });

    return true;
  }

  /**
   * Handle an 'close-channel' event to close a channel.
   * @param client The connected socket client.
   * @param payload The payload containing channelId.
   * @returns A boolean indicating success.
   */
  @SubscribeMessage('close-channel')
  @UseRequestContext()
  public async closeChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { channelId: string },
  ) {
    const channel = await this.channels.fromId(payload.channelId);
    await this.channels.close(channel);

    return true;
  }

  /**
   * Handle the connection event.
   *
   * @param client The connected socket client.
   */
  public async handleConnection(client: Socket) {
    /*
     * This is a workaround for getting the client's rooms in the disconnecting event.
     * The client's rooms are not available in the disconnecting event when
     * using nest.js' @SubscribeMessage('disconnecting') decorator.
     */
    client.on('disconnecting', () => this.leaveRoom(client));
  }
}
