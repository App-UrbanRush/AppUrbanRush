export class People {
    constructor(
      public id: number | null,
      public firstName: string,
      public firstLastName: string,
      public cellphone: string,
      public address: string,
      public gender: string,
      public userId: number | null,
      public avatarUrl: string | null = null,
      public latitude: number | null = null,
      public longitude: number | null = null,
    ) {}
  }