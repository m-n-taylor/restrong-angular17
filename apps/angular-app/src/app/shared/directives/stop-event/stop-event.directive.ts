import { Directive, ElementRef, Input, HostListener } from '@angular/core';
import { Util } from "../../util";

@Directive({ selector: '[mStopEvent]' })
export class StopEventDirective {

    @HostListener('click', ['$event']) onMouseClick(event: Event) {
        Util.log('StopEvent');

        event.stopPropagation();
    }
}