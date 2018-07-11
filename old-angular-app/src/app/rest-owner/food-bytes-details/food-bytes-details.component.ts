import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../shared/components/breadcrumb/breadcrumb.module';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';

@Component({
  selector: 'food-bytes-details',
  templateUrl: './food-bytes-details.component.html'
})
export class FoodBytesDetailsComponent implements OnInit {
  LOG_TAG = 'FoodBytesDetailsComponent';

  foodBytesList: any = [];

  foodBytesItem: any = {};

  id: number;

  viewerURL: SafeResourceUrl;

  busy = false;

  @ViewChild('PDFViewer') PDFViewer: ElementRef;

  constructor(private ROService: ROService, private activatedRoute: ActivatedRoute, private router: Router, public sanitizer: DomSanitizer, public constants: Constants, private breadcrumbService: BreadcrumbService) { }

  ngOnInit() {
    Util.log(this.LOG_TAG, 'ngOnInit()');

    this.activatedRoute.params.subscribe((params: any) => {
      Util.log(this.LOG_TAG, 'params', params);

      this.id = params.id;
    });

    this.loadData();
  }

  loadData = () => {
    Util.log(this.LOG_TAG, 'loadData()');

    this.busy = true;

    this.ROService.getFoodBytesList(this.id).subscribe(response => {
      var item = response;

      item.Title = item.Title.replace('FoodBytes: ', '');

      this.foodBytesItem = item;

      this.breadcrumbService.addFriendlyNameForRoute(`/${Path.RO.BASE}/${Path.RO.FOOD_BYTES}/${this.id}`, item.Title);

      this.viewerURL = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.constants.PDF_VIEWER}?file=${encodeURIComponent(this.foodBytesItem.FileLink)}`);

      this.initPDFViewer();

      Util.log(this.LOG_TAG, 'loadData', this.viewerURL, this.PDFViewer);
    });
  }

  initPDFViewer = () => {
    this.PDFViewer.nativeElement.onload = this.PDFViewerLoaded;
  }

  PDFViewerLoaded = () => {
    this.busy = false;

    Util.log(this.LOG_TAG, 'PDFViewerLoaded');
  }

  goBack = () => {
    this.router.navigate([`/${Path.RO.BASE}/${Path.RO.FOOD_BYTES}`]);
  }

}
