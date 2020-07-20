import { Component, OnInit, OnChanges, AfterViewInit, DoCheck, ViewChild, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Paint, Stroke , Point, Color, Brush,StrokeType } from '../models/paints';
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
  public canvas: HTMLCanvasElement = null; // canvasを宣言
  public ctx: CanvasRenderingContext2D = null; // contextを宣言
  //入力途中用のcanvas
  public tmpCanvas: HTMLCanvasElement = null; // canvasを宣言
  public tmpCtx: CanvasRenderingContext2D = null; // contextを宣言

  public paintStream: Subject<Stroke>;
  public canvasStream: Observable<Stroke>;
  public brush: Brush;
  public paint: Paint;
  public strokeNow: Stroke;
  public CANVAS_SIZE_HEIGHT:number;
  public CANVAS_SIZE_WIDTH:number;
  constructor(private connectService: ConnectService) { 
    this.brush = new Brush();
    this.paint = new Paint();
    this.paintStream = this.connectService.paintStream;
    this.canvasStream = this.connectService.canvasStream();
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
      
      this.strokeNow = new Stroke();
      this.strokeNow.addPoint(mousePoint);
    }
  }

  @HostListener('mousemove', ['$event']) 
	public moveCanvas (target: any) {
    const mousePoint = this.getCanvasPoint(target);
    if(this.brush.isTouch){
      this.strokeNow.addPoint(mousePoint);
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
      this.strokeNow.setStrokeType(StrokeType.WRITE)
      // 一筆をストリームへ流す
      this.paintStream.next(this.strokeNow);
    } 
  }


  ngOnInit(): void {
    this.canvasStream.subscribe(
      //1 stroke毎の処理
      stroke => {
        switch(stroke.strokeType){
          case StrokeType.WRITE:
            stroke.pairLines().map(pair =>{ 
              const pre = pair[0];
              const suc = pair[1];
              //console.log(pre,suc);
              this.ctx.beginPath();
              this.ctx.moveTo(pre.x,pre.y);
              this.ctx.lineTo(suc.x,suc.y);
              this.ctx.stroke(); 
            })
            break;
          case StrokeType.CLEAR:
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            break;
          default:
            break;
        }
        //入力中の画面を削除
        this.tmpCtx.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
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

  //public paintCanvas(){
  //  this.paint.strokes.map(st =>{
  //    st.pairLines().map(pair =>{ 
  //      console.log("this1");
  //      const pre = pair[0];
  //      const suc = pair[1];
  //      console.log(pre,suc);
  //      this.ctx.beginPath();
  //      this.ctx.moveTo(pre.x,pre.y);
  //      this.ctx.lineTo(suc.x,suc.y);
  //      this.ctx.stroke();
  //    });
  //  }
  //  );
	//}

  public clearCanvas(){
    console.log("clear");
    let st = new Stroke();
    st.setStrokeType(StrokeType.CLEAR);
    this.paintStream.next(st);

  }

}
