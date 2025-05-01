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
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const depot_schema_1 = require("../depot/schemas/depot.schema");
const user_schema_1 = require("../user/schemas/user.schema");
let TeamService = class TeamService {
    constructor(depotModel, userModel) {
        this.depotModel = depotModel;
        this.userModel = userModel;
    }
    async listByDepot(depotId, adminId, role) {
        await this.guardDepot(depotId, adminId);
        const oid = new mongoose_2.Types.ObjectId(depotId);
        const fetch = (r) => this.userModel
            .find({ depot: oid, role: r })
            .select('-password')
            .lean();
        if (role) {
            const arr = await fetch(role);
            return { [role]: arr };
        }
        const [livraison, prevente, entrepot] = await Promise.all([
            fetch('livraison'),
            fetch('prevente'),
            fetch('entrepot'),
        ]);
        return { livraison, prevente, entrepot };
    }
    async addMember(depotId, dto, adminId) {
        const depot = await this.guardDepot(depotId, adminId);
        if (await this.userModel.exists({ email: dto.email }))
            throw new common_1.ConflictException('Email déjà utilisé');
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = new this.userModel({
            nom: dto.nom,
            prenom: dto.prenom,
            email: dto.email,
            num: dto.num,
            password: hashed,
            role: dto.role,
            fonction: dto.fonction,
            company: depot.company_id,
            depot: new mongoose_2.Types.ObjectId(depotId),
        });
        await user.save();
        const _a = user.toObject(), { password } = _a, safe = __rest(_a, ["password"]);
        return safe;
    }
    async removeMember(memberId, adminId) {
        const member = await this.userModel.findById(memberId).lean();
        if (!member)
            throw new common_1.NotFoundException('Membre introuvable');
        await this.guardDepot(member.depot.toString(), adminId);
        await this.userModel.deleteOne({ _id: memberId });
        return { deleted: true };
    }
    async guardDepot(depotId, adminId) {
        const admin = await this.userModel.findById(adminId).lean();
        if (!(admin === null || admin === void 0 ? void 0 : admin.company))
            throw new common_1.ForbiddenException('Pas de société associée');
        const depot = await this.depotModel.findById(depotId).lean();
        if (!depot || depot.company_id.toString() !== admin.company.toString())
            throw new common_1.ForbiddenException('Accès refusé');
        return depot;
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(depot_schema_1.Depot.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TeamService);
//# sourceMappingURL=team.service.js.map