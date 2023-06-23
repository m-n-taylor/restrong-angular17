import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}

// update: 2025-07-31T20:24:10.086241

// update: 2025-08-01T01:07:23.340858
