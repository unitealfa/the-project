import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ad, AdDocument } from './schemas/ad.schema';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Injectable()
export class AdService {
  constructor(@InjectModel(Ad.name) private adModel: Model<AdDocument>) {}

  async create(dto: CreateAdDto & { filePath: string }): Promise<Ad> {
    const created = new this.adModel({
      company: dto.company,
      type: dto.type,
      duration: dto.duration,
      filePath: dto.filePath,
      expiresAt: new Date(dto.expiresAt), // Inject expiresAt here
    });
    return created.save();
  }

  async findAll(): Promise<Ad[]> {
    return this.adModel.find().populate('company').exec();
  }

  async findByCompany(companyId: string): Promise<Ad[]> {
    return this.adModel.find({ company: companyId }).exec();
  }

  async findOne(id: string): Promise<Ad> {
    const ad = await this.adModel.findById(id).populate('company').exec();
    if (!ad) throw new NotFoundException('Publicité introuvable');
    return ad;
  }

  async update(
    id: string,
    dto: UpdateAdDto & { filePath?: string },
  ): Promise<Ad> {
    const update: Partial<Record<keyof UpdateAdDto | 'filePath', any>> = {};
    if (dto.company) update.company = dto.company;
    if (dto.type) update.type = dto.type;
    if (dto.duration !== undefined) update.duration = dto.duration;
    if (dto.filePath) update.filePath = dto.filePath;
    if (dto.expiresAt) update.expiresAt = new Date(dto.expiresAt); // Inject expiresAt here

    const updated = await this.adModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Publicité introuvable');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.adModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Publicité introuvable');
  }
}