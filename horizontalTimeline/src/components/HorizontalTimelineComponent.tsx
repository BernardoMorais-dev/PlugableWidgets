import {  ReactElement, useEffect, useRef, useState } from "react";
import { createPortal} from "react-dom";
import { ObjectItem } from "mendix";

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

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    event: MappedEvent | null;
}

// ─── Colour palette (cycles when no color attribute is set) ───────────────────

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color + '85';
}

const randColor= getRandomColor();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
}

function getLeftSpace(hourWidth: number, startHour: Date): number{

    return (hourWidth/60)*startHour.getMinutes();
}

function fmt(date: Date): string {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}


function getWidthPx(endHour: number, start: Date, end: Date, calcHourWidth: number): number {
    console.log(`EndDate ${end.getDate()} StartDate: ${start.getDate()} Hour Width: ${calcHourWidth} MinuteWidth: ${calcHourWidth/60}`);
    let width= end.getDate() > start.getDate() ? 
    (((endHour * 60 - dateToMinutes(start)) / 60) * calcHourWidth)
    :(((dateToMinutes(end) - dateToMinutes(start))/60) * calcHourWidth)
    console.log(`Width: ${width}`);
    return width;
}

function getEventLayerHeightForDay(hours: number[], events : MappedEvent[]): number{
    let height=0; 
    for(const h of hours){
        let newHeight= events.filter(ev => ev.start.getHours() === h).length * 30; 
        height=newHeight>height ? (newHeight):(height);
    }
    return height+ 10;
} 

// ─── Sub-components ───────────────────────────────────────────────────────────

