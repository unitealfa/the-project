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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const user_service_1 = require("./user.service");
let UserController = class UserController {
    constructor(userSvc, authSvc) {
        this.userSvc = userSvc;
        this.authSvc = authSvc;
    }
    async login({ email, password }) {
        var _a, _b, _c, _d, _e, _f;
        const doc = await this.authSvc.validateUser(email, password);
        const { access_token } = await this.authSvc.login(doc);
        const obj = doc.toObject();
        return {
            token: access_token,
            user: {
                id: obj._id.toString(),
                nom: obj.nom,
                prenom: obj.prenom,
                email: obj.email,
                role: obj.role,
                company: (_b = (_a = obj.company) === null || _a === void 0 ? void 0 : _a._id.toString()) !== null && _b !== void 0 ? _b : null,
                companyName: (_d = (_c = obj.company) === null || _c === void 0 ? void 0 : _c.nom_company) !== null && _d !== void 0 ? _d : null,
                depot: (_f = (_e = obj.depot) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : null,
                num: obj.num,
            },
        };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService])
], UserController);
//# sourceMappingURL=user.controller.js.map