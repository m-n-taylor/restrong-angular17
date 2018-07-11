import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

// Shared Helpers
import { Util } from '../../shared/util';
import { Constants } from '../../shared/constants';

// Shared Components
import { BreadcrumbService } from '../../libs/breadcrumb/breadcrumb.module';

// Shared Services
import { PathService as Path } from '../../shared/services/path.service';

// RO Services
import { ROService } from '../shared/services/ro.service';
import { Http } from '@angular/http';

@Component({
	selector: 'food-bytes-details',
	templateUrl: './food-bytes-details.component.html'
})
export class FoodBytesDetailsComponent implements OnInit {
	LOG_TAG = 'FoodBytesDetailsComponent';

	foodBytesList: any = [];
	foodBytesItem: any = {};
	id: number;
	pdfPages = [];
	viewerURL: SafeResourceUrl;
	busy = false;
	pdf: any;

	@ViewChild('PDFViewer') PDFViewer: ElementRef;

	constructor(private ROService: ROService, private activatedRoute: ActivatedRoute, private router: Router, public sanitizer: DomSanitizer, public constants: Constants, private breadcrumbService: BreadcrumbService, private http: Http) { }

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

			this.http.get(`${this.constants.SOCKET_SERVER}/pdf-reader?file=${encodeURIComponent(this.foodBytesItem.FileLink)}`).map(res => res.json()).subscribe((response: any) => {
				if (response.status == this.constants.STATUS_SUCCESS) {
					this.pdfPages = response.pages;
				}

				this.busy = false;

				Util.log(this.LOG_TAG, 'pdf-reader => response', response);
			});

			// this.viewerURL = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.constants.PDF_VIEWER}?file=${encodeURIComponent(this.foodBytesItem.FileLink)}`);

			// this.initPDFViewer();

			Util.log(this.LOG_TAG, 'loadData', this.viewerURL, this.PDFViewer);
		});
	}

	initPDFViewer = () => {
		// this.PDFViewer.nativeElement.onload = this.PDFViewerLoaded;

		this.busy = false;

		const pdfjsLib = require('pdfjs-dist');
		const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.min');

		const pdfjsWorkerBlob = new Blob([pdfjsWorker]);
		const pdfjsWorkerBlobURL = URL.createObjectURL(pdfjsWorkerBlob);

		pdfjsLib.PDFJS.workerSrc = pdfjsWorkerBlobURL;

		var url = 'https://apps.datassential.com/snap/api/GetFoodBytes?id=561';

		var loadingTask = pdfjsLib.getDocument(url);
		loadingTask.promise.then((pdf) => {
			console.log('PDF loaded');
			this.pdf = pdf;

			this.renderPage(1);

		}, function (reason) {
			// PDF loading error
			console.error(reason);
		});

		Util.log(this.LOG_TAG, 'ngOnInit()', pdfjsLib, pdfjsWorker);
	}

	renderPage = (page) => {
		// Fetch the first page
		var pageNumber = page;
		this.pdf.getPage(pageNumber).then(function (page) {
			console.log('Page loaded');

			var scale = 1.5;
			var viewport = page.getViewport(scale);

			// Prepare canvas using PDF page dimensions
			var canvas: any = document.getElementById('the-canvas');
			var context = canvas.getContext('2d');
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			// Render PDF page into canvas context
			var renderContext = {
				canvasContext: context,
				viewport: viewport
			};
			var renderTask = page.render(renderContext);
			renderTask.then(function () {
				console.log('Page rendered');
			});
		});
	}

	PDFViewerLoaded = () => {
		this.busy = false;

		Util.log(this.LOG_TAG, 'PDFViewerLoaded');
	}

	goBack = () => {
		this.router.navigate([`/${Path.RO.BASE}/${Path.RO.FOOD_BYTES}`]);
	}

}
