/**
 * Head
 */

import { MenuItem } from "../../../shared/models/menu-item";

export class Head {
    public Mhid: number;
    public MasterHeading: string;
    public Hid: number;
    public Heading: string;
    public ItemCount: number;
    public Menus_SourceID: number;

    // custom
    public menuItems = new Array<MenuItem>();
    public element: HTMLElement;
}