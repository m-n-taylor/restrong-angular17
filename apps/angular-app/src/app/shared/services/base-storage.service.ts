import { Md5 } from 'ts-md5/dist/md5';
import { Base64 } from 'js-base64';

export abstract class BaseStorageService {
    OBJECT_KEY = '';
    OBJECT_KEY_HASH = '';

    constructor(protected platformId: Object, objectKey: string, protected storageType: string) {
        this.OBJECT_KEY = objectKey + '0';
        this.OBJECT_KEY_HASH = objectKey + '1';
    }

    protected getLocally = () => {
        var object = null;

        var objectStringBase64 = window[this.storageType].getItem(this.OBJECT_KEY);
        var objectStringHash = window[this.storageType].getItem(this.OBJECT_KEY_HASH);

        if (typeof objectStringBase64 !== 'undefined' && objectStringBase64 && typeof objectStringHash !== 'undefined' && objectStringHash) {
            try {
                var objectString = Base64.decode(objectStringBase64);
                var objectStringMD5 = <string>Md5.hashStr(objectString);

                if (objectStringHash == objectStringMD5) {
                    object = JSON.parse(objectString);
                }
            }
            catch (e) { }
        }

        return object;
    }

    protected saveLocally = (object: any) => {
        var objectString = JSON.stringify(object);
        var objectStringMD5 = <string>Md5.hashStr(objectString);
        var objectStringBase64 = Base64.encode(objectString);

        window[this.storageType].setItem(this.OBJECT_KEY, objectStringBase64);
        window[this.storageType].setItem(this.OBJECT_KEY_HASH, objectStringMD5);
    }

    protected removeLocally = () => {
        window[this.storageType].removeItem(this.OBJECT_KEY);
        window[this.storageType].removeItem(this.OBJECT_KEY_HASH);
    }
}