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

/**
 * WebSocket gateway for handling browser-related operations.
 */
@WebSocketGateway(WEB_SOCKET_OPTIONS)
export class BrowserGateway {
  @WebSocketServer()
  public server: Server;

  /**
   * Initializes an instance of the BrowserGateway.
   *
   * @param orm - The MikroORM instance.
   * @param channels - The ChannelService instance.
   * @param browserService - The BrowserService instance.
   */
  constructor(
    private orm: MikroORM,
    private channels: ChannelService,
    private browserService: BrowserService,
  ) {}

  /**
   * Handles the "open-website" event, allowing a client to open a website in a browser.
   *
   * @param client - The connected socket client.
   * @param payload - The message payload containing the URL to open.
   * @returns A boolean indicating the success of opening the website.
   */
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

  /**
   * Handles the "move-mouse" event, allowing a client to move the mouse in the browser.
   *
   * @param client - The connected socket client.
   * @param payload - The message payload containing the coordinates to move the mouse to.
   * @returns A boolean indicating the success of moving the mouse.
   */
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

  /**
   * Handles the "mouse-down" event, allowing a client to simulate a mouse button press.
   *
   * @param client - The connected socket client.
   * @returns A boolean indicating the success of simulating a mouse button press.
   */
  @SubscribeMessage('mouse-down')
  @UseRequestContext()
  public async mouseDown(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.mouseDown(channel.id);

    return true;
  }

  /**
   * Handles the "mouse-up" event, allowing a client to simulate a mouse button release.
   *
   * @param client - The connected socket client.
   * @returns A boolean indicating the success of simulating a mouse button release.
   */
  @SubscribeMessage('mouse-up')
  @UseRequestContext()
  public async mouseUp(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.mouseUp(channel.id);

    return true;
  }

  /**
   * Handles the "key-down" event, allowing a client to simulate a keyboard key press.
   *
   * @param client - The connected socket client.
   * @param payload - The message payload containing the key to press.
   * @returns A boolean indicating the success of simulating a keyboard key press.
   */
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

  /**
   * Handles the "key-up" event, allowing a client to simulate releasing a keyboard key.
   *
   * @param client - The connected socket client.
   * @param payload - The message payload containing the key to release.
   * @returns A boolean indicating the success of simulating a keyboard key release.
   */
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

  /**
   * Handles the "scroll" event, allowing a client to simulate scrolling in the browser.
   *
   * @param client - The connected socket client.
   * @param payload - The message payload containing the deltaY value for scrolling.
   * @returns A boolean indicating the success of simulating scrolling in the browser.
   */
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

  /**
   * Handles the "reload" event, allowing a client to simulate reloading the browser page.
   *
   * @param client - The connected socket client.
   * @returns A boolean indicating the success of simulating a browser page reload.
   */
  @SubscribeMessage('reload')
  public async reload(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.reload(channel.id);

    return true;
  }

  /**
   * Handles the "navigate-back" event, allowing a client to simulate navigating back in the browser.
   *
   * @param client - The connected socket client.
   * @returns A boolean indicating the success of simulating navigating back in the browser.
   */
  @SubscribeMessage('navigate-back')
  public async navigateBack(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.navigateBack(channel.id);

    return true;
  }

  /**
   * Handles the "navigate-forward" event, allowing a client to simulate navigating forward in the browser.
   *
   * @param client - The connected socket client.
   * @returns A boolean indicating the success of simulating navigating forward in the browser.
   */
  @SubscribeMessage('navigate-forward')
  public async navigateForward(@ConnectedSocket() client: Socket) {
    const channel = await this.channels.fromClientOrFail(client);

    await this.browserService.navigateForward(channel.id);

    return true;
  }
}
