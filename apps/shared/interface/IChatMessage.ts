export interface IChatMessage {
    ID?: number;
    Message?: string;
    SenderType?: string;
    ThreadID?: number;
    DateCreated?: string;

    // Custom properties
    image?: string;
}