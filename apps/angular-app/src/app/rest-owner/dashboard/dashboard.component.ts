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

// update: 2025-07-31T20:25:34.663710
