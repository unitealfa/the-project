"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepotService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const depot_schema_1 = require("./schemas/depot.schema");
const user_schema_1 = require("../user/schemas/user.schema");
let DepotService = class DepotService {
    constructor(depotModel, userModel) {
        this.depotModel = depotModel;
        this.userModel = userModel;
    }
    async create(dto, adminId) {
        const admin = await this.userModel.findById(adminId).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        const { responsable } = dto, depotPayload = __rest(dto, ["responsable"]);
        const depot = new this.depotModel(Object.assign(Object.assign({}, depotPayload), { company_id: new mongoose_2.Types.ObjectId(admin.company) }));
        const hashedPwd = await bcrypt.hash(responsable.password, 10);
        const respUser = await this.userModel.create({
            nom: responsable.nom,
            prenom: responsable.prenom,
            email: responsable.email,
            password: hashedPwd,
            num: responsable.num,
            role: 'responsable depot',
            company: new mongoose_2.Types.ObjectId(admin.company),
            depot: depot._id,
        });
        depot.responsable_id = respUser._id;
        await depot.save();
        return this.depotModel
            .findById(depot._id)
            .populate('responsable_id', '-password -__v')
            .lean();
    }
    async findAllForCompany(adminId) {
        const admin = await this.userModel.findById(adminId).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        return this.depotModel
            .find({ company_id: admin.company })
            .populate('responsable_id', '-password -__v')
            .lean();
    }
    async findOne(id, user) {
        if (user.role === 'responsable depot') {
            const depot = await this.depotModel
                .findOne({
                _id: new mongoose_2.Types.ObjectId(id),
                responsable_id: new mongoose_2.Types.ObjectId(user.id),
            })
                .populate('responsable_id', '-password -__v')
                .lean();
            if (!depot) {
                throw new common_1.NotFoundException('Dépôt introuvable ou accès interdit');
            }
            return depot;
        }
        const admin = await this.userModel.findById(user.id).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        const depot = await this.depotModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(id),
            company_id: new mongoose_2.Types.ObjectId(admin.company),
        })
            .populate('responsable_id', '-password -__v')
            .lean();
        if (!depot) {
            throw new common_1.NotFoundException('Dépôt introuvable ou non autorisé');
        }
        return depot;
    }
    async update(id, dto, adminId) {
        const admin = await this.userModel.findById(adminId).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        const existingDepot = await this.depotModel
            .findOne({ _id: id, company_id: admin.company })
            .populate('responsable_id')
            .exec();
        if (!existingDepot)
            throw new common_1.NotFoundException('Dépôt introuvable ou non autorisé');
        if (dto.responsable && existingDepot.responsable_id) {
            const update = {
                nom: dto.responsable.nom,
                prenom: dto.responsable.prenom,
                email: dto.responsable.email,
                num: dto.responsable.num,
            };
            if (dto.responsable.password && dto.responsable.password.length >= 3) {
                update.password = await bcrypt.hash(dto.responsable.password, 10);
            }
            await this.userModel.findByIdAndUpdate(existingDepot.responsable_id._id, update, { new: true, runValidators: true });
        }
        const { responsable } = dto, depotData = __rest(dto, ["responsable"]);
        const updatedDepot = await this.depotModel
            .findByIdAndUpdate(id, {
            $set: Object.assign(Object.assign({}, depotData), { company_id: existingDepot.company_id }),
        }, { new: true, runValidators: true })
            .populate('responsable_id', '-password -__v')
            .lean();
        return updatedDepot;
    }
    async remove(id, adminId) {
        const admin = await this.userModel.findById(adminId).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        const depot = await this.depotModel.findOne({
            _id: id,
            company_id: admin.company,
        });
        if (!depot) {
            throw new common_1.NotFoundException('Dépôt introuvable ou non autorisé');
        }
        if (depot.responsable_id) {
            await this.userModel.deleteOne({ _id: depot.responsable_id });
        }
        await depot.deleteOne();
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