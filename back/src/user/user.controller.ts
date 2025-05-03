import { Controller, Post, Body } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userSvc: UserService) {}

  /** POST /user/login */
  @Post("login")
  async login(
    @Body() { email, password }: { email: string; password: string }
  ) {
    /* 1 ) document Mongoose + société */
    const doc = await this.userSvc.findByEmailWithCompany(email);

    /* 2 ) JWT */
    const token = await this.userSvc.checkPasswordAndSignJwt(doc, password);

    /* 3 ) On « dé-Mongoose » pour sérialiser facilement */
    const obj: any = doc.toObject(); // <- any pour TS

    return {
      token,
      user: {
        id: obj._id.toString(),
        nom: obj.nom,
        prenom: obj.prenom,
        email: obj.email,
        role: obj.role, // Admin / livraison / …
        fonction: obj.fonction, // Livreur / Chauffeur / …
        company: obj.company?._id ?? null,
        companyName: obj.company?.nom_company ?? null,
        num: obj.num,
        depot: obj.depot ?? null, // ✅ AJOUTE CECI
      },
    };
  }
}
