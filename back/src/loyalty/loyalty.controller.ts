import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { LoyaltyService } from "./loyalty.service";
import { CreateTierDto } from "./dto/create-tier.dto";
import { GetUser } from "../auth/decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

@Controller("loyalty")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get("available")
  getAvailable(@GetUser("id") clientId: string) {
    return this.loyaltyService.availableForClient(clientId);
  }

  @Get(":companyId")
  getProgram(@Param("companyId") companyId: string) {
    return this.loyaltyService.getProgram(companyId);
  }

  @Get(":companyId/client-data")
  getClientData(
    @Param("companyId") companyId: string,
    @GetUser("id") clientId: string
  ) {
    return this.loyaltyService.getClientData(companyId, clientId);
  }

  @Get(":companyId/spend-progress")
  getSpendProgress(
    @Param("companyId") companyId: string,
    @GetUser("id") clientId: string
  ) {
    return this.loyaltyService.getSpendProgress(companyId, clientId);
  }

  @Get(":companyId/repeat-progress/:rewardId")
  getRepeatProgress(
    @Param("companyId") companyId: string,
    @Param("rewardId") rewardId: string,
    @GetUser("id") clientId: string
  ) {
    return this.loyaltyService.getRepeatProgress(companyId, clientId, rewardId);
  }

  @Roles("admin")
  @Patch(":companyId/ratio")
  setRatio(
    @Param("companyId") companyId: string,
    @Body("amount") amount: number,
    @Body("points") points: number
  ) {
    return this.loyaltyService.setRatio(companyId, amount, points);
  }

  @Roles("admin")
  @Post(":companyId/repeat-rewards")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./public/uploads/tiers",
        filename: (_, file, cb) => {
          const ext = file.originalname.split(".").pop();
          cb(null, `repeat-${Date.now()}.${ext}`);
        },
      }),
    })
  )
  async addRepeatReward(
    @Param("companyId") companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("every") every: number,
    @Body("reward") reward: string
  ) {
    const dto: any = { every: Number(every), reward };
    if (file) dto.image = `uploads/tiers/${file.filename}`;
    return this.loyaltyService.addRepeatReward(companyId, dto);
  }

  @Roles("admin")
  @Patch(":companyId/repeat-rewards/:rewardId")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./public/uploads/tiers",
        filename: (_, file, cb) => {
          const ext = file.originalname.split(".").pop();
          cb(null, `repeat-${Date.now()}.${ext}`);
        },
      }),
    })
  )
  async updateRepeatReward(
    @Param("companyId") companyId: string,
    @Param("rewardId") rewardId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("every") every: number,
    @Body("reward") reward: string
  ) {
    const dto: any = {};
    if (every !== undefined) dto.every = Number(every);
    if (reward !== undefined) dto.reward = reward;
    if (file) dto.image = `uploads/tiers/${file.filename}`;
    return this.loyaltyService.updateRepeatReward(companyId, rewardId, dto);
  }

  @Roles("admin")
  @Delete(":companyId/repeat-rewards/:rewardId")
  removeRepeatReward(
    @Param("companyId") companyId: string,
    @Param("rewardId") rewardId: string
  ) {
    return this.loyaltyService.removeRepeatReward(companyId, rewardId);
  }

  @Get(":companyId/repeat-rewards")
  getRepeatRewards(@Param("companyId") companyId: string) {
    return this.loyaltyService.getRepeatRewards(companyId);
  }

  @Roles("admin")
  @Post(":companyId/tiers")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./public/uploads/tiers",
        filename: (_, file, cb) => {
          const ext = file.originalname.split(".").pop();
          cb(null, `tier-${Date.now()}.${ext}`);
        },
      }),
    })
  )
  async addTier(
    @Param("companyId") companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateTierDto
  ) {
    if (file) {
      dto.image = `uploads/tiers/${file.filename}`;
    }
    return this.loyaltyService.addTier(companyId, dto);
  }

  @Roles("admin")
  @Patch(":companyId/tiers/:tierId")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./public/uploads/tiers",
        filename: (_, file, cb) => {
          const ext = file.originalname.split(".").pop();
          cb(null, `tier-${Date.now()}.${ext}`);
        },
      }),
    })
  )
  async updateTier(
    @Param("companyId") companyId: string,
    @Param("tierId") tierId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: Partial<CreateTierDto>
  ) {
    if (file) dto.image = `uploads/tiers/${file.filename}`;
    return this.loyaltyService.updateTier(companyId, tierId, dto);
  }

  @Roles("admin")
  @Post(":companyId/tiers/:tierId/delete")
  removeTier(
    @Param("companyId") companyId: string,
    @Param("tierId") tierId: string
  ) {
    return this.loyaltyService.removeTier(companyId, tierId);
  }

  @Roles("admin")
  @Get(":companyId/pending")
  listPending(@Param("companyId") companyId: string) {
    return this.loyaltyService.listPending(companyId);
  }

  @Roles("admin")
  @Post(":companyId/deliver/:clientId/:points")
  deliver(
    @Param("companyId") companyId: string,
    @Param("clientId") clientId: string,
    @Param("points") points: string
  ) {
    return this.loyaltyService.deliver(
      companyId,
      clientId,
      parseInt(points, 10)
    );
  }

  @Roles("admin")
  @Post(":companyId/deliver-all")
  deliverAll(@Param("companyId") companyId: string) {
    return this.loyaltyService.deliverAll(companyId);
  }
}
