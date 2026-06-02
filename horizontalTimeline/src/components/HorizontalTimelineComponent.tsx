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
/*
interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    event: MappedEvent | null;
}
*/
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
/*
function getLeftPx(date: Date, startHour: number, calcHourWidth: number): number {
    return ((dateToMinutes(date) - startHour * 60) / 60) * calcHourWidth;
}

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
*/

function getWidthPx(start: Date, end: Date, calcHourWidth: number): number {
    return ((dateToMinutes(end) - dateToMinutes(start)) / 60) * calcHourWidth;
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

/*function EventBlock({
    event,
    left,
    width,
    top,
    bottom,
    fontSize,
    paletteEntry,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
}: {
    event: MappedEvent;
    left: number;
    width: number;
    top: number;
    fontSize: number;
    bottom: number;
    paletteEntry: string;
    onClick?: () => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onMouseMove?: (e: React.MouseEvent) => void;
}): ReactElement {
    const bg = event.color ? hexToRgba(event.color, 0.15) : paletteEntry;
    const border = event.color ?? paletteEntry;
    const textColor = event.color ?? paletteEntry;

    const tooNarrow = width < 56;

    return (
        <div
            className={`htl-event${onClick ? " htl-event--clickable" : ""}`}
            style={{
                left,
                width: Math.max(width - 4, 8),
                top,
                bottom,
                background: bg,
                borderLeftColor: border,
                color: textColor,
            }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
            aria-label={`${event.title} ${fmt(event.start)}–${fmt(event.end)}`}
        >
            {!tooNarrow && (
                <>
                    <span className="htl-event-title" style={{fontSize: fontSize}}>{event.title} </span>
                    <span className="htl-event-time" style={{fontSize: fontSize}}>{fmt(event.start)}–{fmt(event.end)}</span>
                </>
            )}
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
            {/*<div className="htl-tooltip-row">
                <span className="htl-tooltip-label">Colaborador</span>
                {ev.collaborator}
            </div>
        </div>
    );
}
*/
// ─── Main component ───────────────────────────────────────────────────────────

export function HorizontalTimelineComponent({
    events,
    dateContext,
    startHour,
    endHour,
    showNowLine,
    //onEventClick,
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
    const calcFontSize = Math.max(8, calcHourWidth * 0.3);


    /*const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        x: 0,
        y: 0,
        event: null,
    });*/

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Build hour ticks array
    const hourTicks = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

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
                            >
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
                {/* Events layer */}
                    {hourTicks.map(h => (
                        <div 
                            key = {h}
                            className="htl-event-layer"
                            style={{width: calcHourWidth}}>
                            {events.filter(ev => ev.start.getHours() === h && 
                            ev.start.getDate() === dateContext.getDate() && 
                            ev.start.getMonth() === dateContext.getMonth() && 
                            ev.start.getFullYear() === dateContext.getFullYear())
                                .map((ev)=> {
                                    const width = getWidthPx(ev.start, ev.end, calcHourWidth);
                        
                        return (
                            <div className ="htl-event"style={{width: width, background: randColor}}>
                                <span className=".htl-event-title" style={{fontSize: calcFontSize}}>
                                    {ev.title}
                                </span>
                                <br/>
                                <span className=".htl-event-time" style={{fontSize: calcFontSize}}>
                                    {fmt(ev.start)}–{fmt(ev.end)}
                                </span>
                            </div>
                            /*<EventBlock
                            key={`ev.item.id`}
                            event={ev}
                            left={left}
                            width={width}
                            top={6}
                            fontSize={calcFontSize}
                            bottom={6}
                            paletteEntry={randColor}
                            onClick={onEventClick ? () => onEventClick(ev.item) : undefined}
                            onMouseEnter={(e) =>
                                setTooltip({ visible: true, x: e.clientX, y: e.clientY, event: ev })
                            }
                            onMouseMove={(e) =>
                                setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))
                            }
                            onMouseLeave={() =>
                                setTooltip(prev => ({ ...prev, visible: false }))
                            }
                            />*/
                            );
                            })}
                        </div>
                    ))}
                </div>

            {/* Tooltip — rendered outside scroll so it doesn't clip */}
            {/*<Tooltip state={tooltip} />*/}
        </div>
    );
}
