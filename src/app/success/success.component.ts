import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  providers: [ AppService ],
  styleUrls: ['./success.component.css']
})

export class SuccessComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
