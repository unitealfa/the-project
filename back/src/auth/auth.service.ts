import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

import { User, UserDocument } from "../user/schemas/user.schema";
import { Client } from "../client/schemas/client.schema";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel("Client") private readonly clientModel: Model<Client>,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ email })
      .select("+password +depot")
      .populate("company")
      .exec();

    if (!user) throw new NotFoundException("Utilisateur introuvable");
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException("Mot de passe invalide");

    this.logger.log(`🔍 Rôle trouvé dans la base de données : ${user.role}`);
    return user;
  }

  async login(user: UserDocument): Promise<{ access_token: string }> {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      depot: user.depot || null,
      entreprise: user.company || null,
    };

    this.logger.log(`🔐 Rôle stocké dans le JWT : ${payload.role}`);

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateClient(email: string, password: string): Promise<any> {
    const client = await this.clientModel
      .findOne({ email })
      .select("+password")
      .exec();

    if (!client) throw new NotFoundException("Client introuvable");
    const isValid = await bcrypt.compare(password, client.password);
    if (!isValid) throw new UnauthorizedException("Mot de passe invalide");

    return client;
  }

async loginClient(client: any): Promise<{ access_token: string, user: any }> {
  const affectation = client.affectations?.[0];
  let depot_name = '';
  let entreprise_name = '';

  try {
    if (affectation && affectation.depot && this.clientModel.db.modelNames().includes('Depot')) {
      const DepotModel = this.clientModel.db.model('Depot');
      const depotDoc = await DepotModel.findById(affectation.depot).lean() as any;
      if (depotDoc && typeof depotDoc.nom_depot === 'string') {
        depot_name = depotDoc.nom_depot;
      }
      if (depotDoc && depotDoc.company_id && this.clientModel.db.modelNames().includes('Company')) {
        const CompanyModel = this.clientModel.db.model('Company');
        const companyDoc = await CompanyModel.findById(depotDoc.company_id).lean() as any;
        if (companyDoc && typeof companyDoc.nom_company === 'string') {
          entreprise_name = companyDoc.nom_company;
        }
      }
    }
  } catch (err) {
    // ignore
  }

  // AJOUTE BIEN localisaton ici
  const userPayload = {
    id: client._id.toString(),
    nom_client: client.nom_client,
    contact: client.contact,
    num: client.contact?.telephone || "",
    pfp: client.pfp,
    depot: affectation?.depot?.toString() || "",
    depot_name,
    entreprise: { nom_company: entreprise_name },
    email: client.email,
    role: client.role,
    affectations: client.affectations ?? [],
    localisation: client.localisation || null, // 👈 AJOUT ICI !
  };

  const access_token = this.jwtService.sign(userPayload);
  return { access_token, user: userPayload };
}

}
