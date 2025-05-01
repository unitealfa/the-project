import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './schemas/user.schema';
export declare class UserService {
    private readonly userModel;
    private readonly jwt;
    constructor(userModel: Model<UserDocument>, jwt: JwtService);
    findByEmailWithCompany(email: string): Promise<import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    checkPasswordAndSignJwt(doc: UserDocument, plain: string): Promise<string>;
}
