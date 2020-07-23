import { Component, OnInit, OnChanges, AfterViewInit, DoCheck, ViewChild, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Observable, Subject } from 'rxjs';
import { Paint, Action , Point, Color, Brush,ActionType } from '../models/action';
import { MouseAction} from '../models/mouse';
import { ConnectService } from '../service/connect.service';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit,AfterViewInit,DoCheck {
  @ViewChild('canvasField') myCanvasComp; // 
  @ViewChild('temporaryField') tmpCanvasComp; //
  //メインキャンバス
  public canvas: HTMLCanvasElement = null; // canvasを宣言
  public ctx: CanvasRenderingContext2D = null; // contextを宣言
  //入力途中用キャンバス
  public tmpCanvas: HTMLCanvasElement = null; // canvasを宣言
  public tmpCtx: CanvasRenderingContext2D = null; // contextを宣言

  public canvasStream: Observable<Action>;
  public brush: Brush;
  public paint: Paint;
  public actionNow: Action;
  public CANVAS_SIZE_HEIGHT:number;
  public CANVAS_SIZE_WIDTH:number;
  constructor(private connectService: ConnectService) { 
    this.brush = new Brush();
    this.paint = new Paint();
    this.canvasStream = this.connectService.actionStream();
    this.CANVAS_SIZE_HEIGHT = 400;
    this.CANVAS_SIZE_WIDTH = 600;
  }

  private getCanvasPoint(e :any): Point{
    //main-canvas の場所取得
    const offsetLeft = this.canvas.offsetLeft + this.myCanvasComp.nativeElement.offsetParent.offsetLeft
    const offsetTop = this.canvas.offsetTop + this.myCanvasComp.nativeElement.offsetParent.offsetTop
    return new Point(e.clientX - offsetLeft,e.clientY - offsetTop);
  }

  private checkInCanvas(p: Point){
    return (0 <= p.x) && (p.x <= this.CANVAS_SIZE_WIDTH) && 
           (0 <= p.y) && (p.y <= this.CANVAS_SIZE_HEIGHT)
  }



  // 線を引くのはマウスイベントで表現 
  @HostListener('mousedown', ['$event']) 
	public downCanvas (target: any) {
    console.log("press");

    const elm = this.canvas.offsetParent;
    if(elm != null){
    }
    const mousePoint = this.getCanvasPoint(target);

    // ブラシの状態変化
    if(this.checkInCanvas(mousePoint)){
      this.brush.putIn(mousePoint);
      this.brush.setBefore(mousePoint);
      
      this.actionNow = new Action();
      this.actionNow.addPoint(mousePoint);
    }
  }

  @HostListener('mousemove', ['$event']) 
	public moveCanvas (target: any) {
    const mousePoint = this.getCanvasPoint(target);
    if(this.brush.isTouch){
      this.actionNow.addPoint(mousePoint);
      const beforePoint = this.brush.before;
      this.tmpCtx.beginPath();
      this.tmpCtx.moveTo(mousePoint.x,mousePoint.y);
      this.tmpCtx.lineTo(beforePoint.x,beforePoint.y);
      this.tmpCtx.stroke();
    }
    //前の場所を記録
    this.brush.setBefore(mousePoint);
  }

  @HostListener('mouseup', ['$event']) 
	public upCanvas (target: any) {
    console.log("up");
    const mousePoint = this.getCanvasPoint(target);
    if(this.brush.isTouch && this.checkInCanvas(mousePoint)){
      this.brush.putOut(mousePoint);
      this.actionNow.setActionType(ActionType.WRITE)
      // 一筆をストリームへ流す
      this.connectService.sendAction(this.actionNow);
    } 
  }


  ngOnInit(): void {
    this.canvasStream.subscribe(
      //1 action毎の処理
      action => {
        switch(action.actionType){
          case ActionType.WRITE:
            action.pairLines().map(pair =>{ 
              const pre = pair[0];
              const suc = pair[1];
              //console.log(pre,suc);
              this.ctx.beginPath();
              this.ctx.moveTo(pre.x,pre.y);
              this.ctx.lineTo(suc.x,suc.y);
              this.ctx.stroke(); 
            })
            break;
          case ActionType.CLEAR:
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            break;
          default:
            break;
        }
        //入力中の画面を削除
        this.tmpCtx.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
      },
    error =>{
      console.log(error);
    }
    );
  }

  ngOnChanges(){
    console.log("change!!");
    //this.paintCanvas();
  }

  ngDoCheck(){
    //this.paintCanvas();
  }

  ngAfterViewInit(){
    // canvasの要素を取得
    this.canvas = this.myCanvasComp.nativeElement;
    this.ctx = this.canvas.getContext( '2d' );
    this.tmpCanvas = this.tmpCanvasComp.nativeElement;
    this.tmpCtx = this.tmpCanvas.getContext( '2d' );
  }


  public clearCanvas(){
    console.log("clear");
    let st = new Action();
    st.setActionType(ActionType.CLEAR);
    this.connectService.sendAction(st);
  }

}
