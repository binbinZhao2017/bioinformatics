/*
 D3 charts JS (2019-03-22)
 circos module
 Author: binbin.zhao

 11 elements are included, including scatter, heatmap, line, peak, bar, arrow, link, highlight, etc.
 all elements are drew in two method, canvas and svg(Commented Out Code).
 tooltip position in cancas are calculated by d3.Delaunay
 svg can only display tens of thousands of data, and canvas can display up to 4 million data

 Data format
   genome  = [
         ["2L" , 23011544],
         ["2R" , 21146708],
         ["3L" , 24543557],
         ["3R" , 27905053],
         ["X" , 22422827],
         ["4" , 1351857]
      ];

   data_highlight = [
            {chr: "2L", start: "0" , end: "2300000", color: "rgb(255,255,255)"},
            {chr: "2L", start: "2300000" , end: "5400000", color: "rgb(200,200,200)"},
            {chr: "2L", start: "5400000" , end: "7200000", color: "rgb(255,255,255)"},
            {chr: "2L", start: "7200000" , end: "9200000", color: "rgb(200,200,200)"},
            {chr: "2L", start: "9200000" , end: "12700000", color: "rgb(255,255,255)"},
            {chr: "2L", start: "12700000" , end: "16200000", color: "rgb(200,200,200)"},
            {chr: "2L", start: "16200000" , end: "20400000", color: "rgb(255,255,255)"},
            {chr: "2L", start: "20400000" , end: "23900000", color: "rgb(200,200,200)"},
            {chr: "2L", start: "23900000" , end: "28000000", color: "rgb(255,255,255)"},
            {chr: "2L", start: "28000000" , end: "30200000", color: "rgb(200,200,200)"},
            {chr: "2L", start: "30200000" , end: "32400000", color: "rgb(255,255,255)"},
 ],

  data for line/scatter/heatmap/bar/peak
      [
            {chr: "2L", start: "9011548" , end: "10011544", name: "TP53", value: "0.8", group: "apple" } ,
             {chr: "2L", start: "10011548" , end: "11011544", name: "TP53", value: "0.23", group: "banana" } ,
             {chr: "2L", start: "11011548" , end: "12011544", name: "TP53", value: "0.36", group: "apple" } ,
             {chr: "2L", start: "12011548" , end: "13011544", name: "TP53", value: "0.27", group: "apple" } ,
             {chr: "2L", start: "13011548" , end: "14011544", name: "TP53", value: "0.91", group: "banana" } ,
             {chr: "2L", start: "14011548" , end: "15011544", name: "TP53", value: "0.45", group: "apple" } ,
             {chr: "2L", start: "15011548" , end: "16011544", name: "TP53", value: "0.33", group: "banana" } ,
             {chr: "2L", start: "16011548" , end: "17011544", name: "TP53", value: "-2", group: "apple" } ,
    ]
*/
import $text_size from '../util/text_g_size';
import $shape from '../elements/shape';
import $colorTheme from '../elements/colorTheme';
export default $circos;

