import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Channel } from './channel';
import { RoomService } from '../room/room.service';
import { Room } from '../room/room.entity';
import { BrowserService } from '../browser/browser.service';

/**
 * Service for managing channels and real-time communication.
 */
@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);
  private readonly channels: { [key: string]: Channel } = {};

  constructor(
    private readonly rooms: RoomService,
    private readonly users: UserService,
    private readonly browsers: BrowserService,
  ) {}

  /**
   * Opens a new channel for a teacher in a specific room.
   *
   * @param client - The socket client of the teacher.
   * @param server - The socket server.
   * @param userId - The ID of the teacher user.
   * @param roomId - The ID of the room to open.
   * @returns The created channel.
   * @throws WsException if the user or room is not found.
   */
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

  /**
   * Checks if a channel with the given channelId exists.
   *
   * @param channelId - The ID of the channel to check.
   * @returns true if the channel exists, false otherwise.
   */
  public exists(channelId: string): boolean {
    return !!this.channels[channelId];
  }

  /**
   * Allows a student to join a channel.
   *
   * @param client - The socket client of the student.
   * @param channelId - The ID of the channel to join.
   * @param name - The name of the student.
   * @param password - The password for the channel (if applicable).
   * @returns The joined channel.
   * @throws WsException if the channel is not found or password is incorrect.
   */
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

  /**
   * Allows a teacher to join a channel.
   *
   * @param client - The socket client of the teacher.
   * @param channelId - The ID of the channel to join.
   * @param userId - The ID of the teacher user.
   * @returns The joined channel.
   * @throws WsException if the channel is not found or user is not found.
   */
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

  /**
   * Handles the process of a client leaving a channel.
   *
   * @param client - The socket client leaving the channel.
   * @param channelId - The ID of the channel to leave.
   */
  public async leave(client: Socket, channelId: string) {
    const channel = this.channels[channelId];

    if (channel?.teacher?.client.id === client.id) {
      await channel?.leaveAsTeacher(client);
      this.logger.debug(`Left ${channel} as teacher ${client.id}`);
    } else {
      await channel?.leaveAsStudent(client);
      this.logger.debug(`Left ${channel} as student ${client.id}`);
    }

    /*
     * If the channel is empty after the client left, close it after 1 second.
     * This is a temporary solution to prevent the channel from being
     * closed when the teacher leaves and rejoins.
     *
     * TODO: implement a better solution
     */
    if (channel?.isEmpty()) {
      channel.clearCloseTimeout();
      channel.setCloseTimeout(async () => {
        delete this.channels[channelId];
        await this.rooms.updateWhiteboard(channel.room.id, channel.canvasJSON);
        await this.browsers.closeBrowserContext(channelId);
        this.logger.debug(`Closed ${channel}`);
      });
    }
  }

  /**
   * Gets a channel associated with the given socket client.
   *
   * @param client - The socket client.
   * @returns The associated channel.
   * @throws WsException if the channel is not found.
   */
  public fromClientOrFail(client: Socket): Channel {
    for (const room of client.rooms) {
      if (this.channels[room]) {
        return this.channels[room];
      }
    }

    throw new WsException('Channel not found');
  }

  /**
   * Retrieves the other client's socket associated with the given client and ID.
   *
   * @param client - The socket client.
   * @param otherId - The ID of the other client.
   * @returns The other client's socket.
   * @throws WsException if the channel is not found.
   */
  public async getOtherClient(
    client: Socket,
    otherId: string,
  ): Promise<Socket> {
    const channel = this.fromClientOrFail(client);

    return channel.getUser(otherId).client;
  }

  /**
   * Retrieves the channel associated with the given room.
   *
   * @param room - The room entity.
   * @returns The associated channel.
   */
  public getChannelFromRoom(room: Room): Channel {
    for (const channel of Object.values(this.channels)) {
      if (channel.room.id === room.id) {
        return channel;
      }
    }
  }
}
