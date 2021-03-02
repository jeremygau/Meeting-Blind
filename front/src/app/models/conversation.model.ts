import { User } from './user.model';
import { Message } from './message.model';

export class Conversation {

  constructor(
    public user1: User,
    public user2: User,
    public messages: Message[],
    public blocked: boolean,
    public hasUnreadMessages: boolean
  ) {}
}
