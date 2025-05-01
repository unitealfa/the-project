declare class ContactDto {
    responsable: string;
    telephone: string;
    email: string;
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
    contact: ContactDto;
    adresse: AdresseDto;
    coordonnees?: CoordonneesDto;
}
export {};
