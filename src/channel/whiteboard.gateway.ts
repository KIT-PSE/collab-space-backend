import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as dotenv from 'dotenv';
import { ChannelService } from './channel.service';

dotenv.config();

const WEB_SOCKET_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? {}
    : { cors: { origin: process.env.FRONTEND_URL } };

/**
 * WebSocket gateway for handling whiteboard-related communication.
 */
@WebSocketGateway(WEB_SOCKET_OPTIONS)
export class WhiteboardGateway {
  @WebSocketServer()
  public server: Server;

  /**
   * Constructor of WhiteboardGateway.
   * @param channels - Instance of ChannelService for managing channels.
   */
  constructor(private channels: ChannelService) {}

  /**
   * Subscribe to the 'whiteboard-change' event to handle whiteboard canvas changes.
   * @param client - The connected socket client.
   * @param payload - The message body containing the updated canvas JSON.
   */
  @SubscribeMessage('whiteboard-change')
  public async whiteboardChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { canvas: string },
  ) {
    const channel = await this.channels.fromClientOrFail(client);

    // Update the canvas JSON in the channel's data
    channel.canvasJSON = payload.canvas;

    // Broadcast the whiteboard change to all clients in the channel
    client.broadcast.to(channel.id).emit('whiteboard-change', payload);
  }
}
