import { Component, OnInit, OnChanges, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ConnectService } from '../service/connect.service';
import { Paint, Action , Point, Color, Brush,ActionType } from '../models/action';

@Component({
  selector: 'app-info-banner',
  templateUrl: './info-banner.component.html',
  styleUrls: ['./info-banner.component.css']
})
export class InfoBannerComponent implements OnInit {
  public announceStream: Observable<Action>;
  public announceText: string

  constructor(private connectService: ConnectService) { 
    this.announceStream = connectService.announceStream();
    this.announceText = "";
  }

  ngOnInit(): void {
    this.announceStream.subscribe(
      act => {
        this.announceText = act.message;
    });
  }

}
