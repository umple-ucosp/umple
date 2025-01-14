// Copyright: All contributers to the Umple Project
// This file is made available subject to the open source license found at:
// http://umple.org/license
//
// Initializing and maintaining the features on the screen in UmpleOnline
// Layout initialization and maintenance is located in umple_layout.js.

Page = new Object();

// Refactoring definitive text location
Page.currentUmpleTextBeingEdited = "";

Page.selectedItem = null;
Page.selectedClass = null;
Page.selectedAssociation = null;
Page.selectedTransition = null;
Page.selectedGeneralization = null;
Page.canEditTask = false;
Page.canCreateTask = true;
Page.codeEffect = null;
Page.clickCount = 0;
Page.repeatToolItem = false;
Page.shortcutsEnabled = true;
Page.diagramSyncNeededAppend = false;
Page.modelDelimiter = "//$?[End_of_model]$?";

Page.codeMirrorOn = false;
Page.codeMirrorEditor = null;
Page.codeMirrorEditor6 = null;
Page.hLine = null;

Page.modelLoadingCount = 0;
Page.layoutLoadingCount = 0;
Page.canvasLoadingCount = 0;
Page.onLoadingCompleteCallbacks = [];

// Global options
Page.readOnly = false; // initially allow editing
Page.useEditableClassDiagram = true;
Page.useGvClassDiagram = false;
Page.useGvStateDiagram = false;
Page.useGvFeatureDiagram = false;
Page.showFeatureDependency = false;
Page.useStructureDiagram = false;
Page.useFeatureDiagram = false;
Page.showAttributes = true;
Page.showMethods = false;
Page.filterWordsOutput = "";
Page.mixsetsActive = new Array();
Page.filtersActive = new Array();
Page.copyableMixset="";
Page.specialSuboptionsActive = new Array();
Page.showActions = true;
Page.showText = true;
Page.showCanvas = true;
Page.showTraits = false;
Page.showTransitionLabels = false;
Page.showGuardLabels = false;
Page.showGuards = true;
Page.modifiedDiagrams = false;
Page.allowPinch = false;

Page.initialMouseDownX=0;
Page.initialMouseDownY=0;
Page.selectedGvClass="";

  Page.blahblah = function (theString) {
    console.log("In blah blah "+theString);
  }

// Gvmanual determines behaviour of editing so this function
// provides a shortcut to check for it
// Returns boolean
Page.isGvManual = function () {
  return Page.specialSuboptionsActive.includes("gvmanual");
}


// The following is set called from umple.php
Page.init = function(doShowDiagram, doShowText, doShowMenu, doReadOnly, doShowLayout, diagramType,generateDefault, doLoadTask, doEditTask, doCreateTask)
{ 
  if(performance.navigation.type == 2)
  {
    location.reload(true);
  }
  Page.canEditTask = doEditTask;
  Page.canCreateTask = doCreateTask;
  Layout.isDiagramVisible = doShowDiagram;  
  Layout.isTextVisible = doShowText;  
  Layout.isPaletteVisible = doShowMenu;  
  Layout.isLayoutVisible = doShowLayout;
  Page.readOnly = doReadOnly;

  TabControl.init();
  jQuery(".layoutListItem").hide();

  // Set diagram type - anything else means use the default editable class diagram
  if(diagramType == "GvState")   
  { 
    Page.useGvStateDiagram = true;
    Page.useEditableClassDiagram = false; 
    Page.setDiagramTypeIconState('GvState');
    Page.useGvFeatureDiagram = false;
    jQuery(".view_opt_state").show();

  }
  else if(diagramType == "GvClass")   
  {
    Page.useGvClassDiagram = true;
    Page.useEditableClassDiagram = false;
    Page.setDiagramTypeIconState('GvClass');
    Page.useGvFeatureDiagram = false;
    jQuery(".view_opt_class").show();

  }
  else if(diagramType == "GvClassTrait")   
  {
    Page.useGvClassDiagram = true;
    Page.useEditableClassDiagram = false;
    Page.setDiagramTypeIconState('GvClass');
    Page.useGvFeatureDiagram = false;
    Page.showTraits=true;
    jQuery(".view_opt_class").show();
  } 
  else if(diagramType == "GvFeature")   
  {
    Page.useGvFeatureDiagram = true;
    Page.useEditableClassDiagram = false;
    Page.useGvStateDiagram = false;
    Page.useStructureDiagram = false;
    Page.setDiagramTypeIconState('GvFeature');
    jQuery(".view_opt_feature").show();

  }
  else if(diagramType == "structureDiagram")
  {
    Page.useStructureDiagram = true;
    Page.useEditableClassDiagram = false;  
    Page.setDiagramTypeIconState('structureDiagram');
    Page.useGvFeatureDiagram = false;
  }
  else
  {
    jQuery(".view_opt_class").show();
    jQuery(".view_opt_class_palette").show();
  }

  jQuery.noConflict();
  jQuery(document).keydown(function(event){Action.keyboardShortcut(event);});
  
  Layout.init();
  Page.initPaletteArea();
  Page.initCanvasArea();
  Page.initUmpleTextArea();
  Page.initSourceCodeArea();
  Page.initCodeExecutionArea();
  jQuery(document).ready(function() {
    DropboxInitializer.initializeDropbox();
    ToolTips.initTooltips();
  });

  if(Page.readOnly) {jQuery("#" + Page.umpleCanvasId()).addClass("photoReady");}

  Action.loadFile();
  if (doLoadTask)
  {
    Action.loadTask(jQuery("#model").val().split("-")[1], true); // load task instruction
  }
  
  jQuery(generateDefault).prop("selected",true);
};

