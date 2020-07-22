import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { webSocket } from "rxjs/webSocket";
import { environment } from '../../environments/environment';
import { Paint, Stroke , Point, Color, Brush, StrokePacket, StrokeType } from '../models/paints';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  //手前の入力が流れるストリーム
  public paintStream = new Subject<Stroke>();
  //サーバーからの入力（全体の情報が流れるストリーム）
  public webStream = webSocket("ws://"+location.hostname+":3000");
  
  constructor() {
    console.log("service constructor called");
    //手元のユーザーからの入力をそのままwebsocketに流す
    this.paintStream.subscribe(
      x => {
        this.webStream.next(x)
      }
    );
  }

  // サーバーへ一筆送信  
  public sendStroke(st: Stroke){
    this.paintStream.next(st);
  }

  //websocketのストリームをstrokeのそれに変換
  public canvasStream(){
    return this.webStream.pipe(map(v => {
      console.log("get web socket");
      console.log(this.shapeStroke(v));
      return this.shapeStroke(v);
    }));
  }

  private shapeStroke(v:StrokePacket){
    let st = new Stroke();
    console.log(v)
    v.line.map(p => {
      st.addPoint(new Point(p.x,p.y))
    });
    st.setStrokeType(v.strokeType);
    return st;
  }
}
