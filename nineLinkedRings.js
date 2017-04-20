//=============================================================================
// Nine Linked Rings
//
// include files: kinetic-v4.5.0.js (http://kineticjs.com/)
//
// V1.2
// 05/10/2013 - move to kineticJS 4.5.0 for fixed hints problem
//              with Chrome 26.0.1410.64 m
//
// V1.1
// 03/30/2013 - (1) fixed chrome 26.0 can not work problem
//              (2) separate mouse event from glinkedRingLayer 
//
// 01/16/2013 - add display ring number
// 11/05/2012 - create by Simon Hung
//=============================================================================

//==========
// define
//==========

var versionString="1.2"

var maxRingDeep = 3;
var ringAngle = 1/5*Math.PI;  //36 degree, 

var BACKGROUND_COLOR = "#FAFAD2"; //Light Goldenrod Yellow
var TITLE_COLOR = "black";
var LINE_COLOR = "black";
var BAR_COLOR = "#99CCFF";

var STRICK_COLOR = "yellow";
var ENDING_BALL_COLOR = "#EB6009";


var RING_COLOR = [ "#66FF66", "#B266FF", "#66FFFF", "#FF66FF", 
                   "#66B2FF", "#FFB266", "#6666FF", "#FF66B2", "#FF6666" ]; 

/* color for write web page only
var RING_COLOR = [   "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#66FF66", "#FF6666" ]; 
*/
				   
var HANDLE_BAR_COLOR1 = "#FA9BA8";
var HANDLE_BAR_COLOR2 = "#FCB1BD";
var SIGN_COLOR = "red"				   
var BAR_BOARD_FILL_COLOR = "#FCFCF8"; //closed to white
var BAR_BOARD_STROKE_COLOR = "#8899AA"; 	

//------------------
// global variable
//------------------
var numOfRings = 5; //number of rings 
var playMode = 0;   //0:goal for all rings down, 1:goal for all rings up

var timeLevel = 2;  //medium
var timeUnit = [ 1, 20, 50, 100, 300 ]; //very fast, fast, medium, slow, very slow
var timeOut;

var gMouseLayer; //mouse event layer (separate from glinkedRingLayer 3/30/2013)
var gStage, gBackgroundLayer, glinkedRingLayer, gMessageLayer; //stage & layer
var gRingNumberLayer; //for display ring number 
var ringInitState, ringWorkState, ringDrawState; //ring initial state, work state and draw state

var glinedRingObject = []; //for ring, stick and bar
var gBarObject;            //for half-circle bar 
var gClickArea = [];       //for click area 

var SCREEN_X, SCREEN_Y; //browser screen X Y
var	STAGE_X, STAGE_Y; //kinetic stage X Y
var sizeUnit; //size unit for fixed to screen size
var titleFontSize; //title font size
var ringDistanceX, ringDistanceY; //ring x Y distance
var startRingX, startRingY; //ring start X Y
var stickLength; //ring stick length

var barLength, leftBarLength; //bar length for one ring, and leftmost bar length 

var ringWidth, ringHigh; //ring radius X Y
var ringX, ringY; //2*X = ring X length, 2*Y = ring Y length 	

var barCenterY;
var bar0Stroke1Y, bar0FillY, bar0Stroke2Y;
var bar1Stroke1Y, bar1FillY, bar1Stroke2Y;

var barBoardOffsetY; //bar board start Y	

var textSuccess = "success";		   
				   
window.onload = function(){
	init();
};

function init()
{
	//just for fixed: chrome sets cursor to text while dragging, why?
	//http://stackoverflow.com/questions/2745028/chrome-sets-cursor-to-text-while-dragging-why
	//This will disable any text selection on the page and it seems that browser starts to show custom cursors.
	document.onselectstart = function(){ return false; } ;

	restoreRingsInfo();
	initScreenXY();
	initLanguage();
	initButton();

	createStageLayer();
	initRingState();
	createLinkedRings();
}

//------------------------------------
// get screen X Y and init stage X Y	
//------------------------------------
function initScreenXY()
{
	var screenWidth = 0, screenHeight = 0;
	
	//----------------------------------------------------------------------
	// Window size and scrolling:
	// URL: http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
	//----------------------------------------------------------------------
	if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
	} else if((document.documentElement) && 
		      (document.documentElement.clientWidth || document.documentElement.clientHeight ) ) 
	{
		//IE 6+ in 'standards compliant mode'
		screenWidth = document.documentElement.clientWidth;
		screenHeight = document.documentElement.clientHeight;
	} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
		screenWidth = document.body.clientWidth;
		screenHeight = document.body.clientHeight;
	}
	SCREEN_X = screenWidth;
	SCREEN_Y = screenHeight;
	
	STAGE_X = SCREEN_X-10;
	STAGE_Y = SCREEN_Y-10;
	
	titleFontSize = Math.floor(STAGE_Y/12);
}

//-------------------------------------------------------------------
// initial button language to traditional chinese if system support
//-------------------------------------------------------------------
function initLanguage()
{
	var sysLang = getSystemLanguage();

	if(sysLang == "zh-tw" || sysLang == "zh-hk") { //tranditional chinese
		document.getElementById('textRings').innerHTML = "\u74B0\u6578:"; //"環數:";
		
		document.getElementById('textMode').innerHTML = "\u904A\u6232\u6A21\u5F0F:"; //"遊戲模式:";
		var modeOption = document.getElementById('mode').options;
		modeOption[0].innerHTML = "\u74B0\u5168\u4E0B"; //"環全下";	
		modeOption[1].innerHTML = "\u74B0\u5168\u4E0A"; //"環全上";

		document.getElementById('textSpeed').innerHTML = "\u901F\u5EA6:"; //"速度:";
		var speedOption = document.getElementById('speed').options;
		speedOption[0].innerHTML = "\u975E\u5E38\u5FEB"; //"非常快";	
		speedOption[1].innerHTML = "\u5FEB"; //"快";
		speedOption[2].innerHTML = "\u9069\u4E2D"; //"適中";
		speedOption[3].innerHTML = "\u6162"; //"慢";
		speedOption[4].innerHTML = "\u975E\u5E38\u6162"; //"非常慢";
		
		document.getElementById('reset').value = "\u91CD\u7F6E"; //"重置";
		document.getElementById('random').value = "\u96A8\u6A5F"; //"隨機";
		document.getElementById('hints').value = "\u63D0\u793A"; //"提示";
		document.getElementById('auto').value = "\u81EA\u52D5"; //"自動";
		document.getElementById('stop').value = "\u505C\u6B62"; //"停止";
		
		textSuccess = "\u5B8C\u6210"; //"完成";
	}	
}

//--------------------------
// initial button position
//--------------------------
function initButton()
{
	var fontSize =  Math.floor(titleFontSize/4);
	var table = document.getElementById("selectTable");
	var tableWidth, tableHigh;
	
	if(fontSize < 9) fontSize = 9;
	
	//initial input 
	document.getElementById('rings').value = numOfRings;
	document.getElementById('mode').value = playMode;
	document.getElementById('speed').value  = timeLevel;	

	var div = document.getElementById('selectDiv');
	for (var i = 0, row; row = table.rows[i]; i++) {
		for (var j = 0, col; col = row.cells[j]; j++) {
			//col.style.fontSize = fontSize + "px";
			col.style.cssText = "font:" + fontSize + "px;";
		}  
	}
	document.getElementById('textRings').style.cssText = "font-size:" + (fontSize+1) + "px; visibility: visible;";
	document.getElementById('textMode').style.cssText =  "font-size:" + (fontSize+1) + "px; visibility: visible;";
	document.getElementById('textSpeed').style.cssText = "font-size:" + (fontSize+1) + "px; visibility: visible;";
	
	document.getElementById('rings').style.cssText = "font-size:" + fontSize + "px; visibility: visible;";
	document.getElementById('mode').style.cssText = "font-size:" + fontSize + "px; visibility: visible;";
	document.getElementById('speed').style.cssText = "font-size:" + fontSize + "px; visibility: visible;";

	tableWidth = table.offsetWidth;
	tableHigh = table.offsetHeight;
	//alert(fontSize + " " + tableWidth + " " + tableHigh );
	
	div.style.cssText = "top: 5px; left:" + (SCREEN_X - tableWidth-5) + "px; position: absolute; visibility: visible;"	

	var buttonWidth = tableWidth*5/12;
	var buttonHigh = 20+fontSize;
	var buttonX = SCREEN_X - buttonWidth - 20;
	var buttonY = SCREEN_Y-buttonHigh*4-60;

	//alert(fontSize);
	var div = document.getElementById('resetDiv');
	var obj = document.getElementById('reset');
	div.style.cssText="top:" + buttonY + "px; left:" + buttonX + "px; position: absolute;";
	obj.style.cssText="width:" +  buttonWidth + "px; font-size:" +  fontSize +"px;  visibility: visible;";	
	
	var div = document.getElementById('randomDiv');
	var obj = document.getElementById('random');
	div.style.cssText="top:" + (buttonY+buttonHigh) + "px; left:" + buttonX + "px; position: absolute;";
	obj.style.cssText="width:" +  buttonWidth + "px; font-size:" +  fontSize +"px;  visibility: visible;";	

	var div = document.getElementById('hintsDiv');
	var obj = document.getElementById('hints');
	div.style.cssText="top:" + (buttonY+buttonHigh*2+20) + "px; left:" + buttonX + "px; position: absolute;";
	obj.style.cssText="width:" +  buttonWidth + "px; font-size:" +  fontSize +"px;  visibility: visible;";	
	
	var div = document.getElementById('autoDiv');
	var obj = document.getElementById('auto');
	div.style.cssText="top:" + (buttonY+buttonHigh*3+20) + "px; left:" + buttonX + "px; position: absolute;";
	obj.style.cssText="width:" +  buttonWidth + "px; font-size:" +  fontSize +"px;  visibility: visible;";	

	var div = document.getElementById('stopDiv');
	var obj = document.getElementById('stop');
	div.style.cssText="top:" + (buttonY+buttonHigh*3+20) + "px; left:" + buttonX + "px; position: absolute;";
	obj.style.cssText="width:" +  buttonWidth + "px; font-size:" +  fontSize +"px; visibility: visible;";	
	
}

