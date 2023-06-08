import { Migration } from '@mikro-orm/migrations';

export class Migration20230605203550 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `users` add `role` varchar(255) not null default \'user\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table `users` drop `role`;');
  }

}
