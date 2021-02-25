export class User {

  constructor(
    public id: number,
    public email: string,
    public password: string,
    public firstName: string,
    public city: string,
    public gender: string,
    public description: string,
    public desiredGender: string,
    public likedUsers: number[],
    public likedBy: number[]
  ) { }

}
