/**
 * APPLICATION LAYER - DTOs (Data Transfer Objects)
 * Se usan para transferir datos entre las capas
 */

export class LoginDto {
  constructor(
    public email: string,
    public password: string
  ) {}
}

export class RegisterDto {
  constructor(
    public email: string,
    public password: string,
    public name: string,
    public role: string
  ) {}
}

export class AuthResponseDto {
  constructor(
    public access_token: string,
    public user: {
      id: string;
      email: string;
      name: string;
      role: string;
    }
  ) {}
}
