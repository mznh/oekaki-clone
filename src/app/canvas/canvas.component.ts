import { Component, OnInit, OnChanges, AfterViewInit, DoCheck, ViewChild, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Paint, Stroke , Point, Color, Brush } from '../models/paints';
import { MouseAction} from '../models/mouse';
import { ConnectService } from '../service/connect.service';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit,AfterViewInit,DoCheck {
  @ViewChild('canvasField') myCanvas; // myCanvasを宣言
  public canvas: HTMLCanvasElement = null; // canvasを宣言
  public ctx: CanvasRenderingContext2D = null; // contextを宣言
  public paintStream: Subject<Stroke>;
  public canvasStream: Observable<Stroke>;
  public brush: Brush;
  public paint: Paint;
  public strokeNow: Stroke;
  constructor(private connectService: ConnectService) { 
    this.brush = new Brush();
    this.paint = new Paint();
    this.paintStream = this.connectService.paintStream;
    this.canvasStream = this.connectService.canvasStream();
  }

  @HostListener('mousedown', ['$event']) 
	public downCanvas (target: any) {
    console.log("press");
    console.log(target.offsetX,target.offsetY);
    // ブラシの状態変化
    this.brush.putIn(target.offsetX,target.offsetY);
    this.brush.setBefore(target.offsetX,target.offsetY);
    
    this.strokeNow = new Stroke();
    this.strokeNow.addPoint(new Point(target.offsetX,target.offsetY));
  }

  @HostListener('mousemove', ['$event']) 
	public moveCanvas (target: any) {
    if(this.brush.isTouch){
      this.strokeNow.addPoint(new Point(target.offsetX,target.offsetY));
    }
    this.brush.setBefore(target.offsetX,target.offsetY);
  }

  @HostListener('mouseup', ['$event']) 
	public upCanvas (target: any) {
    console.log("up");
    console.log(target.offsetX,target.offsetY);
    this.brush.putOut(target.offsetX,target.offsetY);
    this.paint.addStroke(this.strokeNow);
    // 一筆をストリームへ流す
    this.paintStream.next(this.strokeNow);
  }


  ngOnInit(): void {
    this.canvasStream.subscribe(
      stroke => {
        stroke.pairLines().map(pair =>{ 
          const pre = pair[0];
          const suc = pair[1];
          //console.log(pre,suc);
          this.ctx.beginPath();
          this.ctx.moveTo(pre.x,pre.y);
          this.ctx.lineTo(suc.x,suc.y);
          this.ctx.stroke();
        })
      }
    );
  }

  ngOnChanges(){
    console.log("change!!");
    this.paintCanvas();
  }

  ngDoCheck(){
    //this.paintCanvas();
  }

  ngAfterViewInit(){
    this.canvas = this.myCanvas.nativeElement;
    this.ctx = this.canvas.getContext( '2d' );
  }

	public paintCanvas(){
    this.paint.strokes.map( st => {
      st.pairLines().map(pair =>{ 
        console.log("this1");
        const pre = pair[0];
        const suc = pair[1];
        console.log(pre,suc);
        this.ctx.beginPath();
        this.ctx.moveTo(pre.x,pre.y);
        this.ctx.lineTo(suc.x,suc.y);
        this.ctx.stroke();
      });
    }
    );
    
	}

}
