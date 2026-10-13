import {  ReactElement, useRef } from "react";
import { ObjectItem } from "mendix";
import { HorizontalTimelineComponent } from "./HorizontalTimelineComponent";
// ─── Types ────────────────────────────────────────────────────────────────────

export interface MappedEvent {
    item: ObjectItem;
    title: string;
    attrMeetSource:string;
    attrMeetStatus:string;
    attrInternalNote:string;
    attrMeetType:string;
    attrClientName:string;
    attrProductCategory:string;
    attrProduct:string;
    start: Date;
    end: Date;
    color?: string;
}

interface HorizontalTimelineProps {
    events: MappedEvent[];
    dateContext:Date;
    startHour: number;
    endHour: number;
    rowHeight: number;
    showNowLine: boolean;
    onEventClick?: (item: ObjectItem) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WeekTimelineComponent({
    events,
    dateContext,
    startHour,
    endHour,
    rowHeight,
    showNowLine,
    onEventClick,
}: HorizontalTimelineProps): ReactElement {
    

    const wrapperRef = useRef<HTMLDivElement>(null);
    //Buld Day Of Week Array
    const daysOfWeek = Array.from({length: 7},(_,i) => 
        {
            const d = new Date(dateContext);
            d.setDate(d.getDate()+i);
            return d;
        } 
    );
    const dayFormatter = new Intl.DateTimeFormat("cs-CZ", {
        weekday: "short",
        day: "numeric",
        month: "numeric"
    });
    return (
        <div 
            ref={wrapperRef}>
                        
            {/* ── Body ── */}
            <div>
                
                <div
                    style={{display: 'flex', flexDirection:'column'}}>
                    {daysOfWeek.map(dw =>{
                        return(
                            <div
                                key={dw.getTime()}
                                style={{display: 'flex', flexDirection:'row'}}>

                                <div
                                className="week-day-container"
                                style = {{padding: '10px', width: "100px"}}>
                                <span> {dayFormatter.format(dw)}</span>    
                                </div>
                            
                                <div
                                className="week-day-calendar"
                                    style={{flex:1, minWidth: 0, overflow:'hidden'}}>  
                                    <HorizontalTimelineComponent
                                        events={events}
                                        dateContext={dw}
                                        startHour={startHour ?? 8}
                                        endHour={endHour ?? 20}
                                        rowHeight={rowHeight ?? 64}
                                        showNowLine={showNowLine ?? true}
                                        onEventClick={onEventClick}
                                    />
                                </div>  
                            </div>      
                        );
                    })}        
                </div>
            </div>
        </div>
    );
}