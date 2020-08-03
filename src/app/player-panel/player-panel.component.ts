import { Component, OnInit, OnChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ConnectService } from '../service/connect.service';
import { Paint, Action , Point, Color, Brush,ActionType } from '../models/action';

@Component({
  selector: 'app-player-panel',
  templateUrl: './player-panel.component.html',
  styleUrls: ['./player-panel.component.css']
})

export class PlayerPanelComponent implements OnInit {
  public player_list: Player[] ;
  public operationStream: Observable<Action>;

  constructor(private connectService: ConnectService) { 
    this.operationStream = connectService.operationStream();
  }
  ngOnInit(): void {
    this.operationStream.subscribe(
      action => {
        console.log(JSON.parse(action.message));
        this.player_list = JSON.parse(action.message);
      }
    );
    let action = new Action();
    action.actionType = ActionType.OPERATION;

    console.log("testtest");
    this.connectService.sendAction(action);
  }
  
  ngOnChanges(): void {
  }

}

export interface Player{
  userId: string,
  userName: string,
  score?: number
}

