(function ( global ) {
    let doc       = document,

        QUOTATION = '"',
        NONE      = 'none',
        GRID      = 'grid',
        GRID_T    = 'grid-template',
        GRID_T_R  = 'grid-template-rows',
        GRID_T_C  = 'grid-template-columns',
        GRID_T_A  = 'grid-template-areas'

    function parseTrackList( val ) {
    }

    function parseGridTemplate( attrs ) {
        let gridTemplate = attrs[ GRID_T ]

        if ( gridTemplate === NONE ) {
            attrs[ GRID_T_R ] = attrs[ GRID_T_C ] = attrs[ GRID_T_A ] = NONE
        } else if ( !gridTemplate.includes( QUOTATION ) && gridTemplate.includes( '/' ) ) {
            //https://www.w3.org/TR/css3-grid-layout/#grid-template-rowcol
            //<‘grid-template-rows’> / <‘grid-template-columns’>
            let vals = gridTemplate.split( '/' )

            attrs[ GRID_T_R ] = vals[ 0 ]
            attrs[ GRID_T_C ] = vals[ 1 ]
            attrs[ GRID_T_A ] = NONE
        } else {
            //https://www.w3.org/TR/css3-grid-layout/#grid-template-ascii
            //[ <line-names>? <string> <track-size>? <line-names>? ]+ [ / <explicit-track-list> ]?
            let str = gridTemplate.trim()

            let pieces   = {
                    areas  : [],
                    rows   : '',
                    columns: ''
                },
                rowName  = '',
                len      = str.length,
                i        = 0,
                rblank   = /\s+/,
                needARow = false,
                char

            while ( i < len ) {
                char = str[ i ]

                if ( char === '[' ) {
                    if ( needARow ) {
                        pieces.rows += 'auto '
                        needARow = false
                    }

                    let endBraceIndex = str.indexOf( ']', i + 1 )

                    pieces.rows += str.substring( i, endBraceIndex + 1 ) + ' '
                    i = endBraceIndex + 1
                    continue
                }

                if ( char === '"' ) {
                    let endQuoteIndex = str.indexOf( '"', i + 1 )

                    pieces.areas.push( str.substring( i + 1, endQuoteIndex ) )
                    i        = endQuoteIndex + 1
                    needARow = true
                    continue
                }

                if ( char === '/' ) {
                    pieces.columns = str.substring( i + 1 ).trim()

                    i = len
                    continue
                }

                if ( rblank.test( char ) ) {
                    if ( rowName.length ) {
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
            attrs[ GRID_T_R ] = pieces.rows
            attrs[ GRID_T_C ] = pieces.columns
            attrs[ GRID_T_A ] = pieces.areas
        }

        return attrs
    }

    function parseGridAttrs( attrs ) {
        let gridAttrs = {}

        if ( attrs.grid ) {
            let gridVal = attrs.grid

            if ( gridVal.includes( 'auto-flow' ) ) {
                //TODO
            } else {
                parseGridTemplate( attrs )
            }
        } else if ( attrs[ GRID_T ] ) {
            parseGridTemplate( attrs )
        }

        gridAttrs[ GRID_T_R ] = attrs[ GRID_T_R ]
        gridAttrs[ GRID_T_C ] = attrs[ GRID_T_C ]
        gridAttrs[ GRID_T_A ] = attrs[ GRID_T_A ]

        gridAttrs.display = attrs.display || GRID

        return gridAttrs
    }

    function parseGridItemAttrs( attrs ) {
    }

    function layout( containerEl, gridAttrs, gridItemAttrs ) {
        let gridObj = {
            container: {
                el: containerEl
            },

            gridAttrs,
            gridItemAttrs
        }

        return gridObj
    }

    let Grid = global.Grid = function ( containerEl, attrs, childrenAttrs ) {
        let rootEl = doc.querySelector( containerEl )

        if ( !rootEl || !rootEl.children || !rootEl.children.length ) {
            return
        }

        return layout( rootEl, parseGridAttrs( attrs || {} ), parseGridItemAttrs( childrenAttrs || {} ) )
    }

    //for test
    Grid.parseGridTemplate = parseGridTemplate
})( window )
