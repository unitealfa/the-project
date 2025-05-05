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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepotSchema = exports.Depot = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Depot = class Depot {
};
exports.Depot = Depot;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Depot.prototype, "nom_depot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Company', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Depot.prototype, "company_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Depot.prototype, "type_depot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Depot.prototype, "capacite", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            rue: String,
            ville: String,
            code_postal: String,
            pays: String,
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Depot.prototype, "adresse", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: { latitude: Number, longitude: Number }, default: null }),
    __metadata("design:type", Object)
], Depot.prototype, "coordonnees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Depot.prototype, "responsable_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], Depot.prototype, "date_creation", void 0);
exports.Depot = Depot = __decorate([
    (0, mongoose_1.Schema)({ timestamps: false })
], Depot);
exports.DepotSchema = mongoose_1.SchemaFactory.createForClass(Depot);
//# sourceMappingURL=depot.schema.js.map