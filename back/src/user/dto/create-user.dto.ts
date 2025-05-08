export class CreateUserDto {
  nom     : string;
  prenom  : string;
  email   : string;
  password: string;
  role    : string;   // Admin ou responsable depot ou job title
  poste?  : string;   // facultatif en création générique
}
