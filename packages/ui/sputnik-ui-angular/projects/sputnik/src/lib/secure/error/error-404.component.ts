import { OnInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-not-found',
  template: `
    <h2>
      404 - Page not found
    </h2>
		<p>Return to <a routerLink="/">home</a></p>
  `
})
export class Error404Component implements OnInit {
  path: string;

  constructor() {}

  ngOnInit() {

  }
}
