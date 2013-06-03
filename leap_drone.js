try{
var context = new webkitAudioContext(),
_x, _y;
}
catch(err){
alert("this uses the web audio API, try opening it in google chrome \n\n <3 whichlight" );

}

var synths = {}
var gainVal = 0.1;

var svg = d3.select("body").append("svg:svg");

function particle(x, y, z) {
  svg.append("svg:circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", function(){
          var r = 1e-6 + (y / 20)
          if(r<1){r=1;}
        return r;})
      .style("stroke", "green")
    .style("stroke-width", "10px")
      .style("fill", "none")
      .style("stroke-opacity", 1-(1- ((500 -z) / 1000)))
    .transition()
      .duration(1000)
      .ease(Math.sqrt)
      .attr("r", function(){
            if(y<1){return 1;}
            return y;})
      .style("stroke-opacity", 1e-6)
      .remove();
}

function setupSynth(){
    var nodes={};
    nodes.source = context.createOscillator();
    nodes.source.type=2;
    nodes.filter = context.createBiquadFilter();
    nodes.volume = context.createGainNode();
    nodes.filter.type=0; //0 is a low pass filter

    nodes.volume.gain.value = 0;
    nodes.source.connect(nodes.filter);
    nodes.filter.connect(nodes.volume);
    //frequency val
    nodes.filter.frequency.value=2000;
    nodes.volume.connect(context.destination);
    return nodes;
}


function synthmap(z,y){
    tz = 6*(360 - z)
    ty = 200+Math.pow(2.5,($(window).height()-y)/72.0);
    return [tz,ty]
}


$(document).ready(function() {
  Leap.loop(function(frame) {
      onsynth = [];
      for (var i = 0; i < frame.pointables.length; i++) {
        var pointer = frame.pointables[i];
        var posX = window.innerWidth/2 + 3*(pointer.tipPosition[0]);
        var posY = window.innerHeight -150 - (pointer.tipPosition[1]);
        var posZ = 180+ (pointer.tipPosition[2]);

        //adding d3 circle
        particle(posX, posY, posZ);

        //set up synth if it doesnt exist
        if (!(pointer.id in synths)){
            var n = setupSynth();
            n.source.noteOn(0);
            synths[pointer.id]=n;
        }

        //update synth
        var freq=  synthmap(posZ,posY);
        synths[pointer.id].source.frequency.value = freq[1]
        synths[pointer.id].filter.frequency.value = freq[0]
        onsynth.push(pointer.id);
      }

     for (var s in synths){
             synths[s].volume.gain.value=0;
      }

     //only play ones that are on
      for (var s in onsynth){
            synths[onsynth[s]].volume.gain.value=gainVal;
      }



  });
})

