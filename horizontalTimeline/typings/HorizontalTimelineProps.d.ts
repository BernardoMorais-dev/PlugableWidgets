/**
 * This file was generated from HorizontalTimeline.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, ListValue, ListActionValue, ListAttributeValue } from "mendix";

export type ViewModeEnum = "dayView" | "monthView";

export interface HorizontalTimelineContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    viewMode: ViewModeEnum;
    monthContext?: DynamicValue<Date>;
    meetingList: ListValue;
    attrCollaborator: ListAttributeValue<string>;
    attrTitle: ListAttributeValue<string>;
    attrStart: ListAttributeValue<Date>;
    attrEnd: ListAttributeValue<Date>;
    attrColor?: ListAttributeValue<string>;
    startHour: number;
    endHour: number;
    hourWidth: number;
    headerHeight: number;
    rowHeight: number;
    showNowLine: boolean;
    onEventClick?: ListActionValue;
}

export interface HorizontalTimelinePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    viewMode: ViewModeEnum;
    monthContext: string;
    meetingList: {} | { caption: string } | { type: string } | null;
    attrCollaborator: string;
    attrTitle: string;
    attrStart: string;
    attrEnd: string;
    attrColor: string;
    startHour: number | null;
    endHour: number | null;
    hourWidth: number | null;
    headerHeight: number | null;
    rowHeight: number | null;
    showNowLine: boolean;
    onEventClick: {} | null;
}
