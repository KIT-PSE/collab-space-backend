import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './channel.service';
import * as process from 'process';
import { BrowserService } from '../browser/browser.service';
import * as dotenv from 'dotenv';

dotenv.config();

const WEB_SOCKET_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? {}
    : { cors: { origin: process.env.FRONTEND_URL } };

@WebSocketGateway(WEB_SOCKET_OPTIONS)
export class BrowserGateway {
  @WebSocketServer()
  public server: Server;

  constructor(
    private orm: MikroORM,
    private channels: ChannelService,
    private browserService: BrowserService,
  ) {}

  @SubscribeMessage('open-website')
  @UseRequestContext()
  public async openWebsite(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { url: string },
  ) {
    const channel = await this.channels.fromClientOrFail(client);

    const peerId = await this.browserService.openWebsite(
      channel.id,
      payload.url,
    );
    this.server.to(channel.id).emit('open-website', peerId);

    return true;
  }

  @SubscribeMessage('move-mouse')
  @UseRequestContext()
  public async moveMouse(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { x: number; y: number },
  ) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.moveMouse(channel.id, payload.x, payload.y);

    return true;
  }

  @SubscribeMessage('mouse-down')
  @UseRequestContext()
  public async mouseDown(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.mouseDown(channel.id);

    return true;
  }

  @SubscribeMessage('mouse-up')
  @UseRequestContext()
  public async mouseUp(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.mouseUp(channel.id);

    return true;
  }

  @SubscribeMessage('key-down')
  @UseRequestContext()
  public async keyDown(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { key: string },
  ) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.keyDown(channel.id, payload.key);

    return true;
  }

  @SubscribeMessage('key-up')
  @UseRequestContext()
  public async keyUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { key: string },
  ) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.keyUp(channel.id, payload.key);

    return true;
  }

  @SubscribeMessage('scroll')
  @UseRequestContext()
  public async scroll(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { deltaY: number },
  ) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.scroll(channel.id, payload.deltaY);

    return true;
  }

  @SubscribeMessage('reload')
  public async reload(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.reload(channel.id);

    return true;
  }

  @SubscribeMessage('navigate-back')
  public async navigateBack(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.navigateBack(channel.id);

    return true;
  }

  @SubscribeMessage('navigate-forward')
  public async navigateForward(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.navigateForward(channel.id);

    return true;
  }
}
