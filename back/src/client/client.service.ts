import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client } from './schemas/client.schema';
import { Model, Types } from 'mongoose';
import { CreateClientDto } from './dto/create-client.dto';
import * as bcrypt from 'bcrypt';
import { Order } from '../order/schemas/order.schema';
import * as mongoose from 'mongoose';
import { Logger } from '@nestjs/common';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(
    @InjectModel('Client') private readonly clientModel: Model<Client>,
    @InjectModel('Order') private readonly orderModel: Model<Order>,
  ) {}

  /* ───────────── CRÉATION ───────────── */
  async create(dto: CreateClientDto): Promise<Client> {
    const existing = await this.clientModel.findOne({ email: dto.email });

    const hashed = await bcrypt.hash(dto.password, 10);
    const affectations =
      dto.affectations?.map((a) => ({
        entreprise: new Types.ObjectId(a.entreprise),
        depot: new Types.ObjectId(a.depot),
      })) ?? [];

    if (existing) {
      const newAffectations = affectations.filter(
        (a) =>
          !existing.affectations.some(
            (e) => e.depot.toString() === a.depot.toString(),
          ),
      );
      if (newAffectations.length > 0) {
        existing.affectations.push(...newAffectations);
        return existing.save();
      }
      return existing;
    }

    const created = new this.clientModel({
      ...dto,
      password: hashed,
      affectations,
    });
    return created.save();
  }

  /* ───────────── LECTURE ───────────── */
  async findAll(): Promise<Client[]> {
    return this.clientModel.find().lean();
  }

  async findByDepot(depotId: string, prevendeurId?: string): Promise<Client[]> {
    const query: any = {
      $or: [
        { 'affectations.depot': depotId },
        { 'affectations.depot': new Types.ObjectId(depotId) },
      ],
    };

    // Si un prévendeur est spécifié, ne retourner que ses clients
    if (prevendeurId) {
      query['affectations.prevendeur_id'] = new Types.ObjectId(prevendeurId);
    }

    return this.clientModel.find(query).lean();
  }

  async findById(id: string): Promise<Client | null> {
    return this.clientModel.findById(id).lean();
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.clientModel.findOne({ email }).lean();
  }

  async getClientStats(id: string) {
    this.logger.debug(`Calcul des stats pour client ${id}`);
    
    try {
      // Vérifier d'abord si le client existe
      const client = await this.clientModel.findById(id);
      this.logger.debug(`Client trouvé:`, client);
      
      if (!client) {
        this.logger.warn(`Client ${id} non trouvé`);
        return {
          totalAmount: 0,
          orderCount: 0,
          lastOrder: null
        };
      }

      // Vérifier toutes les commandes dans la base
      const allOrders = await this.orderModel.find({});
      this.logger.debug(`Nombre total de commandes dans la base:`, allOrders.length);
      this.logger.debug(`Exemple de commande:`, allOrders[0]);

      // Vérifier les commandes du client avec différentes approches
      const ordersById = await this.orderModel.find({ clientId: id });
      this.logger.debug(`Commandes trouvées avec clientId=${id}:`, ordersById.length);

      const ordersByStringId = await this.orderModel.find({ clientId: id.toString() });
      this.logger.debug(`Commandes trouvées avec clientId=${id.toString()}:`, ordersByStringId.length);

      const ordersByObjectId = await this.orderModel.find({ 
        clientId: new mongoose.Types.ObjectId(id) 
      });
      this.logger.debug(`Commandes trouvées avec ObjectId:`, ordersByObjectId.length);

      // Essayer l'agrégation avec différentes approches
      const stats = await this.orderModel.aggregate([
        { 
          $match: { 
            $or: [
              { clientId: id },
              { clientId: id.toString() },
              { clientId: new mongoose.Types.ObjectId(id) }
            ]
          } 
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$total' },
            orderCount: { $sum: 1 },
            lastOrder: { $max: '$createdAt' }
          }
        }
      ]);

      this.logger.debug(`Résultat de l'agrégation:`, stats);

      if (stats.length === 0) {
        return {
          totalAmount: 0,
          orderCount: 0,
          lastOrder: null
        };
      }

      return {
        totalAmount: stats[0].totalAmount || 0,
        orderCount: stats[0].orderCount || 0,
        lastOrder: stats[0].lastOrder || null
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des stats:`, error);
      return {
        totalAmount: 0,
        orderCount: 0,
        lastOrder: null
      };
    }
  }

  /* ───────────── AFFECTATION ───────────── */
  async addAffectation(
    clientId: string,
    entrepriseId: string,
    depotId: string,
  ) {
    const client = await this.clientModel.findById(clientId);
    if (!client) return null;

    const exists = client.affectations.some(
      (a) => a.depot.toString() === depotId,
    );
    if (exists) {
      throw new Error('Ce client est déjà affecté à ce dépôt.');
    }

    client.affectations.push({
      entreprise: new Types.ObjectId(entrepriseId),
      depot: new Types.ObjectId(depotId),
    });

    return client.save();
  }

  async removeAffectation(clientId: string, depotId: string) {
    // 1. Récupérer le client tel quel (en mode « plain object » suffit pour lire les affectations)
    const client = await this.clientModel.findById(clientId).lean().exec();
    if (!client) {
      throw new NotFoundException(`Client ${clientId} introuvable`);
    }

    // 2. Filtrer le tableau d'affectations : on enlève uniquement l'entrée correspondant à depotId
    const nouvellesAffectations = (client.affectations ?? []).filter(
      (aff) => aff.depot.toString() !== depotId.toString(),
    );

    // 3. Si on n'a filtré aucune entrée, l'utilisateur n'était pas affecté à ce dépôt
    if (nouvellesAffectations.length === (client.affectations?.length ?? 0)) {
      return { message: 'Aucune affectation trouvée pour ce dépôt.' };
    }

    // 4. Si, après filtrage, il n'a plus d'affectations → suppression définitive
    if (nouvellesAffectations.length === 0) {
      await this.clientModel.findByIdAndDelete(clientId).exec();
      return {
        message: 'Client supprimé définitivement car plus d\'affectations.',
      };
    }

    // 5. Sinon, mettre à jour uniquement le champ affectations
    await this.clientModel
      .findByIdAndUpdate(clientId, { affectations: nouvellesAffectations })
      .exec();

    // Pour renvoyer éventuellement le client mis à jour, on peut le refetcher :
    const clientMisAJour = await this.clientModel.findById(clientId).lean().exec();
    return {
      message: 'Affectation retirée. Le client reste actif (autres dépôts).',
      client: clientMisAJour,
    };
  }

  async assignPrevendeur(clientId: string, prevendeurId: string, depotId: string) {
    const client = await this.clientModel.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client non trouvé');
    }

    // Vérifier que le client est bien affecté au dépôt
    const affectation = client.affectations.find(
      a => a.depot.toString() === depotId
    );
    if (!affectation) {
      throw new BadRequestException('Ce client n\'est pas affecté à ce dépôt');
    }

    // Mettre à jour l'affectation avec l'ID du prévendeur
    affectation.prevendeur_id = new Types.ObjectId(prevendeurId);
    return client.save();
  }

  async unassignPrevendeur(clientId: string, depotId: string) {
    const client = await this.clientModel.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client non trouvé');
    }

    // Vérifier que le client est bien affecté au dépôt
    const affectation = client.affectations.find(
      a => a.depot.toString() === depotId
    );
    if (!affectation) {
      throw new BadRequestException('Ce client n\'est pas affecté à ce dépôt');
    }

    // Retirer l'ID du prévendeur
    affectation.prevendeur_id = undefined;
    return client.save();
  }

  /* ───────────── MISE À JOUR ───────────── */
  async update(id: string, dto: Partial<CreateClientDto>) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    return this.clientModel.findByIdAndUpdate(id, dto, { new: true }).lean();
  }

  /* ───────────── SUPPRESSION ───────────── */
  async delete(id: string) {
    return this.clientModel.findByIdAndDelete(id).lean();
  }
}
