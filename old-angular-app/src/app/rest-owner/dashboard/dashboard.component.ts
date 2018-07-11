import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'ro-dashboard',
	templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  constructor() {
    
  }

  ngOnInit() {
    console.log('DashboardComponent => Init()');
  }
}
