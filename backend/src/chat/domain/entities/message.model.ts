export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export class MessageModel {
  constructor(
    public message_id: string | null,
    public order_id: string,
    public sender_id: number,
    public sender_role: string,
    public content: string,
    public type: MessageType,
    public read: boolean,
    public created_at: Date | null,
  ) {}
}
