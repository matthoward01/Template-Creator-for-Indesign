main();
function main(){
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	myDisplayDialog();
}

function myDisplayDialog(){
	var myDialog = app.dialogs.add({name:"Template Creator"});
	with(myDialog){
		with(dialogColumns.add()){
			with(borderPanels.add()){
				staticTexts.add({staticLabel:"Wrap or Cut-Edge?:"});
				var myWrapButtons = radiobuttonGroups.add();
				with(myWrapButtons){
					radiobuttonControls.add({staticLabel:"Wrap", checkedState:true});
					radiobuttonControls.add({staticLabel:"Cut-Edge"});
				}
				staticTexts.add({staticLabel:"How much smaller for Liner?:"});
				var myWrapIndent = radiobuttonGroups.add();
				with(myWrapIndent){
					radiobuttonControls.add({staticLabel:"0.25", checkedState:true});
					radiobuttonControls.add({staticLabel:"0.5"});
				}
			}
			with(borderPanels.add()){
				staticTexts.add({staticLabel:"Document Size:"});
				with (dialogColumns.add()){
					staticTexts.add({staticLabel:"Width (in):"});
					staticTexts.add({staticLabel:"Height (in):"});
				}
				with (dialogColumns.add()){
					var docWidth = measurementEditboxes.add({editUnits:MeasurementUnits.inches});
					var docHeight = measurementEditboxes.add({editUnits:MeasurementUnits.inches});
				}
			}		
		}
	}
	var myReturn = myDialog.show();
	if (myReturn == true){
		var mydocWidth = docWidth.editValue;
		var mydocHeight = docHeight.editValue;
		var myWrap = myWrapButtons.selectedButton;
		var myWrapInset = myWrapIndent.selectedButton;
		myDialog.destroy();
		if ((mydocWidth != "") || (mydocHeight != "")){
			myDrawPrintersMarks(myWrap,myWrapInset, mydocWidth, mydocHeight);
		}
		else{
			alert("You Forgot Something.");
		}
	}
	else{
		myDialog.destroy();
	}
}
function myDrawPrintersMarks(myWrap, myWrapInset, mydocWidth, mydocHeight){	
	var myDocument = app.documents.add();
	myDocument.documentPreferences.facingPages = false;
	var linerInset = 0;
	var addWrap = 0;
	if (myWrap == 0)
	{
		addWrap = 144
		if(myWrapInset == 0)
		{
			linerInset = 18
		}
		if(myWrapInset == 1)
		{
			linerInset = 36
		}
	}
	//Set Page Sizes for First Page
	app.activeDocument.pages[0].resize(CoordinateSpaces.INNER_COORDINATES,AnchorPoint.CENTER_ANCHOR,ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,[mydocWidth+addWrap+72,mydocHeight+addWrap+72]);	
	myDocument.pages.add(LocationOptions.AFTER,myDocument.pages[0]);
	
	//Set Page Sizes for Second Page Page
	app.activeDocument.pages[1].resize(CoordinateSpaces.INNER_COORDINATES,AnchorPoint.CENTER_ANCHOR,ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,[mydocWidth-linerInset+72,mydocHeight-linerInset+72]);	
	for (var z = 0; z < 2; z++)
	{
		var i = z;
		var myBounds, myX1, myY1, myX2, myY2;
	myBounds = myDocument.pages[i].bounds;
	var myOldRulerOrigin = myDocument.viewPreferences.rulerOrigin;
	myDocument.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
	//Save the current measurement units.
	var myOldXUnits = myDocument.viewPreferences.horizontalMeasurementUnits;
	var myOldYUnits = myDocument.viewPreferences.verticalMeasurementUnits;
	//Set the measurement units to points.
	myDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
	myDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
	//Create a layer to hold the printers marks (if it does not already exist).
	var myLayer = myDocument.layers.item("CropMarks");
	var myLayer2 = myDocument.layers.item("Dielines");
	try{
		myLayerName = myLayer.name;
	}
	catch (myError){
		var myLayer = myDocument.layers.add({name:"CropMarks"});
	}
	try{
		myLayerName2 = myLayer2.name;
	}
	catch (myError){
		var myLayer2 = myDocument.layers.add({name:"Dielines"});
	}
	var myDielineColor = myDocument.colors.item("Dielines");
	try{
		myColorName2 = myDielineColor.name;
	}
	catch (myError){
		var myDielineColor = myDocument.colors.add({name:"Dielines", model:ColorModel.PROCESS, space:ColorSpace.CMYK, colorValue:[0,100,100,0]});
	}
	//Get references to the Registration color and the None swatch.
	var myRegistrationColor = myDocument.colors.item("Registration");
	var myNoneSwatch = myDocument.swatches.item("None");
	//Process the objects in the selection.	
	//if(myWrap == 0){
			myX1 = myBounds[1];
			myY1 = myBounds[0];
			myX2 = myBounds[3];
			myY2 = myBounds[2];
			myDrawCropMarks ((myX1*72)+36, (myY1*72)+36, (myX2*72)-36, (myY2*72)-36, 18, 18, 1,myRegistrationColor, myNoneSwatch, myLayer, i, myWrap);
			myDrawDielines ((myX1*72)+36, (myY1*72)+36, (myX2*72)-36, (myY2*72)-36, 18, 18, 1,myDielineColor, myNoneSwatch, myLayer2, i, myWrap);
	//}
	myDocument.viewPreferences.rulerOrigin = myOldRulerOrigin;
	//Set the measurement units back to their original state.
	myDocument.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
	myDocument.viewPreferences.verticalMeasurementUnits = myOldYUnits;
	}
	
}

