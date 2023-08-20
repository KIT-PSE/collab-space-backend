import { User } from '../../user/user.entity';
import { Room } from '../../room/room.entity';
import { Channel } from '../channel';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

export class MockChannelService {
  constructor(
    private readonly testUser: User,
    private readonly testRoom: Room,
    private readonly testChannel: Channel,
  ) {}

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
    return channelId === '123456';
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
}
