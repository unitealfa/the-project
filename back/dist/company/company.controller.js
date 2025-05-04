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
var CompanyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const company_service_1 = require("./company.service");
const create_company_dto_1 = require("./dto/create-company.dto");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let CompanyController = CompanyController_1 = class CompanyController {
    constructor(svc) {
        this.svc = svc;
        this.logger = new common_1.Logger(CompanyController_1.name);
    }
    async create(companyData, adminData) {
        try {
            this.logger.log(`Création ${JSON.stringify(companyData)}`);
            return await this.svc.createWithAdmin(companyData, adminData);
        }
        catch (err) {
            this.logger.error('Erreur createWithAdmin', err.stack || err.message);
            if (err.status === 400 || err instanceof common_1.BadRequestException) {
                throw new common_1.BadRequestException(err.message);
            }
            throw err;
        }
    }
    async findAll() {
        this.logger.log('Récupération de toutes les sociétés');
        return this.svc.findAll();
    }
    async findOne(id) {
        this.logger.log(`findOne id=${id}`);
        return this.svc.findOne(id);
    }
    async update(id, dto) {
        this.logger.log(`update id=${id}`);
        return this.svc.update(id, dto);
    }
    async remove(id) {
        this.logger.log(`Suppression totale de la société id=${id}`);
        await this.svc.delete(id);
        return { message: 'Société et données associées supprimées avec succès.' };
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, roles_decorator_1.Roles)('Super Admin'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('companyData')),
    __param(1, (0, common_1.Body)('adminData')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_company_dto_1.CreateCompanyDto,
        create_admin_dto_1.CreateAdminDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('Super Admin'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('Super Admin', 'Admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('Super Admin'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('Super Admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "remove", null);
exports.CompanyController = CompanyController = CompanyController_1 = __decorate([
    (0, common_1.Controller)('companies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [company_service_1.CompanyService])
], CompanyController);
//# sourceMappingURL=company.controller.js.map