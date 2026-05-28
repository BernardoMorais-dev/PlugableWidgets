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
        attrCollaborator,
        attrTitle,
        attrStart,
        attrEnd,
        monthContext,
        attrColor,
        startHour,
        endHour,
        hourWidth,
        headerHeight,
        rowHeight,
        showNowLine,
        onEventClick,
    } = props;
    
    const monthDate: Date | undefined= monthContext?.value;
    // Map Mendix ObjectItems → plain objects the timeline component can use
    const events: MappedEvent[] = (meetingList.items ?? []).map((item: ObjectItem) => ({
        item,
        collaborator: attrCollaborator.get(item).value ?? "",
        title: attrTitle.get(item).value ?? "",
        start: attrStart.get(item).value as Date,
        end: attrEnd.get(item).value as Date,
        color: attrColor ? (attrColor.get(item).value ?? undefined) : undefined,
    }));

    if (viewMode === "dayView") {
        return (
            <HorizontalTimelineComponent
                events={events}
                startHour={startHour ?? 8}
                endHour={endHour ?? 20}
                hourWidth={hourWidth ?? 120}
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
                dayWidth={hourWidth ?? 120}
                monthContext={monthDate?? new Date()}
                headerHeight={headerHeight??50}
                events={events}
            />
        );
}
