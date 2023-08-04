import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from './channel';
import { RoomService } from '../room/room.service';
import { Room } from '../room/room.entity';
import { BrowserService } from '../browser/browser.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);
  private readonly channels: { [key: string]: Channel } = {};

  constructor(
    private readonly rooms: RoomService,
    private readonly users: UserService,
    private readonly browsers: BrowserService,
  ) {}

  public async open(
    client: Socket,
    server: Server,
    userId: number,
    roomId: number,
  ): Promise<Channel> {
    const user = await this.users.findOne(userId);

    if (!user) {
      throw new WsException('User not found');
    }

    const room = await this.rooms.findOneWithCategory(roomId);

    if (!room || room.category.owner.id !== userId) {
      throw new WsException('Room not found');
    }

    let channelId;
    do {
      channelId = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.exists(channelId));

    const channel = new Channel(room, server, channelId);
    await channel.joinAsTeacher(client, user);
    this.channels[channel.id] = channel;

    this.logger.debug(`Opened ${channel} for ${room} with ${user}`);

    return channel;
  }

  public exists(channelId: string): boolean {
    return !!this.channels[channelId];
  }

  public async joinAsStudent(
    client: Socket,
    channelId: string,
    name: string,
    password?: string,
  ): Promise<Channel> {
    const channel = this.channels[channelId];

    if (!channel) {
      throw new WsException('Channel not found');
    }

    if (channel.room.password && channel.room.password !== password) {
      throw new WsException('Wrong password');
    }

    await channel.joinAsStudent(client, name);

    channel.clearCloseTimeout();
    this.logger.debug(`Joined ${channel} as student ${name}`);

    return channel;
  }

  public async joinAsTeacher(
    client: Socket,
    channelId: string,
    userId: number,
  ): Promise<Channel> {
    const channel = this.channels[channelId];

    if (!channel) {
      throw new WsException('Channel not found');
    }

    const user = await this.users.findOne(userId);

    if (!user) {
      throw new WsException('User not found');
    }

    await channel.joinAsTeacher(client, user);

    channel.clearCloseTimeout();
    this.logger.debug(`Joined ${channel} as teacher ${user}`);

    return channel;
  }

  public async leave(client: Socket, channelId: string) {
    const channel = this.channels[channelId];

    if (channel?.teacher?.client.id === client.id) {
      await channel?.leaveAsTeacher(client);
      this.logger.debug(`Left ${channel} as teacher ${client.id}`);
    } else {
      await channel?.leaveAsStudent(client);
      this.logger.debug(`Left ${channel} as student ${client.id}`);
    }

    if (channel?.isEmpty()) {
      channel.clearCloseTimeout();
      channel.setCloseTimeout(() => {
        this.close(channelId);
      });
    }
  }

  public async close(channelId: string) {
    const channel = this.channels[channelId];

    if (!channel) {
      throw new WsException('Channel not found');
    }

    await this.rooms.updateWhiteboard(channel.room.id, channel.canvasJSON);
    await this.browsers.closeBrowserContext(channelId);

    await channel.close();
    delete this.channels[channelId];
    this.logger.debug(`Closed ${channel}`);
  }

  @OnEvent('room:deleted')
  public async onRoomDeleted(room: Room) {
    const channel = this.getChannelFromRoom(room);
    if (channel) {
      await this.close(channel.id);
    }
  }

  public fromClientOrFail(client: Socket): Channel {
    for (const room of client.rooms) {
      if (this.channels[room]) {
        return this.channels[room];
      }
    }

    throw new WsException('Channel not found');
  }

  public async getOtherClient(
    client: Socket,
    otherId: string,
  ): Promise<Socket> {
    const channel = this.fromClientOrFail(client);

    return channel.getUser(otherId).client;
  }

  public getChannelFromRoom(room: Room): Channel {
    for (const channel of Object.values(this.channels)) {
      if (channel.room.id === room.id) {
        return channel;
      }
    }
  }
}
