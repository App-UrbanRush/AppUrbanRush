export class User {
    constructor(
      public id: number | null, 
      public email: string,     
      public password?: string,  
      public roles: string[] = [],
    ) {}
  
    isAdmin(): boolean {
      return this.roles.includes('admin');
    }
  }