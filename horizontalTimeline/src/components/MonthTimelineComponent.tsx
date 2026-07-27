import { ObjectItem } from "mendix";
import {  ReactElement, useEffect, useRef, useState} from "react";

export interface MappedEvent{
    item: ObjectItem;
    title: string;
    start: Date;
    end: Date;
    color?: string;
}

export interface HorizontalTimelimeProps{
    events: MappedEvent[];
    monthContext: Date;
    onEventClick?: (item: ObjectItem) => void;
}

//-----Helper functions ----------------

function calcEventsHeight(days: number[], events: MappedEvent[], ): number{
    let height=0;
    for (const d of days){
        height = (events.filter(ev => ev.start.getDate() === d).length)* 30 > height ? 
        (events.filter(ev => ev.start.getDate() === d).length)* 30 : height   
    }
    return height+10;
}

function daysInMonth(date:Date): number{
    const month = date.getMonth();
    const year = date.getFullYear();
    return (new Date(year, month+1, 0)).getDate();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color + '85';
}

const randColor= getRandomColor();

//-------------------------------------


export function MonthTimeline({
    monthContext,
    events,
    onEventClick
}:HorizontalTimelimeProps): ReactElement{
    const [wrapperWidth, setWrapperWidth] = useState(0);
    const daysNum = daysInMonth(monthContext); 
    const currDay= new Date().getDate();
    const currYear = new Date().getFullYear();
    const currMonth= new Date().getMonth();
    const wrapperRef = useRef<HTMLDivElement>(null); 
    const dayArray = Array.from({length: daysNum}, (_, i)=> 1 + i)

    //Helper for view Width
    useEffect(()=> {
        const el = wrapperRef.current;
        if(!el) return;
        const obs = new ResizeObserver(entries =>{
            setWrapperWidth(entries[0].contentRect.width);
        });
        obs.observe(el);
        return() => obs.disconnect();
    }, []);
    const calcDayWidth= wrapperWidth > 0 ? wrapperWidth/daysNum : 0;
    const calcFontSize = Math.min(10, calcDayWidth * 0.3);
    const eventsHeight= calcEventsHeight(dayArray, events.filter(ev => ev.start.getMonth() === monthContext.getMonth() && ev.start.getFullYear() === monthContext.getFullYear()));

    return (
    <div className="mtl-wrapper" ref={wrapperRef} >
        <div className="mtl-header" style={{width: "100%", height: calcDayWidth}}>
            {dayArray.map(d =>(
                <div  
                    key={d}
                    className="mtl-day"
                    style = {{ width:calcDayWidth}}>
                        {currDay === d  && currMonth === monthContext.getMonth() && currYear === monthContext.getFullYear()? (
                           <div
                            className="mtl-curr-day-content" 
                            style={{width: Math.min(35, calcDayWidth), height: Math.min(35, calcDayWidth)}}>
                            {String(d).padStart(2, "0")}/{String(monthContext.getMonth() + 1).padStart(2, "0")}        
                        </div> 
                        ) : (
                            <div
                            className="mtl-day-content" 
                            style={{width: Math.min(35, calcDayWidth), height: Math.min(35, calcDayWidth)}}>
                            {String(d).padStart(2, "0")}/{String(monthContext.getMonth() + 1).padStart(2, "0")}        
                        </div>
                        )}
                        
                        
                </div>
            ))
            }
        </div>
        
        <div className="mtl-body" style= {{width:"100%", height: eventsHeight}}>
            {dayArray.map(d=>{
                return(
                <div  
                    key={d}
                    className={d === currDay && currMonth === monthContext.getMonth() && currYear === monthContext.getFullYear()? "mtl-curr-day-event":"mtl-day-event"}
                    style = {{ height: eventsHeight, width:calcDayWidth}}>
                    <div 
                        className="event-layer" 
                        style={{position: "relative"}}>
                        {/*<div className= "mtl-grid-line" style={{left: d * calcDayWidth}}/>*/}

                        {events.filter(ev=> ev.start.getDate() === d && ev.start.getMonth() === monthContext.getMonth() && ev.start.getFullYear() === monthContext.getFullYear())
                        .map((ev, index)=>{
                            return(
                            <div className="mtl-event" 
                            key = {ev.item.id}
                            style={{top: index * 30, position: "absolute", width: ev.end.getDate() - ev.start.getDate() > 0 ? ((ev.end.getDate() - ev.start.getDate()) * calcDayWidth):(calcDayWidth), background: ev.color ?? randColor}}
                            onClick={() => onEventClick?.(ev.item)}>
                                <span className="mtl-event-title" style={{fontSize: calcFontSize}}>{ev.title}</span>
                            </div>
                            );
                        })}  
                    </div>      
                </div>
                );
            })}
            

        </div>
    </div>
);
}