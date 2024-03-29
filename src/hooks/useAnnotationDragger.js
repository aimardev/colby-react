
/**
 * Chart JS Plugin
 */



import { useEffect } from 'react'
import { SELECTED_COLOR, copySimpleObject, findNearestDataPoint, getArrowSubtypeById, getLeftElementId, getMainElementId, getRightElementId, getXValueForMultiDataset, highlightLine, isArrowElement, unhighlightLine, wait } from '../utils/utils';
import { ARROW_LINE_TYPE_CAGR, ARROW_LINE_TYPE_GROW_METRIC } from '../components/common/types';


export const CLICK_TIMEOUT = 250

export const onDrag = function (element, moveX, moveY) {

    element.x += moveX;
    element.y += moveY;
    element.x2 += moveX;
    element.y2 += moveY;
    element.centerX += moveX;
    element.centerY += moveY;
    if (element.elements && element.elements.length) {
        for (const subEl of element.elements) {
            subEl.x += moveX;
            subEl.y += moveY;
            subEl.x2 += moveX;
            subEl.y2 += moveY;
            subEl.centerX += moveX;
            subEl.centerY += moveY;
            subEl.bX += moveX;
            subEl.bY += moveY;
        }
    }
};
function highlightLineByDoubleClicked(element, alreadySelected, selected) {
    // console.log('[updateLine]', element)
    // const { options } = element

    if (alreadySelected) {
        // options.borderColor = selected.borderColor
        // options.borderWidth = selected.borderWidth
        return {}
    } else {
        const result = copySimpleObject({
            id: options.id,
            // borderColor: options.borderColor,
            // borderWidth: options.borderWidth
        })
        // options.borderColor = SELECTED_COLOR
        // options.borderWidth = +options.borderWidth + 2
        return result;
    }
}
function onSelectClick(element, colbyAnnotation, chart, dispatch) {
    if (!colbyAnnotation) return false;
    const { options } = element
    // const alreadySelected = colbyAnnotation.selected?.id == options.id
    // console.log("[annotation][Double click]", options, chart, alreadySelected);

    // switch (options.type) {
    //     case 'line':
    //         colbyAnnotation.selected = highlightLineByDoubleClicked(element, alreadySelected, colbyAnnotation.selected);
    //         break;
    // }
    dispatch({
        type: 'ACTIVE_ANNOTATION_ITEM',
        id: options.id
    })

    return true;
}

const handleSingleClick = (ctx, event) => {

    const { chart } = event
    const { element } = ctx
    const elementId = element.options.id

    if (!(isArrowElement(elementId) && (elementId.endsWith('left') || elementId.endsWith('right')))) return;
    // CAGR or grow
    const subtype = getArrowSubtypeById(elementId)
    if (subtype == ARROW_LINE_TYPE_GROW_METRIC || subtype == ARROW_LINE_TYPE_CAGR) {
        console.log('[elementId] clicked', elementId)
        const colbyAnnotationTemp = window.colbyAnnotationTemp

        let selected = false;
        if (colbyAnnotationTemp.arrowElement?.id != element.options.id) {
            colbyAnnotationTemp.arrowElement = element.options;
            selected = true;
        } else {
            colbyAnnotationTemp.arrowElement = null
        }
        highlightLine(chart, element.options, selected, subtype);
    }


}
function updateArrowLine(chart, element, eventX, dispatch) {
    const colbyAnnotationTemp = window.colbyAnnotationTemp
    const nearestData = findNearestDataPoint(chart, eventX, 'x');
    const elementId = element.id
    const mainEleId = getMainElementId(elementId)
    const subtype = getArrowSubtypeById(elementId)
    unhighlightLine(chart, element, subtype);
    colbyAnnotationTemp.arrowElement = null
    dispatch({ type: 'UPDATE_ANNOTATION_ARROW_DATA', id: mainEleId, side: elementId.endsWith('left') ? 'left' : 'right', data: nearestData })
}
const checkMovableIfElement = (elementId) => {
    if (!elementId) return false;
    if (elementId.startsWith('arrow')) return false;
    // console.log('[checkMovableIfElement]', elementId)
    return true
}

