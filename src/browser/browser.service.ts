import { Browser } from './browser';
import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class BrowserService implements OnModuleDestroy {
  public browser: Browser | null;

  public async openBrowser(url: string): Promise<string> {
    this.browser = new Browser(url);

    return await this.browser.open();
  }

  public async close(): Promise<void> {
    await this.browser?.close();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}
