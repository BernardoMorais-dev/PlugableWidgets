import {  ReactElement, useEffect, useRef, useState } from "react";
import { ObjectItem } from "mendix";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MappedEvent {
    item: ObjectItem;
    title: string;
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

function fmt(date: Date): string {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}


function getWidthPx(endHour: number, start: Date, end: Date, calcHourWidth: number): number {
    let width= end.getDate() > start.getDate() ? 
    (((endHour * 60 - dateToMinutes(start)) / 60) * calcHourWidth)
    :(((dateToMinutes(end) - dateToMinutes(start)) / 60) * calcHourWidth)
    return width;
}

function getEventLayerHeight(hours: number[], events : MappedEvent[]): number{
    let height=0;
    for(const h of hours){
        let newHeight= events.filter(ev => ev.start.getHours() === h).length * 50; 
        height=newHeight>height ? (newHeight):(height)
    }
    return height;
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
            const h = now.getHours() + now.getMinutes() / 60;
            if (h < startHour || h > endHour) {
                setLeft(null);
                return;
            }
            setLeft(((h - startHour) * calcHourWidth));
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

    return (
        <div
            className="htl-tooltip"
            style={{ left: state.x + 12, top: state.y+ 12}}
            role="tooltip"
        >
            <div className="htl-tooltip-title">{ev.title}</div>
            <div className="htl-tooltip-row">
                <span className="htl-tooltip-label">Hours: </span>
                {fmt(ev.start)} – {fmt(ev.end)}
            </div>
            <div className="htl-tooltip-row">
                <span className="htl-tooltip-label">Duration: </span>
                {durationLabel}
            </div>
        </div>
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
    const calcFontSize = Math.min(15, calcHourWidth * 0.3);
    

    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        x: 0,
        y: 0,
        event: null,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Build hour ticks array
    const hourTicks = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);
    const eventsHeight = getEventLayerHeight(hourTicks, events);
    return (
        <div className="htl-wrapper" ref={wrapperRef}>

            {/* ── Sticky header ── */}
            <div className="htl-header" >
                {/* Hour ticks */}
                
                    {hourTicks.map(h => (
                        <div className="htl-header-ticks" style={{width: calcHourWidth}} >    
                            <div
                                key={h}
                                className="htl-hour-tick"
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
                let topMargin = h % 2 ===0 ? 50: 0; 
                return (
                    <div
                        key={h}
                        className="htl-event-layer"
                        style={{ width: calcHourWidth , height: eventsHeight}}
                    >
                        {events
                            .filter(ev =>
                                ev.start.getHours() === h &&
                                ev.start.getDate() === dateContext.getDate() &&
                                ev.start.getMonth() === dateContext.getMonth() &&
                                ev.start.getFullYear() === dateContext.getFullYear()
                            )
                            
                            .map(ev => {
                                const width = getWidthPx(endHour, ev.start, ev.end, calcHourWidth);
                                const currTopMargin = topMargin;
                                
                                topMargin += 50; 

                                return (
                                    <div
                                        className="htl-event"
                                        key={ev.item.id}
                                        style={{
                                            width,
                                            top: currTopMargin,       
                                            background: ev.color ?? randColor,
                                        }}
                                        onClick={() => onEventClick?.(ev.item)}
                                        onMouseEnter={e => setTooltip({ visible: true, x: e.clientX, y: e.clientY, event: ev })}
                                        onMouseMove={e => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                                        onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                                    >
                                        <span className="htl-event-title" style={{ fontSize: calcFontSize }}>{ev.title}</span>
                                        <span className="htl-event-time" style={{ fontSize: calcFontSize }}>{fmt(ev.start)}–{fmt(ev.end)}</span>
                                        <Tooltip state={tooltip} />
                                    </div>
                                );
                            })}
                    </div>
                );
            })}
    
                </div>
        </div>
    );
}
