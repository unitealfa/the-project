declare class AdresseDTO {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
}
export declare class ContactDTO {
    telephone: string;
    email: string;
    adresse: AdresseDTO;
}
export declare class CreateCompanyDto {
    nom_company: string;
    gerant_company: string;
    contact: ContactDTO;
}
export {};
