import { Component, OnInit } from '@angular/core';

import { CanvasComponent } from '../canvas/canvas.component';
import { ConnectService } from '../service/connect.service';
import { Paint, Action, Point, Color, Brush } from '../models/action';
import { ChatComponent } from '../chat/chat.component';
import { InfoBannerComponent } from '../info-banner/info-banner.component';
import { PlayerPanelComponent } from '../player-panel/player-panel.component';

@Component({
  selector: 'app-game-screen',
  templateUrl: './game-screen.component.html',
  styleUrls: ['./game-screen.component.css']
})
export class GameScreenComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