Page.initPaletteArea = function()
{
  var palette = "#palette";
  var paletteItems = palette + " *";
  jQuery(palette).accordion({heightStyle: "fill", fillSpace: true, active: 1, collapsible: true});
  jQuery(paletteItems).addClass("unselectable");
  
  Layout.initPaletteSize();
  
  Page.initJQueryButton("buttonGenerateCode");
  Page.initJQueryButton("buttonExecuteCode");
  Page.initJQueryButton("buttonStartOver");
  Page.initJQueryButton("buttonShowRefreshUmpleOnlineCompletely")
  Page.initJQueryButton("buttonLoadBlankModel");
  
  Page.initHighlighter("buttonAddClass");
  Page.initHighlighter("buttonAddAssociation");
  Page.initHighlighter("buttonAddTransition");
  Page.initHighlighter("buttonAddGeneralization");
  Page.initHighlighter("buttonDeleteEntity");
  Page.initHighlighter("buttonPngImage");
  Page.initHighlighter("buttonYumlImage");
  Page.initHighlighter("buttonSimulateCode");
  Page.initHighlighter("buttonUigu");
  Page.initHighlighter("buttonCopyClip");
  Page.initHighlighter("buttonCopyMix");  
  Page.initHighlighter("buttonCollabFork");
  Page.initHighlighter("buttonCopy");
  Page.initHighlighter("buttonCopyEncodedURL");
  Page.initHighlighter("buttonCopyCommandLine");
  Page.initHighlighter("buttonCopyLocalBrowser");
  Page.initHighlighter("buttonLoadLocalBrowser");
  if (Page.canEditTask)
  {
    //Page.initHighlighter("buttonEditTask");
    //Page.initHighlighter("buttonLoadThisTask");
    Page.initHighlighter("buttonRequestAllZip");
    Page.initHighlighter("buttonRequestLoadTaskURL");
  }
  if (Page.canCreateTask)
  {
    Page.initHighlighter("buttonCreateTask");
  }
  Page.initHighlighter("buttonLoadTask")
  
  Page.initHighlighter("buttonDownloadFiles");
  Page.initHighlighter("buttonSmaller");
  Page.initHighlighter("buttonLarger");
  Page.initHighlighter("buttonSyncCode");
  Page.initHighlighter("buttonSyncDiagram");
  Page.initHighlighter("buttonToggleMethods");
  Page.initHighlighter("buttonToggleAttributes");
  Page.initHighlighter("buttonToggleActions");
  Page.initHighlighter("buttonToggleTransitionLabels");
  Page.initHighlighter("buttonToggleGuards");
  Page.initHighlighter("buttonToggleGuardLabels");
  Page.initHighlighter("buttonToggleTraits");
  Page.initHighlighter("buttonToggleFeatureDependency");
  Page.initHighlighter("buttonallowPinch");
  Page.initHighlighter("buttonReindent");
  
  Page.initToggleTool("buttonAddClass");
  Page.initToggleTool("buttonAddAssociation");
  Page.initToggleTool("buttonAddTransition");
  Page.initToggleTool("buttonAddGeneralization");
  Page.initToggleTool("buttonDeleteEntity");
   
  Page.initAction("buttonPngImage");
  Page.initAction("buttonYumlImage");
  Page.initAction("buttonPhpCode");
  Page.initAction("buttonEcoreCode");  
  Page.initAction("buttonJavaCode");
  Page.initAction("buttonJavaAPIDoc");
//  Page.initAction("buttonZip");
  Page.initAction("buttonRubyCode");
  Page.initAction("buttonAlloyCode");
  Page.initAction("buttonNuSMVCode");
  Page.initAction("buttonSqlCode");
  Page.initAction("buttonCppCode");
  Page.initAction("buttonPhotoReady");
  Page.initAction("buttonSimulateCode");
  Page.initAction("buttonShowHideTextEditor");
  Page.initAction("buttonShowHideCanvas");
  Page.initAction("buttonShowEditableClassDiagram");
  Page.initAction("buttonShowJointJSClassDiagram");
    
  Page.initAction("buttonShowGvClassDiagram");
  Page.initAction("buttonShowGvStateDiagram");
  Page.initAction("buttonShowGvFeatureDiagram");//buttonShowGvFeatureDiagram
  Page.initAction("buttonShowStructureDiagram");
  Page.initAction("buttonShowHideLayoutEditor");
  Page.initAction("buttonManualSync");
  Page.initAction("buttonCopyClip");
  Page.initAction("buttonCopyMix");
  Page.initAction("buttonCollabFork");
  Page.initAction("buttonCopy");
  Page.initAction("buttonCopyEncodedURL");
  Page.initAction("buttonCopyCommandLine");
  Page.initAction("buttonCopyLocalBrowser");
  Page.initAction("buttonLoadLocalBrowser");
  if (Page.canEditTask)
  {
    //Page.initAction("buttonEditTask");
    //Page.initAction("buttonLoadThisTask");
    Page.initAction("buttonRequestAllZip");
    Page.initAction("buttonRequestLoadTaskURL");
  }
  if (Page.canCreateTask)
  {
    Page.initAction("buttonCreateTask");
  }
  Page.initAction("buttonLoadTask");

  Page.initAction("buttonDownloadFiles");
  Page.initAction("buttonUndo");
  Page.initAction("buttonRedo");
  Page.initAction("buttonReindent");
  Page.initAction("buttonUigu");
  Page.initAction("buttonStartOver");
  Page.initAction("buttonShowRefreshUmpleOnlineCompletely");
  Page.initAction("buttonLoadBlankModel");
  Page.initAction("buttonGenerateCode");
  Page.initAction("buttonExecuteCode");
  Page.initAction("buttonTabsCheckbox");
  Page.initAction("buttonSmaller");
  Page.initAction("buttonLarger");
  Page.initAction("buttonSyncCode");
  Page.initAction("buttonSyncDiagram");
  Page.initAction("buttonToggleMethods");
  Page.initAction("buttonToggleAttributes");
  Page.initAction("buttonToggleActions");
  Page.initAction("buttonToggleTraits");
  Page.initAction("buttonToggleFeatureDependency");
  Page.initAction("buttonToggleTransitionLabels");
  Page.initAction("buttonToggleGuards");
  Page.initAction("buttonToggleGuardLabels");
  Page.initAction("buttonAllowPinch");
    
  Page.initLabels();

  Page.enablePaletteItem("buttonUndo", false);
  Page.enablePaletteItem("buttonRedo", false);
  Page.enablePaletteItem("buttonSyncDiagram", false);
  Page.enablePaletteItem("buttonAddTransition", false);

  jQuery("#genstatus").hide();
  jQuery("#buttonViewComplete").hide();
  
  Page.initExamples();
  Page.initOptions();
  if(Page.readOnly) {
    jQuery("#mainDrawMenu").hide();
    jQuery(".layoutListItem").hide();
    jQuery("#preferencesTitle").hide();
    jQuery("#ttPhotoReady").hide();
    jQuery("#ttManualSync").hide();
    jQuery("#canvasSizeTitle").hide();
    jQuery("#buttonSmaller").hide();
    jQuery("#buttonLarger").hide();
    jQuery("#menuBookmarkable").hide();
  }
  if(Page.readOnly || !Layout.isPaletteVisible) {  
    jQuery("#topBookmarkable").hide();
  }
  if(!Layout.isPaletteVisible) {jQuery("#paletteColumn").hide();}
  if(!Layout.isTextVisible) {
    if(Page.readOnly) {
      jQuery("#topLine").hide(); 
    }
    else {
      jQuery("#linetext").hide();
    }
  }

  // Only show execute code button for the Java language
  jQuery("#inputGenerateCode").on('change', function() {
    if(this.value.split(":")[1] === 'Java' || this.value.split(":")[1] === 'Python') {
      jQuery("#buttonExecuteCode").show();
    } else {
      jQuery("#buttonExecuteCode").hide();
    }
  })
}

Page.initOptions = function()
{
  jQuery("#buttonShowHideLayoutEditor").prop('checked', Layout.isLayoutVisible);
  jQuery("#buttonShowHideTextEditor").prop('checked', Layout.isTextVisible);
  jQuery("#buttonShowHideCanvas").prop('checked', Layout.isDiagramVisible);
	jQuery("#buttonTabsCheckbox").prop('checked', false);
	jQuery("#tabRow").hide();
	jQuery("#ttTabsCheckbox").hide();
  jQuery("#buttonToggleAttributes").prop('checked',true);
  jQuery("#buttonToggleActions").prop('checked',true);
  jQuery("#buttonToggleTransitionLabels").prop('checked',false);
  jQuery("#buttonToggleGuards").prop('checked',true);  
  jQuery("#buttonToggleGuardLabels").prop('checked',false);
  jQuery("#buttonToggleTraits").prop('checked',Page.showTraits);
  jQuery("#buttonToggleFeatureDependency").prop('checked',false);
  jQuery("#buttonAllowPinch").prop('checked',false);
  
  if(Page.useEditableClassDiagram)
   jQuery("#buttonShowEditableClassDiagram").prop('checked', true);
  if(Page.useJointJSClassDiagram)
   jQuery("#buttonShowJointJSClassDiagram").prop('checked', true);
  if(Page.useGvClassDiagram)
    jQuery("#buttonShowGvClassDiagram").prop('checked', true);
  if(Page.useGvFeatureDiagram)
    jQuery("#buttonShowGvFeatureDiagram").prop('checked', true);

  if(Page.useGvStateDiagram)
    jQuery("#buttonShowGvStateDiagram").prop('checked', true);
  if(Page.useStructureDiagram)
    jQuery("#buttonShowStructureDiagram").prop('checked', true);

  jQuery("#buttonPhotoReady").prop('checked', false);
  jQuery("#buttonManualSync").prop('checked', false);
  
  jQuery("#buttonShowHideTextEditor").prop('disabled', false);
  jQuery("#buttonShowHideCanvas").prop('disabled', false);
  jQuery("#buttonPhotoReady").prop('disabled', false);
  jQuery("#buttonManualSync").prop('disabled', false);
}

