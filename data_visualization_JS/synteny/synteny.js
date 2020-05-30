/*
 D3 charts JS (2019-10-30)
 synteny module
 Author: binbin.zhao
 used for drawing synteny module
 including condition one-to-one and one-to-many
 two data should be input
 data1 = {
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 1, "chr1_end": 10, "super1": "a-b-r1", "super1_start": 1, "super1_end": 10, "sp2": "bbb", "chr2": "sb1", "chr2_start": 7, "chr2_end": 10, "super2": "a-b-q1", "super2_start": 7, "super2_end": 100,"value": "11"},
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 12, "chr1_end": 16, "super1": "a-b-r2", "super1_start": 12, "super1_end": 44,"sp2": "bbb", "chr2": "sb1", "chr2_start": 11, "chr2_end": 15, "super2": "a-b-q1", "super2_start": 7, "super2_end": 100, "value": "5"},
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 17, "chr1_end": 20, "super1": "a-b-r2", "super1_start": 12, "super1_end": 44,"sp2": "bbb", "chr2": "sb1", "chr2_start": 16, "chr2_end": 19, "super2": "a-b-q1", "super2_start": 7, "super2_end": 100, "value": "8"},
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 20, "chr1_end": 25, "super1": "a-b-r2", "super1_start": 12, "super1_end": 44,"sp2": "bbb", "chr2": "sb1", "chr2_start": 20, "chr2_end": 30, "super2": "a-b-q1", "super2_start": 7, "super2_end": 100, "value": "3"},
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 26, "chr1_end": 29, "super1": "a-b-r2", "super1_start": 12, "super1_end": 44,"sp2": "bbb", "chr2": "sb1", "chr2_start": 31, "chr2_end": 36, "super2": "a-b-q1", "super2_start": 7, "super2_end": 100, "value": "6"},
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 30, "chr1_end": 34, "super1": "a-b-r2", "super1_start": 12, "super1_end": 44,"sp2": "bbb", "chr2": "sb1", "chr2_start": 37, "chr2_end": 40, "super2": "a-b-q1", "super2_start": 7, "super2_end": 100, "value": "5"},
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 35, "chr1_end": 40, "super1": "a-b-r2", "super1_start": 12, "super1_end": 44,"sp2": "bbb", "chr2": "sb1", "chr2_start": 41, "chr2_end": 44, "super2": "a-b-q1", "super2_start": 7, "super2_end": 100, "value": "4"},
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 41, "chr1_end": 44, "super1": "a-b-r2", "super1_start": 12, "super1_end": 44,"sp2": "bbb", "chr2": "sb1", "chr2_start": 45, "chr2_end": 100, "super2": "a-b-q1", "super2_start": 7, "super2_end": 100, "value": "12"},
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 60, "chr1_end": 62, "super1": "a-b-r3", "super1_start": 60, "super1_end": 102,"sp2": "bbb", "chr2": "sb10", "chr2_start": 0, "chr2_end": 26, "super2": "a-b-q2", "super2_start": 0, "super2_end": 150,"value": "41"},
     {"sp1": "aaa", "chr1": "os1", "chr1_start": 63, "chr1_end": 69, "super1": "a-b-r3", "super1_start": 60, "super1_end": 102,"sp2": "bbb", "chr2": "sb10", "chr2_start": 27, "chr2_end": 78, "super2": "a-b-q2", "super2_start": 0, "super2_end": 150,"value": "71"},
     ......
},
data2 = [
       {"sp": "aaa", "chr": "os1", "chr_length": 250},
       {"sp": "aaa", "chr": "os2", "chr_length": 260},
       {"sp": "bbb", "chr": "sb1", "chr_length": 110},
       {"sp": "bbb", "chr": "sb10", "chr_length": 150},
       {"sp": "bbb", "chr": "sb2", "chr_length": 210},
       {"sp": "bbb", "chr": "sb3", "chr_length": 270},
       {"sp": "ccc", "chr": "sb4", "chr_length":150},
       {"sp": "ccc", "chr": "sb5", "chr_length": 280},
       {"sp": "ddd", "chr": "sb6", "chr_length":230},
       {"sp": "ddd", "chr": "sb7", "chr_length": 200}
   ];
*/

import $shape from '../elements/shape';
export default $synteny;
import $select from '../action/select';
import $text_size from '../util/text_g_size';
import $textInteractive from '../action/text_interactive';
import $saveloadStorage from '../util/saveloadStorage';
import $tooltip from '../elements/tooltip';
import $showArrow from '../elements/legend/add_action/show_arrow';


