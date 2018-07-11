import { IHttpResponse } from './interfaces/http-response';
import { ITestItem } from './interfaces/test-item';

export class Helper {
    MSG_VALID_JSON = 'MSG_VALID_JSON';
    MSG_ATTR = 'MSG_ATTR_FOUND';
    MSG_PAGE_SIZE = 'MSG_CORRECT_PAGE_SIZE';
    MSG_ATTR_CORRECT_VALUE = 'MSG_ATTR_CORRECT_VALUE';

    STATUS_STOPPED = 'STATUS_STOPPED';
    STATUS_RUNNING = 'STATUS_RUNNING';
    STATUS_COMPLETED = 'STATUS_COMPLETED';

    public makeMessage = (type: string, data?: any): string => {
        var message = '';

        if (type == this.MSG_VALID_JSON) {
            message = 'API should return valid JSON response.';
        }
        else if (type == this.MSG_ATTR) {
            message = `${data.attrs.join(',')} attributes must be present in JSON response`;
        }
        else if (type == this.MSG_PAGE_SIZE) {
            message = `Page size should return correct no. of items.`;
        }
        else if (type == this.MSG_ATTR_CORRECT_VALUE) {
            message = `${data.attrs.join(',')} must have correct value in JSON response.`;
        }

        return message;
    }

    public isValidResponse = (response: IHttpResponse) => {
        var valid = true;

        if (response.status != 200) {
            valid = false;
        }

        if (!response.ok) {
            valid = false;
        }

        if (response.statusText != "OK") {
            valid = false;
        }

        try {
            var r = response.json();
        }
        catch (e) {
            valid = false;
        }

        return valid;
    }
}