Page.initHighlighter = function(id)
{
  var selector = "#" + id;
  jQuery(selector).mouseover(function() {Page.highlightItem(id);});
  jQuery(selector).mouseout(function() {Page.unhighlightItem(id);});
}

Page.removeHighlighter = function(id)
{
  var selector = "#" + id;
  
  jQuery(selector).unbind('mouseover');
  jQuery(selector).unbind('mouseout');
}

Page.enableCheckBoxItem = function(boxId, listItemId, doEnable)
{
  var listItem = jQuery("#" + listItemId);
  var checkbox = jQuery("#" + boxId);
  
  if (doEnable)
  {
    checkbox.prop('disabled', false);
    checkbox.css('cursor', 'pointer');
    listItem.css('color', 'Black');
    
  }
  else
  {
    checkbox.prop('disabled', true);
    checkbox.css('cursor', 'not-allowed');
    listItem.css('color', 'Silver');
  }
}

Page.enablePaletteItem = function(id, doEnable)
{
  var item = jQuery("#" + id);
  var enabled = !item.hasClass("disabled");
  
  if (enabled == doEnable) return;
  
  if (doEnable)
  {
    item.removeClass();
    item.prop('disabled', true);
    Page.initHighlighter(id);
  }
  else
  {
    item.removeClass();
    item.addClass("disabled");
    item.prop('disabled', false);
    Page.removeHighlighter(id);
  }
}

Page.initToggleTool = function(id)
{
  var item = jQuery("#" + id);
  item.unbind().click(function() {Page.toggleToolItem(id, false);});
  item.dblclick(function() {Page.toggleToolItem(id, true);});
}

Page.removeToggleTool = function(id)
{
  var item = jQuery("#" + id);
  item.unbind('click');
  item.unbind('dblclick');
}

Page.initJQueryButton = function(id)
{
  var selector = "#" + id;
  var value = jQuery(selector).attr("value");
  jQuery(selector).button({
    label: value,
    className: "jQuery-palette-button"
  });
}

Page.initAction = function(id)
{
  var selector = "#" + id;
  jQuery(selector).click(Action.clicked);
}

// Binds the label text on buttons to the button action
// Allows the user to click the label or the actual button
Page.initLabels = function()
{
  var labels = jQuery(".buttonExtend");
  
  for(var i = 0, len = labels.length; i < len; i++)
  {
    Page.initLabel(jQuery(labels[i]).prop("id") );
  }
}

Page.initLabel = function(id)
{
  var labelId = "#" + id;
  jQuery(labelId).click(function(x) {
    return function() {
      jQuery("#" + jQuery(x).prop("id").replace("label", "button")).trigger('click');
    }
  }(labelId));  
}

// BOOKMARK: adding basic event handlers to model and layout editors:: calls to Action...
Page.initUmpleTextArea = function()
{
  var modelEditor = jQuery("#umpleModelEditorText");
  var layoutEditor = jQuery("#umpleLayoutEditorText");
  
  modelEditor.keyup(function(eventObject){
    Action.freshLoad = false;
    Action.umpleTyped(eventObject);
  });
  modelEditor.mousedown(function(){setTimeout("jQuery(\"#linenum\").val(Action.getCaretPosition())",25)});
  layoutEditor.keyup(function(eventObject){
    Action.freshLoad = false;
    Action.setjustUpdateNowtoSaveLater(false);
    Action.umpleCodeMirrorTypingActivity("layoutEditor");
  }); // Fixes Issue#1571 Editing on the layout editor will not update the Umple diagram
  modelEditor.focus(function(){Action.focusOn("umpleModelEditorText", true);});
  layoutEditor.focus(function(){Action.focusOn("umpleLayoutEditorText", true);});
  modelEditor.blur(function(){Action.focusOn("umpleModelEditorText", false);});
  layoutEditor.blur(function(){Action.focusOn("umpleLayoutEditorText", false);});
  
  Page.initCodeMirrorEditor();
  Layout.initUmpleTextAreaSize();
  if (!Layout.isTextVisible) {Layout.showHideTextEditor(false);}
  if (!Layout.isLayoutVisible) {Layout.showHideLayoutEditor(false);}
}

/* codemirror 6 */
Page.initCodeMirrorEditor = function() {
  const extraKeys = [
    { key: "Ctrl-E", run: function() { Page.clickShowEditableClassDiagram() } },
    { key: "Ctrl-J", run: function() { Page.clickShowJointJSClassDiagram() } },
    { key: "Ctrl-G", run: function() { Page.clickShowGvClassDiagram() } },
    { key: "Ctrl-S", run: function() { Page.clickShowGvStateDiagram() } },
    { key: "Ctrl-L", run: function() { Page.clickShowStructureDiagram() } },
    { key: "Ctrl-T", run: function() { Page.clickShowHideText() } },
    { key: "Shift-Ctrl-Alt-T", run: function() { Page.clickShowHideText() } },
    { key: "Ctrl-D", run: function() { Page.clickShowHideCanvas() } },
    { key: "Ctrl-N", run: function() { Page.clickShowHideMenu() } },
    { key: "trl-Alt-N", run: function() { Page.clickShowHideMenu() } },
    { key: "Ctrl-Shift-=", run: function() { Page.clickButtonlarger() } },
    { key: "Ctrl-Shift--", run: function() { Page.clickButtonSmaller() } },
    { key: "Shift-Ctrl-A", run: function() { Page.clickToggleAttributes() } },
    { key: "Ctrl-M", run: function() { Page.clickToggleMethods() } },
    { key: "Ctrl-R", run: function() { Page.clickToggleTraits() } },
    { key: "Ctrl-I", run: function() { Page.clickToggleTransitionLabels() } },
    { key: "Ctrl-K", run: function() { Page.clickToggleGuardLabels() } },
    { key: "Ctrl-O", run: function() { Page.copyCommandLineCode() } },
    { key: "Ctrl-B", run: function() { Page.promptAndExecuteTest() } },
    { key: "Esc", run: function(cm6) { cm6.getInputField().blur() } },
  ]
    
  // codemirror 6 
  // comment the following when trying to mount react app
  const initialState = cm6.createEditorState(
    document.getElementById("newEditor").value, 
     {
       extensions: []
     });

  Page.codeMirrorEditor6 = cm6.createEditorView(
    initialState, document.getElementById("newEditor"));

  // adds changeListenerPlugin to the code editor
  // to listen to code changes happening in it
  // either due to collaborative editing or normal editing
  // without triggering any keyboard/mouse events
  Page.codeMirrorEditor6.dispatch({
    effects: cm6.StateEffect.appendConfig.of(cm6.changeListenerPlugin)
  });

  if (Page.readOnly) {
            Page.codeMirrorEditor6.dispatch({
          effects: cm6.editableCompartment.reconfigure(cm6.EditorView.editable.of(false))
      });
  }
      
  // Sets the codemirror 6 text without any change trigger (hopefully)
  Page.setCodeMirror6Text = function (textToSet) {
    Page.codeMirrorEditor6.dispatch({ 
      changes: { 
        from: 0, 
        to: Page.codeMirrorEditor6.state.doc.length, 
        insert: textToSet
        }
    } )
  }

   Page.codeMirrorEditor6.dom.addEventListener('mousedown', function () {
    Action.umpleCodeMirrorCursorActivity();
   });

  Page.codeMirrorOn = true;  
}

