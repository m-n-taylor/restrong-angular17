import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({ selector: '[mStopEvent]' })
export class StopEventDirective {

    @HostListener('click', ['$event']) onMouseClick(event: Event) {
        event.stopPropagation();
    }

}