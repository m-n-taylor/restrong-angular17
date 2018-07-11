import { Util } from '../util';

/**
 * API Request Data
 */
export class APIRequestData {

    private static fill = (requestData: APIRequestData, objectData: any, mapObject) => {
        for (var mapKey in mapObject) {
            var mapValue = mapObject[mapKey];

            if (Util.isDefined(objectData[mapValue])) {
                requestData[mapKey] = objectData[mapValue];
            }
        }
    }
}