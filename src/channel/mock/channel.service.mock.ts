import { User } from '../../user/user.entity';
import { Room } from '../../room/room.entity';
import { Channel } from '../channel';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

export class MockChannelService {
  private testChannels: Channel[] = [];
  constructor(
    private readonly testUser: User,
    private readonly testRoom: Room,
    private readonly testChannel: Channel,
    private readonly otherClient: Socket,
  ) {
    this.testChannels[this.testChannel.id] = this.testChannel;
  }

  public async open(
    client: Socket,
    server: Server,
    userId: number,
    roomId: number,
  ): Promise<Channel> {
    if (userId !== this.testUser.id) {
      throw new WsException('User not found');
    }
    if (roomId !== this.testRoom.id) {
      throw new WsException('Room not found');
    }

    const channel = new Channel(this.testRoom, server, '123456');
    await channel.joinAsTeacher(client, this.testUser);
    return channel;
  }

  public exists(channelId: string): boolean {
    return this.testChannels.some((channel) => channel.id === channelId);
  }

  public async joinAsStudent(
    client: Socket,
    channelId: string,
    name: string,
    password?: string,
  ) {
    if (channelId !== '123456') {
      throw new WsException('Channel not found');
    }
    if (
      this.testChannel.room.password &&
      this.testChannel.room.password !== password
    ) {
      throw new WsException('Wrong password');
    }
    await this.testChannel.joinAsStudent(client, name);

    return this.testChannel;
  }

  public async joinAsTeacher(
    client: Socket,
    channelId: string,
    userId: number,
  ) {
    if (channelId !== '123456') {
      throw new WsException('Channel not found');
    }
    if (userId !== this.testUser.id) {
      throw new WsException('User not found');
    }
    await this.testChannel.joinAsTeacher(client, this.testUser);

    return this.testChannel;
  }

  public async leave(client: Socket, channelId: string) {
    if (channelId !== '123456') {
      throw new WsException('Channel not found');
    }
    if (this.testChannel.teacher?.client.id === client.id) {
      await this.testChannel.leaveAsTeacher(client);
    } else {
      await this.testChannel.leaveAsStudent(client);
    }
  }

  public fromClientOrFail(client: Socket): Channel {
    if (client.id === 'test' && client.rooms.has('123456')) {
      return this.testChannel;
    }
    throw new WsException('Channel not found');
  }

  public async getOtherClient(
    client: Socket,
    otherId: string,
  ): Promise<Socket> {
    if (client.id === 'test' && otherId === this.otherClient.id) {
      return this.otherClient;
    }
    throw new WsException('Channel not found');
  }

  public fromId(id: string): Channel {
    if (!this.exists(id)) {
      throw new WsException('Channel not found');
    }

    return this.testChannels[id];
  }

  public async close(channel: Channel) {
    channel.close();
    delete this.testChannels[channel.id];
  }
}
