import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from './channel';
import { RoomService } from '../room/room.service';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);
  private readonly channels: { [key: string]: Channel } = {};

  constructor(
    private readonly rooms: RoomService,
    private readonly users: UserService,
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

    const channel = new Channel(room, user, client, server);
    this.channels[channel.id] = channel;

    this.logger.debug(`Opened ${channel} for ${room} with ${user}`);

    return channel;
  }

  public exists(channelId: string): boolean {
    return !!this.channels[channelId];
  }

  public async joinAsStudent(
    client: Socket,
    name: string,
    channelId: string,
  ): Promise<Channel> {
    const channel = this.channels[channelId];

    if (!channel) {
      throw new WsException('Channel not found');
    }

    await channel.joinAsStudent(client, name);

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
      channel.close();
      delete this.channels[channelId];
      this.logger.debug(`Closed ${channel}`);
    }
  }
}
