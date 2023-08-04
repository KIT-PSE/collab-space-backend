import { Migration } from '@mikro-orm/migrations';

export class Migration20230720182345 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `rooms` add `channel_id` varchar(255) null, add `whiteboard_canvas` text null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `rooms` drop `channel_id`;');
    this.addSql('alter table `rooms` drop `whiteboard_canvas`;');
  }

}
