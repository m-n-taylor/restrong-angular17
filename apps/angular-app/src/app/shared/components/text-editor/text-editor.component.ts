import { Component, Input, EventEmitter, Output, ViewChild, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Util } from "../../util";

declare var Quill;

@Component({
	selector: 'text-editor',
	templateUrl: './text-editor.component.html',

})
export class TextEditorComponent {
	LOG_TAG = 'TextEditorComponent =>';

	nativeElement: any;
	instance: any;

	valueSet = false;

	@Input() placeholder: string;
	@Input() value: string;
	@Output() valueChange = new EventEmitter<any>();

	@ViewChild('toolbar') public toolbar: any;
	@ViewChild('textEditor') public textEditor: any;

	constructor(private changeDetectorRef: ChangeDetectorRef) {
	}

	ngAfterViewInit() {
		this.nativeElement = this.textEditor.nativeElement;

		this.instance = new Quill(this.nativeElement, {
			// scrollingContainer: document.documentElement,
			modules: {
				toolbar: this.toolbar.nativeElement
			},
			placeholder: this.placeholder || 'Enter your text.',
			theme: 'snow'  // or 'bubble'
		});

		this.setHtml(this.value, true);

		this.instance.on('text-change', (delta, oldDelta, source) => {
			this.valueChange.emit({
				html: this.instance.root.innerHTML,
				text: this.instance.getText(),
				isEmpty: this.instance.getText().trim() == ''
			});
		});

		// Util.log(this.LOG_TAG, 'ngAfterViewInit()', this.value, this.instance, this.toolbar);
	}

	setHtml = (html, ignoreScroll: boolean) => {
		if (ignoreScroll) {
			// FIX: Make sure that page doesn't scroll
			this.instance.container.style.position = 'fixed';
			this.instance.container.style.zIndex = '-1';
		}

		this.instance.setContents([]);
		this.instance.pasteHTML(0, html);

		if (ignoreScroll) {
			// FIX: Removes the `fixes` styles
			this.instance.container.style.position = null;
			this.instance.container.style.zIndex = null;
		}
	}
}