export const markColbyChartOptions = (options, dispatch) => ({
    ...options,
    plugins: {
        ...options.plugins,
        annotation: {
            ...options.plugins.annotation,
            enter(ctx) {
                const { element } = ctx
                if (checkMovableIfElement(element.options.id)) {
                    window.colbyAnnotation.element = element
                }
            },
            leave() {
            },
            click(ctx, event) {
                // window.colbyAnnotation.element = null
                // window.colbyAnnotation.lastEvent = null
                const colbyAnnotationTemp = window?.colbyAnnotationTemp
                const colbyAnnotation = window.colbyAnnotation
                if (!colbyAnnotationTemp) return;
                colbyAnnotationTemp.clickCount = colbyAnnotationTemp.clickCount + 1;
                const { chart } = event

                const { idx, type, element } = ctx
                if (colbyAnnotationTemp.clickCount == 1) {

                    // Single click action
                    colbyAnnotationTemp.clickTimer = setTimeout(() => {
                        if (colbyAnnotationTemp.clickCount == 1) {
                            handleSingleClick(ctx, event)
                        }
                        colbyAnnotationTemp.clickCount = 0
                        clearTimeout(colbyAnnotationTemp.clickTimer)
                    }, CLICK_TIMEOUT)
                } else if (colbyAnnotationTemp.clickCount == 2) {
                    // Double click action
                    onSelectClick(element, colbyAnnotation, chart, dispatch)

                    colbyAnnotationTemp.clickCount = 0;
                    clearTimeout(colbyAnnotationTemp.clickCount)
                }
            }
        },
    }
})

function showColbyMenu(x, y) {
    const menu = document.querySelector('.colby-menu');
    if (menu) {
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.style.display = 'block';
    }
}
export function hideColbyMenu() {
    const menu = document.querySelector('.colby-menu');
    if (menu) menu.style.display = 'none';
}
function handleMouseDown(e) {
    if (e.target.closest('.colby-menu') === null) {
        hideColbyMenu()
    }
}
const handlContextMenu = async (event, chart) => {
    event.preventDefault();
    // wait 250 ms
    await wait(250);
    // if (window.colbyAnnotation.element || window.colbyAnnotation.selected) return;
    // if (window.colbyAnnotationTemp.arrowElement) return;

    const rect = chart.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log('[handlDoubleClick]', x, y)
    showColbyMenu(x, y);
}
const useAnnotationDragger = (dispatch, state) => {
    useEffect(() => {
        window.colbyAnnotation = {
            element: null,
            lastEvent: null,
            selected: null
        }
        window.colbyAnnotationTemp = {
            clickCount: 0,
            clickTimer: null,
            arrowElement: null,
        }
    }, [])

    const handleElementDragging = function (event) {
        const { lastEvent, element } = window.colbyAnnotation
        if (!lastEvent || !element) {
            return;
        }
        let moveX = event.x - lastEvent.x;
        let moveY = event.y - lastEvent.y;
        if (element.options.type == 'line') {
            if (!element.options.xScaleID) {
                moveX = 0;
            }
            if (!element.options.yScaleID) {
                moveY = 0;
            }
        }

        onDrag(element, moveX, moveY);
        window.colbyAnnotation.lastEvent = event

        return true;
    };

    const handleDrag = function (event, element) {
        if (element) {
            switch (event.type) {
                case 'mousemove':
                    return handleElementDragging(event);
                case 'mouseout':
                case 'mouseup':
                    window.colbyAnnotation.element = null
                    window.colbyAnnotation.lastEvent = null
                    break;
                case 'mousedown':

                    window.colbyAnnotation.lastEvent = event
                    break;
                default:
            }
        }
    };

    const handleClick = function (chart, args) {
        const event = args.event;
        const eventX = event.x;
        const colbyAnnotationTemp = window.colbyAnnotationTemp
        if (colbyAnnotationTemp.arrowElement) {
            console.log('[colbyAnnotationTemp.arrowElement]', colbyAnnotationTemp.arrowElement)
            const element = colbyAnnotationTemp.arrowElement

            updateArrowLine(chart, element, eventX, dispatch)

        }
    };



    return ({
        id: 'colbyDraggerPlugin',
        beforeEvent: (chart, args, options) => {
            const event = args.event;
            // console.log('[event type]', event.type)
            if (event.type === 'click') {
                handleClick(chart, args)
            } else {

                const { element } = window.colbyAnnotation
                if (handleDrag(args.event, element)) {
                    args.changed = true;
                    return;
                }
            }
        },
        afterInit(chart, args) {
            // Add event listener to the canvas element
            chart.canvas.addEventListener('contextmenu', e => handlContextMenu(e, chart));
            chart.canvas.addEventListener('mousedown', handleMouseDown);
        },
        beforeDraw: (chart, args, options) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.bgcolor || '#ffffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    })
}

export default useAnnotationDragger







