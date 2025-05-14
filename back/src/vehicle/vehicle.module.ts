import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { User, UserSchema } from '../user/schemas/user.schema'; // Adjust path if needed
import { Depot, DepotSchema } from '../depot/schemas/depot.schema'; // Adjust path if needed
import { AuthModule } from '../auth/auth.module'; // Import AuthModule for guards

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: VehicleSchema },
      { name: User.name, schema: UserSchema }, // Needed for user role checks in service
      { name: Depot.name, schema: DepotSchema }, // Needed for depot checks in service
    ]),
    AuthModule, // Provide JwtAuthGuard and potentially RolesGuard if it's exported from AuthModule
  ],
  controllers: [VehicleController],
  providers: [VehicleService],
})
export class VehicleModule {}