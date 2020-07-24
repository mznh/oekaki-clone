export class Color{
  public red: number;
  public green: number;
  public blue: number;
  constructor(red:number, green:number, blue:number){
    this.red = red;
    this.green = green;
    this.blue = blue;
  }
  public getCanvasString(){
    return `rgb(${this.red},${this.green},${this.blue})`;
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


export const enum ActionType{ WRITE, CLEAR, UNDO, REDO, OPERATION, ANNOUNCE }

export interface ActionPacket{
  actionType?: ActionType,
  line?: {x:number, y:number}[],
  lineWidth?: number,
  color?: Color, // ここも後々websocketに合わせて修正
  message?: string
}

export class Action{
  public actionType: ActionType;
  public line: Point[];
  public lineWidth: number;
  public color: Color;
  public message: string;
  constructor(msg? : string){
    this.line = [];
    if(msg){
      this.actionType = ActionType.OPERATION;
      this.message = msg;
    }else{
      this.actionType = ActionType.WRITE;
      this.lineWidth = 1;
    }
  }
  public setActionType(t:ActionType){
    this.actionType = t;
  }
  public addPoint(p:Point){
    this.line.push(p);
  }
  //[0,1,2,3] -> [(0,1),(1,2),(2,3)]
  public pairLines(){
    const pres = this.line.slice(0,-1);
    const sucs = this.line.slice(1);
    return pres.map(function(e,i){
      return [e, sucs[i]];
    });
  }
  public setColor(c:Color){
    this.color = c;
  }
  public setWidth(n: number){
    this.lineWidth = n;
  }
}

//現在は未使用
export class Paint{
  public actions: Action[];
  constructor(){
    this.actions = [];
  }
  public addAction(s:Action){
    this.actions.push(s);
  }
}

export class Brush{
  public start: Point;
  public end: Point;
  public before: Point;
  public isTouch: boolean;
  public color: Color;
  public lineWidth: number;
  constructor(){
    this.color = new Color(0,0,0);
    this.lineWidth = 1;
  }
  public putIn(p:Point){
    this.start = p; 
    this.isTouch = true;
  }
  public putOut(p:Point){
    this.end = p; 
    this.isTouch = false;
  }
  public setBefore(p:Point){
    this.before = p; 
  }
  public setColor(c: Color){
    this.color = c;
  }
  public getColor(){
    return this.color.getCanvasString();
  }
}