// Function to make the E G S icons in UmpleOnline context senstive (#1400)
Page.setDiagramTypeIconState = function(diagramType){
  buttonList = ['ECD_button','GCD_button','SD_button'];
  for (i = 0, l = buttonList.length; i<l;++i){
    document.getElementById(buttonList[i]).className = "button2";
  }
  switch(diagramType){
    case 'editableClass':
    document.getElementById('ECD_button').className = "button2 active";
    break;
    case 'GvClass':
    document.getElementById('GCD_button').className = "button2 active";
    break;
    case 'GvState':
    document.getElementById('SD_button').className = "button2 active";
    break;
  }
}

// Function to make the T D A M icons in UmpleOnline context senstive (#1400)
Page.setShowHideIconState = function(selectedButton){
  switch(selectedButton){
    case 'SHT_button':
      if(Page.showText){
        document.getElementById(selectedButton).className = "button2 active";
      } else {
        document.getElementById(selectedButton).className = "button2";
      }
      break;
    case 'SHD_button':
      if(Page.showCanvas){
        document.getElementById(selectedButton).className = "button2 active";
      } else {
        document.getElementById(selectedButton).className = "button2";
      }
      break;
    case 'SHA_button':
      if(Page.showAttributes){
        document.getElementById(selectedButton).className = "button2 active";
      } else {
        document.getElementById(selectedButton).className = "button2";
      }
      break;
    case 'SHM_button':
      if(Page.showMethods){
        document.getElementById(selectedButton).className = "button2 active";
      } else {
        document.getElementById(selectedButton).className = "button2";
      }
      break;
  }
}

// Functions to click various menu items - invoked by code mirror and MouseTrap
Page.clickShowEditableClassDiagram = function() {
  jQuery('#buttonShowEditableClassDiagram').trigger('click');
}
Page.clickShowJointJSClassDiagram = function() {
  jQuery('#buttonShowJointJSClassDiagram').trigger('click');
}
Page.clickShowGvClassDiagram = function() {
  jQuery('#buttonShowGvClassDiagram').trigger('click');
}
Page.clickShowGvStateDiagram = function() {
  jQuery('#buttonShowGvStateDiagram').trigger('click');
}
Page.clickShowGvFeatureDiagram = function() {
  jQuery('#buttonShowGvFeatureDiagram').trigger('click');
}
Page.clickShowStructureDiagram = function() {
  jQuery('#buttonShowStructureDiagram').trigger('click');
}
Page.clickShowHideText = function() {
  jQuery('#buttonShowHideTextEditor').trigger('click');
}
Page.clickShowHideCanvas = function() {
  jQuery('#buttonShowHideCanvas').trigger('click');
}
Page.clickShowHideMenu = function() {
  Layout.showHideMenu(); // No clickable button
}

Page.clickButtonlarger = function() {
  jQuery('#buttonLarger').trigger('click');
}
Page.clickButtonSmaller = function() {
  jQuery('#buttonSmaller').trigger('click');
}
Page.clickToggleAttributes = function() {
  jQuery('#buttonToggleAttributes').trigger('click');
}
Page.clickToggleMethods = function() {
  jQuery('#buttonToggleMethods').trigger('click');
}
Page.clickToggleTraits = function() {
  jQuery('#buttonToggleTraits').trigger('click');
}
Page.clickToggleFeatureDependency= function() {
  jQuery('#buttonToggleFeatureDependency').trigger('click');
}
Page.clickToggleTransitionLabels = function() {
  jQuery('#buttonToggleTransitionLabels').trigger('click');
}
Page.clickToggleGuardLabels = function() {
  jQuery('#buttonToggleGuards').trigger('click');
}
Page.clickToggleGuardLabels = function() {
  jQuery('#buttonToggleGuardLabels').trigger('click');
}

Page.clickAllowPinch = function() {
  jQuery('#buttonAllowPinch').trigger('click');
}


Page.isPhotoReady = function()
{
  if(Page.readOnly) {
    return(true)
  }
  else {
    var selector = "#buttonPhotoReady";
    return jQuery(selector).prop('checked');
  }
}

Page.initSourceCodeArea = function()
{
  SyntaxHighlighter.config.clipboardSwf = 'scripts/clipboard.swf';
  var generatedCodeRowSelector = "#generatedCodeRow";
  jQuery(generatedCodeRowSelector).hide();
}

Page.initCodeExecutionArea = function()
{
  var executionAreaSelector = "#codeExecutionArea";
  jQuery(executionAreaSelector).hide();
}

Page.showExecutionArea = function()
{
  var executionAreaSelector = "#codeExecutionArea";
  jQuery(executionAreaSelector).show();
}

Page.hideExecutionArea = function()
{
  var executionAreaSelector = "#codeExecutionArea";
  jQuery(executionAreaSelector).hide();
}

Page.hideGeneratedCode = function()
{
  jQuery("#generatedCodeRow").hide();
  jQuery("#innerGeneratedCodeRow").hide();
  if(!Page.useStructureDiagram) jQuery("#svgCanvas").hide();
}

Page.hideGeneratedCodeOnly = function() {
  jQuery("#generatedCodeRow").hide();
  jQuery("#innerGeneratedCodeRow").hide();
}

