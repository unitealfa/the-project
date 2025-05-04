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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const company_schema_1 = require("./schemas/company.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const depot_schema_1 = require("../depot/schemas/depot.schema");
const client_schema_1 = require("../client/schemas/client.schema");
let CompanyService = class CompanyService {
    constructor(companyModel, userModel, depotModel, clientModel) {
        this.companyModel = companyModel;
        this.userModel = userModel;
        this.depotModel = depotModel;
        this.clientModel = clientModel;
    }
    async createWithAdmin(companyData, adminData) {
        const exists = await this.companyModel.findOne({ nom_company: companyData.nom_company });
        if (exists) {
            throw new common_1.ConflictException(`L’entreprise '${companyData.nom_company}' existe déjà.`);
        }
        const userExists = await this.userModel.findOne({ email: adminData.email });
        if (userExists) {
            throw new common_1.ConflictException(`L’email '${adminData.email}' est déjà utilisé.`);
        }
        const company = new this.companyModel(companyData);
        await company.save();
        const hashed = await bcrypt.hash(adminData.password, 10);
        const admin = new this.userModel(Object.assign(Object.assign({}, adminData), { password: hashed, role: 'Admin', company: company._id }));
        await admin.save();
        return { company, admin };
    }
    async findOne(id) {
        const company = await this.companyModel.findById(id).lean();
        if (!company)
            throw new common_1.NotFoundException(`Société ${id} introuvable.`);
        return company;
    }
    async findAll() {
        const companies = await this.companyModel.find().lean();
        return Promise.all(companies.map(async (c) => {
            const admin = await this.userModel
                .findOne({ company: c._id, role: 'Admin' })
                .lean()
                .select('nom prenom email');
            return Object.assign(Object.assign({}, c), { admin: admin
                    ? { nom: admin.nom, prenom: admin.prenom, email: admin.email }
                    : null });
        }));
    }
    async update(id, dto) {
        const updated = await this.companyModel
            .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
            .lean();
        if (!updated)
            throw new common_1.NotFoundException(`Société ${id} introuvable pour mise à jour.`);
        return updated;
    }
    async delete(id) {
        const companyObjectId = new mongoose_2.Types.ObjectId(id);
        await this.userModel.deleteMany({ company: companyObjectId });
        await this.clientModel.deleteMany({ company: companyObjectId });
        await this.depotModel.deleteMany({ company_id: companyObjectId });
        const result = await this.companyModel.findByIdAndDelete(companyObjectId).exec();
        if (!result)
            throw new common_1.NotFoundException(`Société ${id} introuvable pour suppression.`);
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(company_schema_1.Company.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(depot_schema_1.Depot.name)),
    __param(3, (0, mongoose_1.InjectModel)(client_schema_1.Client.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CompanyService);
//# sourceMappingURL=company.service.js.map