import {  ReactElement, useEffect, useRef, useState } from "react";
import { ObjectItem } from "mendix";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MappedEvent {
    item: ObjectItem;
    collaborator: string;
    title: string;
    start: Date;
    end: Date;
    color?: string;
}

interface HorizontalTimelineProps {
    events: MappedEvent[];
    startHour: number;
    endHour: number;
    hourWidth: number;
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

const PALETTE = [
    { bg: "#dbeafe", border: "#3b82f6", text: "#1e3a5f" },
    { bg: "#dcfce7", border: "#22c55e", text: "#14532d" },
    { bg: "#fce7f3", border: "#ec4899", text: "#831843" },
    { bg: "#fef3c7", border: "#f59e0b", text: "#78350f" },
    { bg: "#ede9fe", border: "#8b5cf6", text: "#4c1d95" },
    { bg: "#ccfbf1", border: "#14b8a6", text: "#134e4a" },
    { bg: "#fee2e2", border: "#ef4444", text: "#7f1d1d" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
}

function fmt(date: Date): string {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getLeftPx(date: Date, startHour: number, hourWidth: number): number {
    return ((dateToMinutes(date) - startHour * 60) / 60) * hourWidth;
}

function getWidthPx(start: Date, end: Date, hourWidth: number): number {
    return ((dateToMinutes(end) - dateToMinutes(start)) / 60) * hourWidth;
}
/*
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}*/
function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function colorForIndex(idx: number): { bg: string; border: string; text: string } {
    return PALETTE[idx % PALETTE.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NowLine({
    startHour,
    endHour,
    hourWidth,
    labelWidth,
    //totalHeight,
}: {
    startHour: number;
    endHour: number;
    hourWidth: number;
    labelWidth: number;
    totalHeight: number;
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
            setLeft(((h - startHour) * hourWidth));
        }
        update();
        const id = setInterval(update, 60_000);
        return () => clearInterval(id);
    }, [startHour, endHour, hourWidth, labelWidth]);

    if (left === null) return null;

    return (
        <div
            className="htl-now-line"
            style={{ left: left }}
            aria-hidden="true"
        >
            <div className="htl-now-dot" />
        </div>
    );
}

function EventBlock({
    event,
    left,
    width,
    top,
    bottom,
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
    bottom: number;
    paletteEntry: { bg: string; border: string; text: string };
    onClick?: () => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onMouseMove?: (e: React.MouseEvent) => void;
}): ReactElement {
    const bg = event.color ? hexToRgba(event.color, 0.15) : paletteEntry.bg;
    const border = event.color ?? paletteEntry.border;
    const textColor = event.color ?? paletteEntry.text;

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
                    <span className="htl-event-title">{event.title}</span>
                    <span className="htl-event-time">{fmt(event.start)}–{fmt(event.end)}</span>
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
            style={{ left: state.x, top: state.y}}
            role="tooltip"
        >
            <div className="htl-tooltip-title">{ev.title}</div>
            <div className="htl-tooltip-row">
                <span className="htl-tooltip-label">Horário</span>
                {fmt(ev.start)} – {fmt(ev.end)}
            </div>
            <div className="htl-tooltip-row">
                <span className="htl-tooltip-label">Duração</span>
                {durationLabel}
            </div>
            <div className="htl-tooltip-row">
                <span className="htl-tooltip-label">Colaborador</span>
                {ev.collaborator}
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HorizontalTimelineComponent({
    events,
    startHour,
    endHour,
    hourWidth,
    rowHeight,
    showNowLine,
    onEventClick,
}: HorizontalTimelineProps): ReactElement {
    const LABEL_WIDTH = 104;
    const HEADER_HEIGHT = 50;
    const totalHours = endHour - startHour;
    const timelineWidth = totalHours * hourWidth;

    // Derive unique collaborator list preserving order of first appearance
    const collaborators = [...new Set(events.map(e => e.collaborator))];
    const collaboratorIndex = Object.fromEntries(collaborators.map((c, i) => [c, i]));

    const totalBodyHeight = collaborators.length * rowHeight;

    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        x: 0,
        y: 0,
        event: null,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Build hour ticks array
    const hourTicks = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

    return (
        <div className="htl-wrapper" ref={wrapperRef}>

            {/* ── Sticky header ── */}
            <div className="htl-header" style={{ height: HEADER_HEIGHT }}>
                {showNowLine && (
                    <NowLine
                        startHour={startHour}
                        endHour={endHour}
                        hourWidth={hourWidth}
                        labelWidth={LABEL_WIDTH}
                        totalHeight={totalBodyHeight}
                    />
                )}
                {/* Hour ticks */}
                <div className="htl-header-ticks" style={{ width: timelineWidth }}>
                    {hourTicks.map(h => (
                        <div
                            key={h}
                            className="htl-hour-tick"
                            style={{ width: hourWidth, left: (h - startHour) * hourWidth }}
                        >
                        {/* Grid lines */}
                        <div
                            key={h}
                            className="htl-grid-line"
                            style={{ left: (h - startHour) * hourWidth , top: HEADER_HEIGHT}}
                        />
                            {String(h).padStart(2, "0")}:00
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Body ── */}
            <div className="htl-body" style={{ height: totalBodyHeight }}>
                
                
                {/*<div className="htl-grid" style={{ left: LABEL_WIDTH, width: timelineWidth, height: totalBodyHeight }}>
                    {hourTicks.map(h => (
                        <div
                            key={h}
                            className="htl-grid-line"
                            style={{ left: (h - startHour) * hourWidth }}
                        />
                    ))}
                </div>*/}

                {/* Now line */}
                

                {/* Collaborator rows */}
                {collaborators.map((name, rowIdx) => (
                    <div
                        key={name}
                        className="htl-row"
                        style={{ top: rowIdx * rowHeight, height: rowHeight }}
                    >
                       {/* Label 
                        <div
                            className="htl-row-label"
                            style={{ width: LABEL_WIDTH, height: rowHeight }}
                            title={name}
                        >
                            <span className="htl-row-avatar">
                                {name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </span>
                            <span className="htl-row-name">{name.split(" ")[0]}</span>
                        </div>*/}

                        {/* Events layer */}
                        <div className="htl-events-layer" style={{ width: timelineWidth, height: rowHeight }}>
                            {events
                                .filter(ev => ev.collaborator === name)
                                .map((ev, evIdx) => {
                                    const left = getLeftPx(ev.start, startHour, hourWidth);
                                    const width = getWidthPx(ev.start, ev.end, hourWidth);
                                    const paletteEntry = colorForIndex(collaboratorIndex[name]);

                                    return (
                                        <EventBlock
                                            key={evIdx}
                                            event={ev}
                                            left={left}
                                            width={width}
                                            top={6}
                                            bottom={6}
                                            paletteEntry={paletteEntry}
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
                                        />
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tooltip — rendered outside scroll so it doesn't clip */}
            <Tooltip state={tooltip} />
        </div>
    );
}