Page.initCanvasArea = function()
{
  var canvas = jQuery("#umpleCanvas");
  Layout.initUmpleCanvasSize();
  
  canvas.click(function(event){Action.umpleCanvasClicked(event);});
  canvas.mousemove(Action.mouseMove);
  canvas.focus(function(){Action.focusOn(Page.umpleCanvasId(), true);});
  canvas.blur(function(){Action.focusOn(Page.umpleCanvasId(), false);});
  canvas.delegate("[class$='editableDoubleClick']", 'dblclick', InlineEditor.handleOnClick);
  canvas.delegate("[class$='editableSingleClick']", 'click', InlineEditor.handleOnClick);

  if (!Layout.isDiagramVisible) {Layout.showHideCanvas(false);}
}
//The purpose of this function is make sure the URL example argument selects the appropriate dropdown example
Page.setExamples = function(ex)
{
  var exValue = ex+".ump"
  jQuery("#inputExample").change(Action.loadExample);
  jQuery("#inputExample option").each(function(){
    if (this.value==exValue || 
      (this.value.startsWith("http") && this.value.endsWith(exValue))){
      jQuery("#inputExample option[value = \""+exValue  +"\"]").attr("selected", true);
      return ;
    }
   }
  )
 
  jQuery("#inputExampleType").change(Action.setExampleType);

  jQuery("#inputExample2").change(Action.loadExample);
  jQuery("#inputExample2 option").each(function(){
     if (this.value==exValue || 
      (this.value.startsWith("http") && this.value.endsWith(exValue))){
      jQuery("#inputExample2 option[value = \""+exValue  +"\"]").attr("selected", true);
      return ;
    }
   }
  )
  
  jQuery("#inputExample3").change(Action.loadExample);
  jQuery("#inputExample3 option").each(function(){
    if (this.value==exValue || 
      (this.value.startsWith("http") && this.value.endsWith(exValue))){
      jQuery("#inputExample3 option[value = \""+exValue  +"\"]").attr("selected", true);
      return ;
    }
   }
  )
 
  jQuery("#inputExample4").change(Action.loadExample);
  jQuery("#inputExample4 option").each(function(){
    if (this.value==exValue || 
      (this.value.startsWith("http") && this.value.endsWith(exValue))){
      jQuery("#inputExample4 option[value = \""+exValue  +"\"]").attr("selected", true);
      return ;
    }
   }
  )

  // TODO the following does not yet properly work to open the files from the command line
  // DEBUG
  jQuery("#inputExample5").change(Action.loadExample);
  jQuery("#inputExample5 option").each(function(){
    if (this.value==exValue || 
      (this.value.startsWith("http") && this.value.endsWith(exValue))){
      jQuery("#inputExample5 option[value = \"extraExamples1/"+exValue  +"\"]").attr("selected", true);
      return ;
    }
   }
  )
}
Page.initExamples = function()
{
 
  jQuery("#inputExample").change(Action.loadExample);
  jQuery("#defaultExampleOption").attr("selected",true);
 
  jQuery("#inputExampleType").change(Action.setExampleType);

  jQuery("#inputExample2").change(Action.loadExample);
  jQuery("#defaultExampleOption2").attr("selected",true);

  jQuery("#inputExample3").change(Action.loadExample);
  jQuery("#defaultExampleOption3").attr("selected",true);

  jQuery("#inputExample4").change(Action.loadExample);
  jQuery("#defaultExampleOption4").attr("selected",true);

  jQuery("#inputExample5").change(Action.loadExample);
  jQuery("#defaultExampleOption5").attr("selected",true);

  jQuery("#inputExample6").change(Action.loadExample);
  jQuery("#defaultExampleOption6").attr("selected",true);

  jQuery("#inputExample7").change(Action.loadExample);
  jQuery("#defaultExampleOption7").attr("selected",true);

  jQuery("#inputExample8").change(Action.loadExample);
  jQuery("#defaultExampleOption8").attr("selected",true);


  if (Page.useStructureDiagram) {
    jQuery("#structureModels").prop("selected",true);
    jQuery("#itemLoadExamples").hide();
    jQuery("#itemLoadExamples2").hide();
    jQuery("#itemLoadExamples4").hide();      
    jQuery("#itemLoadExamples5").hide();   
    jQuery("#itemLoadExamples6").hide();   
    jQuery("#itemLoadExamples7").hide();   
    jQuery("#itemLoadExamples8").hide();   

  }
  else if (Page.useGvStateDiagram) {
    jQuery("#smModels").prop("selected",true);
    jQuery("#itemLoadExamples").hide();
    jQuery("#itemLoadExamples3").hide();
    jQuery("#itemLoadExamples4").hide();
    jQuery("#itemLoadExamples5").hide();
    jQuery("#itemLoadExamples6").hide();   
    jQuery("#itemLoadExamples7").hide();   
    jQuery("#itemLoadExamples8").hide();   

  }
 else if (Page.useGvFeatureDiagram) {
    jQuery("#featureModels").prop("selected",true);
    jQuery("#itemLoadExamples").hide();
    jQuery("#itemLoadExamples2").hide();
    jQuery("#itemLoadExamples3").hide();
    jQuery("#itemLoadExamples5").hide();
    jQuery("#itemLoadExamples6").hide();   
    jQuery("#itemLoadExamples7").hide();   
    jQuery("#itemLoadExamples8").hide();   

  }
  else {
    // TODO any examples loaded on initialization without a 
    // URL argument will choose class diagrams
    // Therefore for new example sets 5-8, we will need to change this logic
    // to determine which set to hide
    jQuery("#cdModels").prop("selected",true); 
    jQuery("#itemLoadExamples2").hide();
    jQuery("#itemLoadExamples3").hide(); 
    jQuery("#itemLoadExamples4").hide();
    jQuery("#itemLoadExamples5").hide();
    jQuery("#itemLoadExamples6").hide();   
    jQuery("#itemLoadExamples7").hide();   
    jQuery("#itemLoadExamples8").hide();   

  }  
}


Page.highlightItem = function(id)
{
  var selector = "#" + id;
  jQuery(selector).addClass("highlight");
}

Page.unhighlightItem = function(id)
{
  var selector = "#" + id;
  jQuery(selector).removeClass("highlight");
}

Page.enableDiagram = function(doEnable)
{
  Page.enableEditDragAndResize(doEnable);
  Page.enablePaletteItem("buttonAddClass", doEnable);
  Page.enablePaletteItem("buttonAddAssociation", doEnable);
  Page.enablePaletteItem("buttonAddGeneralization", doEnable);
  Page.enablePaletteItem("buttonDeleteEntity", doEnable);
  Page.showDiagramSyncNeeded(!doEnable);
}
Page.enableTransition = function(doEnable)
{
    Page.enablePaletteItem("buttonAddTransition", doEnable);
    Page.enablePaletteItem("buttonAddAssociation", !doEnable);
}

Page.enableEditDragAndResize = function(doEnable)
{
  if (doEnable)
  {
    jQuery("span.editable").removeClass("uneditable");
    jQuery("div.umpleClass").removeClass("unselectable");
    jQuery("div.umpleClass.ui-draggable").draggable({disabled: false});
  } 
  else
  {
    jQuery("span.editable").addClass("uneditable");
    jQuery("div.umpleClass").addClass("unselectable");
    jQuery("div.umpleClass.ui-draggable").draggable({disabled: true});
    jQuery(':text').blur()

  }
}

Page.toggleToolItem = function(id, doubleClicked)
{
  if (doubleClicked == undefined) doubleClicked = false;
  Page.repeatToolItem = doubleClicked;
  
  var toolSelected = id.substring(6);
  var isNewTool = (toolSelected != Page.selectedItem);
  
  if (isNewTool)
  {
    Page.selectToggleTool(toolSelected);
  }
  else
  {
    Page.unselectAllToggleTools();
  }
}

Page.unselectAllToggleTools = function()
{
  var unselected = false;
  var temp = false;

  temp = DiagramEdit.removeNewClass();
  if(temp) unselected = true;
  temp = DiagramEdit.removeNewAssociation();
  if(temp) unselected = true;
  temp = DiagramEdit.removeNewTransition();
  if(temp) unselected = true;
  temp = DiagramEdit.removeNewGeneralization();
  if(temp) unselected = true;
  
  var allSelectedItems = "ul.toggle li.selected"; 
  jQuery(allSelectedItems).removeClass("selected highlight");
  
  setTimeout("Page.enableEditDragAndResize(true);", 500);
  Page.selectedItem = null;
  Page.repeatToolItem = false;

  return unselected;
}

Page.selectToggleTool = function(toolSelected)
{
  if (Page.selectedItem != null)
  {
    DiagramEdit.removeNewClass();
    DiagramEdit.removeNewAssociation();
    DiagramEdit.removeNewTransition();
    DiagramEdit.removeNewGeneralization();
  }
  
  Page.enableEditDragAndResize(false);
  Page.selectedItem = toolSelected;
  Action.unselectAll();
  
  var allSelectedItems = format("ul.toggle li.selected");
  var newSelectedItem = "#button" + toolSelected;
  jQuery(allSelectedItems).removeClass("selected highlight");
  jQuery(newSelectedItem).addClass("selected");
}

Page.canShowHovers = function()
{
  return Page.selectedItem == null || Page.selectedItem == "DeleteEntity";
}

Page.getRawUmpleCode = function()
{
  return document.getElementById('umpleModelEditorText').value;
}

// CM6 function corresponding to CM5 Page.getRawUmpleCode()
Page.getRawUmpleCodeCM6 = function()
{
  return Page.codeMirrorEditor6.state.doc.toString();
}

