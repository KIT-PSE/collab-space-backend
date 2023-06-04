import { Migration } from '@mikro-orm/migrations';

export class Migration20230604192349 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `users` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `email` varchar(255) not null, `organization` varchar(255) not null, `password` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `categories` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `owner_id` int unsigned not null, `created_at` datetime not null, `updated_at` datetime not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `categories` add index `categories_owner_id_index`(`owner_id`);');

    this.addSql('create table `rooms` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `password` varchar(255) null, `category_id` int unsigned not null, `created_at` datetime not null, `updated_at` datetime not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `rooms` add index `rooms_category_id_index`(`category_id`);');

    this.addSql('alter table `categories` add constraint `categories_owner_id_foreign` foreign key (`owner_id`) references `users` (`id`) on update cascade;');

    this.addSql('alter table `rooms` add constraint `rooms_category_id_foreign` foreign key (`category_id`) references `categories` (`id`) on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `categories` drop foreign key `categories_owner_id_foreign`;');

    this.addSql('alter table `rooms` drop foreign key `rooms_category_id_foreign`;');

    this.addSql('drop table if exists `users`;');

    this.addSql('drop table if exists `categories`;');

    this.addSql('drop table if exists `rooms`;');
  }

}
