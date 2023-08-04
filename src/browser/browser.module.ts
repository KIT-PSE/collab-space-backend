import { Global, Module } from '@nestjs/common';
import { BrowserService } from './browser.service';

/**
 * Global module providing services related to browser functionality.
 */
@Global()
@Module({
  providers: [BrowserService],
  exports: [BrowserService],
})
export class BrowserModule {}
