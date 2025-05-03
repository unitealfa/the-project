import { UserService } from "./user.service";
export declare class UserController {
    private readonly userSvc;
    constructor(userSvc: UserService);
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