var $circos = {
    /**
     *
     * @param    dict
     *
     * @return   dict
     **/
    init:function(params)
    {
        console.log("circos - data:\n",params)
        this.check();
        this.getConfig(params);
        this.draw(params);
    },
    /**
     * Check the parameters
     *
     *
     *
     **/
    check:function()
    {

    },
    /**
     * Parameter configuration
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
     * 画图
     *
     * @param    dict
     *
     * @return   dict
     **/

    draw:function(params)
    {
         /*to modify the color, modify the params firstly*/
         if (typeof(params.redrawType) != "undefined"){
             if (params.redrawType == "themeColor"){
                 var color_theme = params.config.visualmap.visualColorValue;
                 var n = 0; //n用于计数
                 for (var j=0; j<params.config.series.length; j++){
                     if (typeof(params.config.series[j].setting) != "undefined"){
                         if (typeof(params.config.series[j].setting.Color) != "undefined"){
                             if (params.config.series[j].type == "c_heatmap"){
                                 if (n < color_theme.length){
                                     params.config.series[j].setting.maxColor = color_theme[n]
                                     n += 1
                                 }else{
                                     n = 0;
                                     params.config.series[j].setting.maxColor = color_theme[n]
                                 };
                                 if (n < color_theme.length){
                                     params.config.series[j].setting.minColor = color_theme[n]
                                     n += 1
                                 }else{
                                     n = 0;
                                     params.config.series[j].setting.minColor = color_theme[n]
                                 };
                             }else{
                                 if (n < color_theme.length){
                                     params.config.series[j].setting.Color = color_theme[n]
                                     n += 1
                                 }else{
                                     n = 0;
                                     params.config.series[j].setting.Color = color_theme[n]
                                 }
                             }
                         }
                     }
                 }
             }
         }
        var init_HISTOGRAMsettings = new Object(); // bar or histogram
        var init_SCATTERsettings = new Object(); //scatter
            init_SCATTERsettings = {
                "circleSize":2,
            }
        var init_ARCsettings = new Object(); // arc
        var init_HEATMAPsettings = new Object(); // heatmap
            init_HEATMAPsettings = {
                "maxColor": "red",
                "minColor": "yellow",
            }
        var init_LINEsettings = new Object(); //line
        var init_GLOBEsettings = new Object();
        var init_BACKGROUNDsettings = new Object();
        var init_Linksettings = new Object();  //link
        var init_PEAKsettings = new Object();  //peak
        var init_ARROWSsettings = new Object();  // arrow
        var init_BANDsettings = new Object();  // band
        var init_TICKsettings = new Object();   // tick

        var init_TEXTCENTREsettings = {
            color: '#333',
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            /*  'normal','bold','bolder','lighter'*/
            fontStyle: 'normal',
            /*  'normal','italic','oblique'*/
            fontSize: 14,
        }
        init_BACKGROUNDsettings = {
            "BgFillColor": "#d3d3d3",
            "BgborderColor": "#000",
            "BgborderSize" : 0.5,
        }
        init_GLOBEsettings = {
            "genomeTextSize": 16,
            "genomeTextDx": 0.028,
            "genomeTextDy": "-0.55em",
            "genomeTextColor": "black",
            "genomeBorderColor": "black",
            "genomeBorderSize": 0.5,
            "genomeFillColor": ["rgb(153,102,0)", "rgb(102,102,0)", "rgb(153,153,30)", "rgb(204,0,0)","rgb(255,0,0)", "rgb(255,0,204)", "rgb(255,204,204)", "rgb(255,153,0)", "rgb(255,204,0)", "rgb(255,255,0)", "rgb(204,255,0)", "rgb(0,255,0)","rgb(53,128,0)", "rgb(0,0,204)", "rgb(102,153,255)", "rgb(153,204,255)", "rgb(0,255,255)", "rgb(204,255,255)", "rgb(153,0,204)", "rgb(204,51,255)","rgb(204,153,255)", "rgb(102,102,102)", "rgb(153,153,153)", "rgb(204,204,204)"],
            "chrPad": 0.04,
            "outerRadius":252,
            "innerRadius":246,
            "TextDisplay":true,
            "genomeBorderDisplay":true,
        };
        $.extend(true, init_GLOBEsettings, params.config.chart)
        var colors = {};
        var genome;
        var new_data = [];
        var genomeLabel;  //chrome name
        var genomeLength;
        var genomeSum = 0;
        var genome_old = params.config.dataset[0].source;
        var genome_matrix = function(genome_argu){
            var i=genome_argu.length;
            genomeLabel = new Array();
            genomeLength = new Array();
            for(var k=0;k<i;k++){
                genomeLabel[k]=genome_argu[k][0];
            }
            for(var k=0;k<i;k++){
                genomeLength[k]=genome_argu[k][1];
                genomeSum += genomeLength[k]
            }
            var i=genomeLength.length;
            var p=genomeLength.length;
            genome = new Array();
            for(var k=0;k<i;k++){
                genome[k]=new Array();
            for(var j=0;j<p;j++){
               genome[k][j]=0;
            }
            }
            for(var k=0;k<i;k++){
                genome[k][0]=genomeLength[k];
            }
        };
        genome_matrix(genome_old);
        var genomeFillColor = init_GLOBEsettings.genomeFillColor
        var fill = d3.scaleOrdinal()
            .domain(d3.range(4))
            .range(genomeFillColor);
        var labeli= genomeLabel.length;
        var initGenome = new Object();
        for(var labelk=0;labelk<labeli;labelk++){
            var labelInit=genomeLabel[labelk];
            initGenome[labelInit]=labelk;
        }


        var chordGenerator = d3.chord().padAngle(0.04).sortSubgroups(d3.descending);
        var chord = chordGenerator(genome)
        var old_group_ = params.seriesGroup
        var innerRadius = init_GLOBEsettings.innerRadius;
        var outerRadius =init_GLOBEsettings.outerRadius;
        var width = params.records.data[0].value.width;
        var height = params.records.data[0].value.height;
        var _circos1; // circos using svg method
        if (typeof(d3.select('#'+params.id).select('#sgchart').select('canvas')._groups[0][0]) == "undefined"){
            _circos1 = d3.select(".sangerchart-series-group").select(".sangerchart-group-0")
                .attr("transform", "translate(" + (params.config.chart.margin.left +  outerRadius) + "," + (params.config.chart.margin.top +  outerRadius  ) + ")");

        }else{
            d3.select('#'+params.id).select('#sgchart').select('#canvas_item').remove();
            _circos1 = d3.select(".sangerchart-series-group").select(".sangerchart-group-0")
                .attr("transform", "translate(" + (params.config.chart.margin.left +  outerRadius) + "," + (params.config.chart.margin.top +  outerRadius) + ")");

        }

        var chartArea = d3.select('#' +params.id)
                        .select("#sgchart")

        var canvas   // circos using canvas method
           = chartArea
           .insert("canvas", "svg")  //
           .attr("width", width)
           .attr("height", height)
           .attr("id", "canvas_item");
         var context = canvas.node().getContext("2d");
         var zoom = params.records.data[0].value.zoom;
         context.scale(zoom, zoom)
         context.translate(params.config.chart.margin.left +  outerRadius, params.config.chart.margin.top +  outerRadius);
         var highlight = chartArea.select("svg").append("g").attr("class", "highlight");

        d3.select(".sangerchart-svg-background").remove();
        /*draw frame*/
        if (init_GLOBEsettings.genomeBorderDisplay == true){
            // _circos1.append("g").selectAll("path") // svg method
            //     .data(chord.groups)   // 1153
            //     .enter()
            //     .append("path")
            //     .style("fill", function(d) {return fill(d.index); })
            //     .style("stroke", init_GLOBEsettings.genomeBorderColor)
            //     .style("stroke-width", init_GLOBEsettings.genomeBorderSize)
            //     .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(outerRadius))
            //     .attr("name", function(d) {return d.index+1; });

            var arcGenerator = d3.arc().context(context).innerRadius(innerRadius).outerRadius(outerRadius); // canvas method
            for (var i =0;i<chord.groups.length; i++){
            arcGenerator(chord.groups[i]);
            context.fillStyle = fill(chord.groups[i].index);
            context.fill();
            context.beginPath();

            }
        }


        /*绘制title*/
        if (init_GLOBEsettings.TextDisplay == true){
            _circos1.append("g").selectAll("text")
                .data(chord.groups)
                .enter()
                .append("text")
                .style("fill", init_GLOBEsettings.genomeTextColor)
                .style("font-size", init_GLOBEsettings.genomeTextSize)
                .each( function(d,i) {
                    d.angle = (d.startAngle + d.endAngle) / 2 - init_GLOBEsettings.genomeTextDx;
                    d.name = genomeLabel[i];})
                .attr("dy",init_GLOBEsettings.genomeTextDy)
                .attr("transform", function(d){
                    // 计算圆弧的角度就是角度*180/pi
                    return "rotate(" + ( d.angle * 180 / Math.PI ) + ")" +
                    "translate(0,"+ -1.0*(outerRadius+10) +")" +
                ( ( d.angle > Math.PI*2 && d.angle < Math.PI*0 ) ? "rotate(180)" : "");

            }
        )
                .text(function(d){
                    return d.name;
                });
           //  for (var i =0; i<chord.groups.length;i++){
           //      context.font = init_GLOBEsettings.genomeTextSize;
           //      context.fillStyle = init_GLOBEsettings.genomeTextColor;
           //      var angle = (chord.groups[i].startAngle + chord.groups[i].endAngle) / 2 - init_GLOBEsettings.genomeTextDx;
           //      var name = genomeLabel[i]
           //      var angle_real = angle * 180 / Math.PI
           //      context.textAlign = 'center';
           //      context.textBaseline = 'middle';
           //      context.fillText(name, (outerRadius + 20)*Math.cos(Math.PI/2 - angle), -(outerRadius + 20)*Math.sin(Math.PI/2 - angle))
           //      // context.rotate(angle_real)
           //
           //  }

        };

        var series_item = params.config.series
        var d = init_GLOBEsettings.outerRadius - init_GLOBEsettings.innerRadius;
        var points = [];
        for (var n=0; n< series_item.length; n++){
            var data_setting = new Object();
            var Radius_max = 0;
            var Radius_min = 0;
            Radius_max = init_GLOBEsettings.outerRadius - (10 + d)*n;
            Radius_min = init_GLOBEsettings.innerRadius - (10 + d)*n;
            data_setting.maxRadius = Radius_max;
            data_setting.minRadius = Radius_min;
            if (series_item[n].type == "c_heatmap"){
                $.extend(true, init_HEATMAPsettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_HEATMAPsettings, series_item[n].setting)
                }
                heatmap(series_item[n].data, init_HEATMAPsettings, n, points)
            } else if (series_item[n].type == "c_line") {
                $.extend(true, init_LINEsettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_LINEsettings, series_item[n].setting)
                }
                init_BACKGROUNDsettings.BginnerRadius = init_LINEsettings.maxRadius
                init_BACKGROUNDsettings.BgouterRadius = init_LINEsettings.minRadius
                if (typeof(series_item[n].background) != "undefined"){
                    $.extend(true, init_BACKGROUNDsettings, series_item[n].background)
                }
                background(init_BACKGROUNDsettings)
                line(series_item[n].data, init_LINEsettings, n, points)
            } else if(series_item[n].type == "c_peak"){
                $.extend(true, init_PEAKsettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_PEAKsettings, series_item[n].setting)
                }
                init_BACKGROUNDsettings.BginnerRadius = init_PEAKsettings.maxRadius
                init_BACKGROUNDsettings.BgouterRadius = init_PEAKsettings.minRadius
                if (typeof(series_item[n].background) != "undefined"){
                    $.extend(true, init_BACKGROUNDsettings, series_item[n].background)
                }
                background(init_BACKGROUNDsettings)
                peak(series_item[n].data, init_PEAKsettings, n)
            }else if (series_item[n].type == "c_bar") {
                $.extend(true, init_HISTOGRAMsettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_HISTOGRAMsettings, series_item[n].setting)
                }
                init_BACKGROUNDsettings.BginnerRadius = init_HISTOGRAMsettings.maxRadius
                init_BACKGROUNDsettings.BgouterRadius = init_HISTOGRAMsettings.minRadius
                if (typeof(series_item[n].background) != "undefined"){
                    $.extend(true, init_BACKGROUNDsettings, series_item[n].background)
                }
                background(init_BACKGROUNDsettings)
                histogram(series_item[n].data, init_HISTOGRAMsettings, n, points)
            } else if(series_item[n].type == "c_scatter"){
                $.extend(true, init_SCATTERsettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_SCATTERsettings, series_item[n].setting)
                }
                init_BACKGROUNDsettings.BginnerRadius = init_SCATTERsettings.maxRadius
                init_BACKGROUNDsettings.BgouterRadius = init_SCATTERsettings.minRadius
                if (typeof(series_item[n].background) != "undefined"){
                    $.extend(true, init_BACKGROUNDsettings, series_item[n].background)
                }
                background(init_BACKGROUNDsettings)
                points = get_scatter(series_item[n].data, init_SCATTERsettings, n, points)
            } else if (series_item[n].type == "c_highlight") {
                $.extend(true, init_ARCsettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_ARCsettings, series_item[n].setting)
                }
                hightlight(series_item[n].data, init_ARCsettings)
            } else if (series_item[n].type == "c_link") {
                $.extend(true, init_Linksettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_Linksettings, series_item[n].setting)
                }
                link(series_item[n].data, init_Linksettings)
            }else if (series_item[n].type == "text_centre") {
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_TEXTCENTREsettings, series_item[n].setting)
                }
                textcentre(series_item[n].content, init_TEXTCENTREsettings)
            }else if (series_item[n].type == "c_arrows") {
                $.extend(true, init_ARROWSsettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_ARROWSsettings, series_item[n].setting)
                }
                init_BACKGROUNDsettings.BginnerRadius = init_ARROWSsettings.maxRadius
                init_BACKGROUNDsettings.BgouterRadius = init_ARROWSsettings.minRadius
                if (typeof(series_item[n].background) != "undefined"){
                    $.extend(true, init_BACKGROUNDsettings, series_item[n].background)
                }
                background(init_BACKGROUNDsettings)
                arrow(series_item[n].data, init_ARROWSsettings, n)
            } else if (series_item[n].type == "ticks"){
                $.extend(true, init_TICKsettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_TICKsettings, series_item[n].setting)
                }
                ticksDisplay(series_item[n].ticksScale,init_TICKsettings)
            }else if (series_item[n].type == "c_band") {
                $.extend(true, init_BANDsettings, data_setting)
                if (typeof(series_item[n].setting)!= "undefined"){
                    $.extend(true, init_BANDsettings, series_item[n].setting)
                }
                init_BACKGROUNDsettings.BginnerRadius = init_BANDsettings.maxRadius
                init_BACKGROUNDsettings.BgouterRadius = init_BANDsettings.minRadius
                if (typeof(series_item[n].background) != "undefined"){
                    $.extend(true, init_BACKGROUNDsettings, series_item[n].background)
                }
                background(init_BACKGROUNDsettings)
                band(series_item[n].data, init_BANDsettings, n)
            };
        }

        /* extremum of histogram*/
         function histogram_value_maxmin(histogramIn){
            var i=histogramIn.length;
            var histogramValueList = new Array();
            for(var k=0;k<i;k++){
                histogramValueList[k]=histogramIn[k].value;
            }
            Array.max=function(array){
                return Math.max.apply(Math,array);
            }
            Array.min=function(array){
                return Math.min.apply(Math,array);
            }
            var histogramValueMax = Array.max(histogramValueList);
            var histogramValueMin = Array.min(histogramValueList);
            var histogramValueMaxmin = new Array();
            histogramValueMaxmin[0]=histogramValueMax;
            histogramValueMaxmin[1]=histogramValueMin;
            return histogramValueMaxmin;
        };

        /*extremum of line*/

        function line_value_maxmin(lineIn){
            var i=lineIn.length;
            var lineValueList = new Array();
            for(var k=0;k<i;k++){
                lineValueList[k]=lineIn[k].value;
            }
            Array.max=function(array){
                return Math.max.apply(Math,array);
            }
            Array.min=function(array){
                return Math.min.apply(Math,array);
            }
            var lineValueMax = Array.max(lineValueList);
            var lineValueMin = Array.min(lineValueList);
            var lineValueMaxmin = new Array();
            lineValueMaxmin[0]=lineValueMax;
            lineValueMaxmin[1]=lineValueMin;
            return lineValueMaxmin;
        }

        /*extremum of heatmap*/
        function heatmap_value_maxmin(heatmapIn){
            var i=heatmapIn.length;
            var heatmapValueList = new Array();
            for(var k=0;k<i;k++){
                heatmapValueList[k]=heatmapIn[k].value;
            }
            Array.max=function(array){
                return Math.max.apply(Math,array);
            }
            Array.min=function(array){
                return Math.min.apply(Math,array);
            }
            var heatmapValueMax = Array.max(heatmapValueList);
            var heatmapValueMin = Array.min(heatmapValueList);
            var heatmapValueMaxmin = new Array();
            heatmapValueMaxmin[0]=heatmapValueMax;
            heatmapValueMaxmin[1]=heatmapValueMin;
            return heatmapValueMaxmin;
        }

        /*extremum of scatter*/
        function snp_value_maxmin(snpIn){
            var i=snpIn.length;
            var snpValueList = new Array();
            for(var k=0;k<i;k++){
                snpValueList[k]=snpIn[k].value;
            }
            Array.max=function(array){
                return Math.max.apply(Math,array);
            }
            Array.min=function(array){
                return Math.min.apply(Math,array);
            }
            var snpValueMax = Array.max(snpValueList);
            var snpValueMin = Array.min(snpValueList);
            var snpValueMaxmin = new Array();
            snpValueMaxmin[0]=snpValueMax;
            snpValueMaxmin[1]=snpValueMin;
            return snpValueMaxmin;
        }


        /*draw ticks*/
        function groupTicks(d) {
            var scale_temp = genomeSum/params.config.chart.ticks
            var j = scale_temp
            var m = 0;
            var j_list = [];
            var num;
            while(j > 1){
                j = j/10
                m += 1
                j_list.push(j)
            }
            if (typeof(j_list[j_list.length -2]) != "undefined"){
                num = parseInt(j_list[j_list.length -2]) * Math.pow(10, m-1);
            }else{
                num = scale_temp
            }
            var ticksScale = num
            var k = (d.endAngle - d.startAngle) / d.value;
            return d3.range(0, d.value, ticksScale).map(function(v, i) {
                return {
                    angle: v * k + d.startAngle,
                    label: v/1000 + "kp "
                };
            });
        }


        function ticksDisplay(ticks_data, ticks_setting){
            var axis =
                _circos1.append("g").selectAll("path")
                .data(chord.groups)
                .enter()
                .append("path")
                .style("fill", "black")
                .style("stroke-width", 0.5)
                .attr("d", d3.arc().innerRadius(ticks_setting.minRadius).outerRadius(ticks_setting.maxRadius))
                .attr("name", function(d) {return d.index+1; });

            var ticks =
                _circos1.append("g").selectAll("g")
                .data(chord.groups)
                .enter()
                .append("g")
                .selectAll("g")
                .data(groupTicks)
                .enter().append("g")
                .attr("transform", function(d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (ticks_setting.minRadius - 0) + ",0)";
                });

                ticks.append("line")
                    .attr("x1", 1)
                    .attr("y1", 0)
                    .attr("x2", -5)
                    .attr("y2", 0)
                    .style("stroke", "#000");

                ticks.append("text")
                    .attr("x", function(d,i){
                        var text_length = $text_size.text_widthbyBBox(params.seriesGroup, d.label, 10, "sans-serif")
                        if (d.angle > Math.PI){
                            return  text_length + 8
                       }else{
                           return -(text_length + 8)
                       }
                    })
                    .attr("dy", ".35em")
                    .style("font-size", 10)
                    .style("fill", "#000")
                    .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(0)" : null; })
                    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
                    .text(function(d) { return d.label; });
        }

        /*绘制UCSC颜色*/
        function hightlight(hightlight_data, hightlight_setting){
            /*highlight绘图*/
            function BioCircosArc(d) {
                return hightlight_data.map(function(v, i) {
                var arc_k = (d[initGenome[v.chr]].endAngle - d[initGenome[v.chr]].startAngle) / d[initGenome[v.chr]].value;
                return {
                    startAngle: v.start * arc_k + d[initGenome[v.chr]].startAngle,
                    endAngle: v.end * arc_k + d[initGenome[v.chr]].startAngle,
                    chr: v.chr,
                    arc_start: v.start,
                    arc_end: v.end,
                    arc_color: v.color,
                    arc_des: v.des,
                    arc_link: v.link,
                };
                });
            };

            var arc_objects = BioCircosArc(chord.groups)
            var arc = d3.arc()
                // .context(context)
                .innerRadius(innerRadius+hightlight_setting.minRadius)
                .outerRadius(outerRadius+hightlight_setting.maxRadius);
            // for (var i =0;i<arc_objects.length; i++){
            // // context.beginPath();
            // // context.fill();
            // arc(arc_objects[i]);
            // arc_hide(arc_objects[i]);
            // colors[color] = arc_objects[i];
            // context.fillStyle = arc_objects[i].arc_color;
            // context.fill();
            // context.beginPath();
            //
            // }
            _circos1.append("g")
                .attr("class", "BioCircosARC")
                .selectAll("path.BioCircosARC")
                .data(arc_objects)
                .enter()
                .append("a")
                .attr("xlink:href", function(d){return d.arc_link})
                .append("path")
                .attr("class", "BioCircosARC")
                .attr("fill", function(d,i) { return d.arc_color; })
                .attr("d", function(d,i) {return arc(d)});
        }
        /*texts in circos*/

        function textcentre(text_content, text_setting){
            var _text;
             _text = _circos1
            .append('text')
            .attr("dy", 0)
            // .text(text_content)
            .attr("color",'#333')
            .attr("fontFamily", "sans-serif")
            .attr("fontWeight", "normal")   /* 字粗细 'normal','bold','bolder','lighter'*/
            .attr("fontStyle", "normal")   /* 斜体 'normal','italic','oblique'*/
            .attr("fontSize", 14)

            var strs = text_content.split(",")
             _text
            .selectAll("tspan")
            .data(strs)
            .enter()
            .append("tspan")
            .attr("x", 0)
            .attr("dy", function(d,i){
                return  i == 0 ? (- 0.5*(strs.length - 1)) + "em": 1 + "em"
            })
            .text(function(d){
            return d;
            })
            .attr('text-anchor',"middle");

        }

        /*draw histogram */
        function histogram(bar_data, bar_setting, n){
            /*直方图 */
            highlight.append("g").attr("class", "highlight_" + n).append("path")

            function BioCircosHISTOGRAM(d) {
                return bar_data.map(function(v, i) {
                    var histogram_k = (d[initGenome[v.chr]].endAngle - d[initGenome[v.chr]].startAngle) / d[initGenome[v.chr]].value;
                    return {
                        index: n,
                        chart_type: "c_histogram",
                        startAngle: v.start * histogram_k + d[initGenome[v.chr]].startAngle,
                        endAngle: v.end * histogram_k + d[initGenome[v.chr]].startAngle,
                        chr: v.chr,
                        histogram_start: v.start,
                        histogram_end: v.end,
                        histogram_name: v.name,
                        histogram_link: v.link,
                        value: v.value,
                        color: v.color,
                        minRadius: bar_setting.minRadius,
                        maxRadius: bar_setting.maxRadius,
                        maxData: histogram_value_maxmin(bar_data)[0],
                        minData: histogram_value_maxmin(bar_data)[1],
                        x: (0 + Math.sin(parseFloat((parseFloat(v.start) + parseFloat(v.end))/2) * histogram_k + d[initGenome[v.chr]].startAngle) * (bar_setting.minRadius + bar_setting.maxRadius)*1/2),  //self.snp_value_maxmin(self.SNP[snpi])[0] max
                        y: (0 - Math.cos(parseFloat((parseFloat(v.start) + parseFloat(v.end))/2) * histogram_k + d[initGenome[v.chr]].startAngle) * (bar_setting.minRadius + bar_setting.maxRadius)*1/2),

                    };
                });
            }

            var histogram_objects = BioCircosHISTOGRAM(chord.groups)
            for (var i =0;i<histogram_objects.length; i++){
                var outerRadius_new = bar_setting.minRadius + ((histogram_objects[i].value- histogram_value_maxmin(bar_data)[1])*(bar_setting.maxRadius-bar_setting.minRadius)/(histogram_value_maxmin(bar_data)[0]-histogram_value_maxmin(bar_data)[1]))
                var arcGenerator = d3.arc()
                    .context(context)
                    .innerRadius(bar_setting.minRadius)
                    .outerRadius(outerRadius_new);
                arcGenerator(histogram_objects[i]);
                context.fillStyle = typeof(histogram_objects[i].color) == "undefined"? params.config.visualmap.visualColorValue[0]:histogram_objects[i].color;
                context.fill();
                context.beginPath();
                points.push(histogram_objects[i])

            }

            // _circos1
            //     .append("g")
            //     .attr("class", "BioCircosHISTOGRAM")
            //     .selectAll("path.BioCircosHISTOGRAM")
            //     .data(histogram_objects)
            //     .enter()
            //     .append("a")
            //     .attr("xlink:href", function(d){return d.histogram_link})
            //     .append("path")
            //     .attr("class", "BioCircosHISTOGRAM")
            //     .attr("fill", bar_setting.Color)
                // .attr("d", d3.arc().innerRadius(bar_setting.minRadius).outerRadius(function(d) {return bar_setting.minRadius + ((d.value- histogram_value_maxmin(bar_data)[1])*(bar_setting.maxRadius-bar_setting.minRadius)/(histogram_value_maxmin(bar_data)[0]-histogram_value_maxmin(bar_data)[1]));}));
        }

        /*drawline*/
        function line(line_data, line_setting){

            highlight.append("g").attr("class", "highlight_" + n).append("path")

            function BioCircosLINE(d) {
                return line_data.map(function(v, i) {
                    var line_k = (d[initGenome[v.chr]].endAngle - d[initGenome[v.chr]].startAngle) / d[initGenome[v.chr]].value;
                    return {
                    index: n,
                    chart_type: "c_line",
                    line_angle: v.start * line_k + d[initGenome[v.chr]].startAngle,
                    chr: v.chr,
                    line_start: v.start,
                    line_des: v.des,
                    value: v.value,
                    line_color:line_setting.Color,
                    line_width: 0.5,
                    x: (0 + Math.sin(v.start * line_k + d[initGenome[v.chr]].startAngle) * ((line_setting.minRadius + ( (v.value-line_value_maxmin(line_data)[1])/(line_value_maxmin(line_data)[0]-line_value_maxmin(line_data)[1])*(line_setting.maxRadius-line_setting.minRadius) )))),
                    y: (0 - Math.cos(v.start * line_k + d[initGenome[v.chr]].startAngle) * ((line_setting.minRadius + ( (v.value-line_value_maxmin(line_data)[1])/(line_value_maxmin(line_data)[0]-line_value_maxmin(line_data)[1])*(line_setting.maxRadius-line_setting.minRadius) ))))
                    };
                    });
            }
            var line_objects = BioCircosLINE(chord.groups)
            for (var i =0;i<line_objects.length; i++){
                points.push(line_objects[i])
            }
            for(var chri=0; chri<genomeLabel.length; chri++){
                var line_objects_a_chr = line_objects.filter(function(element,start){return element.chr==genomeLabel[chri]})
                if(line_objects_a_chr.length != 0){
                  // _circos1.append("g")
                  //     .attr("class", "BioCircosLINE")
                  //     .append("path")
                  //     .datum(line_objects_a_chr)
                  //     .attr("class", "BioCircosLINE")
                  //     .attr("fill", "none")
                  //     .attr("stroke",line_setting.Color)
                  //     .attr("stroke-width",line_setting.LineWidth)
                  //     .attr("d",  d3.line()
                  //     .x(function(d) { return d.x; })
                  //     .y(function(d) { return d.y; })
                  //     );
                  var newdata = [];
                  arcGenerator = d3.line().context(context);
                      for (var i =0;i<line_objects_a_chr.length; i++){
                      newdata.push([line_objects_a_chr[i].x, line_objects_a_chr[i].y])

                  }
                  arcGenerator(newdata);
                  context.fillStyle = line_setting.Color;
                  context.strokeStyle = line_setting.Color;
                  // context.fill();
                  context.stroke();
                  context.beginPath();
                }
            }
        }
        //
        // /*draw heatmap */
        function heatmap(heatmap_data, heatmap_setting, index, points){

            highlight.append("g").attr("class", "highlight_" + n).append("path")

            function BioCircosHeatmap(d) {
                return heatmap_data.map(function(v, i) {
                var heatmap_k = (d[initGenome[v.chr]].endAngle - d[initGenome[v.chr]].startAngle) / d[initGenome[v.chr]].value;
                return {
                    index: n,
                    chart_type: "c_heatmap",
                    startAngle: v.start * heatmap_k + d[initGenome[v.chr]].startAngle,
                    endAngle: v.end * heatmap_k + d[initGenome[v.chr]].startAngle,
                    chr: v.chr,
                    heatmap_start: v.start,
                    heatmap_end: v.end,
                    heatmap_name: v.name,
                    value: v.value,
                    minRadius: heatmap_setting.minRadius,
                    maxRadius: heatmap_setting.maxRadius,
                    maxData: heatmap_value_maxmin(heatmap_data)[0],
                    minData: heatmap_value_maxmin(heatmap_data)[1],
                    x: (0 + Math.sin(parseFloat((parseFloat(v.start) + parseFloat(v.end))/2) * heatmap_k + d[initGenome[v.chr]].startAngle) * (heatmap_setting.minRadius + heatmap_setting.maxRadius)*1/2),  //self.snp_value_maxmin(self.SNP[snpi])[0] max
                    y: (0 - Math.cos(parseFloat((parseFloat(v.start) + parseFloat(v.end))/2) * heatmap_k + d[initGenome[v.chr]].startAngle) * (heatmap_setting.minRadius + heatmap_setting.maxRadius)*1/2),
                    };
                    });
            };
            var color_pick;
            if(params.config.series[index].visualMap.length != 0){
            var visualMap = params.config.series[index].visualMap[0];
            if(!visualMap.hasOwnProperty('visualValue')){
                params.config.series[index].visualMap[0]['visualValue'] = params.config.visualmap.heatmapThemeColors.slice(0,3);
                }
            if(!visualMap.hasOwnProperty('colorDomain') && visualMap['visualValue'].length !=2){
                var colorDomain = [];
                colorDomain.push(parseFloat(visualMap.min));
                var oneData =(parseFloat(visualMap.max) - parseFloat(visualMap.min))/(visualMap['visualValue'].length-1);
                for(var k =1; k<visualMap['visualValue'].length-1; k++){
                    colorDomain.push(parseFloat(parseFloat(visualMap.min) + k*oneData));
                }
                colorDomain.push(parseFloat(visualMap.max));
                visualMap['colorDomain'] = colorDomain;
            }else{
                visualMap['colorDomain'] = visualMap.colorDomain;
            }
            color_pick = d3.scaleLinear()
                .domain(params.config.series[index].visualMap[0]['colorDomain'])
                .range(params.config.series[index].visualMap[0]['visualValue'])
                .nice();
            }else{
                alert("heatmap必须设置visualmap！")
                return "stop"
            }
            var heatmap_objects = BioCircosHeatmap(chord.groups)
            var HeatmapMaxColor = heatmap_setting.maxColor
            var HeatmapMinColor = heatmap_setting.minColor
            var HeatmapValue2Color = d3.interpolate(HeatmapMinColor,HeatmapMaxColor);
            var arcGenerator = d3.arc()
                .context(context)
                .innerRadius(heatmap_setting.minRadius)
                .outerRadius(heatmap_setting.maxRadius);
            for (var i =0;i<heatmap_objects.length; i++){
                points.push(heatmap_objects[i])
                arcGenerator(heatmap_objects[i]);
                context.fillStyle = color_pick(heatmap_objects[i].value)
                context.fill();
                context.beginPath();
            };
            return points
            // _circos1.append("g")
            //     .attr("class", "BioCircosHEATMAP")
            //     .selectAll("path.BioCircosHEATMAP")
            //     .data(heatmap_objects)
            //     .enter()
            //     .append("path")
            //     .attr("class", "BioCircosHEATMAP")
            //     .attr("fill", function(d,i) { return HeatmapValue2Color((d.heatmap_value - heatmap_value_maxmin(heatmap_data)[1])/(heatmap_value_maxmin(heatmap_data)[0]-heatmap_value_maxmin(heatmap_data)[1])); })
            //     .attr("d", function(d,i) { console.log(d);return heatmap(d,i); });
        }


        /*开始绘制峰图*/
        function peak(line_data, line_setting){

            highlight.append("g").attr("class", "highlight_" + n).append("path")

            function BioCircosPEAK(d) {
                return line_data.map(function(v, i) {
                    var line_k = (d[initGenome[v.chr]].endAngle - d[initGenome[v.chr]].startAngle) / d[initGenome[v.chr]].value;
                    return {
                    index:n,
                    chart_type: "c_peak",
                    line_k:line_k,
                    line_angle: v.start * line_k + d[initGenome[v.chr]].startAngle,
                    chr: v.chr,
                    line_start: v.start,
                    line_des: v.des,
                    value: v.value,
                    line_color:line_setting.Color,
                    line_width: 0.5,
                    line_size: v.value < 0 ? -1 : 1,
                    x: (0 + Math.sin(v.start * line_k + d[initGenome[v.chr]].startAngle) * ((line_setting.minRadius + ( (v.value-line_value_maxmin(line_data)[1])/(line_value_maxmin(line_data)[0]-line_value_maxmin(line_data)[1])*(line_setting.maxRadius-line_setting.minRadius) )))),  //self.snp_value_maxmin(self.SNP[snpi])[0] max
                    y: (0 - Math.cos(v.start * line_k + d[initGenome[v.chr]].startAngle) * ((line_setting.minRadius + ( (v.value-line_value_maxmin(line_data)[1])/(line_value_maxmin(line_data)[0]-line_value_maxmin(line_data)[1])*(line_setting.maxRadius-line_setting.minRadius) )))),
                    y0: (0 - Math.cos(v.start * line_k + d[initGenome[v.chr]].startAngle) * ((line_setting.minRadius + ( (0-line_value_maxmin(line_data)[1])/(line_value_maxmin(line_data)[0]-line_value_maxmin(line_data)[1])*(line_setting.maxRadius-line_setting.minRadius) )))),
                    };
                    });
            }
            var line_objects = BioCircosPEAK(chord.groups)
            // Positive and negative numbers
            for(var j = 0; j<line_objects.length; j++){
                points.push(line_objects[j])
            }
            var line_objects_pos = [], line_objects_neg = [];
            for(var m = 0; m < line_objects.length; m++){
                if (line_objects[m].line_size == 1){
                    line_objects_pos.push(line_objects[m]);
                    var a = {};
                    a.line_angle = line_objects[m].line_angle;
                    a.chr = line_objects[m].chr;
                    a.line_start = line_objects[m].line_start;
                    a.value = 0;
                    a.line_width = line_objects[m].line_width;
                    a.y = (0 - Math.cos(line_objects[m].line_start * line_objects[m].line_k + chord.groups[initGenome[line_objects[m].chr]].startAngle) * ((line_setting.minRadius + ( (0-line_value_maxmin(line_data)[1])/(line_value_maxmin(line_data)[0]-line_value_maxmin(line_data)[1])*(line_setting.maxRadius-line_setting.minRadius) ))));
                    a.y0 = line_objects[m].y0;
                    line_objects_neg.push(a)
                }else{
                    line_objects_neg.push(line_objects[m]);
                    var b = {};
                    b.line_angle = line_objects[m].line_angle;
                    b.chr = line_objects[m].chr;
                    b.line_start = line_objects[m].line_start;
                    b.value = 0;
                    b.line_width = line_objects[m].line_width;
                    b.y = (0 - Math.cos(line_objects[m].line_start * line_objects[m].line_k + chord.groups[initGenome[line_objects[m].chr]].startAngle) * ((line_setting.minRadius + ( (0-line_value_maxmin(line_data)[1])/(line_value_maxmin(line_data)[0]-line_value_maxmin(line_data)[1])*(line_setting.maxRadius-line_setting.minRadius) ))));
                    b.y0 = line_objects[m].y0;
                    line_objects_pos.push(b)
                }
            };
            var color;
            for(var chri=0; chri<genomeLabel.length; chri++){
                var line_objects_a_chr_pos = line_objects_pos.filter(function(element,start){return element.chr==genomeLabel[chri]})
                var line_objects_a_chr_neg = line_objects_neg.filter(function(element,start){return element.chr==genomeLabel[chri]})
                for (var k = 0; k < line_objects_a_chr_pos.length; k++){
                    var radialAreaGenerator = d3.areaRadial()
                                                  .angle(function(d){
                                                      return d.line_angle
                                                  })
                                                  .innerRadius( function(d){
                                                      return (Math.abs(d.y0/Math.cos(d.line_angle)))
                                                  })
                                                  .outerRadius( function(d){
                                                      return (Math.abs(d.y/Math.cos(d.line_angle)))
                                                  } )
                                                  .curve(d3.curveLinear)
                                                  .context(context);

                    context.beginPath();
                    radialAreaGenerator(line_objects_a_chr_pos)
                    context.fillStyle = line_setting.Color_positive;
                    context.fill();
                    // context.strokeStyle = line_setting.Color_positive;
                    // context.stroke();

                };
                for (var k = 0; k < line_objects_a_chr_neg.length; k++){
                    var radialAreaGenerator = d3.areaRadial()
                                                .angle(function(d){
                                                    return d.line_angle
                                                })
                                                .innerRadius( function(d){
                                                    return (Math.abs(d.y0/Math.cos(d.line_angle)))
                                                })
                                                .outerRadius( function(d){
                                                    return (Math.abs(d.y/Math.cos(d.line_angle)))
                                                } )
                                                .curve(d3.curveLinear)
                                                .context(context);

                    context.beginPath();
                    radialAreaGenerator(line_objects_a_chr_neg)
                    context.fillStyle = line_setting.Color_negative;
                    context.fill();
                    // context.strokeStyle = line_setting.Color_negative;
                    // context.stroke();

                }
                // if(line_objects_a_chr.length != 0){
                //   _circos1.append("g")
                //       .attr("class", "BioCircosLINE")
                //       .append("path")
                //       .datum(line_objects_a_chr)
                //       .attr("class", "BioCircosLINE")
                //       .attr("fill", function(d){
                //           if (d.line_size == 1){
                //               return line_setting.Color_positive
                //           }else{
                //               return line_setting.Color_negative
                //           }
                //       })
                //       .attr("stroke",function(d){
                //           console.log(d);
                //           if (d.line_size == 1){
                //               return line_setting.Color_positive
                //           }else{
                //               return line_setting.Color_negative
                //           }
                //       })
                //       .attr("stroke-width",line_setting.LineWidth)
                //       .attr("d",  d3.areaRadial()
                //                     .angle(function(d){
                //                         return d.line_angle})
                //                     // .innerRadius(function(d){return line_setting.minRadius})
                //                     // .innerRadius(function(d){return line_setting.minRadius + 1/2*(line_setting.maxRadius - line_setting.minRadius)})
                //                     .innerRadius(function(d){ return (Math.abs(d.y0/Math.cos(d.line_angle)))})
                //                     .outerRadius(function(d){
                //                                              // if((d.line_size) == 1){
                //                                                  return (Math.abs(d.y/Math.cos(d.line_angle)))
                //                                              // }else{
                //                                              //     return (Math.abs((2*(line_setting.minRadius + 1/2*(line_setting.maxRadius - line_setting.minRadius)) - d.y))/Math.cos(d.line_angle))
                //                                              // }
                //                                          })
                //                     .curve(d3.curveLinear)
                //     )
                //
                //
                //   var newdata = [];
                //   arcGenerator = d3.line().context(context);
                //   var arcGenerator_hide = d3.line().context(picker);
                //       for (var i =0;i<line_objects_a_chr.length; i++){
                //       // context.beginPath();
                //       // context.fill();
                //       newdata.push([line_objects_a_chr[i].x, line_objects_a_chr[i].y])
                //
                //   }
                //   i = 0;
                //   var color = getColor(i * 1000 + 1);
                //   colors[color] = line_setting;
                //   picker.strokeStyle = "rgb(" + color + ")";
                //   arcGenerator(newdata);
                //   arcGenerator_hide(newdata)
                //   picker.stroke();
                //   picker.beginPath();
                //   context.fillStyle = line_setting.Color;
                //   context.strokeStyle = line_setting.Color;
                //   // context.fill();
                //   context.stroke();
                //   context.beginPath();
                // }
            }
        }

        /*draw scatter */
        function get_scatter(scatter_data, scatter_setting, n, points){
            highlight.append("g").attr("class", "highlight_" + n).append("path")
            function BioCircosSNP(d) {
                return scatter_data.map(function(v, i) {
                    var snp_k = (d[initGenome[v.chr]].endAngle - d[initGenome[v.chr]].startAngle) / d[initGenome[v.chr]].value;
                    return {
                        index:n,
                        chart_type: "c_scatter",
                        snp_angle: v.start * snp_k + d[initGenome[v.chr]].startAngle,
                        chr: v.chr,
                        snp_start: v.start,
                        value: v.value,
                        snp_des: v.des,
                        snp_color: v.color,
                        snp_link: v.link,
                        x: (0 + Math.sin(v.start * snp_k + d[initGenome[v.chr]].startAngle) * (scatter_setting.minRadius + ( (v.value-snp_value_maxmin(scatter_data)[1])/(snp_value_maxmin(scatter_data)[0]-snp_value_maxmin(scatter_data)[1])*(scatter_setting.maxRadius-scatter_setting.minRadius) ))),  //self.snp_value_maxmin(self.SNP[snpi])[0] max
                        y: (0 - Math.cos(v.start * snp_k + d[initGenome[v.chr]].startAngle) * (scatter_setting.minRadius + ( (v.value-snp_value_maxmin(scatter_data)[1])/(snp_value_maxmin(scatter_data)[0]-snp_value_maxmin(scatter_data)[1])*(scatter_setting.maxRadius-scatter_setting.minRadius) )))
                    };
                });
            }
            var snp_objects = BioCircosSNP(chord.groups)
             snp_objects.forEach(function(p,i){
              context.fillStyle = snp_objects[i].snp_color!=undefined? snp_objects[i].snp_color : "black";
              context.beginPath();
              context.arc(p.x, p.y, scatter_setting.circleSize, 0, 2 * Math.PI);
              context.fill();
              points.push(p)
            });
            return points;

            // for (var i =0;i<snp_objects.length; i++){
            //     // context.fillStyle = if(snp_objects[i].snp_color!=undefined){return snp_objects[i].snp_color;}else{return scatter_setting.Color;};
            //     new_data.push([snp_objects[i].x, snp_objects[i].y]);
            //     context.fillStyle = snp_objects[i].snp_color!=undefined? snp_objects[i].snp_color : scatter_setting.Color;
            //     // console.log(snp_objects[i].x);
            //     context.arc(snp_objects[i].x, snp_objects[i].y, scatter_setting.circleSize, 0, 2 * Math.PI);
            //     context.fill();
            //     context.beginPath();
            // };
            // _circos1.append("g")
            //     .attr("class", "BioCircosSNP")
            //     .selectAll("circle")
            //     .data(snp_objects)
            //     .enter()
            //     .append("a")
            //     .attr("xlink:href", function(d){return d.scatter_link})
            //     .append("circle")
            //     .attr("id", "BioCircosSNP")
                // .attr("fill", function(d,i) { if(d.snp_color!=undefined){return d.snp_color;}else{return scatter_setting.Color;} })
            //     .attr("r", scatter_setting.circleSize)
            //     .attr("cx", function(d) {return d.x; })
            //     .attr("cy", function(d) {return d.y; });
        };

        /* 找点*/
        redraw();

        function redraw() {
            var delaunay = d3.Delaunay.from(points, (function(d) {return d.x}), (function(d) {return d.y}))
            chartArea.on("mousemove",function(){
            var mx, my;
            mx = d3.mouse(this)[0]/(params.records.data[0].value.zoom);
            my = d3.mouse(this)[1]/(params.records.data[0].value.zoom);
            var site = points[delaunay.find(mx - params.config.chart.margin.left - outerRadius, my - params.config.chart.margin.top - outerRadius)];
            if(mx > (params.config.chart.margin.left + 2* outerRadius) || my > (params.config.chart.margin.top + 2* outerRadius) || mx < params.config.chart.margin.left || my < params.config.chart.margin.top){
                d3.select('#'+params.id).select(".highlight").selectAll("path").attr("visibility", "hidden")
                d3.select('#'+params.id).select('.sgchart-tooltip')
                .style('opacity', 0)
            }else{
                if(site.chart_type == "c_histogram"){
                    d3.select('#'+params.id).select(".highlight").selectAll("path").attr("visibility", "hidden")
                    d3.select('#'+params.id)
                      .select(".highlight_"+site.index)
                      .select("path")
                      .attr("fill", "none")
                      .attr("stroke", "green")
                      .attr("transform", "translate(" + (params.config.chart.margin.left + outerRadius) + "," + (params.config.chart.margin.top + outerRadius) + ")")
                      .attr("d", d3.arc().innerRadius(site.minRadius).outerRadius(site.minRadius + ((site.value- site.minData)*(site.maxRadius-site.minRadius)/(site.maxData-site.minData))).startAngle(site.startAngle).endAngle(site.endAngle))
                      .attr("visibility", "");

                }else if (site.chart_type == "c_scatter") {
                    d3.select('#'+params.id).select(".highlight").selectAll("path").attr("visibility", "hidden")
                    var circle_path = d3.symbol().size(10).type(d3.symbolCircle);

                      d3.select('#'+params.id)
                        .select(".highlight_"+site.index)
                        .select("path")
                        .attr("fill", "none")
                        .attr("stroke", "green")
                        .attr("d", circle_path())
                        .attr("visibility", "")
                        .attr("transform", "translate(" + (site.x + params.config.chart.margin.left + outerRadius) + "," + (site.y + params.config.chart.margin.top + outerRadius) + ")");

                }else if (site.chart_type == "c_heatmap") {
                    d3.select('#'+params.id).select(".highlight").selectAll("path").attr("visibility", "hidden")
                    d3.select('#'+params.id)
                      .select(".highlight_"+site.index)
                      .select("path")
                      .attr("fill", "none")
                      .attr("stroke", "green")
                      .attr("transform", "translate(" + (params.config.chart.margin.left + outerRadius) + "," + (params.config.chart.margin.top + outerRadius) + ")")
                      .attr("d", d3.arc().innerRadius(site.minRadius).outerRadius(site.maxRadius).startAngle(site.startAngle).endAngle(site.endAngle))
                      .attr("visibility", "");

                }else if (site.chart_type == "c_band") {

                    d3.select('#'+params.id).select(".highlight").selectAll("path").attr("visibility", "hidden")
                    d3.select('#'+params.id)
                      .select(".highlight_"+site.index)
                      .select("path")
                      .attr("fill", "none")
                      .attr("stroke", "green")
                      .attr("transform", "translate(" + (params.config.chart.margin.left + outerRadius) + "," + (params.config.chart.margin.top + outerRadius) + ")")
                      .attr("d", d3.arc().innerRadius(site.minRadius + site.beauty).outerRadius(site.maxRadius - site.beauty).startAngle(site.startAngle).endAngle(site.endAngle))
                      .attr("visibility", "");

                }else if (site.chart_type == "c_arrows") {  //highlight使用不同的命名方式就可以避开会冲突的问题
                    d3.select('#'+params.id).select(".highlight").selectAll("path").attr("visibility", "hidden")
                    if(site.arc_direction == "p"){
                        if(site.data_rect.length != 0){
                            var arrow_newdata = site.data_triangle.concat(site.data_rect)
                            console.log(arrow_newdata);
                            var path_arrow = "M" + arrow_newdata[3][0] + " " + arrow_newdata[3][1] + "A" + " " + (site.maxRadius -site.beauty) + " " + (site.maxRadius -site.beauty) +  " 0 0 1 " + arrow_newdata[0][0] + " " + arrow_newdata[0][1] +
                                             "L" + arrow_newdata[2][0] + " " + arrow_newdata[2][1] + "L" + " " + arrow_newdata[1][0] + " " + arrow_newdata[1][1] +
                                             "A" + " " + (site.minRadius + site.beauty) + " " + (site.minRadius + site.beauty) + " 0 0 0 " + arrow_newdata[4][0] + " " + arrow_newdata[4][1] +
                                             "L" + arrow_newdata[3][0] + " " + arrow_newdata[3][1]
                            d3.select('#'+params.id)
                              .select(".highlight_"+site.index)
                              .select("path")
                              .attr("fill", "none")
                              .attr("stroke", "red")
                              .attr("transform", "translate(" + (params.config.chart.margin.left + outerRadius) + "," + (params.config.chart.margin.top + outerRadius) + ")")
                              .attr("d", path_arrow)
                              .attr("visibility", "");
                        }else {
                            var path_arrow = "M" + arrow_newdata[0][0] + " " + arrow_newdata[0][1]  + "L" + " " + arrow_newdata[1][0] + " " + arrow_newdata[1][1] +
                                             "L" + arrow_newdata[2][0] + " " + arrow_newdata[2][1]  + "L" + " " + arrow_newdata[0][0] + " " + arrow_newdata[1][1]
                            d3.select('#'+params.id)
                              .select(".highlight_"+site.index)
                              .select("path")
                              .attr("fill", "none")
                              .attr("stroke", "green")
                              .attr("transform", "translate(" + (params.config.chart.margin.left + outerRadius) + "," + (params.config.chart.margin.top + outerRadius) + ")")
                              .attr("d", path_arrow)
                              .attr("visibility", "");
                        }

                    }else {
                        if(site.data_rect.length != 0){
                            var arrow_newdata = site.data_triangle.concat(site.data_rect)
                            var path_arrow = "M" + arrow_newdata[0][0] + " " + arrow_newdata[0][1] + "A" + " " + (site.maxRadius -site.beauty) + " " + (site.maxRadius -site.beauty) +  " 0 0 1 " + arrow_newdata[3][0] + " " + arrow_newdata[3][1] +
                                             "L" + arrow_newdata[4][0] + " " + arrow_newdata[4][1] + "A" + " " + (site.minRadius + site.beauty) + " " + (site.minRadius + site.beauty) + " 0 0 0 " + arrow_newdata[1][0] + " " + arrow_newdata[1][1] +
                                             "L" + arrow_newdata[2][0] + " " + arrow_newdata[2][1] + "L" + arrow_newdata[0][0] + " " + arrow_newdata[0][1]
                                             // "L" + arrow_newdata[3][0] + " " + arrow_newdata[3][1]
                            d3.select('#'+params.id)
                              .select(".highlight_"+site.index)
                              .select("path")
                              .attr("fill", "none")
                              .attr("stroke", "red")
                              .attr("transform", "translate(" + (params.config.chart.margin.left + outerRadius) + "," + (params.config.chart.margin.top + outerRadius) + ")")
                              .attr("d", path_arrow)
                              .attr("visibility", "");
                        }else {
                            var path_arrow = "M" + arrow_newdata[0][0] + " " + arrow_newdata[0][1]  + "L" + " " + arrow_newdata[1][0] + " " + arrow_newdata[1][1] +
                                             "L" + arrow_newdata[2][0] + " " + arrow_newdata[2][1]  + "L" + " " + arrow_newdata[0][0] + " " + arrow_newdata[1][1]
                            d3.select('#'+params.id)
                              .select(".highlight_"+site.index)
                              .select("path")
                              .attr("fill", "none")
                              .attr("stroke", "green")
                              .attr("transform", "translate(" + (params.config.chart.margin.left + outerRadius) + "," + (params.config.chart.margin.top + outerRadius) + ")")
                              .attr("d", path_arrow)
                              .attr("visibility", "");
                        }
                    }

                }else if (site.chart_type == "c_line") {
                    d3.select('#'+params.id).select(".highlight").selectAll("path").attr("visibility", "hidden")
                    var circle_path = d3.symbol().size(6).type(d3.symbolCircle);
                      d3.select('#'+params.id)
                        .select(".highlight_"+site.index)
                        .select("path")
                        .attr("fill", "none")
                        .attr("stroke", "green")
                        .attr("d", circle_path())
                        .attr("visibility", "")
                        .attr("transform", "translate(" + (site.x + params.config.chart.margin.left + outerRadius) + "," + (site.y + params.config.chart.margin.top + outerRadius) + ")");

                }else if (site.chart_type == "c_peak") {
                    d3.select('#'+params.id).select(".highlight").selectAll("path").attr("visibility", "hidden")
                    var circle_path = d3.symbol().size(6).type(d3.symbolCircle);
                    d3.select('#'+params.id)
                      .select(".highlight_"+site.index)
                      .select("path")
                      .attr("fill", "none")
                      .attr("stroke", "green")
                      .attr("d", circle_path())
                      .attr("visibility", "")
                      .attr("transform", "translate(" + (site.x + params.config.chart.margin.left + outerRadius) + "," + (site.y + params.config.chart.margin.top + outerRadius) + ")");
                }

                d3.select('.sgchart-tooltip')
                  .style('opacity', 0.8)
                  .style('top', d3.event.layerY  +'px')
                  .style('left', d3.event.layerX + 5 + 'px')
                  .style('padding', '5px')
                  .html('chr: ' + (site.chr) + '<br>' +  'value: ' + (site.value))
                  .style('font-size',params.config.tooltip.textStyle.fontSize)
                  .style('font-weight',params.config.tooltip.textStyle.fontWeight)
                  .style('color',params.config.tooltip.textStyle.color)
                  .style('font-style',params.config.tooltip.textStyle.fontStyle)
                  .style('font-family',params.config.tooltip.textStyle.fontFamily)
                  .style('border-color', 'black')
                  .style('border-width', 0)
                  .style("visibility", "")
            }
          }
        );

        }

            /*draw link*/
                   function link(link_data, scatter_setting){
                    function BioCircosLINK(d) {
                      return link_data.map(function(v, i) {
                        var start_k = (d[initGenome[v.g1chr]].endAngle - d[initGenome[v.g1chr]].startAngle) / d[initGenome[v.g1chr]].value;
                        var end_k = (d[initGenome[v.g2chr]].endAngle - d[initGenome[v.g2chr]].startAngle) / d[initGenome[v.g2chr]].value;
                        return {
                          link_angle1: (v.g1start/2+v.g1end/2) * start_k + d[initGenome[v.g1chr]].startAngle,
                          link_angle2: (v.g2start/2+v.g2end/2) * end_k + d[initGenome[v.g2chr]].startAngle,
                          link_label1: v.g1name,
                          link_label2: v.g2name,
                          link_pair: v.fusion,
                          link_width: scatter_setting.LinkWidth,
                          link_X1: (0 + Math.sin((v.g1start/2+v.g1end/2) * start_k + d[initGenome[v.g1chr]].startAngle) * (scatter_setting.LinkRadius)),
                          link_Y1: (0 - Math.cos((v.g1start/2+v.g1end/2) * start_k + d[initGenome[v.g1chr]].startAngle) * (scatter_setting.LinkRadius)),
                          link_X2: (0 + Math.sin((v.g2start/2+v.g2end/2) * end_k + d[initGenome[v.g2chr]].startAngle) * (scatter_setting.LinkRadius)),
                          link_Y2: (0 - Math.cos((v.g2start/2+v.g2end/2) * end_k + d[initGenome[v.g2chr]].startAngle) * (scatter_setting.LinkRadius))
                        };
                      });
                    }
                    var link_objects = BioCircosLINK(chord.groups)
                    for (var i =0; i < link_objects.length; i++){
                        context.strokeStyle = scatter_setting.Color;
                        context.LineWidth = scatter_setting.LinkWidth;
                        context.beginPath();
                        context.moveTo(link_objects[i].link_X1, link_objects[i].link_Y1);
                        context.quadraticCurveTo(0,0,link_objects[i].link_X2, link_objects[i].link_Y2);
                        context.stroke();
                        context.closePath();
                    }
                    // var Link_svg = _circos1.append("g")
                    //     .attr("class", "BioCircosLINK")
                    //     .selectAll("path")
                    //     .data(link_objects)
                    //     .enter()
                    //     .append("path")
                    //     .attr("d", function(d) { return "M"+d.link_X1+","+d.link_Y1+" Q0,0 "+d.link_X2+","+d.link_Y2+""; })
                    //     .attr("class", "BioCircosLINK")
                    //     .attr("fill","none")
                    //     .attr("stroke",scatter_setting.Color)
                    //     .attr("stroke-width",scatter_setting.LinkWidth);
            };

            /*开始绘制band图 一键直达*/
            function band(band_data, band_setting, n){

                highlight.append("g").attr("class", "highlight_" + n).append("path")

                function BioCircosBAND(d) {
                    return band_data.map(function(v, i) {
                    var arc_k = (d[initGenome[v.chr]].endAngle - d[initGenome[v.chr]].startAngle) / d[initGenome[v.chr]].value;
                        return {
                            index:n,
                            chart_type: "c_band",
                            startAngle: v.start * arc_k + d[initGenome[v.chr]].startAngle,
                            endAngle: v.end * arc_k + d[initGenome[v.chr]].startAngle,
                            chr: v.chr,
                            arc_start: v.start,
                            arc_end: v.end,
                            arc_color: v.color,
                            arc_des: v.des,
                            arc_link: v.link,
                            arc_direction:v.direction,
                            minRadius: band_setting.minRadius,
                            maxRadius: band_setting.maxRadius,
                            beauty: 0.1 * (Math.abs(band_setting.maxRadius - band_setting.minRadius)),
                            value: "起始位点"+ v.start + " 终止位点 "+ v.end,
                            x: (0 + Math.sin(parseFloat((parseFloat(v.start) + parseFloat(v.end))/2) * arc_k + d[initGenome[v.chr]].startAngle) * (band_setting.minRadius + band_setting.maxRadius)*1/2),  //self.snp_value_maxmin(self.SNP[snpi])[0] max
                            y: (0 - Math.cos(parseFloat((parseFloat(v.start) + parseFloat(v.end))/2) * arc_k + d[initGenome[v.chr]].startAngle) * (band_setting.minRadius + band_setting.maxRadius)*1/2),
                        };
                    });
                };
                var band_objects = BioCircosBAND(chord.groups);
                var beauty = 0.1 * (Math.abs(band_setting.maxRadius - band_setting.minRadius))  // 为了保证基因簇不至于太宽
                var arc = d3.arc()
                    .context(context) // 是否canvas所用
                    .innerRadius((band_setting.minRadius + beauty))
                    .outerRadius((band_setting.maxRadius - beauty));

                for (var i =0;i<band_objects.length; i++){
                    points.push(band_objects[i])
                    arc(band_objects[i]);
                    context.fillStyle = typeof(band_objects[i].arc_color) == "undefined"? params.config.visualmap.visualColorValue[0]:band_objects[i].arc_color;
                    context.fill();
                    context.beginPath();
                }
            }


            /*draw gene clusters*/

             function arrow(arrow_data, arrow_setting){
                 // draw_arrows()
                 // function draw_arrows(){
                 //     // arrow elements
                 //     var outerRadius = 240;
                 //     var innerRadius = 220;
                 //     var arc = d3.arc()
                 //         // .context(context)
                 //         .innerRadius(innerRadius)
                 //         .outerRadius(outerRadius);
                 //    var data_final = {
                 //        startAngle:1.6,
                 //        endAngle:1.7369291106164535
                 //    }
                 //    var arc_length = Math.abs(data_final.endAngle - data_final.startAngle)
                    // if (arc_length*(outerRadius+innerRadius)/2 > 0.5*(Math.abs(outerRadius - innerRadius))){
                    //     var data_split2 = {   // draw band
                    //         startAngle: data_final.startAngle,
                    //         // endAngle:    Math.abs(data_final.endAngle - (Math.abs(outerRadius - innerRadius)/(outerRadius + innerRadius))),
                    //         endAngle:    data_final.startAngle +  (Math.abs(outerRadius - innerRadius)/(outerRadius + innerRadius))
                    //     };
                    //     var data_split1 = {  // draw triangle
                    //         // startAngle: Math.abs(data_final.endAngle - (Math.abs(outerRadius - innerRadius)/(outerRadius + innerRadius))),
                    //         startAngle: data_final.startAngle +  (Math.abs(outerRadius - innerRadius)/(outerRadius + innerRadius)),
                    //         endAngle: data_final.endAngle
                    //     };

                        // var data_new = [[outerRadius*Math.sin(data_split2.startAngle),-outerRadius*Math.cos(data_split2.startAngle)],
                        //              [innerRadius*Math.sin(data_split2.startAngle),-innerRadius*Math.cos(data_split2.startAngle)],
                        //              [(outerRadius + innerRadius)/2 *Math.sin(data_split2.endAngle), -(outerRadius + innerRadius)/2 *Math.cos(data_split2.endAngle)]]

                        // var data_new = [[outerRadius*Math.sin(data_split2.endAngle),-outerRadius*Math.cos(data_split2.endAngle)],
                        //              [innerRadius*Math.sin(data_split2.endAngle),-innerRadius*Math.cos(data_split2.endAngle)],
                        //              [(outerRadius + innerRadius)/2 *Math.sin(data_split2.startAngle), -(outerRadius + innerRadius)/2 *Math.cos(data_split2.startAngle)]]

                 //        _circos1.append("g")
                 //                .attr("class", "BioCircosARROW")
                 //                .append("polygon")
                 //                .attr("points", data_new)
                 //                .attr("stroke", "FF8C00")
                 //                // .attr("stroke-width", 1)
                 //                .attr("fill", "#FF8C00")
                 //
                 //        _circos1.append("g")
                 //            .attr("class", "BioCircosARROW")
                 //            .append("path")
                 //            .attr("fill", "#FF8C00")
                 //            .attr("d", arc(data_split1))
                 //            .attr("stroke", "FF8C00");
                 //
                 //    }else{
                 //
                 //        var data_new = [[outerRadius*Math.sin(data_final.startAngle),-outerRadius*Math.cos(data_final.startAngle)],
                 //                     [innerRadius*Math.sin(data_final.startAngle),-innerRadius*Math.cos(data_final.startAngle)],
                 //                     [(outerRadius + innerRadius)/2 *Math.sin(data_final.endAngle), -(outerRadius + innerRadius)/2 *Math.cos(data_final.endAngle)]]
                 //
                 //        _circos1.append("g")
                 //                .attr("class", "BioCircosARROW")
                 //                .append("polygon")
                 //                .attr("points", data_new)
                 //                .attr("stroke", "FF8C00")
                 //                // .attr("stroke-width", 1)
                 //                .attr("fill", "#FF8C00")
                 //    }
                 //
                 // }

                 function BioCircosARROW(d) {

                     highlight.append("g").attr("class", "highlight_" + n).append("path")

                     return arrow_data.map(function(v, i) {
                     var arc_k = (d[initGenome[v.chr]].endAngle - d[initGenome[v.chr]].startAngle) / d[initGenome[v.chr]].value;
                         return {
                             index:n,
                             chart_type: "c_arrows",
                             beauty:0.1 * (Math.abs(arrow_setting.maxRadius - arrow_setting.minRadius)),
                             minRadius:arrow_setting.minRadius,
                             maxRadius:arrow_setting.maxRadius,
                             startAngle: v.start * arc_k + d[initGenome[v.chr]].startAngle,
                             endAngle: v.end * arc_k + d[initGenome[v.chr]].startAngle,
                             chr: v.chr,
                             arc_start: v.start,
                             arc_end: v.end,
                             arc_color: v.color,
                             arc_des: v.des,
                             arc_link: v.link,
                             arc_direction:v.direction,
                             value: "起始位点"+ v.start + " 终止位点 "+ v.end,
                             x: (0 + Math.sin(parseFloat((parseFloat(v.start) + parseFloat(v.end))/2) * arc_k + d[initGenome[v.chr]].startAngle) * (arrow_setting.minRadius + arrow_setting.maxRadius)*1/2),  //self.snp_value_maxmin(self.SNP[snpi])[0] max
                             y: (0 - Math.cos(parseFloat((parseFloat(v.start) + parseFloat(v.end))/2) * arc_k + d[initGenome[v.chr]].startAngle) * (arrow_setting.minRadius + arrow_setting.maxRadius)*1/2),

                         };
                     });
                 };
                 var arrow_objects = BioCircosARROW(chord.groups)
                 var beauty = 0.1 * (Math.abs(arrow_setting.maxRadius - arrow_setting.minRadius))  // 为了保证基因簇不至于太宽
                 var arc = d3.arc()
                     .context(context)
                     .innerRadius((arrow_setting.minRadius + beauty))
                     .outerRadius((arrow_setting.maxRadius - beauty));

                 for(var j = 0; j<arrow_objects.length; j++){
                     var arc_length = Math.abs(arrow_objects[j].endAngle - arrow_objects[j].startAngle)
                     if (arc_length*((arrow_setting.maxRadius - beauty)+(arrow_setting.minRadius + beauty))/2 > 0.5*(Math.abs((arrow_setting.maxRadius - beauty) - (arrow_setting.minRadius + beauty)))){
                         if (arrow_objects[j].arc_direction == "p"){
                             var data_split1 = {   // draw band
                                 startAngle: arrow_objects[j].startAngle,
                                 endAngle:    Math.abs(arrow_objects[j].endAngle - (Math.abs((arrow_setting.maxRadius - beauty) - (arrow_setting.minRadius + beauty))/((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))))
                             };
                             var data_split2 = {  // draw triangle
                                 startAngle: Math.abs(arrow_objects[j].endAngle - (Math.abs((arrow_setting.maxRadius - beauty) - (arrow_setting.minRadius + beauty))/((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty)))),
                                 endAngle: arrow_objects[j].endAngle
                             };

                             arrow_objects[j].data_rect = [[(arrow_setting.maxRadius - beauty)*Math.sin(data_split1.startAngle),-(arrow_setting.maxRadius - beauty)*Math.cos(data_split1.startAngle)],
                                          [(arrow_setting.minRadius + beauty)*Math.sin(data_split1.startAngle),-(arrow_setting.minRadius + beauty)*Math.cos(data_split1.startAngle)]];

                             var data_new = [[(arrow_setting.maxRadius - beauty)*Math.sin(data_split2.startAngle),-(arrow_setting.maxRadius - beauty)*Math.cos(data_split2.startAngle)],
                                          [(arrow_setting.minRadius + beauty)*Math.sin(data_split2.startAngle),-(arrow_setting.minRadius + beauty)*Math.cos(data_split2.startAngle)],
                                          [((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))/2 *Math.sin(data_split2.endAngle), -((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))/2 *Math.cos(data_split2.endAngle)]]
                         }else if (arrow_objects[j].arc_direction == "n") {
                             var data_split2 = {   // draw triangle
                                 startAngle: arrow_objects[j].startAngle,
                                 endAngle:    arrow_objects[j].startAngle +  (Math.abs((arrow_setting.maxRadius - beauty) - (arrow_setting.minRadius + beauty))/((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty)))
                             };
                             var data_split1 = {  // draw band
                                 startAngle: arrow_objects[j].startAngle +  (Math.abs((arrow_setting.maxRadius - beauty) - (arrow_setting.minRadius + beauty))/((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))),
                                 endAngle: arrow_objects[j].endAngle,
                             };
                             arrow_objects[j].data_rect = [[(arrow_setting.maxRadius - beauty)*Math.sin(data_split1.endAngle),-(arrow_setting.maxRadius - beauty)*Math.cos(data_split1.endAngle)],
                                          [(arrow_setting.minRadius + beauty)*Math.sin(data_split1.endAngle),-(arrow_setting.minRadius + beauty)*Math.cos(data_split1.endAngle)]];
                             var data_new = [[(arrow_setting.maxRadius - beauty)*Math.sin(data_split2.endAngle),-(arrow_setting.maxRadius - beauty)*Math.cos(data_split2.endAngle)],
                                          [(arrow_setting.minRadius + beauty)*Math.sin(data_split2.endAngle),-(arrow_setting.minRadius + beauty)*Math.cos(data_split2.endAngle)],
                                          [((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))/2 *Math.sin(data_split2.startAngle), -((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))/2 *Math.cos(data_split2.startAngle)]]
                         }else {
                         }


                         // _circos1.append("g")
                         //         .attr("class", "BioCircosARROW")
                         //         .append("polygon")
                         //         .attr("points", data_new)
                         //         .attr("stroke", "FF8C00")
                         //         .attr("fill", "#FF8C00")



                         // _circos1.append("g")
                         //     .attr("class", "BioCircosARROW")
                         //     .append("path")
                         //     .attr("fill", "#FF8C00")
                         //     .attr("d", arc(data_split1))
                         //     .attr("stroke", "FF8C00");
                         arrow_objects[j].data_triangle = data_new;
                         points.push(arrow_objects[j])
                         context.beginPath();
                         arc(data_split1);
                         context.moveTo(data_new[0][0], data_new[0][1])
                         context.lineTo(data_new[1][0], data_new[1][1])
                         context.lineTo(data_new[2][0], data_new[2][1])
                         context.closePath()
                         context.fillStyle = typeof(arrow_objects[j].arc_color) == "undefined"? params.config.visualmap.visualColorValue[0]:arrow_objects[j].arc_color;
                         context.fill();
                     }else{
                         if (arrow_objects[j].arc_direction == "p"){
                             var data_new = [[(arrow_setting.maxRadius - beauty)*Math.sin(arrow_objects[j].startAngle),-(arrow_setting.maxRadius - beauty)*Math.cos(arrow_objects[j].startAngle)],
                                          [(arrow_setting.minRadius + beauty)*Math.sin(arrow_objects[j].startAngle),-(arrow_setting.minRadius + beauty)*Math.cos(arrow_objects[j].startAngle)],
                                          [((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))/2 *Math.sin(arrow_objects[j].endAngle), -((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))/2 *Math.cos(arrow_objects[j].endAngle)]]
                         }else if (arrow_objects[j].arc_direction == "n") {
                             var data_new = [[(arrow_setting.maxRadius - beauty)*Math.sin(arrow_objects[j].endAngle),-(arrow_setting.maxRadius - beauty)*Math.cos(arrow_objects[j].endAngle)],
                                          [(arrow_setting.minRadius + beauty)*Math.sin(arrow_objects[j].endAngle),-(arrow_setting.minRadius + beauty)*Math.cos(arrow_objects[j].endAngle)],
                                          [((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))/2 *Math.sin(arrow_objects[j].startAngle), -((arrow_setting.maxRadius - beauty) + (arrow_setting.minRadius + beauty))/2 *Math.cos(arrow_objects[j].startAngle)]]
                         }else{
                         }

                        // _circos1.append("g")
                        //          .attr("class", "BioCircosARROW")
                        //          .append("polygon")
                        //          .attr("points", data_new)
                        //          .attr("stroke", "FF8C00")
                        //          .attr("fill", "#FF8C00")
                        arrow_objects[j].data_rect = [];
                        arrow_objects[j].data_triangle = data_new;
                        points.push(arrow_objects[j])
                        context.beginPath();
                        context.moveTo(data_new[0][0], data_new[0][1])
                        context.lineTo(data_new[1][0], data_new[1][1])
                        context.lineTo(data_new[2][0], data_new[2][1])
                        context.closePath()
                        context.fillStyle = typeof(arrow_objects[j].arc_color) == "undefined"? params.config.visualmap.visualColorValue[0]:arrow_objects[j].arc_color;
                        context.fill();

                     }
                 }
             };

            /*draw background*/
             function background(background_setting){
                    var arcGenerator = d3.arc()
                        .context(context)
                        .innerRadius(background_setting.BginnerRadius)
                        .outerRadius(background_setting.BgouterRadius);
                    for (var i =0;i<chord.groups.length; i++){
                        arcGenerator((chord.groups)[i]);
                        context.fillStyle = background_setting.BgFillColor
                        // context.strokeStyle = background_setting.BgborderColor;
                        context.fill();
                        // context.stroke()
                        context.beginPath();
                }
                    // _circos1.append("g").selectAll("path")
                    //     .data(chord.groups)
                    //     .enter().append("path")
                    //     .style("fill", background_setting.BgFillColor)
                    //     .style("stroke", background_setting.BgborderColor)
                    //     .style("stroke-width", background_setting.BgborderSize)
                    //     .style('opacity', 0.4)
                    //     .attr("d", d3.arc().innerRadius(background_setting.BginnerRadius).outerRadius(background_setting.BgouterRadius));
            }

        },

        colorTheme:function(svg){
            var _obj = d3.select(svg._groups[0][0].parentElement.parentElement);
            $colorTheme.addColorTheme(_obj,['#1B79CC','#FFFFFF', '#E04B3A'],'HeatmapTheme10','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#CC9966','#FFFFFF','#666699'],'HeatmapTheme9','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#FF9966','#FFFFFF','#FFCC00'],'HeatmapTheme8','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#F39950','#FFFFFF','#30398B'],'HeatmapTheme7','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#E68A2E','#FFFFFF','#9ACC68'],'HeatmapTheme6','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#F27D51','#FFFFFF','#6462CC'],'HeatmapTheme5','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#1B79CC', '#E04B3A'],'HeatmapTheme4','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#CC9966','#666699'],'HeatmapTheme3','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#FF9966','#FFCC00'],'HeatmapTheme2','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#F39950','#30398B'],'HeatmapTheme1','heatmapThemeColors', "before");
            $colorTheme.addColorTheme(_obj,['#F27D51','#6462CC'],'HeatmapTheme0','heatmapThemeColors', "before");
        },
};
