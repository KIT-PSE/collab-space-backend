import { Migration } from '@mikro-orm/migrations';

export class Migration20230608100226 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `categories` drop foreign key `categories_owner_id_foreign`;');

    this.addSql('alter table `categories` add constraint `categories_owner_id_foreign` foreign key (`owner_id`) references `users` (`id`) on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `categories` drop foreign key `categories_owner_id_foreign`;');

    this.addSql('alter table `categories` add constraint `categories_owner_id_foreign` foreign key (`owner_id`) references `users` (`id`) on update cascade;');
  }

}
