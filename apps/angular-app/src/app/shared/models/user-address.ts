import { Util } from '../util';

/**
 * UserAddress
 */
export class UserAddress {
    private static LAT_LNG_SEPRATOR = ',';

    public Address: string;
    public Address2: string;
    public City: string;
    public ID: number;
    public Is_Default: boolean;
    public LatLng: string;
    public State: string;
    public Zip: string;
    public Country: string;

    public static isValid = (userAddress: UserAddress) => {
        return (Util.isDefined(userAddress.Address) && Util.isDefined(userAddress.City) && Util.isDefined(userAddress.Country) && Util.isDefined(userAddress.LatLng) && Util.isDefined(userAddress.State) && Util.isDefined(userAddress.Zip));
    }

    public static initFromGooglePlace = (place: any) => {
        var userAddress = new UserAddress();

        userAddress.Address = place.formatted_address;
        userAddress.LatLng = place.geometry.location.lat() + ',' + place.geometry.location.lng();

        for (var i in place.address_components) {
            var address_component = place.address_components[i];

            var type = address_component.types[0];

            // if (type == 'street_number') {
            //     addr.Address = a.short_name;
            // }
            // else if (type == 'route') {
            //     addr.Address = addr.Address || '';
            //     addr.Address += (addr.Address.length ? ' ' : '') + a.short_name;
            // }
            // else if (type == 'neighborhood') {
            //     addr.Address = addr.Address || '';
            //     addr.Address += (addr.Address.length ? ', ' : '') + a.short_name;
            // }
            //else 

            if (type == 'postal_code') {
                userAddress.Zip = address_component.short_name;
            }
            else if (type == "locality") {
                userAddress.City = address_component.short_name;
            }
            else if (type == "administrative_area_level_1") {
                userAddress.State = address_component.short_name;
            }
            else if (type == "country") {
                userAddress.Country = address_component.short_name;
            }
        }

        return userAddress;
    }

    public static setLatLng(userAddress: UserAddress, lat: number, lng: number) {
        userAddress.LatLng = lat + UserAddress.LAT_LNG_SEPRATOR + lng;
    }

    public static getLatLng(userAddress: UserAddress) {
        var latLng = userAddress.LatLng.split(UserAddress.LAT_LNG_SEPRATOR);

        return {
            lat: Util.isDefined(latLng[0]) ? parseFloat(latLng[0]) : null,
            lng: Util.isDefined(latLng[1]) ? parseFloat(latLng[1]) : null
        }
    }

    public static getStringCoordinate = (LatLng) => {
        var latLng = LatLng.split(UserAddress.LAT_LNG_SEPRATOR);

        return `${latLng[1]},${latLng[0]}`;
    }

    public static getDefaultOrFirst(userAddresses: Array<UserAddress>): UserAddress {
        var userAddress: UserAddress;

        for (var i in userAddresses) {
            var address = userAddresses[i];

            if (address.Is_Default) {
                userAddress = address;
                break;
            }
        }

        if (!userAddress && typeof userAddresses !== 'undefined' && userAddresses && userAddresses.length > 0) {
            userAddress = userAddresses[0];
        }

        return userAddress;
    }

    public static isDifferent = (userAddress1: UserAddress, userAddress2: UserAddress): boolean => {
        var isDifferent = true;

        if (userAddress1.LatLng == userAddress2.LatLng) {
            isDifferent = false;
        }

        return isDifferent;
    }
}