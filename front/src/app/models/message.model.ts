export class Message {

  constructor(
    public id: number,
    public sender: number,
    public receiver: number,
    public timestamp: Date,
    public content: string,
  ) { }

}
