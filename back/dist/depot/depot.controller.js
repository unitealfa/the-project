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
var DepotController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepotController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const depot_service_1 = require("./depot.service");
const create_depot_dto_1 = require("./dto/create-depot.dto");
let DepotController = DepotController_1 = class DepotController {
    constructor(svc) {
        this.svc = svc;
        this.logger = new common_1.Logger(DepotController_1.name);
    }
    async create(dto, req) {
        this.logger.log(`Admin ${req.user.id} crée un dépôt pour sa société`);
        return this.svc.create(dto, req.user.id);
    }
    async findAllForMe(req) {
        this.logger.log(`Admin ${req.user.id} liste ses dépôts`);
        return this.svc.findAllForCompany(req.user.id);
    }
    async findOne(id, req) {
        this.logger.log(`Admin ${req.user.id} consulte dépôt ${id}`);
        return this.svc.findOne(id, req.user.id);
    }
    async update(id, dto, req) {
        this.logger.log(`Admin ${req.user.id} modifie dépôt ${id}`);
        return this.svc.update(id, dto, req.user.id);
    }
    async remove(id, req) {
        this.logger.log(`Admin ${req.user.id} supprime dépôt ${id}`);
        return this.svc.remove(id, req.user.id);
    }
};
exports.DepotController = DepotController;
__decorate([
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_depot_dto_1.CreateDepotDto, Object]),
    __metadata("design:returntype", Promise)
], DepotController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DepotController.prototype, "findAllForMe", null);
__decorate([
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DepotController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DepotController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DepotController.prototype, "remove", null);
exports.DepotController = DepotController = DepotController_1 = __decorate([
    (0, common_1.Controller)('depots'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [depot_service_1.DepotService])
], DepotController);
//# sourceMappingURL=depot.controller.js.map