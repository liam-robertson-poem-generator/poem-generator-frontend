import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  providers: [ AppService ],
  styleUrls: ['./success.component.css']
})

export class SuccessComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  backToMain() {
    this.router.navigate(["/"])
  }
}
