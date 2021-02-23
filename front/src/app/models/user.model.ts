export class User {

  constructor(
    public id: number,
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public city: string,
    public gender: number,
    public description: string,
    public search: number,
    public phone: number,
    public likedUsers: number[],
    public likedBy: number[]
  ) { }

}
