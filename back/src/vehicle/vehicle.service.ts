import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { User, UserDocument } from '../user/schemas/user.schema'; // Assuming User schema is in this path
import { Depot, DepotDocument } from '../depot/schemas/depot.schema'; // Assuming Depot schema is in this path

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Depot.name) private depotModel: Model<DepotDocument>,
  ) {}

  // Méthode utilitaire pour extraire correctement un ID, qu'il vienne d'un ObjectId ou d'un objet peuplé
  private extractId(obj: any): string | null {
    if (!obj) return null;
    
    if (typeof obj === 'object') {
      // Si c'est un objet peuplé avec un _id
      if (obj._id) return obj._id.toString();
      // Si c'est un ObjectId de Mongoose
      if (obj.toString) return obj.toString();
    }
    
    // En dernier recours, essayer de convertir en chaîne directement
    return String(obj);
  }

  async create(createVehicleDto: CreateVehicleDto, adminUser: UserDocument): Promise<Vehicle> {
    if (adminUser.role !== 'Administrateur des ventes') {
      throw new ForbiddenException('Only Sales Administrators can create vehicles.');
    }

    if (!adminUser.depot) {
      throw new BadRequestException('Sales Administrator must be assigned to a depot.');
    }

    // Vérifier le chauffeur si fourni
    if (createVehicleDto.chauffeur_id) {
      const chauffeur = await this.userModel.findById(createVehicleDto.chauffeur_id);
      if (!chauffeur || chauffeur.role !== 'Chauffeur') {
        throw new BadRequestException('Invalid Chauffeur ID or user is not a Chauffeur.');
      }

      // Vérifier que le chauffeur appartient au même dépôt que l'admin
      const adminDepotId = this.extractId(adminUser.depot);
      const chauffeurDepotId = this.extractId(chauffeur.depot);
      
      if (chauffeurDepotId !== adminDepotId) {
        throw new BadRequestException('Chauffeur must belong to the same depot as the Sales Administrator.');
      }
    }

    // Vérifier le livreur si fourni
    if (createVehicleDto.livreur_id) {
      const livreur = await this.userModel.findById(createVehicleDto.livreur_id);
      if (!livreur || livreur.role !== 'Livreur') {
        throw new BadRequestException('Invalid Livreur ID or user is not a Livreur.');
      }

      // Vérifier que le livreur appartient au même dépôt que l'admin
      const adminDepotId = this.extractId(adminUser.depot);
      const livreurDepotId = this.extractId(livreur.depot);
      
      if (livreurDepotId !== adminDepotId) {
        throw new BadRequestException('Livreur must belong to the same depot as the Sales Administrator.');
      }
    }

    const newVehicle = new this.vehicleModel({
      ...createVehicleDto,
      depot_id: adminUser.depot, // Assign vehicle to the admin's depot
      // working_days automatiquement inclus si présent dans createVehicleDto
    });
    return newVehicle.save();
  }

  async findAll(adminUser: UserDocument): Promise<Vehicle[]> {
    if (adminUser.role === 'Administrateur des ventes' && adminUser.depot) {
      return this.vehicleModel.find({ depot_id: adminUser.depot })
        .populate('chauffeur_id', 'nom prenom email')
        .populate('livreur_id', 'nom prenom email')
        .populate('depot_id', 'nom_depot')
        .exec();
    }
    // Add more role-based access if needed, e.g., Super Admin sees all
    if (adminUser.role === 'Super Admin' || adminUser.role === 'Admin') {
      return this.vehicleModel.find()
        .populate('chauffeur_id', 'nom prenom email')
        .populate('livreur_id', 'nom prenom email')
        .populate('depot_id', 'nom_depot')
        .exec();
    }
    throw new ForbiddenException('Access denied.');
  }

  async findOne(id: string, adminUser: UserDocument): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findById(id)
      .populate('chauffeur_id', 'nom prenom email')
      .populate('livreur_id', 'nom prenom email')
      .populate('depot_id', 'nom_depot')
      .exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found`);
    }

    if (adminUser.role === 'Administrateur des ventes' && adminUser.depot) {
      // Utilisation de la méthode extractId
      const vehicleDepotId = this.extractId(vehicle.depot_id);
      const userDepotId = this.extractId(adminUser.depot);
      
      
      if (vehicleDepotId !== userDepotId) {
        throw new ForbiddenException('Access to this vehicle is restricted.');
      }
    } else if (adminUser.role !== 'Super Admin' && adminUser.role !== 'Admin') {
      throw new ForbiddenException('Access denied.');
    }
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, adminUser: UserDocument): Promise<Vehicle> {
    const existingVehicle = await this.findOne(id, adminUser); // Ensures admin has access and vehicle exists

    if (updateVehicleDto.chauffeur_id) {
      const chauffeur = await this.userModel.findById(updateVehicleDto.chauffeur_id);
      if (!chauffeur || chauffeur.role !== 'Chauffeur') {
        throw new BadRequestException('Invalid Chauffeur ID or user is not a Chauffeur.');
      }
      // Utilisation de la méthode extractId
      const vehicleDepotId = this.extractId(existingVehicle.depot_id);
      const chauffeurDepotId = this.extractId(chauffeur.depot);
      if (chauffeurDepotId !== vehicleDepotId) {
        throw new BadRequestException('New Chauffeur must belong to the same depot as the vehicle.');
      }
    }

    if (updateVehicleDto.livreur_id) {
      const livreur = await this.userModel.findById(updateVehicleDto.livreur_id);
      if (!livreur || livreur.role !== 'Livreur') {
        throw new BadRequestException('Invalid Livreur ID or user is not a Livreur.');
      }
      // Utilisation de la méthode extractId
      const vehicleDepotId = this.extractId(existingVehicle.depot_id);
      const livreurDepotId = this.extractId(livreur.depot);
      if (livreurDepotId !== vehicleDepotId) {
        throw new BadRequestException('New Livreur must belong to the same depot as the vehicle.');
      }
    }

    // working_days accepté ici sans traitement particulier : il sera modifié si envoyé dans updateVehicleDto
    const updatedVehicle = await this.vehicleModel.findByIdAndUpdate(id, updateVehicleDto, { new: true }).exec();
    if (!updatedVehicle) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found during update`);
    }
    return updatedVehicle;
  }

  async remove(id: string, adminUser: UserDocument): Promise<{ deleted: boolean; message?: string }> {
    await this.findOne(id, adminUser); // Ensures admin has access and vehicle exists
    const result = await this.vehicleModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found for deletion`);
    }
    return { deleted: true };
  }
}