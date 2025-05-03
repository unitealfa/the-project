import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
export declare class UserController {
    private readonly userSvc;
    private readonly authSvc;
    constructor(userSvc: UserService, authSvc: AuthService);
    login({ email, password }: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: any;
            nom: any;
            prenom: any;
            email: any;
            role: any;
            fonction: any;
            company: any;
            companyName: any;
            num: any;
            depot: any;
        };
    }>;
}
