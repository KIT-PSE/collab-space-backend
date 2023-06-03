import { Migration } from '@mikro-orm/migrations';

export class Migration20230601132750 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `user` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `email` varchar(255) not null, `organization` varchar(255) not null, `password` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null) default character set utf8mb4 engine = InnoDB;',
    );
  }
}
