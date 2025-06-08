// back/src/client/client.controller.ts

import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Put,
  Delete,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Body,
} from "@nestjs/common";
import { ClientService } from "./client.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { DepotHelperService } from "../common/helpers/depot-helper.service";
import { GetUser } from '../auth/decorators';
import { Client } from './schemas/client.schema';

import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { existsSync, mkdirSync } from "fs";
import { extname } from "path";

@Controller("clients")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientController {
  private readonly logger = new Logger(ClientController.name);

  constructor(
    private readonly clientService: ClientService,
    private readonly depotHelper: DepotHelperService
  ) {}

  /* ───────────────────────── CHECK EMAIL ───────────────────────── */
  @Get("check")
  @Roles("Admin", "responsable depot")
  async checkClient(@Query("email") email: string) {
    this.logger.debug(`GET /clients/check?email=${email}`);
    return this.clientService.findByEmail(email);
  }

  /* ───────────────────────── LISTE DES CLIENTS ───────────────────────── */
  @Get()
  @Roles(
    "Admin",
    "responsable depot",
    "superviseur des ventes",
    "Administrateur des ventes",
    "Pré-vendeur"
  )
  async getClients(@Req() req, @Query("depot") depotId?: string) {
    const user = req.user;
    this.logger.debug(
      `GET /clients – role=${user.role} depotQuery=${depotId ?? "∅"}`
    );

    // Pré-vendeurs ⇒ uniquement leurs clients assignés
    if (user.role === "Pré-vendeur") {
      this.logger.debug(` → findByDepot(${user.depot}, ${user.id})`);
      return this.clientService.findByDepot(user.depot, user.id);
    }

    // Responsables / superviseurs / admin-ventes ⇒ uniquement leur dépôt
    if (
      user.role === "responsable depot" ||
      user.role === "superviseur des ventes" ||
      user.role === "Administrateur des ventes"
    ) {
      this.logger.debug(` → findByDepot(${user.depot})`);
      return this.clientService.findByDepot(user.depot);
    }

    // Admin
    if (depotId) {
      this.logger.debug(` → Admin + filtrage depot ${depotId}`);
      return this.clientService.findByDepot(depotId);
    }
    this.logger.debug(" → Admin – all clients");
    return this.clientService.findAll();
  }

  /* ──────────────────────── GET CLIENT PAR ID ──────────────────────── */
  @Get(":id")
  @Roles(
    "Admin",
    "responsable depot",
    "superviseur des ventes",
    "Administrateur des ventes",
    "Pré-vendeur"
  )
  async getClientById(@Param("id") id: string) {
    this.logger.debug(`GET /clients/${id}`);

    const client = await this.clientService.findById(id);
    if (!client) {
      this.logger.warn(`Client ${id} introuvable`);
      throw new NotFoundException(`Client ${id} introuvable`);
    }

    const stats = await this.clientService.getClientStats(id);
    this.logger.debug(`Stats pour client ${id}:`, stats);

    return {
      ...client,
      stats,
    };
  }

  /* ───────────────────────── AFFECTATION ───────────────────────── */
  @Post(":id/affectation")
  @Roles("responsable depot")
  async addAffectation(@Param("id") id: string, @Req() req) {
    const body: { entreprise: string; depot: string } = req.body;
    this.logger.debug(
      `POST /clients/${id}/affectation – body=${JSON.stringify(body)}`
    );
    return this.clientService.addAffectation(id, body.entreprise, body.depot);
  }

  /* ───────────────────────── CRÉATION (avec upload pfp) ───────────────────────── */
  @Post()
  @UseInterceptors(
    FileInterceptor("pfp", {
      storage: diskStorage({
        // → Dossier de destination EXACT : "back/public/client-pfps"
        destination: (req, file, cb) => {
          const uploadPath = "public/client-pfps";
          // Créer le dossier s'il n'existe pas
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Générer un nom unique : timestamp + extension d'origine
          const uniqueSuffix = Date.now().toString();
          const fileExt = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExt}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accepter uniquement les images JPG / JPEG / PNG
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
        } else {
          cb(new Error("Seules les images JPG/PNG sont autorisées."), false);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 Mo max
    })
  )
  @Roles("responsable depot")
  async createClient(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const user = req.user;
    this.logger.debug(`POST /clients – user=${user.role}`);

    /**
     * 1) On récupère tout ce qui vient dans req.body (FormData),
     *    puis on reconstruit manuellement un CreateClientDto valide.
     */
    const body = req.body as Record<string, any>;

    // Construire l'objet CreateClientDto
    const dto: CreateClientDto = {
      nom_client: body.nom_client,
      email: body.email,
      password: body.password,
      contact: {
        nom_gerant: body["contact.nom_gerant"],
        telephone: body["contact.telephone"],
      },
      localisation: {
        adresse: body["localisation.adresse"],
        ville: body["localisation.ville"],
        code_postal: body["localisation.code_postal"],
        region: body["localisation.region"],
        coordonnees: {
          latitude: parseFloat(body["coordonnees.latitude"]),
          longitude: parseFloat(body["coordonnees.longitude"]),
        },
      },
      // On ajoutera les affectations juste après
      affectations: [],
      // pfp sera mis à jour en fonction de "file" ou laissé par défaut
    };

    // 2) Si un fichier image a été uploadé, on force dto.pfp = "client-pfps/<filename>"
    if (file) {
      dto.pfp = `client-pfps/${file.filename}`;
    } else {
      dto.pfp = "images/default-pfp-client.jpg";
    }

    // 3) Si le rôle est "responsable depot", on fixe automatiquement l'affectation
    if (user.role === "responsable depot") {
      const entrepriseId = await this.depotHelper.getEntrepriseFromDepot(
        user.depot
      );
      if (!entrepriseId) {
        throw new Error("Entreprise introuvable pour ce dépôt.");
      }
      dto.affectations = [
        { entreprise: entrepriseId.toString(), depot: user.depot.toString() },
      ];
    }

    // 4) On appelle ensuite le service pour créer le client
    return this.clientService.create(dto);
  }

  /* ───────────────────────── UPDATE / DELETE ───────────────────────── */
  @Put(":id")
  @Roles("responsable depot")
  @UseInterceptors(
    FileInterceptor("pfp", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = "public/client-pfps";
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now().toString();
          const fileExt = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExt}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
        } else {
          cb(new Error("Seules les images JPG/PNG sont autorisées."), false);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    })
  )
  async updateClient(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ) {
    // Pour FormData
    let dto: any;
    if (req.is("multipart/form-data")) {
      const body = req.body as Record<string, any>;
      dto = {
        nom_client: body.nom_client,
        email: body.email,
        password: body.password,
        contact: {
          nom_gerant: body["contact.nom_gerant"],
          telephone: body["contact.telephone"],
        },
        localisation: {
          adresse: body["localisation.adresse"],
          ville: body["localisation.ville"],
          code_postal: body["localisation.code_postal"],
          region: body["localisation.region"],
          coordonnees: {
            latitude: parseFloat(body["coordonnees.latitude"]),
            longitude: parseFloat(body["coordonnees.longitude"]),
          },
        },
      };

      // Gestion de la photo de profil
      if (body.removePfp === "true") {
        // Si on veut supprimer la photo
        dto.pfp = "images/default-pfp-client.jpg";
      } else if (file) {
        // Si on veut mettre une nouvelle photo
        dto.pfp = `client-pfps/${file.filename}`;
      }
    } else {
      // Pour JSON classique
      dto = req.body as Partial<CreateClientDto>;
    }
    this.logger.debug(`PUT /clients/${id} – body=${JSON.stringify(dto)}`);
    return this.clientService.update(id, dto);
  }
  /* ───────────── MISE À JOUR PHOTO (client) ───────────── */
  @Put(":id/pfp")
  @Roles("Client")
  @UseInterceptors(
    FileInterceptor("pfp", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = "public/client-pfps";
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now().toString();
          const fileExt = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExt}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
        } else {
          cb(new Error("Seules les images JPG/PNG sont autorisées."), false);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    })
  )
  async updateClientPfp(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ) {
    if (!file) {
      throw new BadRequestException("Aucune image reçue");
    }
    if (req.user?.id !== id) {
      throw new ForbiddenException("Accès refusé");
    }

    const dto = {
      pfp: `client-pfps/${file.filename}`,
    } as Partial<CreateClientDto>;
    const updated = await this.clientService.update(id, dto);
    return { pfp: updated.pfp };
  }
  @Delete(":id")
  @Roles("responsable depot")
  async deleteClient(@Param("id") id: string, @Req() req) {
    const user = req.user; // JwtAuthGuard ajoute user.depot
    this.logger.debug(
      `DELETE /clients/${id} (soft delete from depot=${user.depot})`
    );
    return this.clientService.removeAffectation(id, user.depot);
  }

  @Post(':clientId/assign-prevendeur')
  @Roles('superviseur des ventes')
  async assignPrevendeur(
    @Param('clientId') clientId: string,
    @Body('prevendeurId') prevendeurId: string,
    @Req() req
  ) {
    const user = req.user;
    this.logger.debug(
      `POST /clients/${clientId}/assign-prevendeur – superviseur=${user.id} prevendeur=${prevendeurId}`
    );
    return this.clientService.assignPrevendeur(clientId, prevendeurId, user.depot);
  }

  @Post(':clientId/unassign-prevendeur')
  @Roles('superviseur des ventes')
  async unassignPrevendeur(
    @Param('clientId') clientId: string,
    @Req() req
  ) {
    const user = req.user;
    this.logger.debug(
      `POST /clients/${clientId}/unassign-prevendeur – superviseur=${user.id}`
    );
    return this.clientService.unassignPrevendeur(clientId, user.depot);
  }

  /**
   * Renvoie les infos du client connecté (dont fidelite_points)
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser("id") clientId: string): Promise<Client> {
    return this.clientService.findById(clientId);
  }
}