Page.getUmpleCode = function()
{
  // DEBUG
  // console.log("Inside Page.getUmpleCode ...")
  var modelCleaned = Page.getRawUmpleCodeCM6().replace(Page.modelDelimiter, "");
  var positioning = jQuery("#umpleLayoutEditorText").val().replace(Page.modelDelimiter, "");
  if(positioning !== "" && !positioning.includes("namespace -;")){
   // prepend namespace cancellation to prevent namespace redefinition errors
    positioning = "\n\nnamespace -;\n"+positioning;
  }
  var umpleCode = modelCleaned + Page.modelDelimiter + positioning;
  return umpleCode;
}

Page.getEncodedURL = function()
{
  var server=window.location.href.split("?")[0];
  if(server.substr(0,37)=="https://cruise.umple.org/umpleonline/") {
    server = "http://try.umple.org/";
  }
  return server+"?text=" + encodeURIComponent(Page.getUmpleCode());
}

Page.splitUmpleCode = function(umpleCode)
{
  // DEBUG
  // console.log("Inside Page.splitUmpleCode ...")

  var splitIndex = umpleCode.indexOf(Page.modelDelimiter);
  if (splitIndex == -1)
  {
    model = umpleCode;
    positioning = "";
  }
  else
  {
    umpleCode = umpleCode.replace(Page.modelDelimiter, "");
  
    var model = umpleCode.substr(0, splitIndex);
    var positioning = umpleCode.substr(splitIndex, umpleCode.length);
  }
  var modelAndPositioning = [model, positioning];
  return modelAndPositioning;
}  

// Takes as an argument the full file with core code and layout info
// Called by fuunctions such as loadExampeCallback and loadFileCallback
// Also called by updateUmpleTextCallback which is triggered by diagram edit by directUpdateCommandCallback  
// Updates all text editors, and then can call a function called reason
Page.setUmpleCode = function(umpleCode, reason)
{
  // DEBUG
  // console.log("Inside Page.setUmpleCode() ...")
  var modelAndPositioning = Page.splitUmpleCode(umpleCode);

  // Update the layout editor with the second part of the combined file
  // console.log("Setting positioningCode into umpleLayoutEditorText html element ...")
  jQuery("#umpleLayoutEditorText").val(modelAndPositioning[1]);

  if(Page.codeMirrorOn) {
    // issue#1409  Do not Set the umple code if codeChange is false(i.e. reason is false)
    if (!((typeof reason === 'boolean') && reason == false))
    {
      Page.setCodeMirror6Text(modelAndPositioning[0]);
    }
  }
  // Refactoring definitive text location
  // Update Codemirror 6 and the backup variable
  // console.log("Setting modelCode to codeMirror 6 ...")
  Action.updateCurrentUmpleTextBeingEdited(modelAndPositioning[0]);

  if (typeof reason === 'function'){
    reason();
  }
}

Page.setUmplePositioningCode = function(positioning)
{
  jQuery("#umpleLayoutEditorText").val(positioning);
}

Page.umpleCanvasId = function()
{
  return "umpleCanvas";
}

// Page.createBookmark() is called when Save & Collaborate button is clicked in umpleonline ui
// this method internally calls Page.connectCollabServer() which connects the current client to the UmpleCollabServer
// and enables the current users to collaborate by sharing the collaborative URL
Page.createBookmark = function()
{
  TabControl.useActiveTabTo(TabControl.saveTab)(Page.getUmpleCode());
  TabControl.saveActiveTabs();
  window.location.href = "bookmark.php?model=" + Page.getModel();
}

// same as Page.createBookmark()
// but creates a new temporary copy of the bookmarked model
// useful when collaborating and the user wants to work
// independently on their own version
Page.createBookmarkFork = function()
{
  TabControl.useActiveTabTo(TabControl.saveTab)(Page.getUmpleCode());
  TabControl.saveActiveTabs();
  window.location.href = "bookmark.php?model=" + Page.getModel() + "&forkSoMakeTmpOnly";
}

Page.createTask = function()
{
  var taskName = jQuery("#taskName").val();
  let patt = /^(\w|\.)+$/; // taskName Take only [ A-Z or a-z or 0-9 or _ or . ]
  if (!patt.test(taskName))//taskName.indexOf(" ") != -1 || taskName.indexOf("/") != -1 || taskName.indexOf("-") != -1 || taskName.indexOf("\\") != -1) 
  {
    window.alert("Task Name can only contain letters(case insensitive), underscores, dots, and digits!");
    return;
  }
  var requestorName = jQuery("#requestorName").val();
  var instructions = jQuery("#instructions");
  var completionURL = jQuery("#completionURL").val();
  var isExperiment = jQuery("#isExperiment").is(':checked');
  // jQuery("#labelInstructions").hide();
  TabControl.useActiveTabTo(TabControl.saveTab)(Page.getUmpleCode());
  TabControl.saveActiveTabs();
  Ajax.sendRequest("task.php",Page.createTaskCallback,format("taskName={0}&instructions={1}&model={2}&requestorName={3}&completionURL={4}&isExperiment={5}", 
    taskName, instructions.val(), Page.getModel(), requestorName, completionURL, isExperiment));
}


Page.createTaskCallback = function(response)
{
  if (response.responseText.split(" ")[0] == "Task")
  {
    window.alert("Not able to create a task with that name. " + response.responseText);
  }
  else 
  {
    window.location.href = "umple.php?task=1&model=" + response.responseText;
  }
}

Page.editTask = function()
{
  var instructions = jQuery("#instructions");
  var taskName = jQuery("#model").val().split("-")[1];
  var requestorName = jQuery("#requestorName").val();
  var completionURL = jQuery("#completionURL").val();
  var isExperiment = jQuery("#isExperiment").is(':checked');
  TabControl.useActiveTabTo(TabControl.saveTab)(Page.getUmpleCode());
  TabControl.saveActiveTabs();
  Ajax.sendRequest("task.php", Page.editTaskCallback, "edit=1&taskName=" + taskName + "&instructions=" + instructions.val() + "&model=" 
    + Page.getModel() + "&requestorName=" + requestorName + "&completionURL=" + completionURL + "&isExperiment=" + isExperiment);
  //window.location.href = "task.php?edit=1&taskName=" + taskName + "&instructions=" + instructions.val() + "&model=" + Page.getModel() + "&requestorName=" + requestorName;
  //window.alert("Successfully edit Task " + taskName + "!");
}

Page.editTaskCallback = function(response)
{
  Page.setFeedbackMessage('Changes saved');
}

Page.cancelTaskResponse = function()
{
  var answer = confirm("Are you sure to cancel this task response?");
  if (answer)
  {
    window.location.href = "task.php?cancelTaskResponse=1&model=" + Page.getModel();
  }
}
Page.hideTask = function(){
    jQuery("#taskArea").css("display","none");
    jQuery("#labelTaskName").css("display","none");
    jQuery("#taskNameCell").css("display","none");
    jQuery("#instructions").css("display","none");
    jQuery("#isExperimentCell").css("display","none");
    jQuery("#isExperiment").attr("checked", false);
    Layout.zoomResize();
}
Page.cancelTask = function(){
   
   if (jQuery("#completionURL").val()!='' || jQuery("#taskName").val()!='' || jQuery("#requestorName").val()!='' || jQuery("#instructions").val()!=''){

    var answer = confirm ("Are you sure you want to end the task creation process?");
	
    if (answer){
    jQuery("#taskName").val('');
    jQuery("#requestorName").val('');
    jQuery("#completionURL").val('');
    jQuery("#instructions").val('');
    Page.hideTask();
    }
    }
    else{ Page.hideTask();}
}

