import React from "react";
import { DragDropItemType, NavigationTreeItemProps } from "./navigation-tree-item.props";
import {
    ConnectDragSource,
    ConnectDropTarget,
    DragElementWrapper,
    DragObjectWithType,
    DragPreviewOptions,
    DragSourceOptions,
    DropTargetMonitor,
    useDrag,
    useDrop,
} from "react-dnd";
import { HoverLocation } from "./navigation.props";

function treeItemEndLeaf(
    handleClick: React.MouseEventHandler<HTMLElement>,
    handleExpandClick: React.MouseEventHandler<HTMLElement>,
    handleKeyDown: React.KeyboardEventHandler<HTMLElement>,
    className: string,
    expandTriggerClassName: string,
    contentClassName: string,
    children: React.ReactNode,
    dictionaryId: string,
    navigationConfigId: string,
    ref?: (node: HTMLAnchorElement) => React.ReactElement<any>
): React.ReactElement {
    return (
        <span className={className}>
            <span className={expandTriggerClassName} onClick={handleExpandClick} />
            <a
                className={contentClassName}
                onClick={handleClick}
                ref={ref}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                data-dictionaryid={dictionaryId}
                data-navigationconfigid={navigationConfigId}
            >
                {children}
            </a>
        </span>
    );
}

function treeItemCollapsible(
    handleClick: React.MouseEventHandler<HTMLElement>,
    handleExpandClick: React.MouseEventHandler<HTMLElement>,
    handleKeyDown: React.KeyboardEventHandler<HTMLElement>,
    className: string,
    expandTriggerClassName: string,
    contentClassName: string,
    children: React.ReactNode,
    dictionaryId: string,
    navigationConfigId: string,
    ref?: (node: HTMLSpanElement) => React.ReactElement<any>
): React.ReactElement {
    return (
        <span className={className}>
            <span className={expandTriggerClassName} onClick={handleExpandClick} />
            <span
                className={contentClassName}
                onClick={handleClick}
                ref={ref}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                data-dictionaryid={dictionaryId}
                data-navigationconfigid={navigationConfigId}
            >
                {children}
            </span>
        </span>
    );
}

export const NavigationTreeItem: React.FC<NavigationTreeItemProps> = ({
    children,
    className,
    expandTriggerClassName,
    contentClassName,
    isCollapsible,
    handleClick,
    handleExpandClick,
    handleKeyDown,
    dictionaryId,
    navigationConfigId,
}: React.PropsWithChildren<NavigationTreeItemProps>): React.ReactElement => {
    return isCollapsible
        ? treeItemCollapsible(
              handleClick,
              handleExpandClick,
              handleKeyDown,
              className,
              expandTriggerClassName,
              contentClassName,
              children,
              dictionaryId,
              navigationConfigId
          )
        : treeItemEndLeaf(
              handleClick,
              handleExpandClick,
              handleKeyDown,
              className,
              expandTriggerClassName,
              contentClassName,
              children,
              dictionaryId,
              navigationConfigId
          );
};

export const DraggableNavigationTreeItem: React.FC<NavigationTreeItemProps> = ({
    type,
    children,
    handleClick,
    handleExpandClick,
    handleKeyDown,
    className,
    expandTriggerClassName,
    contentClassName,
    isCollapsible,
    dragStart,
    dragEnd,
    dragHover,
    dictionaryId,
    navigationConfigId,
    index,
}: React.PropsWithChildren<NavigationTreeItemProps>): React.ReactElement => {
    let ref: HTMLAnchorElement | HTMLSpanElement | null = null;

    const drag: [
        unknown,
        DragElementWrapper<DragSourceOptions>,
        DragElementWrapper<DragPreviewOptions>
    ] = useDrag({
        item: {
            type,
        },
        begin(): void {
            dragStart(dictionaryId);
        },
        end(): void {
            // TODO: investigate why when not dropped on a drop target this takes extra time to respond
            // see issue: https://github.com/microsoft/fast/issues/2867
            dragEnd();
        },
    });
    const dragSource: ConnectDragSource = drag[1];
    const drop: [{}, DragElementWrapper<any>] = useDrop({
        accept: [DragDropItemType.linkedData],
        hover(item: DragObjectWithType, monitor: DropTargetMonitor): void {
            const dragItemOffsetY: number = monitor.getClientOffset().y;
            const dropItemBoundingClientRect: DOMRect = ref.getBoundingClientRect() as DOMRect;
            let hoverLocation: HoverLocation = HoverLocation.before;

            if (
                dropItemBoundingClientRect.y + dropItemBoundingClientRect.height / 2 <
                dragItemOffsetY
            ) {
                hoverLocation = HoverLocation.after;
            }

            dragHover(type, dictionaryId, navigationConfigId, index, hoverLocation);
        },
    });
    const dropTarget: ConnectDropTarget = drop[1];

    function refNode(node: HTMLSpanElement | HTMLAnchorElement): React.ReactElement {
        switch (type) {
            case DragDropItemType.linkedData:
                return dragSource(dropTarget(node));
            case DragDropItemType.linkedDataContainer:
            case DragDropItemType.default:
                return dropTarget(node);
        }
    }

    return isCollapsible
        ? treeItemCollapsible(
              handleClick,
              handleExpandClick,
              handleKeyDown,
              className,
              expandTriggerClassName,
              contentClassName,
              children,
              dictionaryId,
              navigationConfigId,
              (node: HTMLSpanElement): React.ReactElement => {
                  ref = node;
                  return refNode(node);
              }
          )
        : treeItemEndLeaf(
              handleClick,
              handleExpandClick,
              handleKeyDown,
              className,
              expandTriggerClassName,
              contentClassName,
              children,
              dictionaryId,
              navigationConfigId,
              (node: HTMLAnchorElement): React.ReactElement => {
                  ref = node;
                  return refNode(node);
              }
          );
};
