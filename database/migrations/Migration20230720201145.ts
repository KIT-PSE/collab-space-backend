import { Migration } from '@mikro-orm/migrations';

export class Migration20230720201145 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `rooms` modify `whiteboard_canvas` blob;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `rooms` modify `whiteboard_canvas` text;');
  }

}
