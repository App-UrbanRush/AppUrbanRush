export interface PayloadInterface {
    user_id: number;
    user_email: string;
    rolIds: number[]; 
    // Estos campos los usaremos cuando extendamos el perfil del usuario
    firstName?: string;
    firstLastName?: string;
  }