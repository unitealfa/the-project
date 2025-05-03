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
var TeamController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const team_service_1 = require("./team.service");
const create_member_dto_1 = require("./dto/create-member.dto");
let TeamController = TeamController_1 = class TeamController {
    constructor(svc) {
        this.svc = svc;
        this.logger = new common_1.Logger(TeamController_1.name);
    }
    async getMyTeam(req) {
        const depotId = req.user.depot;
        if (!depotId) {
            throw new common_1.ForbiddenException('Aucun dépôt assigné');
        }
        this.logger.log(`Responsable ${req.user.id} consulte son équipe`);
        return this.svc.listByDepot(depotId, req.user.id);
    }
    async list(depotId, req, role) {
        this.logger.log(`${req.user.role} ${req.user.id} liste ${role !== null && role !== void 0 ? role : 'ALL'} pour dépôt ${depotId}`);
        return this.svc.listByDepot(depotId, req.user.id, role);
    }
    async addMember(depotId, dto, req) {
        try {
            this.logger.log(`${req.user.role} ${req.user.id} - add member to ${depotId}`);
            return await this.svc.addMember(depotId, dto, req.user.id);
        }
        catch (e) {
            this.logger.error('addMember failed', e.stack || e.message);
            throw new common_1.BadRequestException(e.message);
        }
    }
    async remove(memberId, req) {
        this.logger.log(`Admin ${req.user.id} - delete member ${memberId}`);
        await this.svc.removeMember(memberId, req.user.id);
        return { deleted: true };
    }
};
exports.TeamController = TeamController;
__decorate([
    (0, roles_decorator_1.Roles)('responsable depot'),
    (0, common_1.Get)('mine'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeam", null);
__decorate([
    (0, roles_decorator_1.Roles)('Admin', 'responsable depot'),
    (0, common_1.Get)(':depotId'),
    __param(0, (0, common_1.Param)('depotId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "list", null);
__decorate([
    (0, roles_decorator_1.Roles)('Admin', 'responsable depot'),
    (0, common_1.Post)(':depotId/members'),
    __param(0, (0, common_1.Param)('depotId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_member_dto_1.CreateMemberDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "addMember", null);
__decorate([
    (0, roles_decorator_1.Roles)('Admin'),
    (0, common_1.Delete)('members/:memberId'),
    __param(0, (0, common_1.Param)('memberId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "remove", null);
exports.TeamController = TeamController = TeamController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('teams'),
    __metadata("design:paramtypes", [team_service_1.TeamService])
], TeamController);
//# sourceMappingURL=team.controller.js.map