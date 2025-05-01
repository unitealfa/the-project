"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepotService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const depot_schema_1 = require("./schemas/depot.schema");
const user_schema_1 = require("../user/schemas/user.schema");
let DepotService = class DepotService {
    constructor(depotModel, userModel) {
        this.depotModel = depotModel;
        this.userModel = userModel;
    }
    async create(createDto, userId) {
        const user = await this.userModel.findById(userId).lean();
        if (!(user === null || user === void 0 ? void 0 : user.company)) {
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        }
        const depot = new this.depotModel(Object.assign(Object.assign({}, createDto), { company_id: new mongoose_2.Types.ObjectId(user.company) }));
        return depot.save();
    }
    async findAllForCompany(userId) {
        const user = await this.userModel.findById(userId).lean();
        if (!(user === null || user === void 0 ? void 0 : user.company)) {
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        }
        const all = await this.depotModel.find().lean();
        const filtered = all.filter(d => d.company_id.toString() === user.company.toString());
        return filtered;
    }
    async findOne(id, userId) {
        const user = await this.userModel.findById(userId).lean();
        if (!(user === null || user === void 0 ? void 0 : user.company)) {
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        }
        const all = await this.depotModel.findOne({ _id: id }).lean();
        if (!all || all.company_id.toString() !== user.company.toString()) {
            throw new common_1.NotFoundException(`Dépôt ${id} introuvable ou non autorisé`);
        }
        return all;
    }
    async update(id, dto, userId) {
        const user = await this.userModel.findById(userId).lean();
        if (!(user === null || user === void 0 ? void 0 : user.company)) {
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        }
        const existing = await this.findOne(id, userId);
        const updated = await this.depotModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
            .lean();
        if (!updated) {
            throw new common_1.NotFoundException(`Dépôt ${id} introuvable`);
        }
        return updated;
    }
    async remove(id, userId) {
        const user = await this.userModel.findById(userId).lean();
        if (!(user === null || user === void 0 ? void 0 : user.company)) {
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        }
        await this.findOne(id, userId);
        await this.depotModel.deleteOne({ _id: id });
    }
};
exports.DepotService = DepotService;
exports.DepotService = DepotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(depot_schema_1.Depot.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DepotService);
//# sourceMappingURL=depot.service.js.map