Page.endTaskEdit = function() {
  
    var answer = confirm ("Are you sure you want to end the task editing process?");
    if (answer){
    	Page.hideTask();
    }
  
}

Page.toggleTabs = function()
{
  TabControl.isHidden()? TabControl.showTabs() : TabControl.hideTabs();
  Layout.layoutHandler.adjustAfterWindowResize();
}

Page.showDiagramSyncNeeded = function(doShow)
{
  var canvas = jQuery("#umpleCanvas");
  var messageDiv =  '<div id="syncNeededMessage" class="syncNeededMessage unselectable">' +
              'Diagram is out of synchronization with the text due to selecting Manual Sync or an error in the text that has caused the compiler to produce no output. ' +
            '</div>';
  if (doShow && !Page.diagramSyncNeededAppend)
  {
    canvas.append(messageDiv);
    Page.diagramSyncNeededAppend = true;
    Page.readOnly = true;
    UmpleSystem.redrawCanvas();
  }
  else if(!doShow && Page.diagramSyncNeededAppend)
  {
    jQuery("#syncNeededMessage").remove();
    Page.diagramSyncNeededAppend = false;
    Page.readOnly = false;
    UmpleSystem.redrawCanvas();
  }
  
}

Page.hideLoading = function()
{
  // change to code mirror 6
  // var modelEditor = "#topTextEditor";
  var modelEditor = "#newEditor";
  var layoutEditor = "#bottomTextEditor";
  var canvas = "#" + Page.umpleCanvasId();  

  if(Page.modelLoadingCount > 0) Page.modelLoadingCount--;
  if(Page.layoutLoadingCount > 0) Page.layoutLoadingCount--;
  if(Page.canvasLoadingCount > 0) Page.canvasLoadingCount--;

  if(Page.modelLoadingCount === 0) jQuery(modelEditor).hideLoading();
  if(Page.layoutLoadingCount === 0) jQuery(layoutEditor).hideLoading();
  if(Page.canvasLoadingCount === 0) jQuery(canvas).hideLoading();
  
  if(Page.modelLoadingCount === 0 
    && Page.layoutLoadingCount === 0 
    && Page.canvasLoadingCount === 0)
  {
    jQuery(".bookmarkableUrl").removeClass("disabled");
  }
}

Page.showModelLoading = function()
{
  // change to code mirror 6
  var modelEditor = jQuery("#newEditor");

  if(Page.modelLoadingCount == 0)
  {
    if (jQuery("#textEditorColumn").is(":visible"))
    {
      modelEditor.showLoading();
    }
    jQuery(".bookmarkableUrl").addClass("disabled");
  }

  Page.modelLoadingCount++;
}

Page.showLayoutLoading = function()
{
  var layoutEditor = jQuery("#bottomTextEditor");
  
  if(Page.layoutLoadingCount == 0)
  {
    jQuery(".bookmarkableUrl").addClass("disabled");
    if (layoutEditor.is(":visible")) 
    {
      layoutEditor.showLoading();
    }
  }

  Page.layoutLoadingCount++;
}

Page.showCanvasLoading = function()
{
  // console.log("Inside Page.showCanvasLoading() ...")

  var canvas = jQuery("#umpleCanvas");
  if(Page.canvasLoadingCount == 0)
  {
    jQuery(".bookmarkableUrl").addClass("disabled");
    if (canvas.is(":visible"))
    {
      canvas.showLoading();
    }
  }
  
  Page.canvasLoadingCount++;
}

Page.resetCanvasSize = function()
{
  Page.setUmpleCanvasSize(Layout.minCanvasSize.width, Layout.minCanvasSize.height);
}


Page.getSelectedExample = function()
{
  var inputExample = "";
  var theExampleType = Page.getExampleType();

  // store the menu id of the example set as there will be more than one for class diagrams
  var exampleSet = theExampleType;

  // The default model type comes from the first 4 menu items created in umple.php
  // But as we add additional special sets of examples, we need to define the exampleType
  if(theExampleType.substring(0,5) == "extra") {
    theExampleType = "cdModels";
  }

  if(theExampleType == "cdModels") {
    // Jan 2025 change to ensure class diagrams by default use GvClass.
    var requiresGvClass = true; // Some class diagrams  are too complex to edit

    var exampleSetIDToLoad = "inputExample";
    if (exampleSet == "extra1ModelsAD") {
      exampleSetIDToLoad = "inputExample5";
      requiresGvClass = true; // All these examples are too complex for E mode
    }
    else if (exampleSet == "extra1ModelsEL") {
      exampleSetIDToLoad = "inputExample6";
      requiresGvClass = true; // All these examples are too complex for E mode
    }
    else if (exampleSet == "extra1ModelsMP") {
      exampleSetIDToLoad = "inputExample7";
      requiresGvClass = true; // All these examples are too complex for E mode
    }
    else if (exampleSet == "extra1ModelsQZ") {
      exampleSetIDToLoad = "inputExample8";
      requiresGvClass = true; // All these examples are too complex for E mode
    }

    inputExample = jQuery("#"+exampleSetIDToLoad+" option:selected").val();

    // Override special case to use G mode where E mode is too complex
    // Commented out when making G mode default
    // TODO: Consider tagging the examples by mode in umple.php rather than here
    // if (inputExample == "GeometricSystem.ump") {
    //  requiresGvClass = true;
    // }

    if(requiresGvClass) {
      // if diagram type not a editable class diagram, set it 
      if(!Page.useGvClassDiagram) {
        jQuery("#buttonShowGvClassDiagram").attr('checked', true); 
        Action.changeDiagramType({type: "GvClass"});
      }
    }
    else {
      // if diagram type not a class diagram, set it to a class diagram
      if(!(Page.useEditableClassDiagram || Page.useGvClassDiagram)) {
        jQuery("#buttonShowEditableClassDiagram").attr('checked', true); 
        Action.changeDiagramType({type: "editableClass"});
      }
    }
  }
  else if (theExampleType == "featureModels")
    {
       inputExample = jQuery("#inputExample4 option:selected").val(); 
     //  if (inputExample == "BerkeleyDB_SP_featureDepend.ump")
     //  this.showFeatureDependency = true;
       if( !Page.useGvFeatureDiagram) {
         jQuery("#buttonShowGvFeatureDiagram").attr('checked', true); 
         Action.changeDiagramType({type: "GvFeature"});
      }
    
    }
  else {

    if(theExampleType == "smModels") {
      inputExample = jQuery("#inputExample2 option:selected").val();
      // if diagram type is not a state machine, set to state machine
      if( !Page.useGvStateDiagram && !Page.useJointJSClassDiagram) {
         jQuery("#buttonShowGvStateDiagram").attr('checked', true); 
         Action.changeDiagramType({type: "GvState"});
      }
    }
    else {
      inputExample = jQuery("#inputExample3 option:selected").val();
      // if diagram type is not a structure diagram, set to structure diagram
      if( !Page.useStructureDiagram) {
         jQuery("#buttonShowStructureDiagram").attr('checked', true); 
         Action.changeDiagramType({type: "structure"});
      }    
    }
  }
  return inputExample;
}

Page.getExampleType = function()
{
  var exampleType = jQuery("#exampleType option:selected").val();
  return exampleType;
}

Page.showCodeDone = function()
{
  var gcselector = "#genstatus";
  jQuery(gcselector).show();
  setTimeout(function() {jQuery(gcselector).hide();}, 2000);
}

Page.showViewDone = function()
{
  var selector = "#buttonViewComplete";
  jQuery(selector).dialog({closeOnEscape:true, hide:'puff', height:100, width:250});
  setTimeout(function() {jQuery(selector).dialog("close");}, 2000);
}

