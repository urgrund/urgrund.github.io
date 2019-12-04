class ChartStyleContainer {

    constructor() {

        this.baseStyle = "dark";
        this.backGroundColor = 'rgba(0, 0, 0, 0)';

        this.fontSizeAxis = 10;
        this.fontSizeSmall = 10;
        this.fontSizeLarge = 20;

        this.textStyle =
            {
                color: '#fff',
                fontFamily: 'Poppins',
                fontSize: 11
            };


        this.axisLineGrey =
            {
                show: true,
                lineStyle: {
                    opacity: 0.5
                }
            };

        // Colors for flat shading status
        this.statusColorsFlat = ['#00ff6a', 'rgb(253,232,0)', 'rgba(255,0,0,1)'];


        // Colors for gradient shading status
        this.statusColors = [
            {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{ offset: 0, color: '#00ff6a' },
                { offset: 1, color: '#00b297' }]
                //00b285
            },
            {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{ offset: 0, color: 'rgb(255,255,0)' },
                { offset: 1, color: 'rgb(240,169,0)' }]
            }
            , {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{ offset: 0, color: 'rgba(255,140,0,1)' },
                { offset: 1, color: 'rgba(255,0,0,1)' }]
            }
        ];


        // Colors for use when highlighting an item
        this.statusColorsEmpahsis = [
            {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{ offset: 0, color: '#00ff6a' },
                { offset: 1, color: '#00b285' }]
            },
            {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{ offset: 0, color: '#ffff00' },
                { offset: 1, color: '#eab300' }]
            }
            , {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{ offset: 0, color: 'rgba(255,180,50,1)' },
                { offset: 1, color: 'rgba(255,100,100,1)' }]
            }
        ];




        this.siteColors = [{
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(0,178,255,1)' },
            { offset: 1, color: 'rgba(0,12,255,1)' }]
        },
        {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(0,220,205,1)' },
            { offset: 1, color: 'rgba(0,152,205,1)' }]
        }];




        // ----------------------------------------------------------
        // Cumulative
        this.cumulativeColor = {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(33,252,199,1)' }, { offset: 1, color: 'rgba(35,223,199,1)' }]
        };

        this.cumulativeArea = {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(133,252,193,0.35)' }, { offset: 1, color: 'rgba(35,223,129,0)' }]
        };

        // ----------------------------------------------------------



        this.disabledColor = {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'grey'
            }, {
                offset: 1,
                color: 'darkgrey'
            }]),
        };


        this.uofaColor = {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#00b2ff' },
            { offset: 1, color: '#000cff' }]
        };

        this.pieRadii = ['60%', '75%'];
    }


    toolTip() {
        return {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow', z: '-1',
                shadowStyle: {
                    color: 'rgba(8,14,18,0.2)'
                }
            },
            textStyle: {
                color: '#fff',
                fontSize: 10
            },
            backgroundColor: 'rgba(50,50,50,0.9)'
        };
    }

    toolTipTextStyle() {
        return {
            color: '#fff',
            fontSize: 12
        };
    }

    toolTipShadow() {
        return {
            type: 'shadow', z: '-1',
            shadowStyle: {
                color: 'rgba(8,14,18,0.2)'
            }
        };
    }

    toolTipBackgroundColor() {
        return 'rgb(34, 85, 138)';
    }

    // toolBoxPixelRatio(_height) {
    //     if(_height < 
    //     return {

    //     };
    // }
    toolBox(_height, _name) {
        return {
            y: 'bottom',
            show: true,

            showTitle: false,
            feature: {
                saveAsImage: {
                    show: true,
                    pixelRatio: 2,
                    name: _name + "_" + (new Date().toISOString()),
                    title: 'Save Image',
                    backgroundColor: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{ offset: 0, color: 'rgba(10,10,10,1)' },
                        { offset: 1, color: 'rgba(50,50,50,1)' }]
                    },
                    emphasis: {
                        iconStyle: {
                            color: 'white',
                            borderColor: '#000',
                            borderWidth: 0,
                            borderType: 'solid',
                            textPosition: 'left'
                        }
                    }
                }
            }
        };
    }

    createTitle(_content) {
        return {
            subtext: _content,
            subtextStyle: { color: '#fff' },
            left: '4px',
            top: '-3%'
        };
    }

    statusItemStyle(_index) {
        return {
            normal: { color: ChartStyles.statusColors[_index] },
            emphasis: { color: ChartStyles.statusColorsEmpahsis[_index] }
            // shadowColor: 'rgba(1, 1, 1, 1)',
            // shadowBlur: 10,
            // shadowOffsetX: 20,
            // shadowOffsetY: 20
        };
    }

    lineShadow() {
        return {
            shadowColor: 'rgba(1, 1, 1, 0.4)',
            shadowBlur: 7,
            shadowOffsetX: 2,
            shadowOffsetY: 4
        };
    }
    timeLineAxisLabel() {
        return {
            show: true,
            interval: 'auto',
            rotate: 45,
            fontSize: ChartStyles.fontSizeSmall
        }
    }
}

// The instance
const ChartStyles = new ChartStyleContainer();