//-------------------------------------
// create stage and layer  (KineticJS) 
//-------------------------------------
function createStageLayer()
{
	//create stage object
	gStage = new Kinetic.Stage({
		container: 'container',
		width: STAGE_X,
		height: STAGE_Y
	});
	
	//create layer object
	gBackgroundLayer  = new Kinetic.Layer();
	glinkedRingLayer = new Kinetic.Layer();
	gMessageLayer = new Kinetic.Layer();
	gRingNumberLayer = new Kinetic.Layer(); //for display ring number 
	gMouseLayer = new Kinetic.Layer();
}

//------------------------------------------------
// Remove child node of stage & layer (KineticJS)
//------------------------------------------------
function clearStageLayer()
{
	gStage.removeChildren(); 
	
	gBackgroundLayer.removeChildren();
	glinkedRingLayer.removeChildren();
	gMessageLayer.removeChildren();
	gRingNumberLayer.removeChildren(); //for display ring number 
	gMouseLayer.removeChildren();
}

//--------------------------------------
// base on playMode to init ring state
//--------------------------------------
function initRingState()
{
	var ringInitValue;
	var maxRings = RING_COLOR.length;

	if(playMode) ringInitValue = 0; //init all rings down
	else ringInitValue = 1; //init all rings up
	
	ringInitState = [];
	for(var i = 0; i < maxRings; i++) {
		ringInitState[i] = ringInitValue;
	}
}

//-------------------------
// random the ring state
//-------------------------
function randomRingState()
{
	var maxRings = RING_COLOR.length;
	
	ringInitState = [];
	for(var i = 0; i < maxRings; i++) {
		ringInitState[i] = Math.floor(Math.random()*2); //0 or 1
	}
	ringInitState[numOfRings-1] = playMode?0:1; //last ring should be init state
}

//----------------------------
// create Nine Linked Rings
//----------------------------
function createLinkedRings()
{	
	initGlobalVariable();
	clearStageLayer();
	initRingWorkState();
	
	createBackground();
	
	var leftRingId = getLeftmostUpperRing();
	if(leftRingId < 0) leftRingId = 1; //if no upper rings assume bar at id = 1

	for(var id = numOfRings-1; id >= 0; id--) {
		createRing(id, leftRingId);
	}
	createCircleBar();
	createFrontBoard();
	for(var id = 0; id < numOfRings; id++) {
		createClickArea(id);
		gMouseLayer.add(gClickArea[id]);
	}
	
	gStage.add(gBackgroundLayer);
	gStage.add(glinkedRingLayer);
	gStage.add(gMessageLayer);	
	gStage.add(gRingNumberLayer); //for display ring number 
	gStage.add(gMouseLayer);
	
	enableAllInput();
	displaySteps();
	showRingBarNumber(); //for display ring number 
}

//------------------------------------------
// base on screen size to initial variable
//------------------------------------------
function initGlobalVariable()
{
	var boundX, boundY;
	var needBreak = 0;
	
	for(sizeUnit = 13; sizeUnit > 2; sizeUnit--) {
		ringDistanceX = sizeUnit * 8;
		ringDistanceY = sizeUnit * 7;
		
		ringWidth =sizeUnit*7;
		ringHigh = sizeUnit*4;
		ringX = Math.cos(ringAngle)*ringWidth;
		ringY = Math.sin(ringAngle)*ringWidth;
	
		stickLength = (maxRingDeep+2) * ringDistanceY + ringY;
		
		boundX = (numOfRings+1.5) * ringDistanceX
		boundY =  ringDistanceY*3/2 +  stickLength + sizeUnit*2;
		if(needBreak == 1) break; //max - 1
		
		if(boundX <=  STAGE_X *8/10 && boundY <= STAGE_Y) {
			needBreak++;
			//if(numOfRings == 9) break; //max
		}
	}
	
	if( STAGE_X - (numOfRings+1)*ringDistanceX > ringDistanceX*4) {
		startRingX =  (STAGE_X - ((numOfRings+1) * ringDistanceX)) /2;
	} else {
		startRingX =  (STAGE_X-boundX)/4 + ringDistanceX*1.5; 
	}
		
	startRingY =  (STAGE_Y-boundY)/4 + ringDistanceY*3/2; 
	
	barLength = ringDistanceX;
	leftBarLength = ringDistanceX*3/5;

	barCenterY   = startRingY+ringY+sizeUnit/2;
	bar0Stroke1Y = barCenterY-sizeUnit*5/2+1;
	bar0FillY    = barCenterY-sizeUnit*2;
	bar0Stroke2Y = barCenterY-sizeUnit*3/2-1;

	bar1Stroke1Y = barCenterY+sizeUnit*3/2+1;
	bar1FillY    = barCenterY+sizeUnit*2;
	bar1Stroke2Y = barCenterY+sizeUnit*5/2-1;	

	barBoardOffsetY = startRingY + maxRingDeep * ringDistanceY + (ringY+1)*2;

	setTimeOutValue();	
}

//------------------------------------------------------------
//convert ring state to draw state
// 
// ring state = 1: up, 0:down
// draw state = 0: on the bar (up), 
//              [1..maxRingDeep]: under the bar (down)
//------------------------------------------------------------
function initRingWorkState()
{
	var drawValue;
	
	ringDrawState = [];
	ringWorkState = [];
	for(var i = numOfRings-1; i >= 0; i--) {
		if(ringInitState[i]) drawValue = 0;
		else {
			if(i == numOfRings-1) drawValue = maxRingDeep;
			else drawValue = ringDrawState[i+1] >= maxRingDeep? maxRingDeep: ringDrawState[i+1]+1;
		}
		ringDrawState[i] = drawValue;
		ringWorkState[i] = ringInitState[i];
	}
}

//----------------------------------------------------
// Create background color, title and back-bar-board
//----------------------------------------------------
function createBackground()
{
	var background = new Kinetic.Rect({
		x: 0,
		y: 0,
		width: STAGE_X,
		height: STAGE_Y,
		fill: BACKGROUND_COLOR
	});	
	
	var titleText = new Kinetic.Text({
		x: titleFontSize/4, 
		y: titleFontSize/4,
		text: "\u4E5D \u9023 \u74B0", //九連環
		fill: BACKGROUND_COLOR,
		fontSize: titleFontSize*1.4,
		fontStyle:"bold",
	
		shadowColor: TITLE_COLOR,
		shadowBlur: 10,
		shadowOffset: [2, 2],
		shadowOpacity:0.3
	});	
	
	var versionText = new Kinetic.Text({
		x: STAGE_X-titleFontSize/2, 
		y: STAGE_Y-titleFontSize/3,
		text: versionString, 
		fill: BACKGROUND_COLOR,
		fontSize: titleFontSize/3,
		fontStyle:"bold",

		shadowColor: TITLE_COLOR,
		shadowBlur: 9,
		shadowOffset: [2, 2],
		shadowOpacity:0.3		
	});	
	
	var backBarBoard = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var startX = startRingX-ringDistanceX;
			var	endX   = startRingX+numOfRings*ringDistanceX-ringDistanceX/2;
				
			var startY = barBoardOffsetY;
			var width = sizeUnit;

			//draw thickness of back bar board  	
			var context = canvas.getContext();
			context.beginPath();
			for(var i = sizeUnit/2; i >= 0; i--) {
				context.moveTo(startX-width, startY+i)
				context.quadraticCurveTo(startX-width*2, startY+i, startX-width*3/2, startY+width+i);
				context.lineTo(startX-width, startY+2*width+i);
			}
			canvas.fillStroke(this);
	
			//draw back bar board
			context.beginPath();
			context.moveTo(endX+width, startY+2*width+1);
			context.lineTo(endX+width/2, startY+width);
			context.quadraticCurveTo(endX, startY, endX-width, startY);
			context.lineTo(startX-width, startY)
			context.quadraticCurveTo(startX-width*2, startY, startX-width*3/2, startY+width);
			context.lineTo(startX-width, startY+2*width+1);
			//this.fill(context);
			context.fillStyle = BAR_BOARD_FILL_COLOR;
			context.fill();
			canvas.fillStroke(this);
			
			//draw hold for ring stick
			for(var i = 0; i < numOfRings;i++) {
				var cx = startRingX + i * ringDistanceX;
				var cy = startY + 2*width;
				context.beginPath();
				drawEllipse(context,cx, cy, sizeUnit/2+1, sizeUnit/4, 180, 360);
				this.setStrokeWidth(1);
				//this.setFill(LINE_COLOR);
				context.fillStyle = LINE_COLOR;
				this.setStroke(LINE_COLOR);
				//this.fill(context);
				context.fill();
				canvas.fillStroke(this);
				
			}			
		},
		//fill: BAR_BOARD_FILL_COLOR,
		stroke: BAR_BOARD_STROKE_COLOR,
		strokeWidth: .3			
	});
	
	gBackgroundLayer.add(background); //for background color
	document.body.style.background = BACKGROUND_COLOR; //body background color

	gBackgroundLayer.add(titleText);
	gBackgroundLayer.add(versionText);
	gBackgroundLayer.add(backBarBoard);
}

