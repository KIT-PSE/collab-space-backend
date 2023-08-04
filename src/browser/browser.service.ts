import { Browser } from './browser';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as path from 'path';
import * as process from 'process';
import { Server } from 'socket.io';
import { Channel } from "../channel/channel";

const LOGGER = new Logger('BrowserService');

const PATH_TO_EXTENSION = path.join(process.cwd(), 'browser-extension');
const EXTENSION_ID = 'jjndjgheafjngoipoacpjgeicjeomjli';

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private browserContexts: Map<string, Browser> = new Map();

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

  public getPeerId(channelId: string): string {
    return this.browserContexts.get(channelId)?.peerId;
  }

  public getFromChannel(channel: Channel): Browser | null {
    return this.browserContexts.get(channel.id) ?? null;
  }

  public async moveMouse(
    channelId: string,
    x: number,
    y: number,
  ): Promise<void> {
    await this.browserContexts.get(channelId)?.moveMouse(x, y);
  }

  public async mouseDown(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.mouseDown();
  }

  public async mouseUp(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.mouseUp();
  }

  public async keyDown(channelId: string, key: string): Promise<void> {
    await this.browserContexts.get(channelId)?.keyDown(key);
  }

  public async keyUp(channelId: string, key: string): Promise<void> {
    await this.browserContexts.get(channelId)?.keyUp(key);
  }

  public async scroll(channelId: string, deltaY: number): Promise<void> {
    await this.browserContexts.get(channelId)?.scroll(deltaY);
  }

  public async reload(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.reload();
  }

  public async navigateBack(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.navigateBack();
  }

  public async navigateForward(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.navigateForward();
  }

  public async closeBrowserContext(channelId: string): Promise<void> {
    await this.browserContexts.get(channelId)?.close();
    this.browserContexts.delete(channelId);
  }

  public async close(): Promise<void> {
    for (const browser of this.browserContexts.values()) {
      await browser.close();
    }
  }

  public async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}
