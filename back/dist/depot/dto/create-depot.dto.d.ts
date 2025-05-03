declare class ResponsableDto {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    num: string;
}
declare class AdresseDto {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
}
declare class CoordonneesDto {
    latitude: number;
    longitude: number;
}
export declare class CreateDepotDto {
    nom_depot: string;
    type_depot: string;
    capacite: number;
    adresse: AdresseDto;
    coordonnees?: CoordonneesDto;
    responsable: ResponsableDto;
}
export {};
