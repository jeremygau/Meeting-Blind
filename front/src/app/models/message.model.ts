export class Message {

  constructor(
    public sender: number,
    public receiver: number,
    public timestamp: Date,
    public content: string,
    public read: boolean
  ) { }

}
