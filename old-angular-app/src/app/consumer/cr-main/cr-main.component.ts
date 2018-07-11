import { Component, OnInit } from '@angular/core'

@Component({
	selector: 'cr-main',
	template: `<div class='cr-app'><router-outlet></router-outlet></div>`,
})
export class CRMainComponent implements OnInit {
  constructor() {}
  ngOnInit() {
  }
}