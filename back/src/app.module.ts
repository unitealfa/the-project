import { Module }         from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule }   from '@nestjs/config';

import { AuthModule }     from './auth/auth.module';
import { UserModule }     from './user/user.module';
import { CompanyModule }  from './company/company.module';
import { DepotModule }    from './depot/depot.module';
import { TeamModule }     from './team/team.module';
import { ClientModule }   from './client/client.module';
import { ProductModule }  from './product/product.module';
import { CartModule }     from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { VehicleModule }  from './vehicle/vehicle.module';
import { OrderModule }    from './order/order.module';

@Module({
  imports: [
    // Charge les variables .env dans tout le projet
    ConfigModule.forRoot({ isGlobal: true }),

    // Connexion MongoDB
    MongooseModule.forRoot(process.env.MONGO_URI),

    // Modules fonctionnels
    AuthModule,
    UserModule,
    CompanyModule,
    DepotModule,
    TeamModule,
    ClientModule,      // /clients
    ProductModule,     // /products
    CartModule,        // /cart
    WishlistModule,    // /wishlist
    VehicleModule,     // /vehicles
    OrderModule,       // /orders
  ],
})
export class AppModule {}