//--------------------------
// create one ring + stick	
//--------------------------
function createRing(id, leftRingId)
{
	var cx = startRingX + id * ringDistanceX;
	var cy = startRingY + ringDrawState[id] * ringDistanceY;
	var width = sizeUnit;
	var eCX = cx-ringX+width/2;
	var eCY = cy+ringY+width/2;
	
	//create upper bar 
	var bar0 = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			context.beginPath();
			context.moveTo(eCX, bar0Stroke1Y);
			context.lineTo(eCX+barLength, bar0Stroke1Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
			
			context.beginPath();
			context.moveTo(eCX, bar0Stroke2Y);
			context.lineTo(eCX+barLength, bar0Stroke2Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
			
			context.beginPath();
			context.moveTo(eCX-1, bar0FillY);
			context.lineTo(eCX+barLength+1, bar0FillY);
			context.lineWidth = width;
			this.setStrokeWidth(width-1.5);
			this.setStroke(BAR_COLOR);
			canvas.fillStroke(this);			
		}
	});

	//create ring stick
	var ringStick = new Kinetic.Shape({
		x: cx,
		y: cy,
		drawFunc: function(canvas) {
			var outlineWidth = 1;
			var sRadius = width/2;  //small circle
			var bRadius = 1.6 * (width+outlineWidth); //big circle
			var mRadius = (bRadius - 2 * sRadius); //middle circle

			var beginAngle = 0.5 /3; // 30 degree
			var sOffsetX =  -(bRadius - sRadius) * Math.sin(beginAngle*Math.PI);
			var sOffsetY =   (bRadius - sRadius) * Math.cos(beginAngle*Math.PI);

			var context = canvas.getContext();
			//ending ball
			context.beginPath();
			drawEllipse(context, 0, stickLength+width*2, mRadius*2, mRadius*11/6, 0, 360);
			//this.setFill(ENDING_BALL_COLOR);
			context.fillStyle = ENDING_BALL_COLOR;
			this.setStroke(LINE_COLOR);
			//this.fill(context);			
			context.fill();			
			canvas.fillStroke(this);
			
			context.beginPath();

			//draw small half circle, (-60 degree ~ 120 degree)	 [0.5 * PI = 90 degree ], clockwise
			context.arc(sOffsetX,sOffsetY, sRadius, (beginAngle-0.5) * Math.PI, (beginAngle+0.5) * Math.PI, false);
		
			//draw big circle from 120 degree to 390 degree clockwise
			context.arc(0,0, bRadius, (beginAngle+0.5) * Math.PI, (beginAngle+2) * Math.PI, false);

			//draw s sign , to connect with stick
			var startingX = bRadius* Math.cos((beginAngle+2)*Math.PI);
			var	startingY = bRadius* Math.sin((beginAngle+2)*Math.PI);
			var ctlX1 = startingX - width ;
			var	ctlY1 = startingY +  width ;
			var ctlX2 =  startingX - width;
			var ctlY2 =  startingY + width;
			context.bezierCurveTo( ctlX1, ctlY1, ctlX2, ctlY2, width/2, bRadius+width);
		
			//draw stick 
			context.lineTo(width/2, stickLength);
		
			//draw half ball from 0 degree to 180 degree clockwise
			context.arc(0,stickLength + Math.cos(-beginAngle * Math.PI) * width, width/2, 0 * Math.PI, 1 * Math.PI, false);
		
			//draw stick 
			context.lineTo(-width/2, bRadius+width);
		
			//draw s sign , to connect with cycle
			var endingX = mRadius * Math.cos((beginAngle+2)*Math.PI);
			var	endingY = mRadius * Math.sin((beginAngle+2)*Math.PI);
			var ctlX1 =  endingX - width;
			var ctlY1 =  endingY + width;
			var ctlX2 = endingX - width;
			var	ctlY2 = endingY +  width;
			context.bezierCurveTo( ctlX1, ctlY1, ctlX2, ctlY2, endingX, endingY);

			//draw middle circle, from 390 degree - 120 degree, anticlockwise
			context.arc(0, 0, mRadius, (beginAngle+2.0) * Math.PI, (beginAngle+0.5) * Math.PI,  true);
			
			//this.setFill(STRICK_COLOR);
			context.fillStyle = STRICK_COLOR;
			this.setStroke(LINE_COLOR);
			//this.fill(context);
			context.fill();			
			canvas.fillStroke(this);
		},
		strokeWidth: .4
	});
	
	//create lower bar
	var bar1 = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			
			context.beginPath();
			context.moveTo(eCX, bar1Stroke1Y);
			context.lineTo(eCX+barLength, bar1Stroke1Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
			
			context.beginPath();
			context.moveTo(eCX, bar1Stroke2Y);
			context.lineTo(eCX+barLength, bar1Stroke2Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
		
			context.beginPath();
			context.moveTo(eCX-1, bar1FillY);
			context.lineTo(eCX+barLength+1, bar1FillY);
			context.lineWidth = width;
			this.setStrokeWidth(width-1.5);
			this.setStroke(BAR_COLOR);
			canvas.fillStroke(this);			
		}
	});
	
	//create ellipse ring 
	var ellipse = new Kinetic.Shape({
		x: eCX,
		y: eCY,
		drawFunc: function(canvas) {
			var startAngle = 180, endAngle = 460; //for id > 0
			if(id == 0){
				startAngle = 0;
				endAngle = 360;
			}
			var context = canvas.getContext();
			
			context.beginPath();
			drawEllipse(context,0, 0, ringWidth, ringHigh, startAngle, endAngle); 
			this.setStrokeWidth(width-1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
			
			context.beginPath();
			drawEllipse(context, 0, 0, ringWidth, ringHigh, startAngle, endAngle); 
			this.setStrokeWidth(width-2);
			this.setStroke(RING_COLOR[id]);
			canvas.fillStroke(this);			
		},
		rotation:  -ringAngle
	});	

	if(id+1 != numOfRings) {
		var overCX = startRingX + (id+1) * ringDistanceX;
		var overCY = startRingY + ringDrawState[id+1] * ringDistanceY;

		var eOverCX = overCX-ringX+width/2;
		var eOverCY = overCY+ringY+width/2;

		//create ellipse ring overlay part
		var ellipseOver = new Kinetic.Shape({
			x: eOverCX,
			y: eOverCY,
			drawFunc: function(canvas) {
				var context = canvas.getContext();
				
				context.beginPath();
				drawEllipse(context, 0, 0, ringWidth, ringHigh, 100, 180); 
				this.setStrokeWidth(width-1);
				this.setStroke(LINE_COLOR);
				canvas.fillStroke(this);
				
				context.beginPath();
				drawEllipse(context, 0, 0, ringWidth, ringHigh, 90, 190); 
				this.setStrokeWidth(width-2);
				this.setStroke(RING_COLOR[id+1]);
				canvas.fillStroke(this);			
			},
			rotation:  -ringAngle
		});
		glinedRingObject[id+1].ellipseOver = ellipseOver;
	}			
	
	//create hold ring overlay part
	var holdRingOver = new Kinetic.Shape({
		x: cx,
		y: cy,
		drawFunc: function(canvas) {
			var outlineWidth = 1;
			var sRadius = width/2;  //small circle
			var bRadius = 1.6 * (width+outlineWidth); //big circle
			var mRadius = (bRadius - 2 * sRadius); //middle circle

			var beginAngle = 0.5 /3; // 30 degree
			var sOffsetX = -(bRadius - sRadius) * Math.sin(beginAngle*Math.PI);
			var sOffsetY =  (bRadius - sRadius) * Math.cos(beginAngle*Math.PI);

			var context = canvas.getContext();
			
			context.beginPath();
			
			//draw middle circle, from 390 degree - 120 degree, anticlockwise
			context.arc(0, 0, mRadius, (beginAngle+1.5) * Math.PI, (beginAngle+0.5) * Math.PI,  true);
			
			//draw small half circle, (-60 degree ~ 120 degree)	 [0.5 * PI = 90 degree ], clockwise
			context.arc(sOffsetX,sOffsetY, sRadius, (beginAngle-0.5) * Math.PI, (beginAngle+0.5) * Math.PI, false);
		
			//draw big circle from 120 degree to 390 degree clockwise
			context.arc(0, 0, bRadius, (beginAngle+0.5) * Math.PI, (beginAngle+1.5) * Math.PI, false);

			//this.fill(context);
			context.fillStyle = STRICK_COLOR;
			context.fill();			
			
			canvas.fillStroke(this);		
		},
		//fill:STRICK_COLOR,
		stroke: LINE_COLOR,
		strokeWidth: .4
	});

	
	if(id >= leftRingId) glinkedRingLayer.add(bar0);
	glinkedRingLayer.add(ringStick);
	if(id+1 != numOfRings) glinkedRingLayer.add(ellipseOver);
	
	if(id >= leftRingId && ringDrawState[id] == 0) glinkedRingLayer.add(bar1);	//in the bar
	glinkedRingLayer.add(ellipse);
	glinkedRingLayer.add(holdRingOver);
	if(id >= leftRingId && ringDrawState[id] != 0) glinkedRingLayer.add(bar1);	//in the bar
	
	glinedRingObject[id] = { 
		ringStick:ringStick, 
		ellipse:ellipse, 
		holdRingOver:holdRingOver,
		bar0:bar0,
		bar1:bar1
	};

}

