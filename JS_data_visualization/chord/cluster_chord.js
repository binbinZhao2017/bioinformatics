/*
 D3 charts JS (2020-02-19)
 柱状图 module
 Author: binbin.zhao
*/
/*
//            ["protein_name", 0, 0, 1, 0, "fc"]
              // 0 and 1 represents the relationshp between protein and GO

              ["P06727",   1, 1, 1, 1, 0, 1,     1.73402674591],
              ["P06655",   1, 0, 1, 0, 0, 1,     -3.3468353551],
              ["U06847",   1, 1, 0, 1, 0, 1,     -2.65354654646],
              ["F06265",   1, 1, 0, 1, 0, 1,     1.36556574646],
              ....
*/
export default $cluster_chord;
import $select from '../action/select';
import $text_size from '../util/text_g_size';
import $colorScheme from '../util/colorScheme';
import $colorTheme from '../elements/colorTheme';



var $cluster_chord = {
    /**
     *
     * @param    dict
     *
     * @return   dict
     **/
    init:function(params)
    {
        this.check();
        this.getConfig(params);
        this.draw(params);
    },
    /**
     *
     *
     *
     **/
    check:function()
    {

    },
    /**
     *
     * @param    dict
     *
     * @return   dict
     **/
    getConfig:function(params)
    {
        this.config = {
        }
    },
    /**
     *
     * @param    dict
     *
     * @return   dict
     **/

    draw:function(params)
    {

    params.config.chart.size = "";
    params.config.chart.gradientTitle = "logFC";
    var cData = (function(dt){
        dt.series[0].data.sort(function(a, b){
          return a[a.length -1] - b[b.length -1]
        });
        var new_data = $.extend(true, [], dt.series[0].data);
        dt.row = new_data.map(function(d){
            return [d.shift(), d.pop()];
        });
        var cSquareMatrix = function(n){

            var repeat = String.prototype.repeat, s;
            if (!repeat) {
                repeat = function(str, m){
                    return _.range(0, m).map(function(){ return str; }).join("");
                };
                s = "[" + repeat(",0", n).slice(1) + "]";
                s = repeat("," + s, n).slice(1);
            } else {
                s = "[" + ",0".repeat(n).slice(1) + "]";
                s = ("," + s).repeat(n).slice(1);
            };

            return JSON.parse("[" + s + "]");
        };
        var lScale;
        var fcDomain = d3.extent(dt.row.map(function(d){ return d[1]; }));
        if(params.config.series[0].visualMap.length != 0){
        var visualMap = params.config.series[0].visualMap[0];
        if(!visualMap.hasOwnProperty('visualFillValue')){
            params.config.series[0].visualMap[0]['visualFillValue'] = params.config.visualmap.heatmapThemeColors.slice(0,3);
            }
        if(!visualMap.hasOwnProperty('colorDomain') && visualMap['visualFillValue'].length !=2){
            var colorDomain = [];
            colorDomain.push(parseFloat(visualMap.min));
            var oneData =(parseFloat(visualMap.max) - parseFloat(visualMap.min))/(visualMap['visualFillValue'].length-1);
            for(var k =1; k<visualMap['visualFillValue'].length-1; k++){
                colorDomain.push(parseFloat(parseFloat(visualMap.min) + k*oneData));
            }
            colorDomain.push(parseFloat(visualMap.max));
            visualMap['colorDomain'] = colorDomain;
        }else{
            visualMap['colorDomain'] = visualMap.colorDomain;
        }
            dt.gradient =  params.config.series[0].visualMap[0]['visualFillValue']
            lScale = d3.scaleLinear()
            .domain(params.config.series[0].visualMap[0]['colorDomain'])
            .range(params.config.series[0].visualMap[0]['visualFillValue'])
            .nice()
        }else{
            if (params.config.series[0].horizontal == false){
                var max = d3.max(params.config.series[0].data.map(function(d){
                    return d.y;}));
                var min = d3.min(params.config.series[0].data.map(function(d){return d.y;}));
            }else{
                var max = d3.max(params.config.series[0].data.map(function(d){
                    return d.x;}));
                var min = d3.min(params.config.series[0].data.map(function(d){return d.x;}));
            }
            var minandmax = [min, max];
            lScale = d3.scaleLinear().domain(minandmax).range(params.config.visualmap.heatmapThemeColors.slice(0,2)).nice();
            dt.gradient = params.config.visualmap.heatmapThemeColors.slice(0,2)
        };
        var color_temp = params.config.series[1].visualMap[0].visualFillValue == undefined ? $colorScheme.setColors(params.config.visualmap.visualColorValue, params.config.series[1].visualMap[0].pieces.length) : params.config.series[1].visualMap[0].visualFillValue;
        var rScale = d3.scaleLinear()
                    .domain(d3.range(0, dt.series[1].data.length))
                    .range(color_temp);

        // initial values
        dt.series[0]._padding     = 0;
        dt.series[0]._innerRadius = 100;
        dt.series[0]._outerRadius = 155;
        dt.series[0]._groups      = null;
        dt.series[0]._chords      = null;

        dt.series[0].chd        = d3.chord();
        dt.series[0].chord      = d3.ribbon().radius((dt.series[0]._innerRadius + dt.series[0]._outerRadius) * 0.5);
        dt.series[0].leftItems  = dt.row.map(function(d){ return d[0]; });
        dt.series[0].rightItems = dt.series[1].data.map(function(d){ return d[0]; });
        dt.series[0].items      = [].concat(dt.series[0].rightItems, dt.series[0].leftItems);

        dt.series[0].fcDomain   = fcDomain;
        dt.series[0].rScale     = rScale;
        dt.series[0].lScale     = lScale;

        // right arc generator
        dt.series[0].rArc = d3.arc()
                .innerRadius(dt.series[0]._innerRadius)
                .outerRadius(dt.series[0]._outerRadius);

        // left arc generator
        dt.series[0].lArc = d3.arc()
                .innerRadius((dt.series[0]._innerRadius + dt.series[0]._outerRadius) * 0.5)
                .outerRadius(dt.series[0]._outerRadius);

        dt.series[0].getMatrix = function(){
            var matrix = cSquareMatrix(dt.series[0].items.length);
            new_data.forEach(function(row, index){
                var columIndex, rowIndex;
                rowIndex = index + dt.series[1].data.length;
                _.each(row, function(val, ii){
                    columIndex = ii;
                    matrix[rowIndex][columIndex] = val;
                    matrix[columIndex][rowIndex] = val;
                });
            });

            this.matrix = matrix;
            return matrix;
        };
        var chord = dt.series[0].chd(dt.series[0].getMatrix());

        dt.series[0].padding = function(val){
            if(!arguments.length){ return this._padding; }

            this._padding = val;
            this.chd.padding(val);

            return this;
        };
        dt.series[0].innerRadius = function(val){
            if(!arguments.length){ return this._innerRadius; }
            var half = 0.5 * (val + this._outerRadius);
            this._innerRadius = val;
            this.lArc.innerRadius(half);
            this.rArc.innerRadius(val);
            this.chord.radius(val);

            this._groups = null;
            this._chords = null;

            return this;
        };
        dt.series[0].outerRadius = function(val){
            if(!arguments.length){ return this._outerRadius; }
            var half = 0.5 * (val + this._innerRadius);
            this._outerRadius = val;
            this.rArc.outerRadius(val);
            this.lArc.outerRadius(val);
            this.lArc.innerRadius(half);
            this._groups = null;
            this._chords = null;
            return this;
        };

        dt.series[0].check = function(){
            return this._outerRadius > this._innerRadius;
        };

        dt.series[0].getGroups = function(){
            if(this._groups){ return this._groups; }
            if(!this.check()){ alert("Bad data!"); return; }

            var groups = chord.groups,
                right = dt.series[1].data.length;
            _.each(groups, function(dd, ii){
                if (ii < right) {
                    var rename = params.config.series[1].hasOwnProperty('tooltipname')?params.config.series[1].tooltipname.name: "name";
                    var rezscore = params.config.series[1].hasOwnProperty('tooltipname')?params.config.series[1].tooltipname.zscore: "zscore";
                    var tooltip ={};
                        tooltip[rename] = dt.series[0].items[dd.index];
                        tooltip[rezscore] = dt.series[1].data[ii][1];
                    _.extend(dd, {
                        color   : rScale(ii),
                        number  : dt.series[1].data[ii][1],
                        opacity : 0.7,
                        name    : dt.series[0].items[dd.index],
                        cdata   : dt.series[1].data[ii][0],
                        tooltip : tooltip,
                        type    : "circle_right"
                    });
                } else {
                    var rename = params.config.series[0].hasOwnProperty('tooltipname')?params.config.series[0].tooltipname.name: "name";
                    var relogFC = params.config.series[0].hasOwnProperty('tooltipname')?params.config.series[0].tooltipname.logFC: "logFC";
                    var tooltip ={};
                        tooltip[rename] = dt.series[0].items[dd.index];
                        tooltip[relogFC] =  dt.row[ii - right][1];
                    _.extend(dd, {
                        color   : lScale(dt.row[ii - right][1]),
                        fc      : dt.row[ii - right][1],
                        opacity : 1,
                        name    : dt.series[0].items[dd.index],
                        cdata   : dt.series[0].data[ii - right][right+1],
                        tooltip : tooltip,
                        type    : "circle_left"
                    });
                }
            });

            // cache this value avoiding intensive calculation
            this._groups = groups;

            return groups;
        };

        dt.series[0].getChords = function(){
            if(this._chords){ return this._chords; }
            if(!this.check()){ alert("Bad data!"); return; }
              var chords = chord.map(function(dd){
                dd.color   = rScale(dd.source.index);
                dd.opacity = 1;
                return dd;
            });

            // cache this value avoiding intensive calculation
            this._chords = chords;

            return chords;
        };
        return dt.series[0];
    })(params.config);

    var dstartX, dstartY;
    var dragListener = d3.drag()
        .on("start", function() {

            dstartX = d3.mouse(this)[0];
            dstartY = d3.mouse(this)[1];
        })
        .on("drag", function() {
            d3.select(this).attr("transform", "translate(" + (d3.event.x - dstartX) + ", " + (d3.event.y - dstartY) + ")");
        });

    var svg = d3.select('#' +params.id)
                .select(".sangerchart-series-group")
                .select(".sangerchart-group-0")

    var cd = params.config.series[0]
    var dim = (function(svg, cd){

        var dd = {};

        dd.outerRadius     = 0;
        dd.outerTextLength = 0;
        dd.lgdHeight       = 0;
        dd.lgdWidth        = 0;
        dd.lgdBoxSize      = 12;
        dd.grdWidth        = 100;
        dd.grdHeight       = 85;

        dd.smallGap        = 10;
        dd.largeGap        = 15;
        dd.svgSize         = [0, 0];

        dd.getTextBox = function(text){
            var box, node;
            try {
                node = svg.append("text").text(text).style("font-size", "12px");
                box = node.node().getBBox();
                node.remove();
            } catch (err) {
                box = { width: text.length * 8.2, height: 15, x: null, y: null };
            }
            return box;
        };

        dd.outerRadius = (function(self){
            var longText = _.last(_.sortBy(cd.leftItems.slice(), "length"));
            var box = self.getTextBox(longText);

            // The bigger value of "factor",
            // the rarer collison chances on the side texts
            var factor = 15;
            var outerRadius = Math.ceil((box.height + factor) * cd.leftItems.length / Math.PI);
            if (outerRadius < 100){ outerRadius = 100; }
            self.outerTextLength = Math.ceil(box.width + 10);
            if(outerRadius > 400) {
                outerRadius = outerRadius * 0.4;
            };
             var outerRadius;
            // var longLegendText = _.last(_.sortBy(params.config.series[1].visualMap[0].pieces.slice(), "length"));
            // var legend_max = $text_size.text_widthbyBBox(params.seriesGroup, longLegendText, 12, "Arial") + $text_size.text_widthbyBBox(params.seriesGroup, "AAA", 12, "Arial");
            outerRadius = (params.config.chart.width - 2*params.config.chart.margin.left  -  $text_size.text_widthbyBBox(params.seriesGroup, longText, 12, "Arial") - params.config.chart.margin.right)/2;
            return outerRadius;
        })(dd);

        dd.lgdWidth = (function(self){
            var longText = _.last(_.sortBy(cd.rightItems.slice(), "length"));
            var box = self.getTextBox(longText);

            return Math.ceil(self.lgdBoxSize + box.width + 5);
        })(dd);

        dd.lgdHeight = (cd.rightItems.length + 1) * (dd.lgdBoxSize + 4);

        // recalculate svg dimension
        dd.svgSize[0] = params.config.chart.margin.left + params.config.chart.margin.right +
                        dd.outerRadius * 2 + dd.outerTextLength + dd.largeGap +
                        Math.max(dd.lgdWidth, dd.grdWidth);
        if(dd.svgSize[0] < params.config.chart.size[0]){
            dd.outerRadius += (params.config.chart.size[0] - dd.svgSize[0]) * 0.5;
            dd.svgSize[0] = params.config.chart.size[0];
        }

        dd.svgSize[1] = params.config.chart.margin.top + params.config.chart.margin.bottom +
                        Math.max((dd.outerRadius + dd.outerTextLength) * 2,
                                 (dd.grdHeight + dd.lgdHeight));

        return dd;

    })(svg, cData); // anonymous function END


    // resize SVG canvas
    svg.attr({ width: dim.svgSize[0], height: dim.svgSize[1] });

    // defs
    var gradientID = "bwr" + (new Date()).getTime();
    svg.append("defs")
        .append("linearGradient")
        .attr(
        "id", gradientID
      )
        .attr("x1",0)
        .attr("y1",0)
        .attr("x2",1)
        .attr("y1",0)
        .selectAll("stop")
        .data(["0%", "50%", "100%"])
        .enter()
        .append("stop")
        .each(function(d, i){
            d3.select(this).attr({ offset: d, "stop-color": params.config.gradient[i] });
        });


    var gMain = svg.append("g")
        .attr("class", "gMain")
        .attr("transform", "translate(" + [params.config.chart.margin.left, params.config.chart.margin.top] + ")");

    var gChordPie = gMain.append("g")
        .attr("class", "gChordPie")
        .attr("transform", "translate(" + [dim.outerRadius + dim.outerTextLength,
                                           dim.outerRadius + dim.outerTextLength] + ")");

    cData.outerRadius(dim.outerRadius).innerRadius(dim.outerRadius - 30);

    gChordPie.append("g")
        .attr("class", "gChrods")
        .selectAll("path")
        .data(cData.getChords())
        .enter()
        .append("path")
        .on("mouseenter", chordsOnMouseEnter)
        .on("mouseleave", chordsOnMouseLeave)
        .attr("d", cData.chord)
        .attr("stroke", "black")
        .attr("stroke-width",0.5)
        .attr("fill", function(d){ return d.color; })
        .attr("opacity", function(d){ return d.opacity})

    var labelStyle = params.config.series[0].labelStyle;
    var visibility = "visible", fontSize = 13+"px", fontFamily = "Arial",
        color = "black", fontWeight = "normal", fontStyle = "normal";
    if("undefined" != typeof labelStyle.textStyle.fontSize){ fontSize = labelStyle.textStyle.fontSize; }
    if("undefined" != typeof labelStyle.textStyle.fontFamily){ fontFamily = labelStyle.textStyle.fontFamily; }
    if("undefined" != typeof labelStyle.textStyle.color){ color = labelStyle.textStyle.color; }
    if("undefined" != typeof labelStyle.textStyle.fontWeight){ fontWeight = labelStyle.textStyle.fontWeight; }
    if("undefined" != typeof labelStyle.textStyle.fontStyle){ fontStyle = labelStyle.textStyle.fontStyle; }
    gChordPie.selectAll("g.gGroups")
        .data(cData.getGroups())
        .enter()
        .append("g")
        .attr("class", "gGroups")
        .each(function(d,i){
            var self = d3.select(this);
            self.append("path")
                .attr("d", ("number" in d) ? cData.rArc(d) : cData.lArc(d))
                .attr("stroke", "black")
                .attr("stroke-width",0.5)
                .attr("fill", d.color)
                .attr("opacity",d.opacity)

         if(i>(params.config.series[1].data.length-1)){
             self.append("g")
                 .attr("class", "gName_0_None")
                 .attr("transform", function(d){
                     return "rotate(" +
                         ((d.startAngle + d.endAngle) * 0.5 * 180 / Math.PI - 90) + ")" +
                         "translate(" + (cData.outerRadius() + 5) + ",0)";
                 })
                 .append("text")
                 .text(d.name)
                 .attr("transform", "rotate(180)")
                 .attr("text-anchor", "end")
                 .attr("y", 5)
                 .attr("class", "ceshi")
                 .style("display", ("number" in d) ? "none" : "block")
                 .style("font-family", function(d){
                     params.config.series[0].data[i-params.config.series[1].data.length].itemStyle == undefined? params.config.series[0].data[i-params.config.series[1].data.length].itemStyle = {}: params.config.series[0].data[i-params.config.series[1].data.length].itemStyle = params.config.series[0].data[i-params.config.series[1].data.length].itemStyle;
                     return params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fontFamily != undefined ? params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fontFamily : fontFamily})
                 .style("font-size", function(d){return params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fontSize != undefined ? params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fontSize : fontSize})
                 .style("font-weight", function(d){return params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fontWeight != undefined ? params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fontWeight : fontWeight})
                 .attr("fill", function(d){return params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fill != undefined ? params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fill : color})
                 .style("font-style", function(d){return params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fontStyle != undefined ? params.config.series[0].data[i-params.config.series[1].data.length].itemStyle.fontStyle : fontStyle});
         // add text selection
     };
                   });
           var rect =d3.select('#'+params.id).select(".sangerchart-series-group").select(".sangerchart-group-0").select(".gMain")
           var select_rect = rect.append("g")
               .attr("class", "select_rect")
               .attr("transform", "translate(" + [dim.outerRadius + dim.outerTextLength,
                                                  dim.outerRadius + dim.outerTextLength] + ")")
               var rect_data = cData.getGroups().slice(-(params.config.series[0].data.length-1))
               select_rect
               .attr("id", ".gName_0_None text")
               .selectAll("rect")
               .data(rect_data)
               .enter()
               .append("rect")
               .attr("transform", function(d){
                   return "rotate(" +
                       ((d.startAngle + d.endAngle) * 0.5 * 180 / Math.PI - 90) + ")" +
                       "translate(" + (cData.outerRadius() + 5) + ",0)"
               })
               .attr('height', function(d){return $text_size.text_heightbyBBox(params.svg, d.name, 12, "Arial") + 5+ 'px'})
               .attr('width', function(d){return $text_size.text_widthbyBBox(params.svg, d.name, 12, "Arial") +5 + 'px'})
        $select.action(params.id, select_rect, 'text')

    // Events
    function chordsOnMouseEnter(d){
        gChordPie.selectAll(".gChrods path").attr("opacity", 0.1);
        d3.select(this).attr("opacity", 1);
        gChordPie.selectAll(".gGroups").attr("opacity", function(j){
            return ((j.index === d.source.index) || (j.index === d.target.index)) ? 1 : 0.3;
        });
    }
    function chordsOnMouseLeave(d){
        gChordPie.selectAll(".gChrods path").attr("opacity", 1);
        gChordPie.selectAll(".gGroups").attr("opacity", 1);
    }

    function groupsOnMouseEnter(d){
        var indexs = [];
        gChordPie.selectAll(".gChrods path")
            .each(function(j){
                if ((d.index === j.source.index) ||
                    (d.index === j.target.index)) {
                    indexs.push(j.source.index);
                    indexs.push(j.target.index);
                    d3.select(this).attr("stroke-width", 1).attr("opacity", 1)
                } else {
                    d3.select(this).attr("stroke-width", 0).attr("opacity", 0.2)
                }
            });
        gChordPie.selectAll(".gGroups").attr("opacity", function(j){
            return _.contains(indexs, j.index) ? 1 : 0.2;

        });
    }
    function groupsOnMouseLeave(d){
        gChordPie.selectAll(".gGroups").attr("opacity", 1);
        gChordPie.selectAll(".gChrods path")
            .attr("opacity", 1)
            .attr("stroke-width", 0.5);
    }

    gMain.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + [dim.outerRadius + dim.outerTextLength, -25] + ")")
        .style("font", "25px arial, Arial");
        },
};
