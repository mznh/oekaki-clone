export class Color{
  public red: number;
  public green: number;
  public blue: number;
  constructor(red:number, green:number, blue:number){
    this.red = red;
    this.green = green;
    this.blue = blue;
  }
}

export class Point{
  public x:number;
  public y:number;
  constructor(x:number, y:number){
    this.x = x;
    this.y = y;
  }
}


export interface StrokePacket{
  line?: {x:number, y:number}[]
  color?: Color // ここも後々websocketに合わせて修正
}

export class Stroke{
  public line: Point[];
  public color: Color;
  constructor(){
    this.line = [];
  }
  public addPoint(p:Point){
    this.line.push(p);
  }
  public pairLines(){
    const pres = this.line.slice(1);
    const sucs = this.line.slice(0,-1);
    return pres.map(function(e,i){
      return [e, sucs[i]];
    });
  }
}

export class Paint{
  public strokes: Stroke[];
  constructor(){
    this.strokes = [];
  }
  public addStroke(s:Stroke){
    this.strokes.push(s);
  }
}

export class Brush{
  public start: Point;
  public end: Point;
  public before: Point;
  public isTouch: boolean;
  constructor(){
  }
  public putIn(x:number, y:number){
    this.start = new Point(x,y); 
    this.isTouch = true;
  }
  public putOut(x:number, y:number){
    this.end = new Point(x,y); 
    this.isTouch = false;
  }
  public setBefore(x:number, y:number){
    this.before = new Point(x,y); 
  }
}

