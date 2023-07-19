import { Migration } from '@mikro-orm/migrations';

export class Migration20230719134804 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `notes` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `content` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `room_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `notes` add index `notes_room_id_index`(`room_id`);');

    this.addSql('alter table `notes` add constraint `notes_room_id_foreign` foreign key (`room_id`) references `rooms` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `rooms` add `channel_id` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `notes`;');

    this.addSql('alter table `rooms` drop `channel_id`;');
  }

}
