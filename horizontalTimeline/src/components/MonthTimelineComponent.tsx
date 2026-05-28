import { ObjectItem } from "mendix";
import {  ReactElement, useEffect, useRef, useState} from "react";

export interface MappedEvent{
    item: ObjectItem;
    collaborator: string;
    title: string;
    start: Date;
    end: Date;
    color?: string;
}

export interface HorizontalTimelimeProps{
    events: MappedEvent[];
    monthContext: Date;
    dayWidth: number;
    headerHeight:number;
}

//-----Helper functions ----------------

function daysInMonth(date:Date): number{
    const month = date.getMonth();
    const year = date.getFullYear();
    return (new Date(year, month+1, 0)).getDate();
}


//-------------------------------------


export function MonthTimeline({
    monthContext,
    dayWidth,
    headerHeight,
    events
}:HorizontalTimelimeProps): ReactElement{
    const [wrapperWidth, setWrapperWidth] = useState(0);
    const daysNum = daysInMonth(monthContext); 
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
    return (
    <div className="mtl-wrapper" ref={wrapperRef} style={{width: "100%"}} >
        <div className="mtl-header" style={{width: "100%", height: headerHeight}}>
            {dayArray.map(d =>(
                <div  
                    key={d}
                    className="mtl-day"
                    style = {{left: d * dayWidth, width:calcDayWidth}}>
                        <div
                            className="mtl-day-content" 
                            style={{height: headerHeight, width: headerHeight}}>
                            {String(d).padStart(2, "0")}/{String(monthContext.getMonth() + 1).padStart(2, "0")}        
                        </div>
                        
                </div>
            ))
            }
        </div>
        <div className="mtl-body" style= {{width:"100%"}}>
            {dayArray.map(d=>(
                <div  
                    key={d}
                    className="mtl-day-event"
                    style = {{left: d * dayWidth, width:calcDayWidth}}>
                        {events.filter(ev=> ev.start.getDate() === d && ev.start.getMonth() === monthContext.getMonth() && ev.start.getFullYear() === monthContext.getFullYear())
                        .map((ev)=>{


                            return(
                            <div className="mtl-event" style={{left: calcDayWidth * d}}>
                                <span className="mtl-event-title">{ev.title}</span> 
                                {/* <span>{ev.start.getDate()}/{ev.start.getMonth()}/{ev.start.getFullYear()} - {ev.end.getDate()}/{ev.end.getMonth()}/{ev.end.getFullYear()} </span>*/}
                            </div>
                            );
                        })}
                        
                </div>
            )
                
            )}
            

        </div>
    </div>
);
}