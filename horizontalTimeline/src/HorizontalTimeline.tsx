import { ReactElement } from "react";
import { ObjectItem } from "mendix";
import { HorizontalTimelineComponent, MappedEvent } from "./components/HorizontalTimelineComponent";
import { MonthTimeline } from "./components/MonthTimelineComponent";
import { HorizontalTimelineContainerProps } from "../typings/HorizontalTimelineProps";
import "./ui/HorizontalTimelineStyle.css";
import "./ui/MonthTimelineStyle.css";


export function HorizontalTimeline(props: HorizontalTimelineContainerProps): ReactElement {
    const {
        viewMode,
        meetingList,
        attrTitle,
        attrStart,
        attrEnd,
        dateContext,
        attrColor,
        startHour,
        endHour,
        rowHeight,
        showNowLine,
        onEventClick,
    } = props;
    
    const monthDate: Date | undefined= dateContext?.value;
    // Map Mendix ObjectItems → plain objects the timeline component can use
    const events: MappedEvent[] = (meetingList.items ?? []).map((item: ObjectItem) => ({
        item,
        title: attrTitle.get(item).value ?? "",
        start: attrStart.get(item).value as Date,
        end: attrEnd.get(item).value as Date,
        color: attrColor ? (attrColor.get(item).value ?? undefined) : undefined,
    }));

    if (viewMode === "dayView") {
        return (
            <HorizontalTimelineComponent
                events={events}
                dateContext={dateContext?.value ??new Date()}
                startHour={startHour ?? 8}
                endHour={endHour ?? 20}
                rowHeight={rowHeight ?? 64}
                
                showNowLine={showNowLine ?? true}
                onEventClick={
                    onEventClick
                        ? (item: ObjectItem) => onEventClick.get(item).execute()
                        : undefined
                }
            />
        );
    }
    return (
            <MonthTimeline
                monthContext={monthDate?? new Date()}
                events={events}
            />
        );
}
