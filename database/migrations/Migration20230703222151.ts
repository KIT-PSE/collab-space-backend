import { Migration } from '@mikro-orm/migrations';

export class Migration20230703222151 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `users` add `refresh_token` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `users` drop `refresh_token`;');
  }

}
