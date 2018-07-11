import { BaseUser } from "./base-user.model";
import { UserRestaurantData } from "./user-restaurant-data.model";

export class User extends BaseUser {
    UserRestaurantData: UserRestaurantData;
}