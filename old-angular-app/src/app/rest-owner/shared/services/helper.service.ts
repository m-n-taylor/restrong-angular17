import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Util } from '../../../shared/util';
import { Constants } from '../../../shared/constants';

import { RestHours, HourDayDetails } from '../../shared/models/rest-hours';

/**
 * Helper Service
 */
@Injectable()
export class HelperService {

    constructor(public constants: Constants) {

    }

    private _getNextDayID = (dayID): number => {
        if (dayID < 7) return dayID + 1;
        else return 1;
    }

    private _updateDayID = (day: RestHours, dayDetail: HourDayDetails) => {
        dayDetail.dayIDFrom = day.DayID;

        if (dayDetail.Opening_Time > dayDetail.Closing_Time) {
            dayDetail.dayIDTo = this._getNextDayID(day.DayID);
        }
        else {
            dayDetail.dayIDTo = day.DayID;
        }
    }

    private _isValidHour = (list: Array<RestHours>, selectedDayDetail: HourDayDetails): boolean => {
        var valid = true;

        var selectedDayDetailOpening = `${selectedDayDetail.dayIDFrom}:${selectedDayDetail.Opening_Time}`;
        var selectedDayDetailClosing = `${selectedDayDetail.dayIDTo}:${selectedDayDetail.Closing_Time}`;

        for (var dayIndex = 0; dayIndex < list.length; dayIndex++) {
            var currDay = list[dayIndex];

            for (var dayDetailIndex = 0; dayDetailIndex < currDay.DayDetails.length; dayDetailIndex++) {
                var dayDetail = currDay.DayDetails[dayDetailIndex];

                if (selectedDayDetail.ID != dayDetail.ID) {

                    var dayDetailOpening = `${dayDetail.dayIDFrom}:${dayDetail.Opening_Time}`;
                    var dayDetailClosing = `${dayDetail.dayIDTo}:${dayDetail.Closing_Time}`;

                    if (selectedDayDetailOpening >= dayDetailOpening && selectedDayDetailOpening <= dayDetailClosing) {
                        selectedDayDetail.openingTimeError = `Value is conflicting with other time ${dayDetail.Opening_Time} - ${dayDetail.Closing_Time}`;
                        selectedDayDetail.editMode = true;

                        valid = false;
                    }

                    if (selectedDayDetailClosing >= dayDetailOpening && selectedDayDetailClosing <= dayDetailClosing) {
                        selectedDayDetail.closingTimeError = `Value is conflicting with other time ${dayDetail.Opening_Time} - ${dayDetail.Closing_Time}`;
                        selectedDayDetail.editMode = true;

                        valid = false;
                    }
                }
            }
        }

        return valid;
    }

    /**
     * Calculate Sort ID for lists
     */
    calculateSortID = (list: Array<any>) => {
        for (var i in list) {
            var item = list[i];
            item.SortID = parseInt(i);
        }
    }

    addHour = (beforeIndex, day: RestHours, editMode?: boolean) => {
        day.DayDetails = day.DayDetails || [];

        day.DayDetails.splice(beforeIndex + 1, 0, {
            ID: 0,
            Enabled: false,
            Opening_Time: this.constants.EMPTY_TIME,
            Closing_Time: this.constants.EMPTY_TIME,
            editMode: editMode || false,
            dayIDFrom: day.DayID,
            dayIDTo: day.DayID
        });
    }

    initEmptyDayHours = (dayList: Array<RestHours>) => {
        for (var index in dayList) {
            var day = dayList[index];
            day.DayDetails = day.DayDetails || [];

            if (day.DayDetails.length == 0) {
                this.addHour(0, day);
            }

            for (var dayDetailsIndex in day.DayDetails) {
                var dayDetail = day.DayDetails[dayDetailsIndex];

                this._updateDayID(day, dayDetail);
            }
        }
    }

    /**
     * Validate Hours
     */
    validateHours = (list: Array<RestHours>): boolean => {
        var valid = true;

        for (var dayIndex in list) {
            var day = list[dayIndex];

            for (var dayIndex in day.DayDetails) {
                var dayDetail = day.DayDetails[dayIndex];

                this._updateDayID(day, dayDetail);
            }
        }

        for (var dayIndex in list) {
            var day = list[dayIndex];

            for (var dayIndex in day.DayDetails) {
                var dayDetail = day.DayDetails[dayIndex];

                dayDetail.openingTimeError = null;
                dayDetail.closingTimeError = null;

                if (dayDetail.Opening_Time == dayDetail.Closing_Time && dayDetail.Opening_Time != this.constants.EMPTY_TIME) {
                    dayDetail.openingTimeError = `Value can't be equal to closing time`;
                    dayDetail.closingTimeError = `Value can't be equal to opening time`;
                    dayDetail.editMode = true;

                    valid = false;
                }

                // if (dayDetail.Opening_Time > dayDetail.Closing_Time) {
                //     // dayDetail.openingTimeError = `Value can't be greater then closing time`;
                //     // dayDetail.editMode = true;
                //     // valid = false;
                // }
                var isValid = this._isValidHour(list, dayDetail);

                if(!isValid) {
                    valid = isValid;
                }
            }
        }

        return valid;
    }

    validateDates = (list): boolean => {
        var valid = true;

        for (var dayIndex in list) {
            var day = list[dayIndex];

            day.dateStartError = null;
            day.dateEndError = null;

            if (day.Date_Start == day.Date_End) {
                day.dateStartError = `Value can't be equal to closing time`;
                day.dateEndError = `Value can't be equal to opening time`;
                day.editMode = true;

                valid = false;
            }

            if (day.Date_Start > day.Date_End) {
                day.dateStartError = `Value can't be greater then closing time`;
                day.editMode = true;

                valid = false;
            }

            for (var i = 0; i < list.length; i++) {
                var item = list[i];

                if (day.ID != item.ID) {

                    if (day.Date_Start >= item.Date_Start && day.Date_Start <= item.Date_End) {
                        day.dateStartError = `Value is conflicting with other time`;
                        day.editMode = true;

                        valid = false;
                    }

                    if (day.Date_End >= item.Date_Start && day.Date_End <= item.Date_End) {
                        day.dateEndError = `Value is conflicting with other time`;
                        day.editMode = true;

                        valid = false;
                    }
                }
            }

            if (!Util.isDefined(day.Date_Start)) {
                day.dateStartError = `Value is required`;
                day.editMode = true;

                valid = false;
            }

            if (!Util.isDefined(day.Date_End)) {
                day.dateEndError = `Value is required`;
                day.editMode = true;

                valid = false;
            }

        }

        return valid;
    }

    getDeliverText = (serviceTypeID, subscriptionID) => {
        var deliverText = '';

        // Pickup
        if (serviceTypeID == this.constants.SERVICE_TYPE_ID_PICKUP) {
            deliverText = 'Pickup by customer at';
        }

        // Delivery OR Catering
        else if (serviceTypeID == this.constants.SERVICE_TYPE_ID_DELIVERY || serviceTypeID == this.constants.SERVICE_TYPE_ID_CATERING) {

            if (subscriptionID == this.constants.RO_SUB_BASIC) {
                deliverText = '(Delivery By Restaurant) Deliver by';
            }

            else if (subscriptionID == this.constants.RO_SUB_PRO) {
                deliverText = 'Pickup by Menus.com at';
            }

        }

        return deliverText;
    }

}