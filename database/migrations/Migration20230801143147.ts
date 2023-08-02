import { Migration } from '@mikro-orm/migrations';

export class Migration20230801143147 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `notes` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `content` text null, `created_at` datetime not null, `updated_at` datetime not null, `room_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `notes` add index `notes_room_id_index`(`room_id`);');

    this.addSql('alter table `notes` add constraint `notes_room_id_foreign` foreign key (`room_id`) references `rooms` (`id`) on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `notes`;');
  }

}
