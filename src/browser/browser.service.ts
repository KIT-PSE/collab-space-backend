import { Browser } from './browser';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as path from 'path';
import * as process from 'process';
import { Server } from 'socket.io';
import { Channel } from '../channel/channel';

const LOGGER = new Logger('BrowserService');

const PATH_TO_EXTENSION = path.join(process.cwd(), 'browser-extension');
const EXTENSION_ID = 'jjndjgheafjngoipoacpjgeicjeomjli';

/**
 * Service responsible for managing browser instances and interactions.
 */
@Injectable()
export class BrowserService implements OnModuleDestroy {
  private browserContexts: Map<string, Browser> = new Map();

  /**
   * Opens a new Puppeteer browser instance.
   *
   * @returns The Puppeteer browser instance.
   */
  private async openBrowser() {
    const args = [];

    args.push('--no-sandbox');
    args.push('--disable-setuid-sandbox');
    args.push(`--load-extension=${PATH_TO_EXTENSION}`);
    args.push(`--disable-extensions-except=${PATH_TO_EXTENSION}`);
    args.push(`--allowlisted-extension-id=${EXTENSION_ID}`);
    args.push('--window-size=1920,1080');
    args.push('--start-fullscreen');

    LOGGER.debug(`Opening browser with args: ${args}`);
    return await puppeteer.launch({
      headless: 'new',
      args,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
  }

  /**
   * Opens a website in a browser context.
   *
   * @param channelId - Identifier for the channel.
   * @param url - URL of the website to open.
   * @returns Peer ID associated with the browser context.
   */
  public async openWebsite(
    channelId: string,
    url: string,
    server: Server,
  ): Promise<string> {
    LOGGER.debug(`Opening website with url: ${url}`);

    if (!this.browserContexts.has(channelId)) {
      LOGGER.debug(`Creating new browser context for channel: ${channelId}`);

      const browserContext = await this.openBrowser();

      const browser = new Browser(browserContext, url, server, channelId);

      this.browserContexts.set(channelId, browser);

      return await browser.open();
    }

    const browser = this.browserContexts.get(channelId);
    await browser.openWebsite(url);

    return browser.peerId;
  }

  /**
   * Retrieves the Peer ID associated with a channel.
   *
   * @param channelId - Identifier for the channel.
   * @returns The Peer ID associated with the browser context.
   */
  public getPeerId(channelId: string): string {
    return this.browserContexts.get(channelId)?.peerId;
  }


 /**
  * Retrieve the browser context associated with a specific channel.
  * @param channel The channel for which to retrieve the browser context.
  * @returns The browser context associated with the channel, or null if not found.
  */
 public getFromChannel(channel: Channel): Browser | null {
   return this.browserContexts.get(channel.id) ?? null;
 }


  /**
   * Moves the mouse cursor to a specific position in a browser context.
   *
   * @param channelId - Identifier for the channel.
   * @param x - The X-coordinate of the mouse cursor.
   * @param y - The Y-coordinate of the mouse cursor.
   */
  public async moveMouse(
    channelId: string,
    x: number,
    y: number,
  ): Promise<void> {
    await this.browserContexts.get(channelId)?.moveMouse(x, y);
  }

  /**
   * Initiates a mouse down event in a browser context.
   *
   * @param channelId - Identifier for the channel.
   */
  public async mouseDown(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.mouseDown();
  }

  /**
   * Initiates a mouse up event in a browser context.
   *
   * @param channelId - Identifier for the channel.
   */
  public async mouseUp(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.mouseUp();
  }

  /**
   * Initiates a key down event in a browser context.
   *
   * @param channelId - Identifier for the channel.
   * @param key - The key to be pressed.
   */
  public async keyDown(channelId: string, key: string): Promise<void> {
    await this.browserContexts.get(channelId)?.keyDown(key);
  }

  /**
   * Initiates a key up event in a browser context.
   *
   * @param channelId - Identifier for the channel.
   * @param key - The key to be released.
   */
  public async keyUp(channelId: string, key: string): Promise<void> {
    await this.browserContexts.get(channelId)?.keyUp(key);
  }

  /**
   * Initiates a scroll event in a browser context.
   *
   * @param channelId - Identifier for the channel.
   * @param deltaY - The amount to scroll along the Y-axis.
   */
  public async scroll(channelId: string, deltaY: number): Promise<void> {
    await this.browserContexts.get(channelId)?.scroll(deltaY);
  }

  /**
   * Reloads the current page in a browser context.
   *
   * @param channelId - Identifier for the channel.
   */
  public async reload(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.reload();
  }

  /**
   * Navigates back to the previous page in a browser context.
   *
   * @param channelId - Identifier for the channel.
   */
  public async navigateBack(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.navigateBack();
  }

  /**
   * Navigates forward to the next page in a browser context.
   *
   * @param channelId - Identifier for the channel.
   */
  public async navigateForward(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.navigateForward();
  }

  /**
   * Closes a specific browser context.
   *
   * @param channelId - Identifier for the channel.
   */
  public async closeBrowserContext(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.close();
    this.browserContexts.delete(channelId);
  }

  /**
   * Closes the service, disposing of browser instances and contexts.
   */
  public async close(): Promise<void> {
    for (const browser of this.browserContexts.values()) {
      await browser.close();
    }
  }

  /**
   * Handles cleanup on module destruction.
   */
  public async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}
