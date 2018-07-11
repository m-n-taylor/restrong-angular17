/**
 * MasterHead
 */
import { Head } from "./head";

export class MasterHead {
    public ItemCount: number;
    public MasterHeading: string;
    public Menus_SourceID: number;
    public Mhid: number;

    // custom
    public heads = new Array<Head>();
    public filteredHeads = new Array<Head>();
}