function myDrawCropMarks (myX1, myY1, myX2, myY2, myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i, myWrap){

	//Upper left crop mark pair.
	myDrawLine([myY1, myX1-myCropMarkOffset, myY1, myX1-(myCropMarkOffset + myCropMarkLength)], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);	
	myDrawLine([myY1-myCropMarkOffset, myX1, myY1-(myCropMarkOffset+myCropMarkLength), myX1], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	if (myWrap == 0 && i == 0)
	{
		myDrawLine([myY1+72, myX1-myCropMarkOffset, myY1+72, myX1-(myCropMarkOffset + myCropMarkLength)], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);	
		myDrawLine([myY1-myCropMarkOffset, myX1+72, myY1-(myCropMarkOffset+myCropMarkLength), myX1+72], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	}

	//Lower left crop mark pair.
	myDrawLine([myY2, myX1-myCropMarkOffset, myY2, myX1-(myCropMarkOffset+myCropMarkLength)], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	myDrawLine([myY2+myCropMarkOffset, myX1, myY2+myCropMarkOffset+myCropMarkLength, myX1], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	if (myWrap == 0 && i == 0)
	{
		myDrawLine([myY2-72, myX1-myCropMarkOffset, myY2-72, myX1-(myCropMarkOffset+myCropMarkLength)], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
		myDrawLine([myY2+myCropMarkOffset, myX1+72, myY2+myCropMarkOffset+myCropMarkLength, myX1+72], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	}

	//Upper right crop mark pair.
	myDrawLine([myY1, myX2+myCropMarkOffset, myY1, myX2+myCropMarkOffset+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	myDrawLine([myY1-myCropMarkOffset, myX2, myY1-(myCropMarkOffset+myCropMarkLength), myX2], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	if (myWrap == 0 && i == 0)
	{
		myDrawLine([myY1+72, myX2+myCropMarkOffset, myY1+72, myX2+myCropMarkOffset+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
		myDrawLine([myY1-myCropMarkOffset, myX2-72, myY1-(myCropMarkOffset+myCropMarkLength), myX2-72], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	}

	//Lower left crop mark pair.
	myDrawLine([myY2, myX2+myCropMarkOffset, myY2, myX2+myCropMarkOffset+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	myDrawLine([myY2+myCropMarkOffset, myX2, myY2+myCropMarkOffset+myCropMarkLength, myX2], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	if (myWrap == 0 && i == 0)
	{
		myDrawLine([myY2-72, myX2+myCropMarkOffset, myY2-72, myX2+myCropMarkOffset+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
		myDrawLine([myY2+myCropMarkOffset, myX2-72, myY2+myCropMarkOffset+myCropMarkLength, myX2-72], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	}
}
function myDrawDielines (myX1, myY1, myX2, myY2, myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i, myWrap){

	//Upper dieline pair.
	myDrawDieLine([myY1, myX1-myCropMarkOffset, myY1, myX2+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);	
	myDrawDieLine([myY1-myCropMarkOffset, myX1, myY2+myCropMarkLength, myX1], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	if (myWrap == 0 && i == 0)
	{
		myDrawDieLine([myY1+72, myX1-myCropMarkOffset, myY1+72, myX2+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);	
	myDrawDieLine([myY1-myCropMarkOffset, myX1+72, myY2+myCropMarkLength, myX1+72], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	}

	//Lower left dieline pair.
	myDrawDieLine([myY2, myX1-myCropMarkOffset, myY2, myX2+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	if (myWrap == 0 && i == 0)
	{
		myDrawDieLine([myY2-72, myX1-myCropMarkOffset, myY2-72, myX2+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	}

	//Upper right dieline pair.
	myDrawDieLine([myY1-myCropMarkOffset, myX2, myY2+myCropMarkLength, myX2], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	if (myWrap == 0 && i == 0)
	{
		myDrawDieLine([myY1-myCropMarkOffset, myX2-72, myY2+myCropMarkLength, myX2-72], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, i);
	}
}

function myDrawLine(myBounds, myStrokeWeight, myRegistrationColor, myNoneSwatch, myLayer, i){
	app.activeDocument.pages[i].graphicLines.add(myLayer, undefined, undefined,{strokeWeight:myStrokeWeight, fillColor:myNoneSwatch, strokeColor:myRegistrationColor, geometricBounds:myBounds})
}
function myDrawDieLine(myBounds, myStrokeWeight, myRegistrationColor, myNoneSwatch, myLayer, i){
	app.activeDocument.pages[i].graphicLines.add(myLayer, undefined, undefined,{strokeType:"Dashed", strokeWeight:myStrokeWeight, fillColor:myNoneSwatch, strokeColor:myRegistrationColor, geometricBounds:myBounds})
}



/*var myTextFrame = myDocument.pages.item(0).textFrames.add();
myTextFrame.geometricBounds = ["6p", "6p", "24p", "24p"];
myTextFrame.contents = wrapChoice;*/