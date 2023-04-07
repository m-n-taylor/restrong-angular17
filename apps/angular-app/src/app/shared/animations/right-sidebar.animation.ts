import { trigger, state, style, animate, transition } from '@angular/animations';

export const RightSidebarAnimation = trigger('rightSidebarState', [
    state('in', style({ transform: 'translateX(0)' })),
    transition('void => *', [
        style({ transform: 'translateX(100%)' }),
        animate(150)
    ]),
    transition('* => void', [
        animate(150, style({ transform: 'translateX(100%)' }))
    ])
]);
// update: 2025-08-01T01:03:45.624220