function createClickArea(id)
{
	var cx = startRingX + id * ringDistanceX;
	
	//create click area
	var clickArea =  new Kinetic.Shape({
		x: cx,
		y: startRingY,
		drawFunc: function(canvas) {
			var context = canvas.getContext();
			
			context.beginPath();
			context.moveTo(0, -2*sizeUnit);	
			context.lineTo(0, 50*sizeUnit);	
			canvas.fillStroke(this);
		},
		stroke: 'black',
		opacity: 0,
		strokeWidth: sizeUnit*4
	});
	
	clickArea.id = id;
	gClickArea[id] = clickArea;	
}

//---------------------------------
// create left half-circle + bar 
// partition to four part:
// (1) upper-bar 
// (2) upper-1/4-circle
// (3) lower-1/4-circle 
// (4) lower-bar 
//---------------------------------
function createCircleBar()
{
	var width = sizeUnit;
	var leftRing = getLeftmostUpperRing();
	if(leftRing < 0) leftRing = 1; //if no upper rings assume bar at id = 1
	
	var barCX = startRingX + (leftRing-1)*ringDistanceX-ringDistanceX/4;

	//(1) create upper bar
	var upperBar = new Kinetic.Shape({
		x:barCX,
		drawFunc: function(canvas) {
			var context = canvas.getContext();

			context.beginPath();
			context.moveTo(0, bar0Stroke1Y);
			context.lineTo(leftBarLength, bar0Stroke1Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
			
			context.beginPath();
			context.moveTo(0, bar0Stroke2Y);
			context.lineTo(leftBarLength, bar0Stroke2Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
		
			context.beginPath();
			context.moveTo(-.5, bar0FillY);
			context.lineTo(leftBarLength, bar0FillY);
			context.lineWidth = width;
			this.setStrokeWidth(width-1.5);
			this.setStroke(BAR_COLOR);
			//this.setStroke(colorSofter(BAR_COLOR,0.3)); //for debug only
			canvas.fillStroke(this);
		}
	});
	
	//(2) create lower bar
	var lowerBar = new Kinetic.Shape({
		x:barCX,
		drawFunc: function(canvas) {
			var context = canvas.getContext();

			context.beginPath();
			context.moveTo(0, bar1Stroke1Y);
			context.lineTo(leftBarLength, bar1Stroke1Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
			
			context.beginPath();
			context.moveTo(0, bar1Stroke2Y);
			context.lineTo(leftBarLength, bar1Stroke2Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
		
			context.beginPath();
			context.moveTo(-.5, bar1FillY);
			context.lineTo(leftBarLength, bar1FillY);
			context.lineWidth = width;
			this.setStrokeWidth(width-1.5);
			this.setStroke(BAR_COLOR);
			//this.setStroke(colorSofter(BAR_COLOR,0.2)); //for debug only
			canvas.fillStroke(this);			
		}
	});	

	
	var eCY = (bar1Stroke2Y-bar0Stroke1Y-width+1)/2;
	var eCX = eCY*3/2;
	
	//create upper 1/4 circle
	var upperCircle = new Kinetic.Shape({
		x: barCX,
		y: (bar1Stroke1Y+bar0Stroke2Y)/2,
		drawFunc: function(canvas) {
			var context = canvas.getContext();

			context.beginPath();
			drawEllipse(context, 0, 0, eCX, eCY, 180, 270); 
			this.setStrokeWidth(width-0.5);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
		
			context.beginPath();
			drawEllipse(context, 0, 0, eCX, eCY, 178, 271); 
			this.setStrokeWidth(width-1);
			this.setStroke(BAR_COLOR);
			canvas.fillStroke(this);			
		
		}
	});		
	
	//create lower 1/4 circle
	var lowerCircle = new Kinetic.Shape({
		x: barCX,
		y: (bar1Stroke1Y+bar0Stroke2Y)/2,
		drawFunc: function(canvas) {
			var context = canvas.getContext();
		
			context.beginPath();
			drawEllipse(context, 0, 0, eCX, eCY, 90, 180); 
			this.setStrokeWidth(width-0.5);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
			
			context.beginPath();
			drawEllipse(context, 0, 0, eCX, eCY, 89, 182); 
			this.setStrokeWidth(width-1);
			this.setStroke(BAR_COLOR);
			canvas.fillStroke(this);			
		}
	});	
	
	//------------------------------
	// begin for create handle bar 
	//------------------------------
	var beginHandleBarX = startRingX + (numOfRings) * ringDistanceX-ringX+width/2;
	var eHCX = beginHandleBarX+leftRing*ringDistanceX+ringDistanceX*7/12;
	
	//handle bar 1
	var ellipseHandle1 = new Kinetic.Shape({
		x: eHCX,
		y: barCenterY,
		drawFunc: function(canvas) {
			var context = canvas.getContext();
		
			context.beginPath();
			context.moveTo(-ringDistanceX/10, -ringHigh);
			context.lineTo(ringDistanceX*3/2, -ringHigh);
			context.arc(ringDistanceX*3/2, 0, ringHigh, 3/2*Math.PI, 5/2*Math.PI, false);
			//context.moveTo(ringDistanceX*3/2+10, ringHigh);
			context.lineTo(ringDistanceX/10, ringHigh);
			
			//this.fill(context);
			context.fillStyle = HANDLE_BAR_COLOR1;
			context.fill();
			this.setStrokeWidth(.5);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);			
		},
		//fill: HANDLE_BAR_COLOR1,
		scale:{x:1,y:.9}
	});
	
	//handle bar 2
	var ellipseHandle2 = new Kinetic.Shape({
		x: eHCX,
		y: barCenterY,
		drawFunc: function(canvas) {
			var context = canvas.getContext();
		
			context.beginPath();
			context.arc(0, 0, ringHigh, 0, 2*Math.PI, false);
			this.setStrokeWidth(.5);
			this.setStroke(LINE_COLOR);
			//this.fill(context);
			context.fillStyle = HANDLE_BAR_COLOR2;
			context.fill();
			canvas.fillStroke(this);				
		
		},
		//fill: HANDLE_BAR_COLOR2,
		scale:{x:1,y:0.3},
		rotation:  ringAngle*2
	});

	//upper handle bar
	var handleBarLength =  leftRing*ringDistanceX+ringDistanceX/2;
	var handleBarScale = handleBarLength /(ringDistanceX/2); 
	var upperHandleBar = new Kinetic.Shape({
		x:beginHandleBarX,
		drawFunc: function(canvas) {
			var context = canvas.getContext();

			context.beginPath();
			context.moveTo(0, bar0Stroke1Y);
			context.lineTo(barLength/2, bar0Stroke1Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
			
			context.beginPath();
			context.moveTo(0, bar0Stroke2Y);
			context.lineTo(barLength/2, bar0Stroke2Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
		
			context.beginPath();
			context.moveTo(0, bar0FillY);
			context.lineTo(barLength/2, bar0FillY);
			context.lineWidth = width;
			this.setStrokeWidth(width-1.5);
			this.setStroke(BAR_COLOR);
			//this.setStroke(colorSofter(BAR_COLOR,0.3)); //for debug only
			canvas.fillStroke(this);
		},
		scale: {x:handleBarScale, y:1}
	});
	
	//lower handle bar
	var handleBarLength =  leftRing*ringDistanceX+ringDistanceX*2/3;
	var handleBarScale = handleBarLength /(ringDistanceX*2/3); 
	var lowerHandleBar = new Kinetic.Shape({
		x:beginHandleBarX,
		drawFunc: function(canvas) {
			var context = canvas.getContext();

			context.beginPath();
			context.moveTo(0, bar1Stroke1Y);
			context.lineTo(barLength*2/3, bar1Stroke1Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
			
			context.beginPath();
			context.moveTo(0, bar1Stroke2Y);
			context.lineTo(barLength*2/3, bar1Stroke2Y);
			context.lineWidth = width;
			this.setStrokeWidth(1);
			this.setStroke(LINE_COLOR);
			canvas.fillStroke(this);
		
			context.beginPath();
			context.moveTo(0, bar1FillY);
			context.lineTo(barLength*2/3, bar1FillY);
			context.lineWidth = width;
			this.setStrokeWidth(width-1.5);
			this.setStroke(BAR_COLOR);
			//this.setStroke(colorSofter(BAR_COLOR,0.2)); //for debug only
			canvas.fillStroke(this);			
		},
		scale: {x:handleBarScale, y:1}
	});	
	
	glinkedRingLayer.add(lowerCircle);
	glinkedRingLayer.add(upperCircle);
	glinkedRingLayer.add(lowerBar);
	glinkedRingLayer.add(upperBar);
	
	glinkedRingLayer.add(ellipseHandle1);
	glinkedRingLayer.add(ellipseHandle2);
	glinkedRingLayer.add(upperHandleBar);
	glinkedRingLayer.add(lowerHandleBar);
	
	gBarObject = { 
		upperBar:upperBar, lowerBar:lowerBar, upperCircle:upperCircle, lowerCircle:lowerCircle, 
		ellipseHandle1:ellipseHandle1, ellipseHandle2:ellipseHandle2,
		upperHandleBar:upperHandleBar,	lowerHandleBar:lowerHandleBar
	};
}

//--------------------------
// create front bar board
//--------------------------
function createFrontBoard()
{
	var frontBoard = new Kinetic.Shape({
		drawFunc: function(canvas) {
			var startX = startRingX-ringDistanceX;
			var	endX   = startRingX+numOfRings*ringDistanceX-ringDistanceX/2;
				
			var startY = barBoardOffsetY;
			var width = sizeUnit;

			var context = canvas.getContext();
			
			//front bar board repeat for create thickness
			for(var i = sizeUnit/2; i >= 0; i--) {
				context.beginPath();
				context.moveTo(startX-width, startY+2*width+i);
				context.lineTo(startX-width/2, startY+3*width+i);
				context.quadraticCurveTo(startX, startY+4*width+i, startX+width, startY+4*width+i);
				context.lineTo(endX+width, startY+4*width+i);

				context.quadraticCurveTo(endX+width*2, startY+4*width+i, endX+width*3/2, startY+3*width+i);
				context.lineTo(endX+width, startY+2*width);
				this.setStrokeWidth(0.3);
				//this.setFill(BAR_BOARD_FILL_COLOR);
				context.fillStyle = BAR_BOARD_FILL_COLOR;
				this.setStroke(BAR_BOARD_STROKE_COLOR);
				//this.fill(context);
				context.fill();
				canvas.fillStroke(this);
			}
			
			//draw front hold for ring stick
			for(var i = 0; i < numOfRings;i++) {
				var cx = startRingX + i * ringDistanceX;
				var cy = startY + 2*width;
				context.beginPath();
				drawEllipse(context,cx, cy, sizeUnit/2+1, sizeUnit/4, 0, 180);
				this.setStrokeWidth(1);
				this.setStroke(LINE_COLOR);
				canvas.fillStroke(this);
				
				context.beginPath();
				drawEllipse(context,cx, cy, sizeUnit/2, sizeUnit/4-1, 0, 180);
				//this.setFill(STRICK_COLOR);
				//this.fill(context);
				context.fillStyle = STRICK_COLOR;
				context.fill();
			}
		}
	});
	
	glinkedRingLayer.add(frontBoard);	
}

//----------------------
// display ring number 
//----------------------
function showRingBarNumber()
{
	var context = gRingNumberLayer.getContext();

	gRingNumberLayer.clear();
	for(var i = 0; i < numOfRings;i++) {
		var cx = startRingX + i * ringDistanceX + sizeUnit;
		var cy = barBoardOffsetY + 7.5* sizeUnit;

		context.font = titleFontSize*.5 + 'px arial';
		context.fillStyle = 'red';
		context.fillText(i+1,cx, cy);
	}
}

//---------------------------
// get the leftmost ring id 
// id = [0..numOfRings-1]
//      -1: no upper ring
//---------------------------
function getLeftmostUpperRing()
{
	for(var id = 0; id < numOfRings; id++) {
		if(ringWorkState[id]) return id;
	}
	return -1; //no upper ring
}

//------------------
//enable all input 
//------------------
function enableAllInput()
{
	enableRingStickClick();
	enableRingStickCursorStyle();
	enableAllButton();
}

//--------------------
// disable all input
//--------------------
function disableAllInput()
{
	disableRingStickClick();
	disableAllButton();
}

//---------------------------------
// display how many steps to goal 
//---------------------------------
function displaySteps()
{
	var grayCode=0;
	var targetGrayCode, targetBinaryCode;
	var binaryCode, nextGrayCode;
	
	if(playMode) targetGrayCode = Math.pow(2,numOfRings) -1;
	else targetGrayCode = 0;
	
	for(var i = numOfRings-1; i >= 0; i--) {
		grayCode = (grayCode<<1) + ringWorkState[i];
	}
	binaryCode = grayToBinary(grayCode, numOfRings);
	targetBinaryCode = grayToBinary(targetGrayCode, numOfRings);
	
	if(binaryCode != targetBinaryCode) {
		writeMessage(Math.abs(binaryCode-targetBinaryCode));
	} else { //finish
		writeMessage(textSuccess);
		disableRingStickClick();
		disableRingStickCursorStyle();
		enableAutoButton();
		enableAllButton();
		disableHintsAutoButton();	
	}
}

//-----------------------------------------------
// enable click while click on stick click area
//-----------------------------------------------
function enableRingStickClick()
{
	for(var id = 0; id < numOfRings; id++) {
		gClickArea[id].on('click', function() {
			var id = this.id;
			if(id != 0 && (getLeftmostUpperRing()+1) != id) {
				drawXSign(id);	
			} else {
				moveRing(id, 1);
			}
		});
	}
}

//----------------
// disable click 
//----------------
function disableRingStickClick()
{
	for(var id = 0; id < numOfRings; id++) {
		gClickArea[id].off('click');
	}
}

//-----------------------------------------------------
// enable change cursor style while move on stick bar
//-----------------------------------------------------
function enableRingStickCursorStyle()
{
	// add cursor style
	for(var id = 0; id < numOfRings; id++) {
		gClickArea[id].on('mouseover', function() {
			document.body.style.cursor = 'pointer';
		});
		
		gClickArea[id].on('mouseout', function() {
			document.body.style.cursor = 'default';
		});	
	}
}

//------------------------------
// disable change cursor style
//------------------------------
function disableRingStickCursorStyle()
{
	document.body.style.cursor = 'default';
	
	for(var id = 0; id < numOfRings; id++) {
		gClickArea[id].off('mouseover mouseout');
	}
}

//----------------
// move one ring  
//----------------
function moveRing(id, enableInputAfterFinish)
{
	if(ringWorkState[id] == 0) { //move ring Up
		if(id == 0) {
			cmdMoveRing0Up(id, enableInputAfterFinish);
		} else {
			cmdMoveRingUp(id, enableInputAfterFinish);
		}
	} else { //move ring down 
		if(id == 0) {
			cmdMoveRing0Down(id, enableInputAfterFinish);
		} else {
			cmdMoveRingDown(id, enableInputAfterFinish);
		}
	}		
}

//-----------------
// move ring 0 up
//-----------------
function cmdMoveRing0Up(id, enableInput)
{
	var moveCommand = [ 
		{func:moveBarLeft1, isRunning:moveBarLeftRunning},
		{func:moveRingUp, isRunning:moveRingRunning},
		{func:moveBarRight2, isRunning:moveBarRightRunning},
		{func:moveRingToBar, isRunning:moveRingRunning},
		{func:changeRingState, isRunning:function() { return 0; } },
		{func:moveBarLeft2, isRunning:moveBarLeftRunning}
	]
	runMoveCommand(id, moveCommand, enableInput, 0);
}

//-----------------------
// move ring up (id > 0) 
//-----------------------
function cmdMoveRingUp(id, enableInput)
{
	var moveCommand = [ 
		{func:moveRingUp, isRunning:moveRingRunning},
		{func:moveBarRight2, isRunning:moveBarRightRunning},
		{func:moveRingToBar, isRunning:moveRingRunning},
		{func:changeRingState, isRunning:function() { return 0; } },
		{func:moveBarLeft2, isRunning:moveBarLeftRunning}
	];
	runMoveCommand(id, moveCommand, enableInput, 0);
}

//------------------
// move ring 0 down
//------------------
function cmdMoveRing0Down(id, enableInput)
{
	var moveCommand = [ 
		{func:moveBarRight2, isRunning:moveBarRightRunning},
		{func:moveRingUp, isRunning:moveRingRunning},
		{func:moveBarLeft1, isRunning:moveBarLeftRunning},
		{func:moveRingDown, isRunning:moveRingRunning},
		{func:changeRingState, isRunning:function() { return 0; } },
		{func:moveBarRight1, isRunning:moveBarRightRunning}
	];
	runMoveCommand(id, moveCommand, enableInput, 0);
}

//------------------------- 
// move ring down (id > 0)
//------------------------- 
function cmdMoveRingDown(id, enableInput)
{
	var moveCommand = [ 
		{func:moveBarRight2, isRunning:moveBarRightRunning},
		{func:moveRingUp, isRunning:moveRingRunning},
		{func:moveBarLeft2, isRunning:moveBarLeftRunning},
		{func:moveRingDown, isRunning:moveRingRunning},
		{func:changeRingState, isRunning:function() { return 0; } }
	];
	runMoveCommand(id, moveCommand, enableInput, 0);
}

//------------------------
// execute move commands
//------------------------
var gRingMoving=0;
function runMoveCommand(id, moveCmd, enableInput, index)
{
	if(index == 0) {
		//start move
		gRingMoving = 1;
		disableAllInput();	
	} else {
		if (moveCmd[index-1].isRunning()) { //previous command is running, wait it ! 
			setTimeout(function() {runMoveCommand(id, moveCmd, enableInput, index);}, timeOut);	
			return;	
		}
	}
	
	if(index < moveCmd.length) {
		moveCmd[index].func(id); //execute command
		//waiting for running next command
		setTimeout(function() {runMoveCommand(id, moveCmd, enableInput, index+1);}, timeOut);			
	} else {
		//end move
		if(enableInput) enableAllInput();
		displaySteps();
		gRingMoving = 0;
	}
}

//--------------------
// change ring state 
//--------------------
function changeRingState(id)
{
	ringWorkState[id] ^= 1; //toggle
}

//==========================
// BEGIN for move commands
//==========================

var moveLeftObject = new animateMoveBarLeft();
var moveRightObject = new animateMoveBarRight();
var moveRingObject = new animateMoveRing();

//----------------------------------------
// check move bar left command is running 
//----------------------------------------
function moveBarLeftRunning()
{
	return moveLeftObject.isRunning();
}

//-----------------------------------------
// check move bar right command is running
//-----------------------------------------
function moveBarRightRunning()
{
	return moveRightObject.isRunning();
}

//------------------------------------
// check move ring up|down is running 
//------------------------------------
function moveRingRunning()
{
	return moveRingObject.isRunning();
}

//------------------------
// move bar left (mode 1)
//------------------------
function moveBarLeft1(id)
{
	moveLeftObject.init(id, timeUnit[timeLevel], 1);
	moveLeftObject.start();	
}

//------------------------
// move bar left (mode 2)
//------------------------
function moveBarLeft2(id)
{
	if(id) id--;
	moveLeftObject.init(id, timeUnit[timeLevel], 2);
	moveLeftObject.start();	
}

//-------------------------
// move bar right (mode 1)
//-------------------------
function moveBarRight1(id)
{
	moveRightObject.init(id, timeUnit[timeLevel], 1);
	moveRightObject.start();
}

//-------------------------
// move bar right (mode 2)
//-------------------------
function moveBarRight2(id)
{
	if(id) id--;
	moveRightObject.init(id, timeUnit[timeLevel], 2);
	moveRightObject.start();
}

//-----------------------------
// move ring up (over the bar)
//-----------------------------
function moveRingUp(id)
{
	moveRingObject.init(id, timeUnit[timeLevel], 0);
	moveRingObject.start();	
}

//-----------------
// move ring down
//-----------------
function moveRingDown(id)
{
	moveRingObject.init(id, timeUnit[timeLevel], 0);
	moveRingObject.start();	
}

//----------------------------
// move ring down to the bar
//----------------------------
function moveRingToBar(id)
{
	moveRingObject.init(id, timeUnit[timeLevel], 1);
	moveRingObject.start();	
}

//=======================
// ellipse draw function
//=======================
function drawEllipse(context,cx, cy, radiusX , radiusY, startAngleDeg, endAngleDeg)
{
	var angle =  startAngleDeg/180*Math.PI;
	var x= cx + radiusX*Math.cos(angle);
	var y= cy + radiusY*Math.sin(angle);
	
	for(var angleDeg = startAngleDeg; angleDeg <= endAngleDeg; angleDeg+=.5) {
		angle =  angleDeg/180*Math.PI;
		x= cx + radiusX*Math.cos(angle);
		y= cy + radiusY*Math.sin(angle);
		context.lineTo(x,y);
	}
}

//=======================
// class: move bar left
//=======================
function animateMoveBarLeft()
{
	var running = 0;
	var startX, endX, shiftX, barStartX;
	var objId, duration, mode;

	//leftMode: 
	// 1: move half-circle-bar that closed to ring to left
	// 2: move half-circle-bar that closed to stick to left	
	this.init = function(id, timeUnit, leftMode) 
	{
		objId = id;
		duration = timeUnit;
		mode = leftMode;
		
		if(id == 0 && mode == 1) {
			var leftRing = getLeftmostUpperRing();
			if(leftRing <= 0) leftRing = 1; //if no upper ring or id = 0 assume move time = timeUnit
			duration *= leftRing;
		}
		
		startX = gBarObject.upperBar.getPosition().x;
		endX = startRingX + (id-1)*ringDistanceX-ringDistanceX/4;
		endScale = (startX - endX) /leftBarLength;
		shiftX = startX - endX;
		barStartX = startX + (gBarObject.upperBar.getScale().x * leftBarLength)
	};

	this.start = function() 
	{
		var addBar = halfCircleTop =0;
		var anim = new Kinetic.Animation(
			function(frame) {
				var time = frame.time;
				
				if(time > duration) time = duration;
				var curX = startX - shiftX * time/duration;

				//set bar position	
				gBarObject.upperCircle.setX(curX);
				gBarObject.lowerCircle.setX(curX);
				gBarObject.upperBar.setX(curX);
				gBarObject.lowerBar.setX(curX);
				moveHandleBar(curX);
				
				if(mode == 2) {
					if(!addBar && time > duration/2) {
						addBar = 1;
							
						//(1) add bar 0 & bar1	
						var zIndex = glinedRingObject[objId].ringStick.getZIndex()-1;
						glinkedRingLayer.add(glinedRingObject[objId].bar0);
						glinedRingObject[objId].bar0.setZIndex(zIndex);
								
						var zIndex = glinedRingObject[objId].ringStick.getZIndex()+1;
						glinkedRingLayer.add(glinedRingObject[objId].bar1)
						glinedRingObject[objId].bar1.setZIndex(zIndex);

						//(2) change bar bar starX because add the bar0 & bar1
						barStartX = curX+leftBarLength*5/12;
						
						//(3) set half-circle-bar to top for override the ring 		
						gBarObject.upperBar.moveToTop();
						gBarObject.lowerBar.moveToTop();
					}	
					if(!halfCircleTop && time > duration*2/5) {
						halfCircleTop = 1;
						//set half-circle to top for override the ring	
						gBarObject.upperCircle.moveToTop();
						gBarObject.lowerCircle.moveToTop();
					}
				}
				//set the scale for change the bar length from barStartX to curX
				var curScale = (barStartX - curX) / leftBarLength
				gBarObject.upperBar.setScale(curScale, 1);
				gBarObject.lowerBar.setScale(curScale, 1);
				
				if(time >= duration) {
					if(mode == 1) {
						var leftRing = getLeftmostUpperRing();
						if(leftRing < 0) leftRing = 1; //if no upper rings assume bar at id = 1

						//add bar0 && bar1 from leftmost upper ring to current id	
						var startId = (leftRing == 0)?0:(leftRing-1);
						for(var i = startId; i >= objId; i--) {
							glinkedRingLayer.add(glinedRingObject[i].bar0)
							glinkedRingLayer.add(glinedRingObject[i].bar1)
							var zIndex = glinedRingObject[i].ringStick.getZIndex()-1;
							glinedRingObject[i].bar0.setZIndex(zIndex);
							var zIndex = glinedRingObject[objId].holdRingOver.getZIndex()+1;
							glinedRingObject[i].bar1.setZIndex(zIndex);
						}
						
						//in back of ringStick
						var zIndex = glinedRingObject[objId].ringStick.getZIndex()-1;
						//glinedRingObject[objId].bar0.setZIndex(zIndex);
						gBarObject.upperCircle.setZIndex(zIndex);
						gBarObject.upperBar.setZIndex(zIndex);
					
						//in front of ring
						zIndex = glinedRingObject[objId].holdRingOver.getZIndex()+1;
						//glinedRingObject[objId].bar1.setZIndex(zIndex);
						gBarObject.lowerCircle.setZIndex(zIndex);
						gBarObject.lowerBar.setZIndex(zIndex);
					}
					
					//set scale X to 1
					gBarObject.upperBar.setScale(1, 1);
					gBarObject.lowerBar.setScale(1, 1);
					
					anim.stop();
					running = 0;
				}
			},
			glinkedRingLayer
		);
		running = 1;
		anim.start();
	};

	this.isRunning = function() 
	{
		return running;
	};
}

//=======================
// class: move bar right
//=======================
function animateMoveBarRight()
{
	var running = 0;
	var startX, endX, shiftX, barEndX;
	var objId, duration, mode, numOfBar;
	var leftRing;

	//rightMode = 1: for ring-0 move closed to leftmost upper ring
	//rightMode = 2: move bar-half-circle closed to strick
	this.init = function(id, timeUnit, rightMode) 
	{
		objId = id;
		mode = rightMode;
	
		startX = gBarObject.upperBar.getPosition().x;
		if(mode == 2) {
			numOfBar = 1;
			endX = startRingX + id*ringDistanceX+ringDistanceX/5;
			barEndX = startX + leftBarLength;
		} else { //mode = 1
			leftRing = getLeftmostUpperRing();
			if(leftRing < 0) leftRing = 1; //if no upper rings assume bar at id = 1
			
			numOfBar = leftRing - id;
			endX = startRingX + (leftRing-1)*ringDistanceX-ringDistanceX/4;
			barEndX = endX + leftBarLength;
		}
		duration = timeUnit * numOfBar;
		shiftX = startX - endX;
	};

	this.start = function() 
	{
		var removeBar = changeBarOrder = changeBarCircleOrder =0;
		var curScale;
		//var removeAdd = 0;
		var anim = new Kinetic.Animation(
			function(frame) {
				var time = frame.time;
				
				if(time > duration) time = duration;
				var curX = startX - shiftX * time/duration;

				gBarObject.upperCircle.setX(curX);
				gBarObject.lowerCircle.setX(curX);
				gBarObject.upperBar.setX(curX);
				gBarObject.lowerBar.setX(curX);
				moveHandleBar(curX);
				
				if(mode == 2) { //move bar-half-circle closed to strick
					if(!changeBarOrder && time > duration/3) {
						changeBarOrder = 1;
						//in back of ringStick (half-circle-upper bar)
						var zIndex = glinedRingObject[objId].ringStick.getZIndex()-1;
						gBarObject.upperBar.setZIndex(zIndex);

						//in front of ringStick (half-circle-lower bar)
						var zIndex = glinedRingObject[objId].ringStick.getZIndex()+1;
						gBarObject.lowerBar.setZIndex(zIndex);	
						
						//change of half-circle-bar 
						barEndX = endX + leftBarLength * .5;
					}
					
					if(!changeBarCircleOrder && time > duration*3/5) {
						changeBarCircleOrder = 1;
						
						//in back of ringStick (half-upper-circle bar)
						var zIndex = glinedRingObject[objId].ringStick.getZIndex()-1;
						gBarObject.upperCircle.setZIndex(zIndex);

						//in front of ringStick (half-lower-circle bar)
						var zIndex = glinedRingObject[objId].ringStick.getZIndex()+1;
						gBarObject.lowerCircle.setZIndex(zIndex);
					}
				}			
			
				if(!removeBar){ //remove redundant bar
					if(time > duration /(numOfBar+2)) {
						removeBar = 1;
						for(var i = 0; i < numOfBar; i++) {
							glinedRingObject[objId+i].bar0.destroy(); //kineticJS 4.5.0
							glinedRingObject[objId+i].bar1.destroy(); //kineticJS 4.5.0
						}
						
					}
				}
				
				//set scale of half-circle upper and lower bar
				curScale = (barEndX -curX) / leftBarLength;
				gBarObject.upperBar.setScale(curScale, 1);
				gBarObject.lowerBar.setScale(curScale, 1);
	
				if(time >= duration) {
					anim.stop();
					running = 0;
				}
			},
			glinkedRingLayer
		);
		running = 1;
		anim.start();
	};

	this.isRunning = function() 
	{
		return running;
	};
}

//-----------------------------------
// move handle bar to position curX
//-----------------------------------
function moveHandleBar(curX)
{
	var beginHandleBarX = (numOfRings) * ringDistanceX+leftBarLength;
	var eHCX = beginHandleBarX+ringDistanceX*7/12+curX
	
	//set handle bar position
	gBarObject.ellipseHandle1.setX(eHCX);
	gBarObject.ellipseHandle2.setX(eHCX);

	var beginHandleBarX = startRingX -ringX;	
	var endHandleBarX = ringDistanceX+sizeUnit/2+curX;
	
	//set upper handle bar scale
	var handleBarLength =  endHandleBarX - beginHandleBarX;
	var handleBarScale = handleBarLength /(ringDistanceX/2); 
	gBarObject.upperHandleBar.setScale(handleBarScale, 1);
	
	//set lower handle bar scale
	var endHandleBarX = ringDistanceX+ringDistanceX/6+sizeUnit/2+curX;
	var handleBarLength =  endHandleBarX - beginHandleBarX;
	handleBarScale = handleBarLength /(ringDistanceX*2/3); 	
	gBarObject.lowerHandleBar.setScale(handleBarScale, 1);

}

//========================
// move ring up or down 
//========================
function animateMoveRing() 
{
	var object;
	var duration;
	var running = 0;
	var endRingDrawState, startY, shiftY;
	var moveUp;
	var objId;

	//---------------------------------------------
	//moveToBar = 
	//          1: move ring from up back to bar
	//          0: move up or down from the bar
	//---------------------------------------------
	this.init = function(id, timeUnit, moveToBar) 
	{
		objId = id;
		
		if(ringDrawState[objId] >= 0) {
			moveUp = 1;
			//current state: under the bar, move up
			endRingDrawState = -1;
			if(id > 0 && ringDrawState[objId] > 0) {

				var zIndex = glinedRingObject[objId].ellipse.getZIndex();
				glinedRingObject[objId-1].bar0.setZIndex(zIndex-1); //under the ellipse
	
				var zIndex = glinedRingObject[objId].ringStick.getZIndex();
				glinedRingObject[objId].bar0.setZIndex(zIndex-1); //under the ringStick

				var zIndex = glinedRingObject[objId-1].ringStick.getZIndex();
				glinedRingObject[objId].ellipseOver.setZIndex(zIndex+1); //ellipseOver over ringStick of id-1
				
				var zIndex = glinedRingObject[objId].ellipseOver.getZIndex();
				glinedRingObject[objId].bar1.setZIndex(zIndex+1); //over ellipseOver			
			}
		} else {
			//current state: over the bar, move down to bar or move down under the bar. 
			moveUp = 0;
			if(moveToBar) {
				endRingDrawState = 0;
				if(id > 0) {
					var zIndex = glinedRingObject[objId].ringStick.getZIndex();
					glinedRingObject[objId].bar1.setZIndex(zIndex+1); //over the stick & under the ellipse
				}
			} else {
				//calculate ring down position
				if(objId == numOfRings-1) { //rightmost ring
					endRingDrawState = maxRingDeep;
				} else {
					endRingDrawState = ringDrawState[objId+1] >= maxRingDeep ? maxRingDeep: (ringDrawState[objId+1]+1);
				}
				if(id > 0) {
					var zIndex = glinedRingObject[objId].ellipse.getZIndex();
					glinedRingObject[objId-1].bar0.setZIndex(zIndex-1); //under the ellipse
					
					zIndex = glinedRingObject[objId-1].ringStick.getZIndex();
					glinedRingObject[objId].ellipseOver.setZIndex(zIndex+1); //ellipseOver over ringStick of id-1
				
					var zIndex = glinedRingObject[objId].ringStick.getZIndex();
					glinedRingObject[objId].bar0.setZIndex(zIndex-1); //under the ringStick
					var zIndex = glinedRingObject[objId].ellipseOver.getZIndex();
					glinedRingObject[objId].bar1.setZIndex(zIndex+1); //over ellipseOver
				
				}
			}
		}
		startY = glinedRingObject[objId].ringStick.getPosition().y;
		shiftY = (endRingDrawState - ringDrawState[objId])*ringDistanceY;
		duration = Math.abs(endRingDrawState - ringDrawState[objId]) * timeUnit;
	};

	this.start = function() 
	{
		var anim = new Kinetic.Animation(
			function(frame) {
				var time = frame.time;
				
				if(time > duration) time = duration;
				var curY = startY + shiftY * time/duration;
				
				glinedRingObject[objId].ringStick.setY(curY);
				glinedRingObject[objId].ellipse.setY(curY+ringY+sizeUnit/2);
				glinedRingObject[objId].holdRingOver.setY(curY);
				//if(typeof glinedRingObject[objId].ellipseOver != "undefined") { 
				if(objId != 0) { //ring 0 without overlay ellipes ring 
					glinedRingObject[objId].ellipseOver.setY(curY+ringY+sizeUnit/2);
				}
				
				if(time >= duration) {
					ringDrawState[objId] = endRingDrawState;
					anim.stop();
					running = 0;
				}
			},
			glinkedRingLayer
		);
		running = 1;
		anim.start();
	};

	this.isRunning = function() 
	{
		return running;
	};
}

//--------------
// draw X sign
//--------------
function drawXSign(id)
{
	var cx = startRingX + id * ringDistanceX;
	var cy = barBoardOffsetY+sizeUnit*2;
	var signSize = sizeUnit*5/2;
	
	var xSign = new Kinetic.Shape({
		x:cx,
		y:cy,
		drawFunc: function(canvas) {
			var context = canvas.getContext();
		
			context.beginPath();
			context.moveTo(-signSize, -signSize);
			context.lineTo(signSize, signSize);
			canvas.fillStroke(this);
				
			context.beginPath();
			context.moveTo(signSize, -signSize);
			context.lineTo(-signSize, signSize);
			canvas.fillStroke(this);
		},
		fill:SIGN_COLOR,
		stroke: SIGN_COLOR,
		strokeWidth: sizeUnit*3/2			
	});		
	
	var flashXSign = new animateFlash();
	flashXSign.init(xSign, glinkedRingLayer, 0, 2);
	flashXSign.start();
}

//-----------------
// draw up arrow 
//-----------------
function drawUpSign(id)
{
	var cx = startRingX + id * ringDistanceX;
	var cy = barBoardOffsetY+sizeUnit*4.75;
	var signSize = sizeUnit;
	
	var xSign = new Kinetic.Shape({
		x:cx,
		y:cy,
		drawFunc: function(canvas) {
			var context = canvas.getContext();
		
			context.beginPath();
			context.moveTo(-signSize, 0);
			context.lineTo(-signSize,  -signSize*3);
			context.lineTo(-signSize*2.5,-signSize*3);
			context.lineTo(0, -signSize*5.5);
			context.lineTo(signSize*2.5, -signSize*3);
			context.lineTo(signSize, -signSize*3);
			context.lineTo(signSize, 0);
			canvas.fillStroke(this);
		},
		fill:SIGN_COLOR,
		stroke: SIGN_COLOR
	});		

	var flashUpSign = new animateFlash();
	flashUpSign.init(xSign, glinkedRingLayer, 0, 2);
	flashUpSign.start();
}

//-----------------
// draw down arrow 
//-----------------
function drawDownSign(id)
{
	var cx = startRingX + id * ringDistanceX;
	var cy = barBoardOffsetY-sizeUnit*0.75;
	var signSize = sizeUnit;
	
	var xSign = new Kinetic.Shape({
		x:cx,
		y:cy,
		drawFunc: function(canvas) {
			var context = canvas.getContext();

			context.beginPath();
			context.moveTo(-signSize, 0);
			context.lineTo(-signSize,  signSize*3);
			context.lineTo(-signSize*2.5,signSize*3);
			context.lineTo(0, signSize*5.5);
			context.lineTo(signSize*2.5, signSize*3);
			context.lineTo(signSize, signSize*3);
			context.lineTo(signSize, 0);
			canvas.fillStroke(this);
		},
		fill:SIGN_COLOR,
		stroke: SIGN_COLOR
	});		
	
	var flashUpSign = new animateFlash();
	flashUpSign.init(xSign, glinkedRingLayer, 0, 2);
	flashUpSign.start();
}

//---------------
// flash object
//---------------
function animateFlash() 
{
	var	object, layer;
	var	startFlashTime;
	var flashTimes;

	this.init = function(myObject, myLayer, startTime, times) 
	{
		object = myObject;
		layer = myLayer;
		startFlashTime = startTime;
		flashTimes = times;
	};

	this.start = function() 
	{
		var flashOnTime = 150, flashOffTime = 100;
		var lastToggleTime = -200;
		var flashOn = 1;
		
		var anim = new Kinetic.Animation(
			function(frame) {
				var time = frame.time;
				
				if(time > startFlashTime) {
					if(flashOn) {
						if(time - lastToggleTime > flashOffTime) {
							layer.add(object);
							layer.draw();
							flashOn = 0;
							lastToggleTime = time;
						}
					} else {
						if(time - lastToggleTime > flashOnTime) {
							object.destroy(); //kineticJS 4.5.0
							layer.draw();
							flashOn = 1;
							lastToggleTime = time;
							if(--flashTimes == 0) {
								anim.stop();
								running = 0;
								enableAllInput();
							}
						}
					}
				}				
			},
			layer
		);
		disableAllInput();	
		running = 1;
		anim.start();
	};

	this.isRunning = function() 
	{
		return flashTimes;
	};
}

//==============================================
// BEGIN for selection change and press button
//==============================================

//-------------------------
// change number of rings
//-------------------------
function setNumOfRings(value)
{
	numOfRings = parseInt(value);
	saveRingsInfo();
	
	initRingState();
	createLinkedRings();
}

//-------------------------
// change play mode
//  0: all rings down, 
//  1: all rings up
//-------------------------
function setPlayMode(value)
{
	playMode = parseInt(value);
	saveRingsInfo();
	
	initRingState();
	createLinkedRings();
}

//-----------------
// set play speed
//-----------------
function setPlaySpeed(value)
{
	timeLevel = parseInt(value);
	setTimeOutValue();
	saveRingsInfo();
}

function setTimeOutValue()
{
	if( (timeOut = Math.ceil(timeUnit[timeLevel]/3)) < 1) timeOut = 1;
	//alert(timeOut);
}

//--------------------
// press reset button 
//--------------------
function resetButton()
{
	initRingState()
	createLinkedRings();
}

//---------------------
// press random button 
//---------------------
function randomButton()
{
	randomRingState();
	createLinkedRings();
}

//--------------------
// press hints button
//--------------------
function hintsButton()
{
	var id = getNextMoveRing();
	if(id >= 0) {
		if(ringWorkState[id]) {
			drawDownSign(id);
		} else {
			drawUpSign(id);
		}
	}
}

//--------------------
// press auto button
//--------------------
function autoButton()
{
	gStopMove = 0;
	disableAutoButton();
	disableRingStickCursorStyle();
	autoPlay();
}

//--------------------
// press stop button
//--------------------
function stopButton()
{
	gStopMove = 1;
}

//----------------------------------------
// get the next ring id need to be moved 
//----------------------------------------
function getNextMoveRing()
{
	var grayCode=0;
	var targetGrayCode, targetBinaryCode;
	var binaryCode, nextGrayCode;
	
	if(playMode) targetGrayCode = Math.pow(2,numOfRings) -1; //all rings up
	else targetGrayCode = 0; //all rings down
	
	for(var i = numOfRings-1; i >= 0; i--) {
		//gray code of current working state
		grayCode = (grayCode<<1) + ringWorkState[i];
	}
	binaryCode = grayToBinary(grayCode, numOfRings);
	targetBinaryCode = grayToBinary(targetGrayCode, numOfRings);
	
	if(binaryCode != targetBinaryCode) {
		//get next number close to target
		if(binaryCode > targetBinaryCode) binaryCode--;
		else binaryCode++;
		nextGrayCode = binaryToGray(binaryCode);
		
		//find the change bit (next changed ring id)
		for(var id = 0; id < numOfRings; id++) {
			if((nextGrayCode & 1) != ringWorkState[id]) 
				break;
			nextGrayCode >>= 1;	
		}
		return id;
	}
	return -1; //finish (current state = target state)
}

//--------------------------------------
// disable auto and enable stop button
//--------------------------------------
function disableAutoButton()
{
	document.getElementById('auto').style.display='none';
	document.getElementById('stop').style.display='inline';
}

//--------------------------------------
// disable stop and enable auto button
//--------------------------------------
function enableAutoButton()
{
	document.getElementById('auto').style.display='inline';
	document.getElementById('stop').style.display='none';
}

//--------------------------------------
// auto play, auto move the ring stick
//--------------------------------------
var gStopMove=0;
function autoPlay()
{
	var id;
	
	if(gRingMoving) {
		setTimeout(function() {autoPlay();}, timeOut);	
		return;
	}
	
	if(gStopMove) {
		enableAutoButton();
		enableAllInput();
		return;
	}
	
	if((id = getNextMoveRing()) >= 0) {
		moveRing(id, 0);
		setTimeout(function() {autoPlay();}, timeOut);	
		return;
	} else {
		//finish	
	}
}

//--------------------------
// enable all input button
//--------------------------
function enableAllButton()
{
	//select 
	document.getElementById('rings').disabled=false;
	document.getElementById('mode').disabled=false;
	//document.getElementById('speed').disabled=false;
	
	//button
	document.getElementById('reset').disabled=false;
	document.getElementById('random').disabled=false;
	document.getElementById('auto').disabled=false;
	//document.getElementById('stop').disabled=false;
	document.getElementById('hints').disabled=false;
}

//--------------------
// disable all button
//--------------------
function disableAllButton()
{
	//select 
	document.getElementById('rings').disabled=true;
	document.getElementById('mode').disabled=true;
	//document.getElementById('speed').disabled=true;
	
	//button
	document.getElementById('reset').disabled=true;
	document.getElementById('random').disabled=true;
	document.getElementById('auto').disabled=true;
	//document.getElementById('stop').disabled=true;
	document.getElementById('hints').disabled=true;
}

//-------------------------------
// disable auto and hints button
//-------------------------------
function disableHintsAutoButton()
{
	document.getElementById('auto').disabled=true;
	document.getElementById('hints').disabled=true;
}

//------------------------------------------------------------------
// get number of rings, play speed and play mode from localstorage
//------------------------------------------------------------------
function restoreRingsInfo()
{
	var maxRings = RING_COLOR.length;
	var maxtimeLevel = timeUnit.length;
	
	numOfRings=parseInt(getStorage("nineRings_Rings_SimonHome"));
	timeLevel=parseInt(getStorage("nineRings_Speed_SimonHome"));
	playMode= parseInt(getStorage("nineRings_Mode_SimonHome"));
	
	if(isNaN(numOfRings) || numOfRings < 3 || numOfRings > maxRings ) numOfRings = 5;
	if(isNaN(timeLevel) || timeLevel < 0 || timeLevel > maxtimeLevel) timeLevel = Math.floor(maxtimeLevel/2);
	if(isNaN(playMode) || playMode < 0 || playMode > 1) playMode = 0;
}

//----------------------------
// save info to localstorage
//----------------------------
function saveRingsInfo()
{
	setStorage("nineRings_Rings_SimonHome", numOfRings);
	setStorage("nineRings_Speed_SimonHome", timeLevel);
	setStorage("nineRings_Mode_SimonHome", playMode);
}

//=======================================
// BEGIN for set|get|clear localstorage
//=======================================
function setStorage(key, value) 
{
	if(typeof(window.localStorage) != 'undefined'){ 
		window.localStorage.setItem(key,value); 
	} 
}

function getStorage(key) 
{
	var value = null;
	if(typeof(window.localStorage) != 'undefined'){ 
		value = window.localStorage.getItem(key); 
	} 
	return value;
}

function clearStorage(key) 
{
	if(typeof(window.localStorage) != 'undefined'){ 
		window.localStorage.removeItem(key); 
	} 
}

//==============================================================================
// Gray code convert 
// gray code to binary | binary to gray code
// url: http://en.wikipedia.org/wiki/Gray_code
// explain:http://www.wisc-online.com/Objects/ViewObject.aspx?ID=IAU8307 (good)
//==============================================================================

//-----------------------------------------------------------------
// The purpose of this function is to convert an unsigned
// binary number to reflected binary Gray code.
// 
// The operator >> is shift right. The operator ^ is exclusive or.
//-----------------------------------------------------------------
function binaryToGray(num)
{
	return (num >> 1) ^ num;
}
 
//-----------------------------------------------------------------
// The purpose of this function is to convert a reflected binary
// Gray code number to a binary number.
//-----------------------------------------------------------------
function grayToBinary(num, numBits)
{
	var shift;
	for(shift = 1; shift < numBits; shift=2*shift) {
		num = num ^ (num >> shift);
	}
	return num;
}

//======================
// get system language
//======================
function getSystemLanguage()
{
	var lang = window.navigator.userLanguage || window.navigator.language;
	return lang.toLowerCase();
}

//========================
// Text message to screen 
//========================
function writeMessage(message) 
{
	var context = gMessageLayer.getContext();
	
	gMessageLayer.clear();
	context.font = titleFontSize*.75 + 'px arial';
	context.fillStyle = 'blue';
	context.fillText(message,20, STAGE_Y-40);
}

//FOR DEBUG ONLY
//----------------------------
// color = "#RRGGBB"
// softerValue = [0.1 .. 2.0]
//----------------------------
function colorSofter(color, softerValue)
{
	//return color;
	var whiteValue = 255 * (1-softerValue);

	var colorR = ("0"+Math.round(parseInt(color.substr(1,2), 16)*softerValue+whiteValue).toString(16)).slice(-2);
	var colorG = ("0"+Math.round(parseInt(color.substr(3,2), 16)*softerValue+whiteValue).toString(16)).slice(-2);
	var colorB = ("0"+Math.round(parseInt(color.substr(5,2), 16)*softerValue+whiteValue).toString(16)).slice(-2);
	
	return ("#" + colorR + colorG + colorB);
}
	