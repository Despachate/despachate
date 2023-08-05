import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-aviso-privacidad',
  templateUrl: './aviso-privacidad.component.html',
  styleUrls: ['./aviso-privacidad.component.css']
})
export class AvisoPrivacidadComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit(): void {
  }
  back(){
    this.location.back();
  }
}
