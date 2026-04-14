export class People {
    constructor(
      public id: number | null,
      public firstName: string,
      public firstLastName: string,
      public cellphone: string,
      public address: string,
      public gender: string,
      public userId: number | null,
    ) {}
  }