var $synteny = {
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
     * 检查参数,当前画柱子的参数是否存在问题,
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
        },
    /**
     *
     * @param    dict
     *
     * @return   dict
     **/
    draw:function(params_old, restore_list)
    {
        var params = typeof(restore_list) == "undefined"? params_old: params_old.sthis.params;
        var padding = params.config.chart.padding;
        var genome_high = params.config.chart.genome_high;
        var index_source = 0;
        var index_target = 0;
        var x = 0;
        var y = 0;
        var _diffX = " ";
        var _diffY = " ";
        var info_value_list = [];
        // to calculate scale, the max value of chr is needed
        var genome_max_list = [];
        var group_dict = {};  // Genomic location information
        var group_dict_x = {};
        var group_list = [];
        var group_length = {};

        var relationship = []; //record the relationship between source and target
        for(var i =0; i < params.config.series[0].data.length; i++){
            var source1 = params.config.series[0].data[i].sp1
            var target1 = params.config.series[0].data[i].sp2
            if (relationship.indexOf(source1+"_VS_"+target1) == -1){
                relationship.push(source1+"_VS_"+target1)
            }

        };
        // Assign colors
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
        var colors = d3.scaleLinear()
            .domain(params.config.series[0].visualMap[0]['colorDomain'])
            .range(params.config.series[0].visualMap[0]['visualFillValue'])
            .nice();

        // Maximum and minimum calculation
        var sp_list = [];
        var spiece_data = params.config.series[1].data;
        var temp_length = 0
        var temp_max = 0;
        var temp_max2 = 0;
        for(var i = 0; i<spiece_data.length; i++){
            if(sp_list.indexOf(spiece_data[i].sp) == -1){
                sp_list.push(spiece_data[i].sp);
                if (i != 0){
                    group_length[spiece_data[i-1].sp] = temp_length;
                    temp_length = spiece_data[i].chr_length + padding;
                }else{
                    temp_length = spiece_data[i].chr_length + padding;
                }
            }else{
                temp_length += (spiece_data[i].chr_length + padding)
            };
        };
        group_length[spiece_data[spiece_data.length -1].sp] = temp_length;

        // condition1: one-to-one

        for(var key1 in group_length){
            if(parseInt(group_length[key1]) > temp_max){
                temp_max = parseInt(group_length[key1])
            }
        };
        var source_list = [];
        var relationship_temp_list = [];
        var relationship_list = [];
        var relationship_dict = {}; // format: {"bbbb": "ccc", "ddd"}
        for (var i = 0; i< relationship.length; i++){
            if(source_list.indexOf(relationship[i].split("_VS_")[0]) == -1){
                source_list.push(relationship[i].split("_VS_")[0])
            }else{
                relationship_temp_list.push(relationship[i].split("_VS_")[0])
            }
        };
        for(var j = 0; j<relationship_temp_list.length; j++){
            var list_temp = [];
            for (var i = 0; i< relationship.length; i++){
                if (relationship[i].split("_VS_")[0] == relationship_temp_list[j]){
                    list_temp.push(relationship[i].split("_VS_")[1])
                }
            };
            relationship_dict[relationship_temp_list[j]] = list_temp
        };

        // condition2： one-to-many
        var subtraction = 0; // 高度上应该减去几个band的高度。
        for(var key2 in relationship_dict){
            var temp = 0;
            subtraction += (relationship_dict[key2].length - 1)
            for (var i =0; i<relationship_dict[key2].length; i++){
                temp += (group_length[relationship_dict[key2][i]])
            };
            temp_max2 = temp > temp_max2? temp: temp_max2
        };

        var high = (params.config.chart.height - params.config.chart.margin.top - params.config.chart.margin.bottom - (Object.keys(group_length).length - subtraction)*genome_high)/(Object.keys(group_length).length - subtraction -1)
        for(var i = 0; i< relationship.length; i++){
            var source = relationship[i].split("_VS_")[0];
            var target = relationship[i].split("_VS_")[1];
            if (group_list.indexOf(source) == -1){
                group_dict[source] = 0;
                group_list.push(source)
            };
            if (group_list.indexOf(target) == -1){
                group_dict[target] = group_dict[source] + high;
                group_list.push(target)
            };
            params.config.series[0].x = 0;
            params.config.series[0].y = 0;
        }

        genome_max = parseInt(temp_max) > parseInt(temp_max2)? temp_max : temp_max2;
        // genome_max  = 790;
        var rangeData = [0, params.xLengths[0]]
        var domainData = [0, genome_max]
        var scale_band = d3.scaleLinear().domain(domainData).range(rangeData);
        var spiece_chr_length = {};
        var chr_length = {};
        var transform_d = 0;
        var index = 0;
        var target_dict = {};
        var target_dict_list_dict = {};
        var sp_list = [];
        for(var i = 0; i<spiece_data.length; i++){
            if(sp_list.indexOf(spiece_data[i].sp) == -1){
                index = i;
                sp_list.push(spiece_data[i].sp);
                spiece_data[i]["transform_d"] = 0;
                target_dict[spiece_data[i].chr] = 0;
                if (i != 0){
                    target_dict_list_dict[spiece_data[i-1].sp] = target_dict
                    spiece_chr_length[spiece_data[i-1].sp] = chr_length
                    chr_length = {};
                    chr_length[spiece_data[i].chr]  = spiece_data[i].chr_length
                }else{
                    chr_length[spiece_data[i].chr]  = spiece_data[i].chr_length
                }
            }else{
                transform_d = 0;
                for (var j = index; j < i; j++){
                    transform_d = padding + scale_band(spiece_data[j].chr_length + 1) - scale_band(1) + transform_d
                };
                spiece_data[i]["transform_d"] = transform_d;
                target_dict[spiece_data[i].chr] = transform_d;
                chr_length[spiece_data[i].chr]  = spiece_data[i].chr_length;
            };
            // source_chr_list
        };
        spiece_chr_length[spiece_data[spiece_data.length -1].sp] = chr_length  // 物种，染色体信息与长度对应关系。 // spieces, chromosome information, length
        target_dict_list_dict[spiece_data[spiece_data.length-1].sp] = target_dict
        // console.log(target_dict);  // sb1: 0  sb2: 299.49367088607596   sb3: 527.0886075949368    sb10: 123.79746835443036
        // console.log(target_dict_list_dict); // "bbb": target_dict;
        var temp_list = [];

        function findKey(obj, value){
            for (var key1 in obj){
                if (obj[key1] == value){
                    return key1
                }
            }
        };

        for (var key in group_dict){
            if (temp_list.indexOf(group_dict[key]) == -1){
                group_dict_x[key] = 0
                temp_list.push(group_dict[key])
            }else{
                group_dict_x[key] = group_length[findKey(group_dict, group_dict[key])] + 2*padding
                temp_list.push(group_dict[key])
            }
        }
        var genome_max = d3.max(genome_max_list)
        var link_data_list_list = [];
        var link_func = function() {
          var curvature = .5;
          var x_transform = x == undefined ? 0 : x;
          var y_transform = y == undefined ? 0 : y;
          function link(d) {
              var d_t_final = d.line_data.dt0 != undefined ?d.line_data.dt0 : d.line_data.dt
              var d_s_final = d.line_data.ds0 != undefined ?d.line_data.ds0 : d.line_data.ds
              var y0_final = d.line_data.y00 != undefined ?d.line_data.y00 : d.line_data.y0
              var y1_final = d.line_data.y10 != undefined ?d.line_data.y10 : d.line_data.y1
              var y2_final = d.line_data.y20 != undefined ?d.line_data.y20 : d.line_data.y2
              var y3_final = d.line_data.y30 != undefined ?d.line_data.y30 : d.line_data.y3
              var x0 = d.line_data.x0 + d_s_final ,
                  y0 = y0_final ,
                  x1 = d.line_data.x1 + d_t_final,
                  y1 = y1_final ,
                  x2 = d.line_data.x2 + d_s_final ,
                  y2 = y2_final ,
                  x3 = d.line_data.x3 + d_t_final ,
                  y3 = y3_final,
                  yi_1 = d3.interpolateNumber(y0, y1),
                  yi_2 = d3.interpolateNumber(y2, y3),
                  ya = yi_1(curvature),
                  yb = yi_1(1 - curvature),
                  yc = yi_2(curvature),
                  yd = yi_2(1 - curvature);

            return "M" + x0 + "," + y0
                 + "C" + x0 + "," + ya
                 + " " + x1 + "," + yb
                 + " " + x1 + "," + y1
                 + "L" + x3 + "," + y3
                 + "C" + x3 + "," + yd
                 + " " + x2 + "," + yc
                 + " " + x2 + "," + y2
                 + "L" + x0 + "," + y0
          }

          link.curvature = function(_) {
            if (!arguments.length) return curvature;
            curvature = +_;
            return link;
          };
          return link;
        };
        var path = link_func();


        var origin_data = params.config.series[0].data;
        synteny_draw(origin_data, 0);
        if (restore_list == undefined){
            draw_band(); // draw_band
        };

        if (restore_list != undefined){
            var _diffX = "";
            var _diffY = "";
            for (var k = 0; k < restore_list.length; k++){
                var _diffX = restore_list[k].diffx;
                var _diffY = restore_list[k].diffy;
                var classname = restore_list[k].obj
                var obj_new = d3.select('#'+params.id).select(".sangerchart-group-1").select("." + restore_list[k].obj)
                var index = obj_new._groups[0][0].attributes.class.nodeValue.split("_")[1];
                if (obj_new._groups[0][0].attributes.hasOwnProperty('x')) {
                  obj_new._groups[0][0].removeAttribute('x');
                }
                if (obj_new._groups[0][0].attributes.hasOwnProperty('y')) {
                  obj_new._groups[0][0].removeAttribute('y');
                }
                if (obj_new._groups[0][0].attributes.hasOwnProperty('transform')) {
                    obj_new.attr("transform","translate("+ (restore_list[k].x - _diffX) +","+ (restore_list[k].y - _diffY) +")")
                        .style("cursor","default");
                    d3.select('#'+params.id).select(".rect_select_"+ classname).attr("transform","translate("+ (restore_list[k].x - _diffX + params.config.chart.margin.left) +","+ (restore_list[k].y - _diffY + params.config.chart.margin.top) +")")
                        .style("cursor","default");
                }

                d3.select('#'+params.id).select(".sangerchart-series-group").selectAll(".link").remove() // delete all link and redraw later

            var item_modified1 = link_data_list_list[0].map(function(d,i){
                                                                     if(d.target == classname){
                                                                         d.line_data.dt0 = d.line_data.dt + (restore_list[k].x - _diffX)
                                                                         d.line_data.y10 = d.line_data.y1 + (restore_list[k].y - _diffY);
                                                                         d.line_data.y30 = d.line_data.y3 + (restore_list[k].y - _diffY);
                                                                     };

                                                                     if(d.source == classname){
                                                                         d.line_data.ds0 = d.line_data.ds + (restore_list[k].x - _diffX)
                                                                         d.line_data.y00 = d.line_data.y0 + (restore_list[k].y - _diffY);
                                                                         d.line_data.y20 = d.line_data.y2 + (restore_list[k].y - _diffY);
                                                                     }

                                                                       return d;})
             link_data_list_list[0] = item_modified1;

            }
        };

        draw_link(); // 绘制link。

        var param_tooltip = {
            "tooltip": params.config.tooltip,
            "xScale":  params.xScale,
            "yScale":  params.yScale,
            "chart":   params.config.chart,
            "series":  params.config.series,
            "id": params.id
        };
        $tooltip.draw(param_tooltip);
        var params_build = {};
        params_build.params = params;
        $showArrow.add(params_build, 0, 0, params.config.series[0].visualMap[0].max, params.config.series[0].visualMap[0].min,
            "vertical", params.config.series[0].visualMap[0].visualFillValue, params.config.series[0].visualMap[0].visualType, ["sangerchart-group-0"]);


        function draw_band(){
            var super_name = [];
            var spiece_data_split_data = [];
            var spiece_data_split_data_list = [];
            var spiece_data_split_data_dict = {};
            var spiece_data_dict = {};
            var spiece_data_list = [];
            var spiece_list = []; // spiece information
            var index_boolen1 = true;  // if false，break。
            var index_boolen2 = true;  // if false，break。
            var x = 0;
            var rect_split_data = params.config.series[0].data
            for (var k = 0; k< rect_split_data.length; k++){
                index_boolen1 = true;
                index_boolen2 = true;
                for(var n = 0; n< spiece_data.length; n++){
                    if(rect_split_data[k].sp1 == spiece_data[n].sp){
                        if(rect_split_data[k].chr1 == spiece_data[n].chr){
                            var new_obj = {};
                            new_obj.category = "source";
                            new_obj.sp = rect_split_data[k].sp1
                            new_obj.chr =  rect_split_data[k].chr1
                            new_obj.tooltip = spiece_data[n].tooltip;
                            new_obj.transform_d = spiece_data[n].transform_d;
                            new_obj.chr_start = rect_split_data[k].super1_start;
                            new_obj.chr_end = rect_split_data[k].super1_end;
                            new_obj.super =  rect_split_data[k].super1;
                            new_obj.color = spiece_data[n].color;
                            new_obj.chr_start1 = rect_split_data[k].super2_start;
                            new_obj.chr_end1 = rect_split_data[k].super2_end;
                            new_obj.super1 =  rect_split_data[k].super2;
                            new_obj.sp1 = rect_split_data[k].sp2
                            new_obj.chr1 =  rect_split_data[k].chr2

                            index_boolen1 = false;
                            if(super_name.indexOf(rect_split_data[k].super1) == -1){
                                super_name.push(rect_split_data[k].super1)
                                spiece_data_split_data.push(new_obj)
                            }
                            x+=1
                        }
                    }
                    if (index_boolen1 == false){
                        break;
                    }
                };
=                for(var n = 0; n< spiece_data.length; n++){
                    if(rect_split_data[k].sp2 == spiece_data[n].sp){
                        if(rect_split_data[k].chr2 == spiece_data[n].chr){
                            var new_obj = {};
                            new_obj.category = "target";
                            new_obj.sp = spiece_data[n].sp;
                            new_obj.chr = spiece_data[n].chr;
                            new_obj.tooltip = spiece_data[n].tooltip;
                            new_obj.transform_d = spiece_data[n].transform_d;
                            new_obj.chr_start = rect_split_data[k].super2_start;
                            new_obj.chr_end = rect_split_data[k].super2_end;
                            new_obj.super =  rect_split_data[k].super2;
                            new_obj.color =  spiece_data[n].color;
                            new_obj.chr_start1 = rect_split_data[k].super1_start; // modified by binbinzhao@20200326 添加点击时间后需要使用的数据，这里的1是为了与上面几行不带1的作区分。
                            new_obj.chr_end1 = rect_split_data[k].super1_end;
                            new_obj.super1 =  rect_split_data[k].super1;
                            new_obj.sp1 = rect_split_data[k].sp1
                            new_obj.chr1 =  rect_split_data[k].chr1

                            index_boolen2 = false;
                            x+=1
                            if(super_name.indexOf(rect_split_data[k].super2) == -1){
                                super_name.push(rect_split_data[k].super2)
                                spiece_data_split_data.push(new_obj)
                            }
                        };
                    }
                    if (index_boolen2 == false){
                        break;
                    }
                };
            };
            for(var j = 0; j<spiece_data_split_data.length; j++){
                if(spiece_data_split_data_dict[spiece_data_split_data[j].sp] == undefined){
                    spiece_data_split_data_dict[spiece_data_split_data[j].sp] = []
                };
                spiece_data_split_data_dict[spiece_data_split_data[j].sp].push(spiece_data_split_data[j])
            }

            for(var i =0; i<spiece_data.length -1; i++){
                if(spiece_data[i].sp == spiece_data[i+1].sp){
                    spiece_data_list.push(spiece_data[i])
                }else {
                    spiece_data_list.push(spiece_data[i])
                    spiece_data_dict[spiece_data[i].sp] = spiece_data_list
                    spiece_data_list = []
                    spiece_list.push(spiece_data[i].sp)
                };
            };
            spiece_data_dict[spiece_data[i].sp] = spiece_data_list;
            spiece_list.push(spiece_data[i].sp)
            if(spiece_data[spiece_data.length -1].sp == spiece_data[spiece_data.length -2].sp){
                spiece_data_dict[spiece_data[spiece_data.length -2].sp].push(spiece_data[spiece_data.length -1])
            }else {
                spiece_data_dict[spiece_data[spiece_data.length -1].sp].push(spiece_data[spiece_data.length -1])
                spiece_list.push(spiece_data[i].sp)
            }
            function dragdown(d){
                d3.select(this).style("cursor","default");
                if (d3.select(this)._groups[0][0].attributes.hasOwnProperty('transform')) {
                  _diffX = d3.event.x - d3.select(this)._groups[0][0].attributes.transform.nodeValue.split(',')[0].split('(')[1];
                  _diffY = d3.event.y - d3.select(this)._groups[0][0].attributes.transform.nodeValue.split(',')[1].split(')')[0];
                }
            };

            function dragrestore(d){
                if(params.id){
                    var info_value = {};
                    info_value.x = d3.event.x;
                    info_value.y = d3.event.y;
                    info_value.obj = this.attributes.class.nodeValue;
                    info_value.diffx = _diffX;
                    info_value.diffy = _diffY;
                    info_value_list.push(info_value)
                    $saveloadStorage.updateInfoToParams(params.id, {'type': 'synteny_drag', 'value': info_value_list});
                };
            }
            function dragmove(d){
                var classname = this.attributes.class.nodeValue;
                if (d3.select(this)._groups[0][0].attributes.hasOwnProperty('x')) {
                  d3.select(this)._groups[0][0].removeAttribute('x');
                }
                if (d3.select(this)._groups[0][0].attributes.hasOwnProperty('y')) {
                  d3.select(this)._groups[0][0].removeAttribute('y');
                }
                if (d3.select(this)._groups[0][0].attributes.hasOwnProperty('transform')) {
                    d3.select(this).attr("transform","translate("+ (d3.event.x - _diffX) +","+ (d3.event.y - _diffY) +")")
                        .style("cursor","default");
                    d3.select('#'+params.id).select(".rect_select_"+ classname).attr("transform","translate("+ (d3.event.x - _diffX + params.config.chart.margin.left) +","+ (d3.event.y - _diffY + params.config.chart.margin.top) +")")
                        .style("cursor","default");
                }

                d3.select('#'+params.id).select(".sangerchart-series-group").selectAll(".link").remove() // 删除掉所有的link准备下一步重新绘制。

            var item_modified1 = link_data_list_list[0].map(function(d,i){
                                                                     if(d.target == classname){
                                                                         d.line_data.dt0 = d.line_data.dt + (d3.event.x - _diffX)
                                                                         d.line_data.y10 = d.line_data.y1 + (d3.event.y - _diffY);
                                                                         d.line_data.y30 = d.line_data.y3 + (d3.event.y - _diffY);
                                                                     };

                                                                     if(d.source == classname){
                                                                         d.line_data.ds0 = d.line_data.ds + (d3.event.x - _diffX)
                                                                         d.line_data.y00 = d.line_data.y0 + (d3.event.y - _diffY);
                                                                         d.line_data.y20 = d.line_data.y2 + (d3.event.y - _diffY);
                                                                     }

                                                                       return d;})

                link_data_list_list[0] = item_modified1;
                draw_link();
                var param_tooltip = {
                    "tooltip": params.config.tooltip,
                    "xScale":  params.xScale,
                    "yScale":  params.yScale,
                    "chart":   params.config.chart,
                    "series":  params.config.series,
                    "dataset": params.config.dataset,
                    "id": params.id
                };
                $tooltip.draw(param_tooltip);
                var params_build = {};
                params_build.params = params;
                $showArrow.add(params_build, 0, 0, params.config.series[0].visualMap[0].max, params.config.series[0].visualMap[0].min,
                    "vertical", params.config.series[0].visualMap[0].visualFillValue, params.config.series[0].visualMap[0].visualType, ["sangerchart-group-0"]);  //拖拽后箭头消失问题。
           }
            var drag = d3.drag()
                        .on("drag", dragmove)
                        .on("start",dragdown)
                        .on("end", dragrestore);

           for(var k = 0; k<spiece_list.length; k++){
               var _band = d3.select('#' +params.id)
                               .select(".sangerchart-series-group")
                               .select(".sangerchart-group-1")
                               .append("g")
                               .attr("class", spiece_list[k])
                               .attr("transform", "translate(0,0)")


               // draw split geneme
               var _band_genome = _band
                           .call(drag)
                           .append("g")
                           .attr("class", "genome")
                           .selectAll("path")
                           .data(spiece_data_dict[spiece_list[k]])
                           .enter()
                           .append("path")
                           .attr("class", function(d,i){
                               return "band_" + d.sp + "_" + d.chr
                           })
                           .attr("d", function(d,i){
                               $shape.sgArect.data ={"x": d.transform_d + group_dict_x[d.sp],
                                                     "y": group_dict[d.sp],
                                                     "w": scale_band(d.chr_length) - scale_band(0),
                                                     "h":genome_high,
                                                     "r": 5
                                                   };
                                                   return $shape.sgArect.draw()
                           })
                           .attr("fill", function(d,i){
                               return typeof(d.fill) == "undefined"? params.config.visualmap.visualColorValue[0]: d.fill
                           })
                           .attr("stroke", function(d,i){
                               var color;
                               if(d.hasOwnProperty('stroke') && d.stroke != undefined){color = d.stroke;}
                               else {
                                   color = "none"
                               }
                                return color
                           })
                           .attr("fill-opacity", 0.4)

               var _band_split = _band
                    .append("g")
                    .attr("class", "genome_split")
                    .selectAll("path")
                    .data(spiece_data_split_data_dict[spiece_list[k]])
                    .enter()
                    .append("path")
                    .attr("class", function(d,i){
                        return "band_" + d.sp + "_" + d.chr + "_" + d.super

                    })
                    .attr("d", function(d,i){
                        $shape.sgArect.data ={"x": d.transform_d + group_dict_x[d.sp] + scale_band(d.chr_start),
                                              "y": group_dict[d.sp],
                                              "w": scale_band(d.chr_end) - scale_band(d.chr_start),
                                              "h":genome_high,
                                              "r": 5
                                            };
                                            return $shape.sgArect.draw()
                    })
                    .attr("fill", function(d,i){
                        return typeof(d.fill) == "undefined"? params.config.visualmap.visualColorValue[0]: d.fill
                    })
                    .attr("stroke", function(d,i){
                        var color;
                        if(d.hasOwnProperty('stroke') && d.stroke != undefined){var color = d.stroke;}
                        else{
                            color = "none"
                        }
                         return color
                    })
                    .attr("fill-opacity", 0)
                    .on("mouseover.synteny", function(){
                        var spiece = d3.select(this)._groups[0][0].__data__.sp
                        var super1 = d3.select(this)._groups[0][0].__data__.super
                        var chr = d3.select(this)._groups[0][0].__data__.chr
                        var link_data = d3.selectAll('#'+params.id).select(".link_" + spiece + "_" + chr + "_" + super1)._groups[0][0].__data__;
                        d3.select(this).attr("fill-opacity", 1);
                        d3.select('#'+params.id).selectAll(".link_" + spiece + "_" + chr  + "_" + super1).attr("fill-opacity", 1)
                        if(link_data.source == spiece){
                            d3.select('#'+params.id).selectAll(".band_"+ link_data.target + "_" + link_data.chr2 + "_" + link_data.super2).attr("fill-opacity", 1)

                        }else{
                            d3.select('#'+params.id).selectAll(".band_"+ link_data.source + "_" + link_data.chr1 + "_" + link_data.super1).attr("fill-opacity", 1)

                        }
                    })
                    .on("mouseout.synteny", function(){
                        var super1 = d3.select(this)._groups[0][0].__data__.super
                        var spiece = d3.select(this)._groups[0][0].__data__.sp
                        var chr = d3.select(this)._groups[0][0].__data__.chr
                         d3.select(this).attr("fill-opacity", 0);
                         d3.select('#'+params.id).selectAll(".link_" + spiece + "_" + chr + "_" + super1).attr("fill-opacity", 0.4)
                         var link_data = d3.selectAll('#'+params.id).select(".link_" + spiece + "_" + chr + "_" + super1)._groups[0][0].__data__;
                         if(link_data.source == spiece){
                             d3.select('#'+params.id).selectAll(".band_"+ link_data.target + "_" + link_data.chr2 + "_" + link_data.super2).attr("fill-opacity", 0)
                         }else{
                             d3.select('#'+params.id).selectAll(".band_"+ link_data.source + "_" + link_data.chr1 + "_" + link_data.super1).attr("fill-opacity", 0)
                         }

                    })
               var showData = "synteny";
               $textInteractive.action(_band_split, params.id, 'click', '300', "100", 'synteny_div_names', showData, true);  //将相关信息在页面展示出来

               var _band_text = _band
                      .append("g")
                      .attr("class", "genome_name")
                      .selectAll("text")
                      .data(spiece_data_dict[spiece_list[k]])
                      .enter()
                      .append("text")
                      .attr("class", "synteny_text_1_None")
                      .text(function(d,i){
                          return d.chr
                      })
                      .attr("x", function(d,i){
                          return (d.transform_d + group_dict_x[d.sp] + 1/2*scale_band(d.chr_length))
                      })
                      .attr("y", function(d,i){
                          return (genome_high*1/2 + group_dict[d.sp])
                      })
                      .style("font-family", function(d){d.itemStyle == undefined? d.itemStyle = {}: d.itemStyle = d.itemStyle;
                          return d.itemStyle.fontFamily != undefined ? d.itemStyle.fontFamily : ""})
                      .attr("font-size", function(d){return d.itemStyle.fontSize != undefined ? d.itemStyle.fontSize : 20})
                      .style("font-weight", function(d){return d.itemStyle.fontWeight != undefined ? d.itemStyle.fontWeight : ""})
                      .attr("fill", function(d){return d.itemStyle.fill != undefined ? d.itemStyle.fill : ""})
                      .style("font-style", function(d){return d.itemStyle.fontStyle != undefined ? d.itemStyle.fontStyle : ""})
                      .attr("text-anchor", "middle")
                      .attr("dominant-baseline", "middle");

               var _thisrect_synteny = d3.select('#'+params.id)
                                 .select("svg")
                                 .append("g")
                                 .attr("transform","translate(" + params.config.chart.margin.left + "," + params.config.chart.margin.top + ")")
                                 .attr("class", "rect_select_" +  spiece_list[k])

            // 添加文字选中框。

                   var _thisrect_text = _thisrect_synteny
                                       .append("g")
                                       .attr("class", "rect_text")
                                       .selectAll("rect")
                                       .data(spiece_data_dict[spiece_list[k]])
                                       .enter()
                                       .append("rect")
                                       .attr("id", ".synteny_text_1_None")
                                       .attr("x", function(d,i){
                                           var g_text = d3.select('#'+params.id).select(".sangerchart-group-0")
                                           return (d.transform_d + group_dict_x[d.sp] + 1/2*scale_band(d.chr_length) - 1/2*($text_size.text_widthbyBBox(g_text, d.chr, 20, "Arial")))
                                       })
                                       .attr("y", function(d,i){
                                           return (group_dict[d.sp] -20)
                                       })
                                       .attr('height', 45)
                                       .attr('width', function(d,i){
                                           var g_text = d3.select('#'+params.id).select(".sangerchart-group-0")
                                           return $text_size.text_widthbyBBox(g_text, d.chr, 20, "Arial")
                                       });

                   $select.action(params.id, _thisrect_text);

           };
        };

        function draw_link(){
            var link_data_list_list_new = [];
            var link_data_list_dict = {};
            var spiece_list = []
            for (var y = 0; y< link_data_list_list[0].length; y++){
                if(link_data_list_dict[link_data_list_list[0][y].source] == undefined){
                    link_data_list_dict[link_data_list_list[0][y].source] = []
                    spiece_list.push(link_data_list_list[0][y].source)
                };
                link_data_list_dict[link_data_list_list[0][y].source].push(link_data_list_list[0][y])
            }
            for (var j = 0; j< spiece_list.length; j++){
                var _link = d3.select('#' +params.id)
                                .select(".sangerchart-series-group")
                                .select(".sangerchart-group-0")
                                .append("g")
                                .attr("class", "link")
                                .selectAll("path")
                                .data(link_data_list_dict[spiece_list[j]])
                                .enter()
                                .append("path")
                                .attr("class", function(d,i){
                                    return "link_" + d.source + "_" + d.chr1 + "_" + d.super1 + " "  + "link_" + d.target + "_" + d.chr2 + "_" + d.super2
                                })
                                .attr("fill", function(d,i){
                                    return colors(d.cdata)
                                })
                                .attr("d", path)
                                .attr("fill-opacity", 0.4)
                                .on("mouseover.synteny", function(){
                                    d3.select(this).attr("fill-opacity", 1);
                                })
                                .on("mouseout.synteny", function(){
                                     d3.select(this).attr("fill-opacity", 0.4);
                                })
            }
        }

        function synteny_draw(origin_data, m){

            var link_data = {};
            var link_data_list = [];
            for (var i =0; i< origin_data.length; i++){
                link_data = {
                    "line_data":{
                        "ds": target_dict_list_dict[params.config.series[m].data[i].sp1][origin_data[i].chr1],
                        "x0": scale_band(origin_data[i].chr1_start) + group_dict_x[params.config.series[m].data[i].sp1],
                        "y0": group_dict[params.config.series[m].data[i].sp1] + genome_high,
                        "x1": scale_band(origin_data[i].chr2_start) + group_dict_x[params.config.series[m].data[i].sp2],
                        "y1": group_dict[params.config.series[m].data[i].sp2],
                        "dt": target_dict_list_dict[params.config.series[m].data[i].sp2][origin_data[i].chr2],
                        "x2": scale_band(origin_data[i].chr1_end) + group_dict_x[params.config.series[m].data[i].sp1],
                        "y2":  group_dict[params.config.series[m].data[i].sp1] + genome_high,
                        "x3": scale_band(origin_data[i].chr2_end) + group_dict_x[params.config.series[m].data[i].sp2],
                        "y3": group_dict[params.config.series[m].data[i].sp2],
                        "dt0": undefined, // use the value when drag
                        "ds0": undefined, // use the value when drag
                        "y00": undefined,
                        "y10": undefined,
                        "y20": undefined,
                        "y30": undefined,
                    },
                    "chr1":origin_data[i].chr1,
                    "chr2":origin_data[i].chr2,
                    "super1":origin_data[i].super1,
                    "super2":origin_data[i].super2,
                    source: params.config.series[m].data[i].sp1,
                    target: params.config.series[m].data[i].sp2,
                    tooltip: origin_data[i].tooltip,
                    cdata:  origin_data[i].value,
                }
                    link_data_list.push(link_data)
            }
            link_data_list_list.push(link_data_list)


        }

     },

 };
