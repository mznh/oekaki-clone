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
      
      //ブラシの諸情報をActionへ入力
      this.actionNow = new Action();
      this.actionNow.setColor(this.brush.color);
      this.actionNow.lineWidth = this.brush.lineWidth;
      this.actionNow.addPoint(mousePoint);
      this.brush.setBefore(mousePoint);
    }
  }

  @HostListener('mousemove', ['$event']) 
	public moveCanvas (target: any) {
    const mousePoint = this.getCanvasPoint(target);
    if(this.brush.isTouch){
      this.actionNow.addPoint(mousePoint);
      const beforePoint = this.brush.before;
      this.tmpCtx.strokeStyle = this.brush.getColor();
      this.tmpCtx.lineWidth = this.brush.lineWidth;
      this.tmpCtx.beginPath();
      this.tmpCtx.moveTo(mousePoint.x,mousePoint.y);
      this.tmpCtx.lineTo(beforePoint.x,beforePoint.y);
      this.tmpCtx.stroke();

      //先端の○
      if(this.brush.lineWidth != 1){
        this.tmpCtx.fillStyle = this.brush.getColor();
        this.tmpCtx.beginPath();
        this.tmpCtx.lineWidth = 1;
        this.tmpCtx.arc(beforePoint.x, beforePoint.y,(this.brush.lineWidth/2.0),0,Math.PI*2,true);
        this.tmpCtx.fill();
        this.tmpCtx.stroke(); 
      }
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
      //入力中の画面を消去
      //TODO actionNowのstrokeがwss経由で到着するのが遅れた場合画面がちらつく
      this.tmpCtx.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
    } 
  }


  ngOnInit(): void {
    this.canvasStream.subscribe(
      //action毎の処理
      action => { return this.execAction(this.canvas,this.ctx,this.tmpCanvas,this.tmpCtx,action);},
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

  //内部でキャンバス再現に使用するツール群
  private execAction(
    mainCanvas: HTMLCanvasElement,
    mainCtx: CanvasRenderingContext2D,
    tmpCanvas: HTMLCanvasElement,
    tmpCtx: CanvasRenderingContext2D,
    action: Action){
    switch(action.actionType){
      case ActionType.WRITE:
        this.execDrawLine(mainCtx,action);
        break;
      case ActionType.CLEAR:
        //メインキャンバス削除
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        break;
      default:
        break;
    }
  }

  private execDrawLine(targetCtx: CanvasRenderingContext2D, action: Action){
    targetCtx.strokeStyle = action.color.getCanvasString();
    targetCtx.lineWidth = action.lineWidth;
    targetCtx.beginPath();
    action.pairLines().map( pair => {
      const pre = pair[0]; 
      const suc = pair[1]; 
      targetCtx.moveTo(pre.x,pre.y);
      targetCtx.lineTo(suc.x,suc.y);
    });
    targetCtx.stroke(); 
    console.log(action.lineWidth)
    if(action.lineWidth != 1){
      action.line.map(p => {
        targetCtx.fillStyle = action.color.getCanvasString();
        targetCtx.beginPath();
        targetCtx.lineWidth = 1;
        targetCtx.arc(p.x,p.y,(action.lineWidth/2.0),0,Math.PI*2,true);
        targetCtx.fill();
        targetCtx.stroke(); 
      });
    }
  }

  
  // 外から叩かれるツール群
  public clearCanvas(){
    console.log("clear");
    let st = new Action();
    st.setActionType(ActionType.CLEAR);
    this.connectService.sendAction(st);
  }
  public changeColor(r:number, g:number, b:number){
    console.log("change color");
    const c = new Color(r,g,b);
    console.log(c);
    this.brush.setColor(c);
  }
  public changeLineWidth(n: number){
    console.log("change lineWidth");
    this.brush.lineWidth = n;
  }

}