function NowLine({
    startHour,
    endHour,
    calcHourWidth,

}: {
    startHour: number;
    endHour: number;
    calcHourWidth: number;

}): ReactElement | null {
    const [left, setLeft] = useState<number | null>(null);

    useEffect(() => {
    function update(): void {
        const now = new Date();
        const currentHour = now.getHours() + (now.getMinutes() / 60); // hora decimal
        
        if (currentHour < startHour || currentHour > endHour) {
            setLeft(null);
            return;
        }

        const h = (now.getHours() - startHour) * (calcHourWidth-2);
        const m = now.getMinutes() * ((calcHourWidth-2) / 60);
        setLeft(h+m);
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
}, [startHour, endHour, calcHourWidth]);

    if (left === null) return null;

    return (
        <div
            className="htl-now-line"
            style={{ left: left , height: "50vh"}}
            aria-hidden="true"
        >
            <div className="htl-now-dot" />
        </div>
    );
}

function Tooltip({ state }: { state: TooltipState }): ReactElement | null {
    if (!state.visible || !state.event) return null;
    const ev = state.event;
    const duration = Math.round((dateToMinutes(ev.end) - dateToMinutes(ev.start)));
    const durationLabel = duration >= 60
        ? `${Math.floor(duration / 60)}h${duration % 60 ? ` ${duration % 60}min` : ""}`
        : `${duration}min`;

    return createPortal (
        <div
            className="htl-tooltip"
            style={{ left: state.x + 12, top: state.y+ 12}}
            role="tooltip"
        >
            {ev.title === null || ev.title === '' ? (<></>):(<div className="htl-tooltip-title">Title: {ev.title}</div>)}
            {ev.attrMeetType === null || ev.attrMeetType === '' ? (<></>):(<div className="htl-tooltip-title">Type: {ev.attrMeetType}</div>)}
            {ev.attrMeetSource === null || ev.attrMeetSource === '' ? (<></>):(<div className="htl-tooltip-title">Source: {ev.attrMeetSource}</div>)}
            {ev.attrMeetStatus === null || ev.attrMeetStatus === '' ? (<></>):(<div className="htl-tooltip-title">Status: {ev.attrMeetStatus}</div>)}
            <div className="htl-tooltip-row">
                <span className="htl-tooltip-label">Hours: </span>
                {fmt(ev.start)} – {fmt(ev.end)}
            </div>
            <div className="htl-tooltip-row">
                <span className="htl-tooltip-label">Duration: </span>
                {durationLabel}
            </div>

            <div className="htl-tooltip-row">
                {ev.attrClientName === null || ev.attrClientName === '' ? (<></>):(
                    <span className="htl-tooltip-label">Client Name: {ev.attrClientName} </span>
                )}
                    
                {ev.attrInternalNote === null || ev.attrInternalNote=== '' ? (<></>):(
                    <span className="htl-tooltip-label">Note Internal:  {ev.attrInternalNote} </span>
                )}
            </div>
            
            <div className="htl-tooltip-row">
                {ev.attrProductCategory === null || ev.attrProductCategory=== '' ? (<></>):(
                    <span className="htl-tooltip-label">Product Group: {ev.attrProductCategory}</span>
                )}
                
                
                {ev.attrProduct === null || ev.attrProduct=== '' ? (<></>):(
                    <span className="htl-tooltip-label">Product: {ev.attrProduct}</span>
                )}
            </div>
            
        </div>,
        document.body
    );
}
// ─── Main component ───────────────────────────────────────────────────────────

export function HorizontalTimelineComponent({
    events,
    dateContext,
    startHour,
    endHour,
    showNowLine,
    onEventClick,
}: HorizontalTimelineProps): ReactElement {

    const totalHours = endHour - startHour;
     
    //Width Function Helper
    const [wrapperWidth, setWrapperWidth] = useState(0);
    useEffect(()=> {
        const el = wrapperRef.current;
        if(!el) return;
        const obs = new ResizeObserver(entries =>{
            setWrapperWidth(entries[0].contentRect.width);
        });
        obs.observe(el);
        return() => obs.disconnect();
    }, []);

    const calcHourWidth= wrapperWidth > 0 ? wrapperWidth/(endHour-startHour) : 0;
    const calcFontSize = Math.min(10, calcHourWidth * 0.3);
    

    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        x: 0,
        y: 0,
        event: null,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Build hour ticks array
    const hourTicks = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);
    const eventsHeight = getEventLayerHeightForDay(hourTicks, events.filter(ev => ev.start.getDate() === dateContext.getDate() && ev.start.getMonth() === dateContext.getMonth() && ev.start.getFullYear() === dateContext.getFullYear()));
    
    const [currHour, setCurrHour] = useState(new Date().getHours());
    useEffect(() => {
        const updateHour = () => {
            setCurrHour(new Date().getHours());
        };
        updateHour(); // atualiza logo ao montar
        const id = setInterval(updateHour, 60_000);
        return () => clearInterval(id);
    }, []);
    return (
        <div className="htl-wrapper" ref={wrapperRef}>
            <Tooltip state = {tooltip}/>

            {/* ── Sticky header ── */}
            <div className="htl-header" >
                {/* Hour ticks */}
                
                    {hourTicks.map(h => (
                        <div 
                            className="htl-header-ticks" 
                            style={{width: calcHourWidth}} > 
                            <div
                                key={h}
                                className= { h === currHour ? "htl-curr-hour-tick":"htl-hour-tick"}
                                style={{width: Math.min(35, calcHourWidth), height: Math.min(35, calcHourWidth)}}>
                                {String(h).padStart(2, "0")}:00
                            </div>
                        </div>
                    ))}
            </div>

            {/* ── Body ── */}
            <div className="htl-body" >
                {showNowLine && (
                    <NowLine
                        startHour={startHour}
                        endHour={endHour}
                        calcHourWidth={calcHourWidth}
                    />
                )}

                {hourTicks.map(h => {
                return (
                    <div
                        key={h}
                        className={h === currHour ? "htl-curr-event-layer" :"htl-event-layer"}
                        style={{ width: calcHourWidth , height: eventsHeight}}
                    >
                    <div className="event-wrapper" style={{width: "100%", position: "relative"}}>
                        {events
                            .filter(ev =>
                                ev.start.getHours() === h &&
                                ev.start.getDate() === dateContext.getDate() &&
                                ev.start.getMonth() === dateContext.getMonth() &&
                                ev.start.getFullYear() === dateContext.getFullYear()
                            )
                            
                            .map((ev, index) => {
                                const width = getWidthPx(endHour, ev.start, ev.end, (calcHourWidth-6));
                                

                                return (
                                    <div
                                        className="htl-event"
                                        key={ev.item.id}
                                        style={{
                                            width,    
                                            left: getLeftSpace(calcHourWidth, ev.start),   
                                            background: ev.color ?? randColor,
                                            position: "absolute",
                                            top: (index*30)+2
                                        }}
                                        onClick={() => onEventClick?.(ev.item)}
                                        onMouseEnter={e => setTooltip({ visible: true, x: e.clientX, y: e.clientY, event: ev })}
                                        onMouseMove={e => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                                        onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                                    >
                                        {dateToMinutes(ev.end)-dateToMinutes(ev.start) < 60 ? 
                                        
                                        <> </>: ( 
                                        <> 
                                        <span className="htl-event-title" style={{ fontSize: calcFontSize }}>{ev.title}</span>
                                        <span className="htl-event-time" style={{ fontSize: calcFontSize }}>{fmt(ev.start)}–{fmt(ev.end)}</span>

                                        </>)
                                        }
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
