import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Member, MemberSchema } from './schemas/member.schema';
import { TeamService }          from './team.service';
import { TeamController }       from './team.controller';

import { Depot, DepotSchema } from '../depot/schemas/depot.schema';
import { User,  UserSchema }  from '../user/schemas/user.schema';
import { Client, ClientSchema } from '../client/schemas/client.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Member.name, schema: MemberSchema },
      { name: Depot.name,  schema: DepotSchema  },
      { name: User.name,   schema: UserSchema   },
      { name: Client.name, schema: ClientSchema },
    ]),
  ],
  providers:   [TeamService],
  controllers: [TeamController],
  exports:     [TeamService],
})
export class TeamModule {}
