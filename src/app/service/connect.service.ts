import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { webSocket } from "rxjs/webSocket";
import { environment } from '../../environments/environment';
import { Paint, Stroke , Point, Color, Brush, StrokePacket, StrokeType } from '../models/paints';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  //サーバーからの入力（全体の情報が流れるストリーム）
  public webStream = webSocket("ws://"+location.hostname+":3000");
  
  constructor() {
    console.log("service constructor called");
  }

  // サーバーへ一筆送信  
  public sendStroke(st: Stroke){
    this.webStream.next(st);
  }

  //websocketのストリームをstrokeのそれに変換
  public strokeStream(){
    return this.webStream.pipe(map(v => {
      console.log("get web socket");
      console.log(this.shapeStroke(v));
      return this.shapeStroke(v);
    }));
  }

  //operation用のストリームを生成
  public operateStream(){
    return this.webStream.pipe(
      map(v => {
        return this.shapeStroke(v);
      }),
      filter(v => v.strokeType === StrokeType.OPERATION),
      //for debug 
      map(v =>{
        console.log("recieved operate packet");
        return v
      })
      );
  }

  //ストリームのjsonをstrokeに変換
  private shapeStroke(v:StrokePacket){
    let st = new Stroke();
    console.log(v)
    st.setStrokeType(v.strokeType);
    switch(v.strokeType){
      case StrokeType.WRITE:
        v.line.map(p => { st.addPoint(new Point(p.x,p.y)) });
        break;
      case StrokeType.CLEAR:
        break;
      case StrokeType.OPERATION:
        st.message = v.message;
        break;
      default:
        break;
    }
    return st;
  }
}
