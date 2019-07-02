;(function(global) {
    let doc = document
    let QUOTATION = '"'
    let NONE = 'none'
    let GRID = 'grid'
    let GRID_T = 'grid-template'
    let GRID_T_R = 'grid-template-rows'
    let GRID_T_C = 'grid-template-columns'
    let GRID_T_A = 'grid-template-areas'
    let rQuotation = /['"]/

    /**
     * https://www.w3.org/TR/css3-grid-layout/#typedef-track-list
     * @param val
     */
    function parseTrackList(val) {
        console.log(val)
    }

    function parseGridTemplate(attrs) {
        let result = {}
        let gridTemplate = attrs[GRID_T]

        if (gridTemplate === NONE) {
            result[GRID_T_R] = result[GRID_T_C] = result[GRID_T_A] = NONE
        } else if (!gridTemplate.match(rQuotation) && gridTemplate.includes('/')) {
            //https://www.w3.org/TR/css3-grid-layout/#grid-template-rowcol
            //<‘grid-template-rows’> / <‘grid-template-columns’>
            let vals = gridTemplate.split('/')

            result[GRID_T_R] = vals[0]
            result[GRID_T_C] = vals[1]
            result[GRID_T_A] = NONE
        } else {
            //https://www.w3.org/TR/css3-grid-layout/#grid-template-ascii
            //[ <line-names>? <string> <track-size>? <line-names>? ]+ [ / <explicit-track-list> ]?
            let str = gridTemplate.trim()
            let pieces = {
                areas: [],
                rows: '',
                columns: ''
            }
            let rowName = ''
            let len = str.length
            let i = 0
            let rblank = /\s+/
            let needARow = false
            let char

            while (i < len) {
                char = str[i]

                if (char === '[') {
                    if (needARow) {
                        pieces.rows += 'auto '
                        needARow = false
                    }

                    let endBraceIndex = str.indexOf(']', i + 1)

                    pieces.rows += str.substring(i, endBraceIndex + 1) + ' '
                    i = endBraceIndex + 1
                    continue
                }

                if (char === '"') {
                    let endQuoteIndex = str.indexOf('"', i + 1)

                    pieces.areas.push(str.substring(i + 1, endQuoteIndex))
                    i = endQuoteIndex + 1
                    needARow = true
                    continue
                }

                if (char === '/') {
                    pieces.columns = str.substring(i + 1).trim()

                    i = len
                    continue
                }

                if (rblank.test(char)) {
                    if (rowName.length) {
                        pieces.rows += rowName + ' '
                        rowName = ''
                    }
                } else {
                    rowName += char
                    needARow = false
                }

                i++
            }

            //TODO: combine two adjacent names
            result[GRID_T_R] = pieces.rows
            result[GRID_T_C] = pieces.columns
            result[GRID_T_A] = pieces.areas
        }

        return result
    }

    function parseGridArea(area) {}

    function parseGridAttrs(attrs) {
        let gridAttrs = {}

        if (attrs.grid) {
            let gridVal = attrs.grid

            if (gridVal.includes('auto-flow')) {
                //TODO
            } else {
                gridAttrs = Object.assign(gridAttrs, parseGridTemplate(attrs))
            }
        } else if (attrs[GRID_T]) {
            gridAttrs = Object.assign(gridAttrs, parseGridTemplate(attrs))
        }

        /* gridAttrs[GRID_T_R] = parseTrackList(attrs[GRID_T_R])
        gridAttrs[GRID_T_C] = parseTrackList(attrs[GRID_T_C])
        gridAttrs[GRID_T_A] = parseGridArea(attrs[GRID_T_A])*/

        gridAttrs.display = attrs.display || GRID

        return gridAttrs
    }

    function parseGridItemAttrs(attrs) {}

    function layout(containerEl, gridAttrs, gridItemAttrs) {
        return {
            container: {
                el: containerEl
            },
            gridAttrs,
            gridItemAttrs
        }
    }

    let Grid = (global.Grid = function(containerEl, attrs, childrenAttrs) {
        let rootEl = doc.querySelector(containerEl)

        if (!rootEl || !rootEl.children || !rootEl.children.length) {
            return
        }

        return layout(rootEl, parseGridAttrs(attrs || {}), parseGridItemAttrs(childrenAttrs || {}))
    })

    //for test
    Grid.parseGridTemplate = parseGridTemplate
})(window)
