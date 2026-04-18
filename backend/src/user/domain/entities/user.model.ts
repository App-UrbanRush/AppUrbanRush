export class User {
    constructor(
      public user_id: number | null, 
      public user_email: string,     
      public user_password?: string,  
      public roles: number[] = [],
    ) {}
  
}
