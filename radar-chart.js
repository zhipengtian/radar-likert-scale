var size = 300;
var lvl = 5;
var vals = ['', 'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']

var RadarChart = {
  draw: function(id, d, options){
    var cfg = {
      radius: 7,    // radius of dots
      w: size,
      h: size,
      factor: 1,    // for frame
      factorLegend: 0.90,
      levels: lvl,    // level of frames
      maxValue: lvl,
      radians: 2 * Math.PI,
      opacityArea: 0.5,
      ExtraWidthX: 200,
	  ExtraWidthY: 200,
      color: d3.scale.category10()
    };
    if('undefined' !== typeof options){
      for(var i in options){
        if('undefined' !== typeof options[i]){
          cfg[i] = options[i];
        }
      }
    }

    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d.map(function(o){return o.value}))); 
    var allAxis = (d.map(function(i, j){return i.axis}));
    var total = allAxis.length;    
    var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);

    // initialize canvas    
    d3.select(id).select("svg").remove();
    var g = d3.select(id).append("svg").attr("width", cfg.w + cfg.ExtraWidthX).attr("height", cfg.h * 0.86 + cfg.ExtraWidthY).append("g");

    var tooltip;

    drawFrame();
    var minAxisValues = [];
    var maxAxisValues = [];
    drawAxis();
    var dataValues = [];
    reCalculatePoints();
    
    var areagg = initPolygon();
    drawPoly();
	
    drawnode();

    // frame
    function drawFrame(){
      for(var j=0; j<cfg.levels; j++){
        var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
        var color = "#E2E2EB";
        g.selectAll(".levels").data(allAxis).enter().append("svg:line")
         .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
         .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
         .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
         .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
         .attr("class", "line").style("stroke", color).style("stroke-width", "1.5px").attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
         g.attr("transform","translate(0,15)");
      }
    }
    
    // axises
    function drawAxis(){
      var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");

      axis.append("line")
          .attr("x1", cfg.w/2)
          .attr("y1", cfg.h/2)
          .attr("x2", function(j, i){
            maxAxisValues[i] = {x:cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total)), y:0};
            minAxisValues[i] = {x:cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total)), y:0};
            minAxisValues[i].x = (minAxisValues[i].x - size / 2) / lvl;
            return maxAxisValues[i].x;
          })
          .attr("y2", function(j, i){
            maxAxisValues[i].y = cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));
            minAxisValues[i].y = (size / 2 - maxAxisValues[i].y) / lvl;
            return maxAxisValues[i].y;
          })
          .attr("class", "line").style("stroke", "E2E2EB").style("stroke-width", "1.5px");

      axis.append("text")
      	  .attr("class", "legend")
          .text(function(d){return d})
          .style("font-family", "sans-serif")
          .style("font-size", "15px")
          .attr("transform", function(d, i){return "translate(0, -10)";})
          .attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-20*Math.sin(i*cfg.radians/total);})
          .attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))+20*Math.cos(i*cfg.radians/total);});
    }

    // calculate points to be drawn
    function reCalculatePoints(){
      g.selectAll(".nodes")
        .data(d, function(j, i){
          var maxX = maxAxisValues[i].x - size / 2;
          dataValues[i] =
          [
            cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
            cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total)),
          ];
        });
      dataValues[d[0].length] = dataValues[0];
    }

    // initialize polygon
    function initPolygon(){
      return g.selectAll("area").data([dataValues])
                .enter()
                .append("polygon")
                .attr("class", "radar-chart-serie0")
                .style("stroke-width", "2px")
                .style("stroke", cfg.color(0))
                .on('mouseover', function (d){
                  z = "polygon."+d3.select(this).attr("class");
                  g.selectAll("polygon").transition(200).style("fill-opacity", 0.1); 
                  g.selectAll(z).transition(200).style("fill-opacity", 0.7);
                })
                .on('mouseout', function(){
                  g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
                })
                .style("fill", function(j, i){return cfg.color(0);})
                .style("fill-opacity", cfg.opacityArea);
    }

    // draw polygon
    function drawPoly(){
      areagg.attr("points",function(de) {
          var str="";
          for(var pti=0;pti<de.length;pti++){
            str=str+de[pti][0]+","+de[pti][1]+" ";
          }            
          return str;
        });
    }
    
    // draw dots
    function drawnode(){
      for (var val = 1; val <= cfg.maxValue; val++) { 
      var color = cfg.color(0);
        switch(val) {
	      case 1:
	      	color = "#FF4D4D";
	      	break;
	      case 2:
	      	color = "#FF9933";
	      	break;
	      case 3:
	      	color = "#FFFF66";
	      	break;
	      case 4:
	      	color = "#CCFF66";
	      	break;
	      case 5:
	      	color = "#00CC00";
	      	break;
        } 
      g.selectAll(".nodes")
        .data(d).enter()
        .append("svg:circle").attr("class", "radar-chart-serie0")
        .attr('r', cfg.radius)
        .attr("alt", function(j){return Math.max(val, 0);})
        .attr("cx", function(j, i){
          return cfg.w/2*(1-(Math.max(val, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
        })
        .attr("cy", function(j, i){
          return cfg.h/2*(1-(Math.max(val, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
        })
        .attr("data-id", function(j){return j.axis;})
        .style("fill", color).style("fill-opacity", 0.9)
        .on('mouseover', function (d){
                    newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                    newY =  parseFloat(d3.select(this).attr('cy')) - 5;
                    level = d3.select(this).attr('alt');
                    tooltip.attr('x', newX).attr('y', newY).text(vals[level]).transition(200).style('opacity', 1);
                    z = "polygon."+d3.select(this).attr("class");
                    g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
                    g.selectAll(z).transition(200).style("fill-opacity", 0.7);
                  })
        .on('mouseout', function(){
                    tooltip.transition(200).style('opacity', 0);
                    g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);  
                  })
        .on('click', clickPoint)
        .append("svg:title")
        .style("cursor","hand")
        .text(function(j){return Math.max(val, 0)});
	  }
    }
    
    //Tooltip
    tooltip = g.append('text').style('opacity', 0).style('font-family', 'sans-serif').style('font-size', 13);
    
    function clickPoint(dobj, i){
      this.parentNode.appendChild(this);
      var dragTarget = d3.select(this);
      var id = dragTarget.attr("data-id");
      var order = dragTarget.data()[0].order;
      var oldData = d[order].value;
      
      // reset axises to facilitate slope calculation later
      var oldX = dataValues[i][0] - size / 2;
      var oldY = size / 2 - dataValues[i][1];
      var newX = parseFloat(dragTarget.attr("cx")) - size / 2;
      var newY = size / 2 - parseFloat(dragTarget.attr("cy"));  
      var newValue = 0;
      var minX = minAxisValues[i].x;
      var minY = minAxisValues[i].y;
      var maxX = maxAxisValues[i].x - size / 2;
      var maxY = size / 2 - maxAxisValues[i].y;

      // when slope is infinity
      if(oldX == 0) {
        newValue = (newY/oldY) * oldData;
      }
      else
      {
        var slope = oldY / oldX;   // slope      
        newY = newX * slope;

        var ratio = newX / oldX; // calculate new values using similar triangles theory
        newValue = ratio * oldData;
      }
      // Set values
      newValue = newValue;
      d[order].value=newValue;
      
      // display user's input
      document.getElementById('input_' + order).value = vals[newValue];
      
      // redraw polygon
      reCalculatePoints();
      drawPoly();
    }
  }
};