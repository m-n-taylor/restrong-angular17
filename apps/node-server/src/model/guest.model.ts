import { BaseUser } from "./base-user.model";

export class Guest extends BaseUser {
    GuestID: string;
    GuestName: string;
    GuestEmail: string;
}