import { BaseSharedData } from '../../../shared/models/base-shared-data';
import { SideMenu } from "./sidemenu";

/**
 * SharedData
 */
export class SharedData extends BaseSharedData {
    public sideMenu: SideMenu;
    public globalSettings: any;
    public pageSizeList: any;

    /**
     * constructor
     */
    constructor() {
        super();

        this.globalSettings = {};
        this.sideMenu = new SideMenu();
        this.pageSizeList = {};
    }
}