import { EventsService } from '../../shared/services/events.service';
import { Util } from '../util';

export class BaseModal {

    public static readonly EVENT_ADD_ITEM = 'EVENT_ADD_ITEM';
    public static readonly EVENT_MODAL_CLOSE = 'EVENT_MODAL_CLOSE';

    public static STATE_OPENED = 1;
    public static STATE_CLOSED = 2;

    private _isModalOpen: boolean = false;
    public get isModalOpen(): boolean {
        return this._isModalOpen;
    }

    private _isModalOpenAnimate: boolean = false;
    public get isModalOpenAnimate(): boolean {
        return this._isModalOpenAnimate;
    }

    constructor(protected eventsService: EventsService) {
    }

    protected openModal = () => {
        this._isModalOpen = true;

        setTimeout(() => {
            this._isModalOpenAnimate = true;
        }, 50);

        Util.enableBodyScroll(false, { mode: 'hide-scroll' });

        this.eventsService.onModalStateChanged.emit({
            state: BaseModal.STATE_OPENED
        });
    }
    protected closeModal = () => {
        this._isModalOpenAnimate = false;

        setTimeout(() => {
            this._isModalOpen = false;
        }, 50);

        Util.enableBodyScroll(true, { mode: 'hide-scroll' });

        this.eventsService.onModalStateChanged.emit({
            state: BaseModal.STATE_CLOSED
        });
    }

}