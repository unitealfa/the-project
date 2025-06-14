
import { Module }         from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule }   from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TourneeModule } from './tournee/tournee.module';

import { AuthModule }     from './auth/auth.module';
import { UserModule }     from './user/user.module';
import { CompanyModule }  from './company/company.module';
import { DepotModule }    from './depot/depot.module';
import { TeamModule }     from './team/team.module';
import { ClientModule }   from './client/client.module';
import { ProductModule }  from './product/product.module';  // ← ajouté
import { CartModule }     from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { VehicleModule } from './vehicle/vehicle.module'; // Add this line
import { OrderModule } from './order/order.module';
import { ImageUploadModule } from './upload/image-upload.module';
import { AdModule } from './ad/ad.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { ChauffeursController } from './chauffeurs.controller';
import { LivreursController } from './livreurs.controller';

@Module({
  imports: [
    /* charge les variables .env dans tout le projet */
    ConfigModule.forRoot({ isGlobal: true }),

    /* connexion MongoDB */
    MongooseModule.forRoot(process.env.MONGO_URI),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),

    /* modules fonctionnels */
    AuthModule,
    UserModule,
    CompanyModule,
    DepotModule,
    TeamModule,
    ClientModule,           // assure l'enregistrement de /clients
    ProductModule,          // assure l'enregistrement de /products
    CartModule,             // assure l'enregistrement de /cart
    WishlistModule,         // assure l'enregistrement de /wishlist
    VehicleModule, 
    OrderModule,// Add this line
    ImageUploadModule,
    TourneeModule,
    AdModule,
    LoyaltyModule,
  ],
  controllers: [
    ChauffeursController,
    LivreursController,
  ],
})
export class AppModule {}