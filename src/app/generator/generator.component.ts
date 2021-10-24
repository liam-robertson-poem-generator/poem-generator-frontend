import { Component, OnInit } from '@angular/core';
import { GeneratorService } from './generator.service';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

  constructor(private generatorService: GeneratorService) { }

  ngOnInit(): void {
  }

  printtPoemData() {
    this.generatorService.getPoemData().subscribe(
      (poemData) => {
        console.log(poemData);
      });
  }

}
