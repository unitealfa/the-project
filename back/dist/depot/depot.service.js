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
        const { responsable } = dto, payload = __rest(dto, ["responsable"]);
        const depot = new this.depotModel(Object.assign(Object.assign({}, payload), { company_id: new mongoose_2.Types.ObjectId(admin.company) }));
        const hashed = await bcrypt.hash(responsable.password, 10);
        const respUser = await this.userModel.create({
            nom: responsable.nom,
            prenom: responsable.prenom,
            email: responsable.email,
            num: responsable.num,
            password: hashed,
            role: 'responsable depot',
            company: admin.company,
            depot: depot._id,
        });
        depot.responsable_id = respUser._id;
        await depot.save();
        return this.depotModel
            .findById(depot._id)
            .populate('responsable_id', 'nom prenom email num')
            .lean();
    }
    async findAllForCompany(adminId) {
        const admin = await this.userModel.findById(adminId).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        return this.depotModel
            .find({ company_id: admin.company })
            .populate('responsable_id', 'nom prenom email num')
            .lean();
    }
    async findOne(id, user) {
        const objId = new mongoose_2.Types.ObjectId(id);
        if (user.role === 'responsable depot') {
            if (user.depot !== id) {
                throw new common_1.NotFoundException('Accès interdit ou introuvable');
            }
            const dp = await this.depotModel
                .findById(objId)
                .populate('responsable_id', 'nom prenom email num')
                .lean();
            if (!dp)
                throw new common_1.NotFoundException('Dépôt introuvable');
            return dp;
        }
        const admin = await this.userModel.findById(user.id).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        const dp = await this.depotModel
            .findOne({ _id: objId, company_id: admin.company })
            .populate('responsable_id', 'nom prenom email num')
            .lean();
        if (!dp)
            throw new common_1.NotFoundException('Dépôt introuvable');
        return dp;
    }
    async update(id, dto, adminId) {
        const admin = await this.userModel.findById(adminId).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        const existing = await this.depotModel
            .findOne({ _id: id, company_id: admin.company })
            .lean();
        if (!existing)
            throw new common_1.NotFoundException('Dépôt introuvable');
        let responsableId = existing.responsable_id;
        if (dto.responsable) {
            const { nom, prenom, email, num, password } = dto.responsable;
            if (existing.responsable_id) {
                const u = await this.userModel.findById(existing.responsable_id);
                if (!u)
                    throw new common_1.NotFoundException('Responsable introuvable');
                u.nom = nom;
                u.prenom = prenom;
                u.email = email;
                u.num = num;
                if ((password === null || password === void 0 ? void 0 : password.length) >= 3)
                    u.password = await bcrypt.hash(password, 10);
                await u.save();
                responsableId = u._id;
            }
            else {
                const hashed = await bcrypt.hash(password, 10);
                const newU = await this.userModel.create({
                    nom,
                    prenom,
                    email,
                    num,
                    password: hashed,
                    role: 'responsable depot',
                    company: admin.company,
                    depot: new mongoose_2.Types.ObjectId(id),
                });
                responsableId = newU._id;
            }
        }
        const set = { responsable_id: responsableId };
        if (dto.nom_depot !== undefined)
            set.nom_depot = dto.nom_depot;
        if (dto.type_depot !== undefined)
            set.type_depot = dto.type_depot;
        if (dto.capacite !== undefined)
            set.capacite = dto.capacite;
        if (dto.adresse !== undefined)
            set.adresse = dto.adresse;
        if (dto.coordonnees !== undefined)
            set.coordonnees = dto.coordonnees;
        const updated = await this.depotModel
            .findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true })
            .populate('responsable_id', 'nom prenom email num')
            .lean();
        if (!updated)
            throw new common_1.NotFoundException('Erreur mise à jour');
        return updated;
    }
    async remove(id, adminId) {
        const admin = await this.userModel.findById(adminId).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Aucune entreprise associée');
        const depot = await this.depotModel
            .findOne({ _id: id, company_id: admin.company })
            .lean();
        if (!depot)
            throw new common_1.NotFoundException('Dépôt introuvable');
        if (depot.responsable_id) {
            await this.userModel.deleteOne({ _id: depot.responsable_id });
        }
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