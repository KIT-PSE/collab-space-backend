import puppeteer, { Browser as PuppeteerBrowser, Page } from 'puppeteer';
import { Logger } from '@nestjs/common';
import * as path from 'path';

const LOGGER = new Logger('Browser');

const PATH_TO_EXTENSION = path.join(process.cwd(), 'extension');
const EXTENSION_ID = 'jjndjgheafjngoipoacpjgeicjeomjli';

export class Browser {
  private browser: PuppeteerBrowser;
  private page: Page;

  constructor(public readonly url: string) {}

  public async open(): Promise<any> {
    const args = [];

    if (process.env.NODE_ENV === 'development') {
      args.push('--no-sandbox');
      args.push('--disable-setuid-sandbox');
      args.push('--remote-debugging-port=9222');
      args.push('--remote-debugging-address=0.0.0.0');
    }

    args.push(`--load-extension=${PATH_TO_EXTENSION}`);
    args.push(`--disable-extensions-except=${PATH_TO_EXTENSION}`);
    args.push(`--allowlisted-extension-id=${EXTENSION_ID}`);

    LOGGER.debug(`Opening browser with args: ${args}`);
    this.browser = await puppeteer.launch({
      headless: 'new',
      args,
    });

    LOGGER.debug(`Opening page with url: ${this.url}`);
    this.page = await this.browser.newPage();

    await this.page.goto(this.url);
    await this.page.setViewport({ width: 1280, height: 720 });

    const extensionPage = await this.browser.newPage();
    await extensionPage.setBypassCSP(true);
    await extensionPage.goto(`chrome-extension://${EXTENSION_ID}/options.html`);

    await this.page.bringToFront();

    const id = await this.page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await START_RECORDING();
    });

    return id;
  }

  public async close(): Promise<void> {
    if (this.browser) {
      LOGGER.debug('Closing browser');
      await this.browser.close();
    }
  }
}
