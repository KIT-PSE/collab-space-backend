import { Migration } from '@mikro-orm/migrations';

export class Migration20230719205351 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `notes` modify `content` text null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `notes` modify `content` text not null default \'\';');
  }

}
