export interface IChatMessage {
    ID?: number;
    Message?: string;
    SenderType?: string;
    ThreadID?: number;
    DateCreated?: string;

    // Custom properties
    image?: string;
}
// update: 2025-08-01T01:03:11.125223