Page.showExecutedResponse = function(responseText) {
  jQuery("#executionMessage").html(responseText);
}

Page.showGeneratedCode = function(code,language,tabnumber)
{
	// Default "tabnumber" parameter to null, ie. only output to the main codeblock
	if (typeof(tabnumber)==='undefined') tabnumber = "";

	Action.toggleTabsCheckbox(language);

  Page.applyGeneratedCodeAreaStyles(language);
  
  var errorMarkup = Page.getErrorMarkup(code, language);
  var generatedMarkup = Page.getGeneratedMarkup(code, language);

  //Set download link, any error or warning messages 
	if (tabnumber == "")
  {
    jQuery("#downloadArea").html(errorMarkup);
  } else {
    jQuery("#messageArea").html(errorMarkup);
  }

  //Set the generated content
  if(language == "java" || language == "php" || language == "cpp" 
    || language == "ruby" || language == "python" || language == "xml" || language == "sql" || language == "alloy" || language == "nusmv")
  {
		jQuery("#innerGeneratedCodeRow" + tabnumber).html(
			formatOnce('<pre class="brush: {1};">{0}</pre>',generatedMarkup,language)
		)
    SyntaxHighlighter.highlight("code");

		if(tabnumber == ""){
			// Remove all previous file codeblocks
			jQuery('#innerGeneratedCodeRow').nextAll().remove();
			// Clear tab row contents
			jQuery('#tabRow').html('');
			// Generate tabs
			Action.generateTabsCode(code);
			Action.toggleTabs();
		}
  }
  else if(language == "structureDiagram")
  {
    //render the structure diagram
    eval(generatedMarkup);

    //Add a download link to the top of the structure diagram
    //This onclick ensures the href is not followed
    var downloadLink = '<div id="diagramLinkContainer"></div>';
    errorMarkup = downloadLink + errorMarkup;

		if(errorMarkup != ""){
    	jQuery("#messageArea").html(errorMarkup);
		}
    Page.toggleStructureDiagramLink(false);
  }
  else
  {
    jQuery("#innerGeneratedCodeRow" + tabnumber).html(generatedMarkup);
  }
}

Page.applyGeneratedCodeAreaStyles = function(language)
{
  var generatedArea = jQuery("#generatedCodeRow");
  generatedArea.show();
  jQuery("#innerGeneratedCodeRow").show();

  //Modify styles and show or hide containers depending on the content
  //Error message
  if(language == "diagramUpdate") 
  {
    generatedArea.removeClass('generatedCode');
    generatedArea.removeClass('generatedDiagram');
  }
  //One of the svg diagram types
  else if(language == "stateDiagram" || language == "classDiagram" || language == "structureDiagram")
  {
    generatedArea.removeClass('generatedCode');
    generatedArea.addClass('generatedDiagram');
    
    if(language == "structureDiagram")
    {
      //Add an svg container to hold the structure diagram
      jQuery("#innerGeneratedCodeRow").html('<svg id="generatedSVGCanvas"></svg>')
    }
  }
  //Generated code
  else
  {
    generatedArea.removeClass('generatedDiagram');
    generatedArea.addClass('generatedCode');
  }
}

// Pulls any error and warning markup from the response from code generation
Page.getErrorMarkup = function(code, language)
{
  var output = "";
  
  if(language == "classDiagram" || language == "stateDiagram")
  { // Covers Graphviz class and state diagrams
    output = code.split("<svg xmlns=")[0];
    output = output.replace(/&nbsp;\s*$/, "");
  }
  else if(language == "javadoc" || language == "yumlDiagram")
  { // Covers javadoc and YUML diagrams
    output = code.split("<iframe ")[0];
  }
  else if(language == "diagramUpdate")
  { // Covers simple right-hand side canvas updates
    output = code.replace(/<p>[\s\S]*/, "");
  }
  else
  {
    // Covers the rest of the generated languages
    // Don't assign error markup unless there was a split - see #1362
    var split = code.split("<p>URL_SPLIT");
    if (split.length > 1){
      output = split[0];
    }
  }

  return output;
}

// Removes any extraneous code from the generated code to display
Page.getGeneratedMarkup = function(code, language)
{
  var output = "";
  
  if(language == "classDiagram" || language == "stateDiagram")
  { // Covers Graphviz class and state diagrams
    output = code.split("<svg width=")[1];
    output = "<svg width=" + output;
    output = output.replace(/<\/svg>$/, "");
  }
  else if(language == "javadoc" || language == "yumlDiagram")
  { // Covers javadoc and YUML diagrams
    output = code.split("<iframe ")[1];
    output = "<iframe " + output;
  }
  else if(language == "diagramUpdate")
  { // Covers simple right-hand side canvas updates
    // No generated code to extract
  }
  else if(language == "structureDiagram") 
  {
    // Covers the structure diagram code
    output = code.split("<p>URL_SPLIT")[1];
    output = output.replace(/##CANVAS_ID##/g, "generatedSVGCanvas");
    // Converts html encoded special characters to plaintext
    output = jQuery("<div/>").html(output).text();
  }
  else
  {
    // Covers the rest of the generated languages
    // Assign to entire code block if non-splitting - see #1362
    var split = code.split("<p>URL_SPLIT");
    output = (split.length > 1) ? split[1] : code;
  }
  return output;
}

Page.toggleStructureDiagramLink = function(isGenerated, filename)
{
  linkContainer = jQuery("#diagramLinkContainer");

  if(isGenerated)
  {
    linkContainer.html(format("<a href='{0}' target='_blank' id='structureLink'>Download the SVG for the following</a>", filename))
    jQuery("#structureLink").on('click', function(event) 
    {
      Page.toggleStructureDiagramLink(false);
    });
  }
  else
  {
    linkContainer.html('<div id="buttonStructureLink" value="Generate SVG"></div>');
    Page.initJQueryButton("buttonStructureLink");
    Page.initAction("buttonStructureLink");
  }
}

Page.setFilename = function(filename)
{
  jQuery("#filename").val(filename);
}

Page.setFeedbackMessage = function(feedbackMessage)
{
  document.getElementById('feedbackMessage').innerHTML=feedbackMessage;
}

Page.setExampleMessage = function(exampleMessage)
{
  document.getElementById('exampleMessage').innerHTML=exampleMessage;
}

Page.getFeedbackMessage = function()
{
  return document.getElementById('feedbackMessage').innerHTML;
}

Page.catFeedbackMessage = function(feedbackMessage)
{
  var origMsg = document.getElementById('feedbackMessage').innerHTML;
  document.getElementById('feedbackMessage').innerHTML=origMsg+feedbackMessage;
}

Page.getFilename = function()
{
  return jQuery("#filename").val();
}

Page.getAdvancedMode = function()
{
  return document.getElementById("advancedMode").value;
}

Page.getModel = function()
{
  return jQuery("#model").val();
}

jQuery.fn.selectRange = function(start, end) {
  return this.each(function() 
  {
    if(this.setSelectionRange) 
    {
      this.focus();
      this.setSelectionRange(start, end);
    } 
    else if(this.createTextRange) 
    {
       var range = this.createTextRange();
       range.collapse(true);
       range.moveEnd('character', end);
       range.moveStart('character', start);
       range.select();
    }
  });
}

// checks if the uel of current page is bookmark or not
Page.isBookmarkURL = function() {
  const currentURL = window.location.href;
  const modelName = currentURL.substring(currentURL.indexOf("?model=") + 1) 
  if(currentURL.includes("model") && modelName.length!=0){
    return true;
  }
  return false;
}