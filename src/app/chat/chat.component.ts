import { Component, OnInit, ViewChild } from '@angular/core';
import {MatInputModule} from '@angular/material/input';

import { ConnectService } from '../service/connect.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild('chatInput') inputForm; // 


  constructor(private connectService: ConnectService) { 
  }

  ngOnInit(): void {
  }
  public getEnter(){
    let elm = this.inputForm.nativeElement;
    const inputAnswer = elm.value;
    console.log(inputAnswer);
    elm.value = "";
  }

}
