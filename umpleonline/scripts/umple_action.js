// Copyright: All contributers to the Umple Project
// This file is made available subject to the open source license found at:
// http://umple.org/license
//
// Actions triggered by UI elements in UmpleOnline
// plus helper functions
// Actions associated with editing the graphical diagram are
// located in the umple_action_diagram.js file.
//
var Action = new Object();
Action.waiting_time = 1500;
Action.oldTimeout = null;
Action.elementClicked = false;
Action.canCreateByDrag = true;
Action.manualSync = false;
Action.diagramInSync = true;
Action.freshLoad = false;
Action.gentime = new Date().getTime();
Action.savedCanonical = "";
Action.gdprHidden = false;
Action.update = "";

const clientDebuggerFlag = false;


// Regulators of whether a save occurs on not
// false: the program proceeds and saves as normal; true: skip the save as the program would have saved earlier already
let justUpdatetoSaveLater = false;

Action.setjustUpdatetoSaveLater = function(state){
  justUpdatetoSaveLater = state;
}

let justUpdatetoSaveLaterForTextCallback = false;

Action.setjustUpdatetoSaveLaterForTextCallback = function(state){
  justUpdatetoSaveLaterForTextCallback = state;
}

Action.clicked = function(event)
{
  Page.clickCount += 1;

  var obj = event.currentTarget;
  var action = obj.id.substring(6);
  if (action == "PhpCode")
  {
    Action.generateCode("php","Php");
  }
  else if (action == "RubyCode")
  {
    Action.generateCode("ruby","Ruby");
  }
  else if (action == "JavaCode")
  {
    Action.generateCode("java","Java");
  }
  else if (action == "RTCppCode")
  {
    Action.generateCode("rtcpp","RTCpp");
  }
  else if (action == "AlloyCode")
  {
    Action.generateCode("alloy","Alloy");
  }
  else if (action == "NuSMVCode")
  {
    Action.generateCode("nusmv","NuSMV");
  }
  else if (action == "CppCode")
  {
    Action.generateCode("cpp","Cpp");
  }
  else if (action == "SQLCode")
  {
    Action.generateCode("sql","Sql");
  }
  else if (action == "JavaAPIDoc")
  {
    Action.generateCode("javadoc","javadoc");
  }
  else if (action == "StateDiagram")
  {
    Action.generateCode("stateDiagram","stateDiagram");
  }
  else if (action == "StructureDiagram")
  {
    Action.generateCode("structureDiagram","structureDiagram");
  }
  else if (action == "FeatureDiagram")
  {
    Action.generateCode("featureDiagram","featureDiagram");
  }
  else if (action == "classDiagram")
  {
    Action.generateCode("classDiagram","classDiagram");
  }
  else if (action == "entityRelationshipDiagram")
  {
    Action.generateCode("entityRelationshipDiagram","entityRelationshipDiagram");
  }
  else if (action == "EcoreCode")
  {
    Action.generateCode("xml","Ecore");
  }
  else if (action == "GenerateCode")
  {
    var languageAndGenerate = $("inputGenerateCode").value.split(":");
    Action.generateCode(languageAndGenerate[0],languageAndGenerate[1]);
  }
  else if (action == "ExecuteCode")
  {
    var languageAndExecute = $("inputGenerateCode").value.split(":");
    Action.executeCode(languageAndExecute[0],languageAndExecute[1]);
  }
  else if (action == "SimulateCode")
  {
    Action.simulateCode();
  }
  else if (action == "StartOver")
  {
    Action.startOver();
  }
  else if (action == "ShowRefreshUmpleOnlineCompletely")
  {
  	Action.showRefreshUmpleOnlineCompletely();
  }
  else if (action == "LoadBlankModel")
  {
  	 Action.loadBlankModel();
  }
  else if (action == "PngImage")
  {
    Action.pngImage();
  }
  else if (action == "YumlImage")
  {
    Action.yumlImage();
  }
  else if (action == "Jsf")
  {
    Action.uigu();
  }
  else if (action == "CopyClip")
  {
    Action.copyClipboardCode();
  }  
  else if (action == "CopyMix")
  {
    Action.copyClipboardMixset();
  }  
  else if (action == "Copy")
  {
    Action.showCodeInSeparateWindow();
  }
  else if (action == "CopyCommandLine")
  {
    Action.copyCommandLineCode();
  }  
  else if (action == "CopyEncodedURL")
  {
    Action.showEncodedURLCodeInSeparateWindow();
  }
  else if (action == "CopyLocalBrowser")
  {
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem("umpleLocalStorage1",Page.getUmpleCode());
      Page.setFeedbackMessage("Model saved. Use Load From Browser later to restore.")
    }
    else{Page.setFeedbackMessage("Unable to copy the model to browser storage. An error occurred.")}
  }
  else if (action == "LoadLocalBrowser")
  {
    if (typeof(Storage) !== "undefined") {
      var textToLoad = localStorage.getItem("umpleLocalStorage1");
      if(textToLoad != null) {
        Page.setUmpleCode(textToLoad);
      }
    }
  }
  else if (action == "CreateTask") 
  {
    jQuery("#taskArea").css("display","block");
    //jQuery("#taskNameArea").css("display","block");
    jQuery("#labelTaskName").css("display","block");
    jQuery("#taskNameCell").css("display","block");
    jQuery("#instructions").css("display","block");
    jQuery("#isExperimentCell").css("display","block");
    Layout.zoomResize();
  }
  else if (action == "LoadTask")
  {
    jQuery("#loadTaskNameArea").css("display","block");
  }
  else if (action == "LoadThisTask")
  {
    Action.loadTask(Page.getModel().split("-")[1], false);
  }
  else if (action == "RequestLoadTaskURL")
  {
    var taskname = Page.getModel().split("-")[1];
    Action.copyToClp(window.location.hostname + "/bookmark.php?loadTaskWithURL=1&taskname=" + taskname + "&model=" + taskname);
  }
  else if (action == "RequestAllZip") 
  {
    if (document.getElementById("downloadTaskDirLink") === null)
    {
      var link = document.createElement("a");
      link.setAttribute("href", "scripts/tab_control.php?downloadTaskUserDir=1&taskid=" + Page.getModel());
      link.setAttribute('id', "downloadTaskDirLink");
      var linkText = document.createTextNode("Download ZIP File From Here");
      link.appendChild(linkText);
      
      var node = document.createElement("LI");   
      node.appendChild(link);
      document.getElementById("taskSubmenu").appendChild(node);
    }
    else
    {
      document.getElementById("downloadTaskDirLink").setAttribute("href", "scripts/tab_control.php?downloadTaskUserDir=1&taskid=" + Page.getModel());
    }

    setTimeout(function () {
      document.getElementById("downloadTaskDirLink").remove();
    }, 30000);
  }
  else if (action == "DownloadFiles")
  {
    TabControl.useActiveTabTo(TabControl.saveTab)(Page.getUmpleCode());
    
    // issue#1554
    //window.location.href = "scripts/tab_control.php?download=1&&model=" + Page.getModel();
    if (document.getElementById("downloadLink") === null)
    {
      var link = document.createElement("a");
      link.setAttribute("href", "scripts/tab_control.php?download=1&&model=" + Page.getModel());
      link.setAttribute('id', "downloadLink");
      var linkText = document.createTextNode("Download ZIP File From Here");
      link.appendChild(linkText);
      
      var node = document.createElement("LI");   
      node.appendChild(link);
      document.getElementById("saveLoad").appendChild(node);
    }
    else 
    {
      document.getElementById("downloadLink").setAttribute("href", "scripts/tab_control.php?download=1&&model=" + Page.getModel());
    }

    setTimeout(function () {
      document.getElementById("downloadLink").remove();
    }, 30000);
  }
  else if (action == "Undo")
  {
    Action.undo();
  }
  else if (action == "Redo")
  {
    Action.redo();
  }
  else if (action == "Reindent") 
  { 
    var lines = Page.getRawUmpleCodeCM6().split("\n");
    var cursorPos = Page.codeMirrorEditor6.state.selection.main.head;
    var cursorPosLine = Page.codeMirrorEditor6.state.doc.lineAt(cursorPos).number;

    if (clientDebuggerFlag){
      console.log(cursorPosLine);
    }

    var whiteSpace = lines[cursorPosLine].match(/^\s*/)[0].length;
    var lengthToFirstCh = cursorPos.ch - whiteSpace;
    cursorPos.ch = lengthToFirstCh;
    Action.reindent(lines, cursorPos);
  }
  else if (action == "ShowHideTextEditor")
  {
    Layout.showHideTextEditor();
    Page.showText = !Page.showText;
    Page.setShowHideIconState('SHT_button');
  }
  else if (action == "ShowHideCanvas")
  {
    Layout.showHideCanvas();
    Page.showCanvas = !Page.showCanvas;
    Page.setShowHideIconState('SHD_button');
  }
  else if (action == "ShowEditableClassDiagram")
  {
    Action.changeDiagramType({type:"editableClass"});
  }
  else if (action == "ShowJointJSClassDiagram")
  {
    Action.changeDiagramType({type:"JointJSClass"});
  }
  else if (action == "ShowGvClassDiagram")
  {
    Action.changeDiagramType({type:"GvClass"});
  }
  else if (action == "ShowGvFeatureDiagram")
  {
    Action.changeDiagramType({type:"GvFeature"});//buttonShowGvFeatureDiagram
  }
  else if (action == "ShowGvStateDiagram")
  {
    Action.changeDiagramType({type:"GvState"});
  }
  else if (action == "ShowStructureDiagram")
  {
    Action.changeDiagramType({type:"structure"});
  }
  else if (action == "ShowHideLayoutEditor")
  {
    Layout.showHideLayoutEditor();
  }
  else if (action == "ManualSync")
  {
    Action.enableManualSync();
  }
  else if (action == "SyncDiagram")
  {
    Action.processTyping("codeMirrorEditor", true);
    Page.codeMirrorEditor6.focus();
  }
  else if (action == "PhotoReady")
  {
    Action.photoReady();
  }
  else if (action == "ToggleAttributes")
  {
    Action.toggleAttributes();
    Page.setShowHideIconState('SHA_button');
  }
  else if (action == "ToggleMethods")
  {
    Action.toggleMethods();
    Page.setShowHideIconState('SHM_button');
  }
  else if (action == "ToggleActions")
  {
    Action.toggleActions();
  }
  else if (action == "ToggleTraits")
  {
    Action.toggleTraits();
  }  
  else if (action == "ToggleTransitionLabels")
  {
    Action.toggleTransitionLabels();
  }
  else if (action == "ToggleGuards")
  {
    Action.toggleGuards();
  }
  else if (action == "ToggleGuardLabels")
  {
    Action.toggleGuardLabels();
  }
  else if (action == "AllowPinch")
  {
    Action.allowPinch();
  }
  else if (action == "ToggleFeatureDependency")
  {
    Action.toggleFeatureDependency();
  }
  else if(action == "StructureLink")
  {
    Action.generateStructureDiagramFile();
  }
  else if(action == "TabsCheckbox")
  {
    Action.toggleTabs();
  }
  else if(action.substr(0,6) == "mixset")
  {
    Action.toggleMixsetUseStatement(action.substr(6));
  }
  else if(action.substr(0,6) == "filter")
  {
    Action.toggleFilterUseStatement(action.substr(6));
  }
  else if(action.substr(0,2) == "gv")
  {
    Action.toggleSpecialSuboption(action);
  }  
}

Action.toggleSpecialSuboption = function(suboption) {
  // If suboption  is not in active ones then add it
  var index = Page.specialSuboptionsActive.indexOf(suboption);  
  if(index !== -1) {
    // Turn off suboption if not already on by deleting it
    // This sets some options to the default
    // Suboptions specified in the code always override this though
    Page.specialSuboptionsActive.splice(index,1);
  }
  else {
    // Turn on suboption if off by adding it
    // May have no effect if the code requires a conflicting one
    Page.specialSuboptionsActive.push(suboption);

    // If gvmanual is active, then the options affecting layout
    // will be applied to the manual layout too
    // this is done in Action.updateUmpleDiagramCallback

    // Only one of the layout algorithms can be active at a time
    // so turn off others that are mutually exclusive. These are
    // gvdot, gvsfdp, gvcirco
    Action.deactivateSpecialLayoutAlgorithmsExcept(suboption);
  }
  Action.redrawDiagram();
}


Action.toggleMixsetUseStatement = function(mixset) {
  // If use statement is not in active ones then add it
  var index = Page.mixsetsActive.indexOf(mixset);
  if(index !== -1) {
    Page.mixsetsActive.splice(index,1);
  }
  else {
    Page.mixsetsActive.push(mixset);
  }

  Action.redrawDiagram();
}

Action.toggleFilterUseStatement = function(filter) {
  // If use statement is not in active ones then add it
  var index = Page.filtersActive.indexOf(filter);
  if(index !== -1) {
    Page.filtersActive.splice(index,1);
  }
  else {
    Page.filtersActive.push(filter);
  }

  Action.redrawDiagram();
}

Action.focusOn = function(id, gained)
{
  var selector = "#" + id;
  var isPlainEditor = ((id == "umpleModelEditorText" || id == "umpleLayoutEditorText") || id == "CodeMirror");

  if(id == "CodeMirror") selector = ".CodeMirror-scroll"
  
  if (gained) 
  {
    if (!Page.isPhotoReady() || isPlainEditor)
    {
      jQuery(selector).parent().addClass("focus");
      jQuery(selector).addClass("visibleFocus");
      if (isPlainEditor)
      {
        Page.shortcutsEnabled = false;
        if (Page.selectedItem != null) Page.unselectAllToggleTools();
        Action.unselectAll();
      }
    }
  }
  else
  { 
    jQuery(selector).parent().removeClass("focus");
    jQuery(selector).removeClass("visibleFocus");
    if (isPlainEditor || id == "CodeMirror")
    {
      Page.shortcutsEnabled = true;
    }
  }
}

Action.startOver = function()
{
  Page.setUmpleCode("");
  UmpleSystem.merge(null);
  window.location = "umple.php";
}

Action.showRefreshUmpleOnlineCompletely = function()
{
	jQuery("#buttonStartOver").show();
}

Action.loadBlankModel = function()
{
  UmpleSystem.merge(null);
  Page.showCanvasLoading(true);
  Page.showModelLoading(true);
  Page.showLayoutLoading(true);
  Ajax.sendRequest("scripts/compiler.php",Action.loadExampleCallback,"exampleCode="); //left empty
}

Action.undo = function()
{
  if (jQuery("#buttonUndo").hasClass("disabled")) return;
  Action.redoOrUndo(true);
}

Action.redo = function()
{
  if (jQuery("#buttonRedo").hasClass("disabled")) return;
  Action.redoOrUndo(false);
}

// The following from https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
Action.dropHandler = function(ev) {
  Page.setFeedbackMessage("File will be dropped")

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        file.text().then(function(text) {
          Page.setUmpleCode(text);
        });
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
       ev.dataTransfer.files[i].text().then(function(text) {
        Page.setUmpleCode(text);
      });
    }
  }
}

Action.dragOverHandler = function(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

Action.redoOrUndo = function(isUndo)
{
  var afterHistoryChange = "";
  if (Action.manualSync && Action.diagramInSync)
  {
    Action.diagramInSync = false;
    Page.enablePaletteItem("buttonSyncDiagram", true);
    Page.enableDiagram(false);
  }
  
  if (isUndo) afterHistoryChange = TabControl.getCurrentHistory().getPreviousVersion();
  else afterHistoryChange = TabControl.getCurrentHistory().getNextVersion();
  if (afterHistoryChange == History.noChange)
  {
    afterHistoryChange = "";
  }
  
  var delimiterLoc = afterHistoryChange.indexOf(Page.modelDelimiter);
  var rawReplacement = "";
  if(delimiterLoc == -1) {
    rawReplacement = afterHistoryChange;
  }
  else {
    rawReplacement = afterHistoryChange.substring(0,delimiterLoc);
  }

  var rawOriginal = Page.getRawUmpleCodeCM6().replace(Page.modelDelimiter, "");
  
  var theDiff=Action.findDiff(rawOriginal, rawReplacement);
  var prevLine=Action.getCaretPosition();
  Action.freshLoad = true;
  Page.setUmpleCode(afterHistoryChange);
  if (!Action.manualSync) Action.updateLayoutEditorAndDiagram();

  Action.setjustUpdatetoSaveLater(true);
  
  setTimeout(function () { // Delay so it doesn't get erased
    if(theDiff[1] == theDiff[2])
    {
      // change was in diagram so leave caret where it is
      Action.setCaretPosition(prevLine);
    }
    else
    {
      // set line number to where change occurred
      Action.setCaretPosition(theDiff[3]);
    }   
  }, 300);
}

Action.findDiff = function(oldString, newString)
{

  var lineNumber = 0; // line number in newString
  
  var lOld = oldString.length, lNew = newString.length;
  var l=lOld; // Assume old is shorter
  if (lNew < l) l=lNew; // Actually new is shorter
  var i=0;

  while(i < l && oldString.charAt(i) === newString.charAt(i)) {
    i++;
    if(oldString.charAt(i) === '\n' && newString.charAt(i) === '\n') lineNumber++;
  }
  
  // i is now the character index where the difference begins
  var startChange=newString.substring(i,1);
  
  // Tuple is length of old, length of new, position of change, line number chg
  return [lOld, lNew, i, lineNumber+1];
}

// Initial load of a file (e.g. example or blank) at initialization
Action.loadFile = function()
{
  var filename = Page.getFilename();
  if (filename != "")
  {
    Action.setjustUpdatetoSaveLater(true);
    if (Page.getModel().substring(0, 8) == "taskroot")
    {
      Ajax.sendRequest("scripts/compiler.php",Action.loadFileCallback,format("load=1&isTask=1&filename={0}",filename));
    } 
    else 
    {
      Ajax.sendRequest("scripts/compiler.php",Action.loadFileCallback,format("load=1&filename={0}",filename));
    }
  }
  else
  {
    Action.saveNewFile();
  }
}

// Triggered by the above Action.loadFile. Initial load of a file at startup
Action.loadFileCallback = function(response)
{
  Action.freshLoad = true;
  // TODO: this resolves the loading issue but in a very hacky way. See PR#1402.
  if (Object.keys(TabControl.tabs).length > 1) return;
  Page.setUmpleCode(response.responseText, true);
  TabControl.getCurrentHistory().save(response.responseText,"loadFileCallback");
  Action.setjustUpdatetoSaveLater(true);
  if (TabControl.tabs[TabControl.getActiveTabId()].nameIsEphemeral)
  {
    var extractedName = TabControl.extractNameFromCode(response.responseText);
    if (extractedName)
    {
      TabControl.useActiveTabTo(TabControl.renameTab)(extractedName, true);
    }
  }
  if (!Action.manualSync) {
    Action.updateUmpleDiagram();
    Action.freshLoad = false;
  }
}

Action.loadTask = function(taskName, isBookmark)
{
  jQuery("#showInstrcutionsArea").css("display","block");
  if (!isBookmark)
  {
    Ajax.sendRequest("bookmark.php", Action.loadTaskBookmark,format("taskname={0}&model={0}",taskName));
  } else {
    if (Page.getModel().split("-")[0] == "task") // it is in task bookmark page. instruction can not be edited.
    {
      Ajax.sendRequest("scripts/compiler.php",Action.loadTaskExceptCodeCallback,format("loadTask=1&loadInstructionAsHTML=1&filename={0}",taskName));
    }
    else
    {
      Ajax.sendRequest("scripts/compiler.php",Action.loadTaskExceptCodeCallback,format("loadTask=1&filename={0}",taskName));
    }
  }
}

Action.loadTaskBookmark = function(response)
{
  if (response.responseText.split(" ")[0] == "Task")
  {
    window.alert("Load Task Failed! " + response.responseText);
  }
  else
  {
    window.location.href = "umple.php?model=" + response.responseText;
  }
}

Action.loadTaskCallback = function(response)
{
  Action.freshLoad = true;
  // TODO: this resolves the loading issue but in a very hacky way. See PR#1402.
  if (Object.keys(TabControl.tabs).length > 1) return;

  Action.setjustUpdatetoSaveLater(true);
  TabControl.getCurrentHistory().save(response.responseText,"loadTaskCallback");
  var responseArray = response.responseText.split("task delimiter");
  Page.setUmpleCode(responseArray[0]);
  if (TabControl.tabs[TabControl.getActiveTabId()].nameIsEphemeral)
  {
    var extractedName = TabControl.extractNameFromCode(responseArray[0]);
    if (extractedName)
    {
      TabControl.useActiveTabTo(TabControl.renameTab)(extractedName, true);
    }
  }
  if (!Action.manualSync) Action.updateUmpleDiagram();
  TabControl.useActiveTabTo(TabControl.saveTab)(Page.getUmpleCode());
  TabControl.saveActiveTabs();
  window.location.href = "bookmark.php?taskname=" + responseArray[2] + "&model=" + responseArray[3];
}

Action.loadTaskExceptCodeCallback = function(response)
{
  Action.freshLoad = true;
  // TODO: this resolves the loading issue but in a very hacky way. See PR#1402.

  if (!justUpdatetoSaveLater){
    TabControl.getCurrentHistory().save(response.responseText,"loadTaskExceptCodeCallback");
    Action.setjustUpdatetoSaveLater(true);
  }
  var responseArray = response.responseText.split("task delimiter");
  jQuery("#labelInstructions").text("Instructions for task \"" + responseArray[2] + "\":");
  jQuery("#requestorName").val(responseArray[4]);
  jQuery("#labelInstructions").css("display","block");
  jQuery("#taskArea").css("display","block");
  if (Page.getModel().split("-")[0] == "task") // it is in task bookmark page. instruction can not be edited.
  {
    jQuery("#labelInstructions").text("Instructions for task \"" + responseArray[2] + "\":               Requestor Name:" + responseArray[4]);
    jQuery("#labelCompletionURL").css("display", "none");
    jQuery("#completionURLCell").css("display", "none");
    jQuery("#labelRequestorName").css("display", "none");
    jQuery("#requestorName").css("display", "none");
    jQuery("#instructionsHTML").html(responseArray[1]);
  }
  else 
  {
    jQuery("#instructions").val(responseArray[1]);
    jQuery("#instructions").css("display","block");
    jQuery("#completionURL").val(responseArray[5]);
    jQuery("#isExperimentCell").css("display", "inline");
    jQuery("#isExperiment").prop('checked', responseArray[6] == 'true');
    jQuery('#instructions').each(function () {
      this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
    }).on('input', function () {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }

  if (TabControl.tabs[TabControl.getActiveTabId()].nameIsEphemeral)
  {
    var extractedName = TabControl.extractNameFromCode(responseArray[0]);
    if (extractedName)
    {
      TabControl.useActiveTabTo(TabControl.renameTab)(extractedName, true);
    }
  }
  Layout.zoomResize();
}

Action.submitLoadTask = function()
{
  var taskName = jQuery("#inputLoadTaskName").val();
  let patt = /^(\w|\.)+$/; // taskName Take only [ A-Z or a-z or 0-9 or _ or . ]
  if (!patt.test(taskName))//taskName.indexOf(" ") != -1 || taskName.indexOf("/") != -1 || taskName.indexOf("-") != -1 || taskName.indexOf("\\") != -1) 
  {
    window.alert("Task Name can only contain letters(case insensitive), underscores, dots, and digits!");
    return;
  }
  Action.loadTask(taskName, false);
}

Action.submitTaskWork =function()
{
  Ajax.sendRequest("task.php", Action.submitTaskWorkCallback, format("submitTaskWork=1&model={0}&responseURL={1}", Page.getModel(), window.location.href));
}

Action.submitTaskWorkCallback = function(response)
{
  window.alert("Successfully submitted Task!");
  var responseArray = response.responseText.split("task submit delimiter");
  if (responseArray[0] == "")
  {
    window.location.href = responseArray[2];
  }
  else
  {
    window.location.href = responseArray[0] + "?task=" + responseArray[1] + "&url=" + responseArray[2];
  }
}

Action.launchParticipantURL = function()
{
  var taskname = Page.getModel().split("-")[1];
  window.open("bookmark.php?loadTaskWithURL=1&taskname=" + taskname + "&model=" + taskname);
}

Action.copyParticipantURL = function()
{
  var taskname = Page.getModel().split("-")[1];
  var copiedURL = window.location.hostname + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + "/bookmark.php?loadTaskWithURL=1&taskname=" + taskname + "&model=" + taskname;
  Action.copyToClp(copiedURL);
  Page.setFeedbackMessage("Participant URL is in copy buffer: " + copiedURL);
}

Action.openStartFreshWork = function() 
{
  var a= confirm("Are you sure to start from fresh?"); 
  if(a) { 
    window.location.href = "/umpleonline/umple.php"
  }
}

Action.copyToClp = function(txt){
    prenode=document.createElement("PRE");
    txt = document.createTextNode(txt);
    prenode.appendChild(txt);
    var m = document;
    var w = window;
    var b = m.body;
    b.appendChild(prenode);

    if (b.createTextRange) {
        var d = b.createTextRange();
        d.moveToElementText(txt);
        d.select();
        m.execCommand('copy');
    } 
    else {
        var d = m.createRange();
        var g = w.getSelection;
        d.selectNodeContents(txt);
        g().removeAllRanges();
        g().addRange(d);
        m.execCommand('copy');
        g().removeAllRanges();
    }
    prenode.remove();
}

Action.openInstructionInNewTab = function()
{
  jQuery("#buttonReshowInstructions").css("display", "inline");
  var tab = window.open('about:blank', '_blank');
  tab.document.write(jQuery("#instructionsHTML").html()); // where 'html' is a variable containing your HTML
  tab.document.close();
  jQuery("#instructionsHTML").css("display", "none");
  jQuery("#labelInstructions").css("display", "none");
  jQuery("#buttonHideInstructions").css("display", "none");
  Layout.zoomResize();
}

Action.reshowInstructions = function()
{
  jQuery("#instructionsHTML").css("display", "block");
  jQuery("#labelInstructions").css("display", "inline");
  jQuery("#buttonReshowInstructions").css("display", "none");
  jQuery("#buttonHideInstructions").css("display", "inline");
  Layout.zoomResize();
}

Action.hideInstructions = function()
{
  jQuery("#instructionsHTML").css("display", "none");
  jQuery("#labelInstructions").css("display", "none");
  jQuery("#buttonHideInstructions").css("display", "none");
  jQuery("#buttonReshowInstructions").css("display", "inline");
  Layout.zoomResize();
}

Action.saveNewFile = function()
{
  var umpleCode = Page.getUmpleCode();
  var filename = Page.getFilename();
  
  if (filename == "")
  {
    Ajax.sendRequest("scripts/compiler.php",Action.saveNewFileCallback,format("save=1&&umpleCode={0}",umpleCode));
  }
}

Action.saveNewFileCallback = function(response)
{
  Page.setFilename(response.responseText);
}

Action.changeDiagramType = function(newDiagramType)
{
  var changedType = false;
  jQuery(".layoutListItem").hide();

  if(newDiagramType.type == "editableClass") { 
    if(Page.useEditableClassDiagram) return;
    Page.useEditableClassDiagram = true;
    Page.useJointJSClassDiagram = false;
    Page.useGvClassDiagram = false;
    Page.useGvStateDiagram = false;
    Page.useGvFeatureDiagram = false;
    Page.useStructureDiagram = false;
    changedType = true;
    jQuery("#buttonShowEditableClassDiagram").prop('checked', 'checked');
    Page.setDiagramTypeIconState('editableClass');
    jQuery(".view_opt_class").show();
    jQuery(".view_opt_class_palette").show();

  }
  else if(newDiagramType.type == "JointJSClass") { 
    if(Page.useJointJSClassDiagram) return;
    Page.useEditableClassDiagram = false;
    Page.useJointJSClassDiagram = true;
    Page.useGvClassDiagram = false;
    Page.useGvStateDiagram = false;
    Page.useGvFeatureDiagram = false;
    Page.useStructureDiagram = false;
    changedType = true;
    jQuery("#buttonShowJointJSClassDiagram").prop('checked', 'checked');
    Page.setDiagramTypeIconState('JointJSClass');
    jQuery(".view_opt_class").show();
    jQuery(".view_opt_class_palette").show();
  }  
  else if(newDiagramType.type == "GvClass") { 
    if(Page.useGvClassDiagram) return;
    Page.useEditableClassDiagram = false;
    Page.useJointJSClassDiagram = false;
    Page.useGvClassDiagram = true;
    Page.useGvStateDiagram = false;
    Page.useGvFeatureDiagram = false;
    Page.useStructureDiagram = false;
    changedType = true;
    jQuery("#buttonShowGvClassDiagram").prop('checked', 'checked');
    Page.setDiagramTypeIconState('GvClass');
    jQuery(".view_opt_class").show();

  }
  else if(newDiagramType.type == "GvState") {
    if(Page.useGvStateDiagram) return;
    Page.useEditableClassDiagram = false;
    Page.useJointJSClassDiagram = false;
    Page.useGvClassDiagram = false;
    Page.useGvStateDiagram = true;
    Page.useStructureDiagram = false;
    Page.useGvFeatureDiagram = false;
    changedType = true;
    jQuery("#buttonShowGvStateDiagram").prop('checked', 'checked');
    Page.setDiagramTypeIconState('GvState');
    jQuery(".view_opt_state").show();

  }
  else if(newDiagramType.type == "GvFeature") {
   if(Page.useGvFeatureDiagram) return;
    Page.useEditableClassDiagram = false;
    Page.useJointJSClassDiagram = false;
    Page.useGvClassDiagram = false;
    Page.useGvStateDiagram = false;
    Page.useStructureDiagram = false;
    Page.useGvFeatureDiagram = true;
    changedType = true;
    jQuery("#buttonShowGvFeatureDiagram").prop('checked', 'checked');
    Page.setDiagramTypeIconState('GvFeature');
    jQuery(".view_opt_feature").show();


  }
  else if(newDiagramType.type == "structure") { // Structure Diagram
    if(Page.useGvStructureDiagram) return;
    Page.useEditableClassDiagram = false;
    Page.useJointJSClassDiagram = false;
    Page.useGvClassDiagram = false;
    Page.useGvStateDiagram = false;
    Page.useStructureDiagram = true;
    Page.useGvFeatureDiagram = false;
    changedType = true;
    jQuery("#buttonShowStructureDiagram").prop('checked', 'checked');
    Page.setDiagramTypeIconState('structure');
  }
  if (changedType) {
    Action.redrawDiagram();
  }
}

Action.pngImage = function()
{
  var jsonText = Json.toString(UmpleSystem);
  var jsonEncodedText = encodeURIComponent(jsonText);
  window.open("scripts/compiler.php?asImage=" + jsonEncodedText, "UMLClassDiagram");
}

Action.yumlImage = function()
{
  var yumlImageSelector = "#buttonYumlImage";
  jQuery(yumlImageSelector).showLoading();
  Action.ajax(Action.yumlImageCallback,"save=1");
}

Action.yumlImageCallback = function(response)
{
  var filename = response.responseText;
  var yumlImageSelector = "#buttonYumlImage";
  jQuery(yumlImageSelector).hideLoading();
  window.open("scripts/compiler.php?asYuml=" + filename, "yumlClassDiagram");
  Page.showViewDone();
}

Action.uigu = function()
{
  var uiguSelector = "#buttonUigu";
  jQuery(uiguSelector).showLoading();
  Action.ajax(Action.uiguCallback,"save=1");
}

Action.uiguCallback = function(response)
{
  var filename = response.responseText;
  var uiguSelector = "#buttonUigu";
  jQuery(uiguSelector).hideLoading();
  window.open("scripts/compiler.php?asUI=" + filename, "showUserInterface");
  Page.showViewDone();
}

Action.copyClipboardCode = function()
{
  Action.copyToClp(Page.getUmpleCode());
  Page.setFeedbackMessage("Code has been copied to the clipboard");  
}

Action.copyClipboardMixset = function()
{
  Action.copyToClp(Page.copyableMixset);
  Page.setFeedbackMessage("Mixset with selected diagram filters and options is in clipboard");  
}

Action.copyCommandLineCode = function()
{
  var pretext="sh\n";
  pretext+="echo Will compile umple file. Requires umple command to be installed\n";
  pretext+="cd ~/tmp\n";
  pretext+="mkdir testump-$$\n";
  pretext+="cd testump-$$\n";
  pretext+="cat >> test.ump <<ENDUMP\n";
  var posttext="\nENDUMP\n";
  posttext+="umple test.ump -c -\n";
  posttext+="echo Use ctrl-D to exit back to the original shell\n\n";
  Action.copyToClp(pretext+Page.getUmpleCode()+posttext);
  Page.setFeedbackMessage("Shell code to compile on command line was copied to clipboard");  
}

Action.showCodeInSeparateWindow = function()
{
  codeWindow = window.open("","UmpleCode"+Math.random()*10000,"height=700, width=400, left=100, top=100, location=no, status=no, scrollbars=yes");
  codeWindow.document.write('<code><pre id="umpleCode">' + Page.getUmpleCode() + '</pre></code>');
  codeWindow.document.title="Umple raw code";
  codeWindow.document.close();
}

Action.showEncodedURLCodeInSeparateWindow = function()
{
  codeWindow = window.open("","UmpleEncodedURL"+Math.random()*10000,"height=500, width=400, left=100, top=100, location=no, status=no, scrollbars=yes");
  codeWindow.document.write('<code><pre id="umpleCode">' + Page.getEncodedURL() + '</pre></code>');
  codeWindow.document.title="Umple encoded URL";
  codeWindow.document.close();
}

Action.simulateCode = function()
{
  simulateButtonSelector = "#buttonSimulateCode";
  jQuery(simulateButtonSelector).showLoading();
  Action.ajax(Action.simulateCodeCallback,"language=Simulate");
}

Action.simulateCodeCallback = function(response)
{
  simulateButtonSelector = "#buttonSimulateCode";
  jQuery(simulateButtonSelector).hideLoading();
  var modelId = response.responseText;
  window.open("../umpleonline/simulate.php?model=" + modelId, "umpleSimulator");
  Page.showViewDone(); 
}
//Called by Action.drawStateMenu(), this multiuse function takes any textual input requires for 
//menu edits on states.
//Part of Issue #1898, see wiki for more details: https://github.com/umple/umple/wiki/MenusInGraphviz
Action.drawInputState = function(inputType,stateCode,stateName){
  // DEBUG
  // console.log("Inside drawInputState: ")
  // console.log("with inputType: ", inputType)
  var prompt = document.createElement('div');
  prompt.style.zIndex = "1000";
  prompt.style.border = "1px solid #ccc";
  prompt.style.backgroundColor = "#f8f8f8";
  prompt.style.padding = "5px";
  prompt.style.position = "fixed";
  prompt.id="promptBox";
  var promptRect=prompt.getBoundingClientRect();
  if(event.clientX+promptRect.width>window.innerWidth){
    prompt.style.right=(window.innerWidth-event.clientX)+"px";
  } else {
    prompt.style.left = event.clientX+"px";
  }
  if(event.clientY+promptRect.height>window.innerHeight){
    prompt.style.bottom=(window.innerHieght-event.clientY)+"px";
  } else {
    prompt.style.top = event.clientY+"px";
  }
  var input = document.createElement('input');
  input.type = 'text';
  input.style.padding = '5px';
  input.style.borderRadius = '3px';
  input.style.border = '1px solid #ccc';
  input.style.width = '200px';
  input.style.marginLeft = '5px';
  var inputErrorMsg = document.createElement('label');
  inputErrorMsg.type='label';
  inputErrorMsg.textContent='Error - Please enter an alphanumeric name beginning with a non-numeric character.';
  inputErrorMsg.style.color="red";
  var hider=function hidePrompt(e) {
    if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
      document.removeEventListener("mousedown", hidePrompt);
      prompt.remove();
    }
  };
  var unsanitizedState=stateCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
  var label = document.createElement('label');
  label.htmlFor = 'inputLabel';
  label.style.marginRight = '5px';
  // Add a listener to hide the prompt when the user clicks outside of it
  document.addEventListener("mousedown", hider);
  if(inputType=="rename"){

    if (clientDebuggerFlag){
      console.log("Renaming State ...");
    }

    label.appendChild(document.createTextNode("New name for \'"+stateName+"\'?"));
    input.value = stateName;
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        //only accounts for case where states all have unique names
        if(Action.validateAttributeName(input.value)){

          if (clientDebuggerFlag){
            console.log("Getting code from codemirror editor ...");
          }
          // get contents of codemirror 6 editor
          let orig = Page.codeMirrorEditor6.state.doc.toString();

          let regex=new RegExp("(\\W+)("+stateName+")(\\W+)");
          let res;
          while((res=orig.match(regex))!=null){
            orig=orig.substr(0,res.index+res[1].length)+input.value.trim()+orig.substr(res.index+res[1].length+res[2].length,orig.length-(res.index+res[1].length+res[2].length));
          }

          if (clientDebuggerFlag){
            console.log("Setting updated code to codemirror editor ...");
          }

          // update content of codemirror 6 editor with updated code/text
          Page.setCodeMirror6Text(orig);

          setTimeout('Action.processTyping("newEditor",' + false + ')', Action.waiting_time);

          document.removeEventListener("mousedown", hider);

          if (clientDebuggerFlag){
            console.log("Removing mousedown event ...");
          }
          
          prompt.remove();
          Action.removeContextMenu();
          TabControl.getCurrentHistory().save(orig, "menuUpdate");
        } else if(!document.contains(inputErrorMsg)) {
          prompt.appendChild(inputErrorMsg);
        }
      }
    });  
  } else if(inputType=="substate") {

    if (clientDebuggerFlag){
      console.log("Substating state ...");
    }

    label.appendChild(document.createTextNode("Name of new substate?"));
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        if(Action.validateAttributeName(input.value)){
          let subtext=unsanitizedState.substr(0,unsanitizedState.length-1)+"  "+input.value+"{}}";

          if (clientDebuggerFlag){
            console.log("Getting original code and adding substate ...");
          }

          subtext=Page.codeMirrorEditor6.state.doc.toString().replace(unsanitizedState,subtext);

          if (clientDebuggerFlag){
            console.log("Setting updated code with substate into codemirror editor ...");
          }

          Page.setCodeMirror6Text(subtext);

          setTimeout('Action.processTyping("newEditor",' + false + ')', Action.waiting_time);

          document.removeEventListener("mousedown", hider);

          if (clientDebuggerFlag){
            console.log("Removing mousedown event ...");
          }

          prompt.remove();
          Action.removeContextMenu();
          TabControl.getCurrentHistory().save(subtext, "menuUpdate");
        } else if(!document.contains(inputErrorMsg)) {
          prompt.appendChild(inputErrorMsg);
        }
      }
    });
   
  } else if(inputType=="transition"){
    //should have an indicator after user enters label so they know to press another state
    
    if (clientDebuggerFlag){
      console.log("Adding Transition ...");
    }

    label.appendChild(document.createTextNode("Condition for new transition?"));
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        if(Action.validateAttributeName(input.value)){
          
          var orig=stateCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
          document.removeEventListener("mousedown", hider);
          prompt.remove();
          Action.removeContextMenu();

          if (clientDebuggerFlag){
            console.log("Waiting to select target state for transition ...");
          }

          var assocState=function (event){
              let targ=event.target;
              while(targ.parentElement.id!="graph0"){
                targ=targ.parentNode;
              }
              let elemText=targ.outerHTML.substr(targ.outerHTML.indexOf("stateClicked(&quot;")+"stateClicked(&quot;".length,targ.outerHTML.indexOf("&quot;)\"")-(targ.outerHTML.indexOf("stateClicked(&quot;")+"stateClicked(&quot;".length));
              elemText=elemText.split("^*^"); //index 0: class, index 1: base state, index 2: remaining states
              let subtext="  "+input.value+" -> "+elemText[2]+";\n}";
              let newState=orig.substr(0,orig.length-1)+subtext;

              if (clientDebuggerFlag){
                console.log("New state created ...");
                console.log("Replacing original state with new state in the code ...");
              }

              Page.setCodeMirror6Text(Page.codeMirrorEditor6.state.doc.toString().replace(orig,newState));

              setTimeout('Action.processTyping("newEditor",' + false + ')', Action.waiting_time);

              //TODO - Saving/edit history doesn't seem to be working here.
              TabControl.getCurrentHistory().save(Page.codeMirrorEditor6.state.doc.toString(), "menuUpdate");
              let others=document.getElementsByClassName("node");
              for(let q=0;q<others.length;q++){
                others[q].removeEventListener("mousedown",assocState);
              }
              elems=document.getElementsByClassName("cluster");
              for(let q=0;q<others.length;q++){
                others[q].removeEventListener("mousedown",assocState);
              }  
            };
          //add event listener to Graphviz nodes for left click
          var elems=document.getElementsByClassName("node");
          for(let i=0;i<elems.length;i++){
            elems[i].addEventListener("mousedown", assocState);
          }       
          elems=document.getElementsByClassName("cluster");
          for(let i=0;i<elems.length;i++){
            elems[i].addEventListener("mousedown", assocState);
          }       
        } else if(!document.contains(inputErrorMsg)) {
          prompt.appendChild(inputErrorMsg);
        }
      }
    });
  }
  // Add the prompt to the page
  prompt.appendChild(label);
  prompt.appendChild(input);
  document.body.appendChild(prompt);
  input.focus();
}
//Deletes a target state within the specific SM and Class, as well any transitions to/from target state
//Part of Issue #1898, see wiki for more details: https://github.com/umple/umple/wiki/MenusInGraphviz
Action.deleteState = function(stateCode,className,smName,stateName){
  // Debug
  // console.log("Inside Action.deleteState ...")
  let subStates=stateName.split(",");

  if (clientDebuggerFlag){
    console.log("Getting code from codemirror editor ...");
  }

  let orig=Page.codeMirrorEditor6.state.doc.toString();

  if (clientDebuggerFlag){
    console.log("Deleting State: ", stateName);
  }

  let unsanitizedState = stateCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
  orig=orig.replace(unsanitizedState,"");
  //delete any transitions leading to target state - this handles the case where there are NOT multiple states with the same name
 let regex=new RegExp("[^{};]*->\\s*([^\\S\\s]*|\\s*)(\\/\\s*{[^}]*})*([^\\S\\s]*|\\s*)("+subStates[subStates.length-1]+")(\\s+\\w+)*\\s*;");
  let res;
  while((res=orig.match(regex))!=null){ 
    orig=orig.substr(0,res.index)+orig.substr(res.index+res[0].length,orig.length-(res.index+res[0].length));
  }

  if (clientDebuggerFlag){
    console.log("Setting updated code to codemirror editor ...");
  }

  Page.setCodeMirror6Text(orig);

  setTimeout('Action.processTyping("newEditor",' + false + ')', Action.waiting_time);

  TabControl.getCurrentHistory().save(orig, "menuUpdate");
  Action.removeContextMenu();
}
//Action.drawStateMenu() is triggered by contextmenu event on Graphviz State Diagram "node" elements
//Draws a div containing the editing options for state GV diagrams, as well as calling the related function when clicked
//Part of Issue #1898, see wiki for more details: https://github.com/umple/umple/wiki/MenusInGraphviz
Action.drawStateMenu = function(){
  // Debug
  // console.log("Inside drawStateMenu: ")
  if(!Action.diagramInSync){
    return;
  }
  // Remove old menu, if any
  Action.removeContextMenu();
  var targ=event.target;
  //iterate up to top of graph elements
  while(targ.parentElement.id!="graph0"){
    targ=targ.parentNode;
  }
  //grabs state name
  var elemText=targ.outerHTML.substr(targ.outerHTML.indexOf("stateClicked(&quot;")+"stateClicked(&quot;".length,targ.outerHTML.indexOf("&quot;)\"")-(targ.outerHTML.indexOf("stateClicked(&quot;")+"stateClicked(&quot;".length));
  elemText=elemText.split("^*^"); //index 0: class, index 1: base state, index 2: remaining states
  elemText[2]=elemText[2].split(".");
  var orig = Page.codeMirrorEditor6.state.doc.toString();
  var chosenStateIndices=Action.selectStateInClassCM6(elemText[0],elemText[1],elemText[2][0]);
  for(let i=1;i<elemText[2].length;i++){
    chosenStateIndices=Action.selectStateInStateCM6(chosenStateIndices.startIndex,chosenStateIndices.endIndex,elemText[2][i]);
  }
  var chosenState=orig.substr(chosenStateIndices.startIndex,chosenStateIndices.endIndex-chosenStateIndices.startIndex);
  if(typeof chosenState != 'string'){
    return;
  }
  //this section generates the context menu, grabbing option names and associated functions from the vars below 
  var menu = document.createElement('customContextMenu');
  var rowContent = ["Rename State","Delete State","Add Substate","Add Transition"];
  //need to sanitize any linebreaks or quotes that could break the generated HTML
  var jsInput=chosenState.replaceAll("\n","&#10").replaceAll("\"","&#$quot");
  var rowFuncs = ["Action.drawInputState(\"rename\",\""+jsInput+"\",\""+elemText[2][elemText[2].length-1]+"\")","Action.deleteState(\""+jsInput+"\",\""+elemText[0]+"\",\""+elemText[1]+"\",\""+elemText[2]+"\")","Action.drawInputState(\"substate\",\""+jsInput+"\",\""+elemText[2][elemText[2].length-1]+"\")","Action.drawInputState(\"transition\",\""+jsInput+"\",\""+elemText[2][elemText[2].length-1]+"\")"];
  menu.style.zIndex = "1000";
  menu.style.border = "1px solid #ccc";
  menu.style.backgroundColor = "#f8f8f8";
  menu.style.padding = "5px";
  menu.style.position = "fixed";
  //add rows
  for (var i = 0; i < rowContent.length; i++) {
    var row = document.createElement("div");
    row.style.padding = "5px";
    row.style.borderRadius = "3px";
    row.style.cursor = "pointer";
    row.style.transition = "background-color 0.3s";
    row.textContent = rowContent[i];
    row.setAttribute('onclick',"javascript:"+rowFuncs[i]);
    //Highlight row on hover
    row.addEventListener("mouseover", function() {
      this.style.backgroundColor = "#ddd";
    });
    row.addEventListener("mouseout", function() {
      this.style.backgroundColor = "transparent";
    });
    //add row to context menu
    menu.appendChild(row);
  }
  //set menu location at mouse, while ensuring it is on screen
  var menuRect=menu.getBoundingClientRect();
  if(event.clientX+menuRect.width>window.innerWidth){
    menu.style.right=(window.innerWidth-event.clientX)+"px";
  } else {
    menu.style.left = event.clientX+"px";
  }
  if(event.clientY+menuRect.height>window.innerHeight){
    menu.style.bottom=(window.innerHieght-event.clientY)+"px";
  } else {
    menu.style.top = event.clientY+"px";
  }

  //Add an event listener to hide the menu when the user clicks outside of it
  document.addEventListener('mousedown', function hideMenu(e) {
    var prompt=document.getElementById("promptBox");
    if (e.target != menu && !menu.contains(e.target)) {
      if(prompt!=null&&e.target != prompt && !prompt.contains(e.target)){
        document.removeEventListener('mousedown', hideMenu);
        Action.removeContextMenu();
      } else {
        document.removeEventListener('mousedown', hideMenu);
        Action.removeContextMenu();
      }
    }
  });
  document.body.appendChild(menu);
}
Action.displayTransitionMenu = function(event) {
  if (!Action.diagramInSync) {
      return;
  }
  // Remove old menu, if any
  Action.removeContextMenu();
  var targ = event.target;
  //iterate up to top of graph elements
  while (targ.parentElement.id != "graph0") {
      targ = targ.parentNode;
  }
  //grabs state name
  var elemText = targ.outerHTML.substr(targ.outerHTML.indexOf("transitionClicked(&quot;") + "transitionClicked(&quot;".length, targ.outerHTML.indexOf("&quot;)\"") - (targ.outerHTML.indexOf("transitionClicked(&quot;") + "transitionClicked(&quot;".length));
  elemText = elemText.replaceAll("&amp;", "&");
  let id = elemText.split("*^*");
  let identifierState = id[3].split(".");
  dest = id[4].split(".");

  var selection = Action.selectStateInClassCM6(id[0], id[1], identifierState[0]);

  for (var i = 1; i < identifierState.length; i++) {
      selection = Action.selectStateInStateCM6(selection.startIndex, selection.endIndex, identifierState[i]);
  }

  let searchTerm = id[2].replaceAll("+", "\\+").replaceAll("-", "\\-").replaceAll("*", "\\*").replaceAll("?", "\\?").replaceAll("|", "\\|"); //preceed any accidental quantifiers with escape character
  searchTerm = searchTerm.replace("after", "after~`~?:Every`~`?"); //subpar solution, could be improved
  if (id[5] != "") {
      let guardStr = id[5].trim().replaceAll("+", "\\+").replaceAll("-", "\\-").replaceAll("*", "\\*").replaceAll("?", "\\?").replaceAll("|", "\\|"); //preceed any accidental quantifiers with escape character
      searchTerm = searchTerm + "\\s*[\\s*" + guardStr.trim().slice(1, guardStr.trim().length - 1) + "\\s*]";
  }

  searchTerm = searchTerm.replaceAll("]", "\\]").replaceAll("[", "\\[").replaceAll(")", "\\)?").replaceAll("(", "\\(?").replaceAll("~`~", "(").replaceAll("`~`", ")").replaceAll(" ", "\\s*").replaceAll(",", "\\s*,\\s*").replaceAll("!", "\\s*!\\s*").replaceAll("/", "\\s*/\\s*");
  searchTerm = searchTerm.replaceAll("&&", "&{1,2}");
  let pattern = new RegExp(searchTerm + ".*->", "s");

     let startIndex = Page.codeMirrorEditor6.state.doc.toString().substr(selection.startIndex, selection.endIndex - selection.startIndex).search(pattern) + selection.startIndex;
  
     let cText = Page.codeMirrorEditor6.state.doc.toString().substr(startIndex);

  let line = Action.findEOL(cText);
  if (!(line.split("->").length - 1 === 1) ) {
      Page.setFeedbackMessage(" Please edit this complex transition in the textual code.");
      return;
  }
  let endIndex = startIndex + line.length;
   let code = Page.codeMirrorEditor6.state.doc.toString().substring(startIndex, endIndex);
  let pattern2 = new RegExp("^(.*?)(\\s*\\[(.*?)\\])?(\\s*\\/\\s*\\{(.*?)\\})?\\s*->\\s*(\\[(.*?)\\])?(\\s*\\/\\s*\\{(.*?)\\})?\\s*(\\w+);?$", "s");

  const match = code.trim().match(pattern2);
  // Extracting captured groups based on the updated pattern
  let eventName = match[1].trim();
  let guard = match[3] ? match[3].trim() : (match[7] ? match[7].trim() : null);
  let action = match[5] ? match[5].trim() : (match[9] ? match[9].trim() : null);
  let destinationState = match[10].trim();
  if (guard === null) {
      guard = "";
  }
  //
  if (action === null) {
      action = "";
  }
  //

  //need to sanitize any linebreaks or quotes that could break the generated HTML
  //var jsInput=chosenState.replaceAll("\n","&#10").replaceAll("\"","&#$quot");
  var menu = document.createElement('customContextMenu');
  var rowContent = ["Change or Add Event Name", "Change or Add Guard", "Change or Add Action", "Change Destination State", "Delete Transition"];
  var rowFuncs = [
      "Action.modifyTransitionEventName(\"" + startIndex + "\",\"" + endIndex + "\")",
      "Action.modifyTransitionGuard(\"" + startIndex + "\",\"" + endIndex + "\")",
      "Action.modifyTransitionAction(\"" + startIndex + "\",\"" + endIndex + "\")",
      "Action.changeTransition(\"" + destinationState + "\",\"" + startIndex + "\",\"" + endIndex + "\")",
      "Action.deleteTransition(\"" + startIndex + "\",\"" + endIndex + "\")"

  ];

  menu.style.zIndex = "1000";
  menu.style.border = "1px solid #ccc";
  menu.style.backgroundColor = "#f8f8f8";
  menu.style.padding = "5px";
  menu.style.position = "fixed";
  //add rows
  for (var i = 0; i < rowContent.length; i++) {
      var row = document.createElement("div");
      row.style.padding = "5px";
      row.style.borderRadius = "3px";
      row.style.cursor = "pointer";
      row.style.transition = "background-color 0.3s";
      row.textContent = rowContent[i];
      row.setAttribute('onclick', "javascript:" + rowFuncs[i]);
      // Highlight row on hover
      row.addEventListener("mouseover", function() {
          this.style.backgroundColor = "#ddd";
      });
      row.addEventListener("mouseout", function() {
          this.style.backgroundColor = "transparent";
      });

      //add row to context menu
      menu.appendChild(row);

  }

  //set menu location at mouse, while ensuring it is on screen
  var menuRect = menu.getBoundingClientRect();
  if (event.clientX + menuRect.width > window.innerWidth) {
      menu.style.right = (window.innerWidth - event.clientX) + "px";
  } else {
      menu.style.left = event.clientX + "px";
  }
  if (event.clientY + menuRect.height > window.innerHeight) {
      menu.style.bottom = (window.innerHieght - event.clientY) + "px";
  } else {
      menu.style.top = event.clientY + "px";
  }
  // Add a listener to hide the menu when the user clicks outside of it
  document.addEventListener('mousedown', function hideMenu(e) {
      var prompt = document.getElementById("promptBox");
      if (e.target != menu && !menu.contains(e.target)) {
          if (prompt != null && e.target != prompt && !prompt.contains(e.target)) {

              document.removeEventListener('mousedown', hideMenu);
              Action.removeContextMenu();

          } else {
              document.removeEventListener('mousedown', hideMenu);
              Action.removeContextMenu();
          }
      }
  });
  document.addEventListener('keydown', function hideMenu(e) {
    var prompt = document.getElementById("promptBox");
      if (e.target != menu && !menu.contains(e.target)&&e.key === "Escape") {
          if (prompt != null && e.target != prompt && !prompt.contains(e.target)) {

              document.removeEventListener('keydown', hideMenu);
              Action.removeContextMenu();

          } else {
              document.removeEventListener('keydown', hideMenu);
              Action.removeContextMenu();
          }
      }
  });
  document.body.appendChild(menu);
}

Action.changeTransition = function(dest,startIndex,endIndex) {
   // let classCode = Page.codeMirrorEditor.getValue().substring(startIndex, endIndex);
   let classCode = Page.codeMirrorEditor6.state.doc.toString().substring(startIndex, endIndex);

   // Assuming classCode contains the full transition line, including condition and destination
   let trimmedString = classCode.trim().replace(/;$/, "");

   // Split the string into condition (with guard) and destination parts
   let parts = trimmedString.split("->");
   parts[0] = parts[0].trim(); // Condition part
   parts[1] = parts[1].trim(); // Destination part

   // Ensure there are two parts (condition and destination)
   if (parts.length != 2) {
       console.log("Invalid transition format.");
       return;
   }
  var prompt = document.createElement('div');
    prompt.style.zIndex = "1000";
    prompt.style.border = "1px solid #ccc";
    prompt.style.backgroundColor = "#f8f8f8";
    prompt.style.padding = "5px";
    prompt.style.position = "absolute";
    prompt.style.left = '50%';
    prompt.style.top = '50%';
    prompt.style.transform = 'translate(-50%, -50%)';
    prompt.id = "promptBox";

    var input = document.createElement('input');
    input.type = 'text';
    input.value=parts[1];
    input.style.padding = '5px';
    input.style.margin = '5px';
    input.style.width = '200px';

    var submitButton = document.createElement('button');
    submitButton.textContent = 'Change Destination';
    submitButton.style.padding = '5px';
    submitButton.style.marginLeft = '5px';

    // Append elements to the prompt
    prompt.appendChild(input);
    prompt.appendChild(submitButton);

    // Add the prompt to the document body
    document.body.appendChild(prompt);
    input.focus(); // Automatically focus the input
    var hider=function hidePrompt(e) {
      if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
        document.removeEventListener("mousedown", hidePrompt);
        prompt.remove();
      }
    };
    // Add a listener to hide the prompt when the user clicks outside of it
    document.addEventListener("mousedown", hider);
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        prompt.remove();
        document.removeEventListener("keydown", arguments.callee);
      }
    });
    // Event listener for the submit action
    submitButton.addEventListener('click', function() {
        // Validate input value is not empty
        if (input.value.trim() === "") {
            console.log("Input for new destination state is empty.");
            return;
        }


        // Create the modified transition string with the new destination
        let modifiedTransition = parts[0] + " -> " + parts[1].replace(dest,input.value.trim()) + ";";
        
        let orig = Page.codeMirrorEditor6.state.doc.toString();
        let before = orig.substring(0, startIndex);
    
        // Get the part of the string after the substring you want to replace
        let after = orig.substring(endIndex);
        let updatedContent = before + modifiedTransition +after;
        //let updatedContent = orig.replace(classCode.trim(), modifiedTransition);

        // Update the editor with the new content
        Page.setCodeMirror6Text(updatedContent);


        Action.removeContextMenu();
        TabControl.getCurrentHistory().save(Page.getUmpleCode(), "changeTransitionDestination");
        document.removeEventListener("mousedown",hider);
        prompt.remove(); // Remove the prompt after processing
        Action.selectMatchingText(modifiedTransition);
    });
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent the default form submission behavior
        e.stopPropagation();
        submitButton.click();
      }
    });
};


Action.deleteTransition = function(startIndex, endIndex) {
  let classCode = Page.codeMirrorEditor6.state.doc.toString().substring(startIndex, endIndex);

  let orig = Page.codeMirrorEditor6.state.doc.toString();

  orig = orig.replace(classCode, "");

  // Update the editor with the new code
  Page.setCodeMirror6Text(orig);

  Action.removeContextMenu();
  TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
};

Action.modifyTransitionGuard = function(startIndex,endIndex) {

  let pattern2 = new RegExp("^(.*?)(\\s*\\[(.*?)\\])?(\\s*\\/\\s*\\{(.*?)\\})?\\s*->\\s*(\\[(.*?)\\])?(\\s*\\/\\s*\\{(.*?)\\})?\\s*(\\w+);?$", "s");
  let classCode = Page.codeMirrorEditor6.state.doc.toString().substring(startIndex, endIndex);
  
  const match =classCode.trim().match(pattern2);

  // Extracting captured groups based on the updated pattern
  let eventName = match[1].trim();
  let guard = match[3] ? match[3].trim() : (match[7] ? match[7].trim() : null);
  let action = match[5] ? match[5].trim() : (match[9] ? match[9].trim() : null);
  let destinationState = match[10].trim();
     if(guard===null){
       guard="";
     }
     //
     if(action===null){
       action="";
     }
  // Create the input prompt for renaming the transition condition
  var prompt = document.createElement('div');
  prompt.style.zIndex = "1000";
  prompt.style.border = "1px solid #ccc";
  prompt.style.backgroundColor = "#f8f8f8";
  prompt.style.padding = "5px";
  prompt.style.position = "absolute";
  prompt.style.left = '50%';
  prompt.style.top = '50%';
  prompt.style.transform = 'translate(-50%, -50%)';
  prompt.id = "promptBox";

  var input = document.createElement('input');
  input.type = 'text';
  input.value = guard;
  input.style.padding = '5px';
  input.style.margin = '5px';
  input.style.width = '200px';

  var submitButton = document.createElement('button');
  submitButton.textContent = 'Change/Add Guard';
  submitButton.style.padding = '5px';
  submitButton.style.marginLeft = '5px';

  // Append elements to the prompt
  prompt.appendChild(input);
  prompt.appendChild(submitButton);

  // Add the prompt to the document body
  document.body.appendChild(prompt);
  input.focus(); // Automatically focus the input
  var hider=function hidePrompt(e) {
    if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
      document.removeEventListener("mousedown", hidePrompt);
      prompt.remove();
    }
  };
  // Add a listener to hide the prompt when the user clicks outside of it
  document.addEventListener("mousedown", hider);
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      prompt.remove();
      document.removeEventListener("keydown", arguments.callee);
    }
  });
  // Event listener for the submit action
  submitButton.addEventListener('click', function() {
    // Validate input value is not empty

    let trimmedString = classCode.trim();

    // Split the string into condition (with guard) and destination parts
    let parts = trimmedString.split("->");
    parts[0] = parts[0].trim(); 
    parts[1] = parts[1].trim(); // Destination part

    // Ensure there are two parts (condition and destination)
    if (parts.length != 2) {
        console.log("Invalid transition format.");
        return;
    }
    let modifiedTransition = "";
    if (input.value.trim() === "") {
      if (guard === null || guard === "") {
        return;
     }
     else{
       pattern=new RegExp("\\[\\s*(.*?)\\s*\\]", "g");
       modifiedTransition = classCode.replace(pattern,"");
     }
    }
    else{
      if (guard === null || guard === "") {
        if(action==null || action === ""){
          parts[0]=eventName+" ["+input.value.trim()+"]";

        }
        else{
          if(parts[1].includes(action)){
            parts[0]=eventName+" ["+input.value.trim()+"]";
          }
          else{
            parts[0]=eventName+" ["+input.value.trim()+"]"+" /{" +action+"}"
          }

        }
        modifiedTransition = parts[0]+ " -> " + parts[1];

      }
      else{
        modifiedTransition = classCode.replace(guard,input.value.trim());
      }
    }


    // Assuming classyCode is meant to represent the original content where the transition is to be found
    let orig = Page.codeMirrorEditor6.state.doc.toString();
    let before = orig.substring(0, startIndex);
    
    // Get the part of the string after the substring you want to replace
    let after = orig.substring(endIndex);
    let updatedContent = before + modifiedTransition +after;

    // Update the editor with the new content
    Page.setCodeMirror6Text(updatedContent);

    Action.removeContextMenu();
    TabControl.getCurrentHistory().save(Page.getUmpleCode(), "modifyGuard");
    document.removeEventListener("mousedown",hider);
    prompt.remove(); // Remove the prompt after processing
    Action.selectMatchingText(modifiedTransition);
});
input.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent the default form submission behavior
    e.stopPropagation();
    submitButton.click();
  }
});
};



Action.modifyTransitionAction = function(startIndex,endIndex) {
  let pattern2 = new RegExp("^(.*?)(\\s*\\[(.*?)\\])?(\\s*\\/\\s*\\{(.*?)\\})?\\s*->\\s*(\\[(.*?)\\])?(\\s*\\/\\s*\\{(.*?)\\})?\\s*(\\w+);?$", "s");
  let classCode = Page.codeMirrorEditor6.state.doc.toString().substring(startIndex, endIndex);

  const match =classCode.trim().match(pattern2);
  // Extracting captured groups based on the updated pattern

  let guard = match[3] ? match[3].trim() : (match[7] ? match[7].trim() : null);
  let currentAction = match[5] ? match[5].trim() : (match[9] ? match[9].trim() : null);

     if(guard===null){
       guard="";
     }
     //
  if(currentAction===null){
    currentAction="";
  }
  // Create the input prompt for  the transition condition
  var prompt = document.createElement('div');
  prompt.style.zIndex = "1000";
    prompt.style.border = "1px solid #ccc";
    prompt.style.backgroundColor = "#f8f8f8";
    prompt.style.padding = "5px";
    prompt.style.position = "absolute";
    prompt.style.left = '50%';
    prompt.style.top = '50%';
    prompt.style.transform = 'translate(-50%, -50%)';
    prompt.id = "promptBox";

  var textarea = document.createElement('textarea');
  textarea.style.width = '300px';
    textarea.style.height = '100px';
    textarea.value = currentAction || ""; // Pre-fill the textarea with the current action if any
    // Styling for the textarea omitted for brevity...

  var submitButton = document.createElement('button');
  submitButton.textContent = 'Change/Add Action';
  submitButton.style.padding = '5px';
  submitButton.style.marginLeft = '5px';

  // Append elements to the prompt
  prompt.appendChild(textarea);
  prompt.appendChild(submitButton);

  // Add the prompt to the document body
  document.body.appendChild(prompt);
  textarea.focus(); // Automatically focus the input
  var hider=function hidePrompt(e) {
    if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
      document.removeEventListener("mousedown", hidePrompt);
      prompt.remove();
    }
  };
  // Add a listener to hide the prompt when the user clicks outside of it
  document.addEventListener("mousedown", hider);
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      prompt.remove();
      document.removeEventListener("keydown", arguments.callee);
    }
  });
  // Event listener for the submit action
  submitButton.addEventListener('click', function() {
      // Validate input value is not empty

      let trimmedString = classCode.trim();

      // Split the string into condition (with guard) and destination parts
      let parts = trimmedString.split("->");
      parts[0] = parts[0].trim(); 
      parts[1] = parts[1].trim(); // Destination part

      // Ensure there are two parts (condition and destination)
      if (parts.length != 2) {
          console.log("Invalid transition format.");
          return;
      }
      let modifiedTransition = "";
      if (textarea.value.trim() === "") {
        if (currentAction === null || currentAction === "") {
          return;
       }
       else{
         pattern=new RegExp("/\\s*\\{.*?\\}\\s*->", "g");
         modifiedTransition = classCode.replace(pattern," ->");
       }
      }
      else{
        if (currentAction === null || currentAction === "") {
          modifiedTransition = parts[0]+"/{"+textarea.value.trim()+"}"+ " -> " + parts[1];


        }
        else{
          modifiedTransition = classCode.replace(currentAction,textarea.value.trim());
        }
      }


      // Assuming classyCode is meant to represent the original content where the transition is to be found
      let orig = Page.codeMirrorEditor6.state.doc.toString();
      let before = orig.substring(0, startIndex);
    
      // Get the part of the string after the substring you want to replace
      let after = orig.substring(endIndex);
      let updatedContent = before + modifiedTransition +after;

      // Update the editor with the new content
         Page.setCodeMirror6Text(updatedContent);

      Action.removeContextMenu();
      TabControl.getCurrentHistory().save(Page.getUmpleCode(), "modifyAction");
      document.removeEventListener("mousedown",hider);
      prompt.remove(); // Remove the prompt after processing
      Action.selectMatchingText(modifiedTransition);
  });
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission behavior
      e.stopPropagation();
      submitButton.click();
    }
  });
};





Action.modifyTransitionEventName = function(startIndex, endIndex) {
  let classCode = Page.codeMirrorEditor6.state.doc.toString().substring(startIndex, endIndex);
  let pattern2 = new RegExp("^(.*?)\\s*(\\[(.*?)\\])?\\s*(\\/\\s*\\{(.*?)\\})?\\s*->\\s*(\\w+);?$", "s");

  const match = classCode.match(pattern2);


  let eventName = match[1].trim();
  let guard = match[3] ? match[3].trim() : null;
  let action = match[5] ? match[5].trim() : null;
  let destinationState = match[6].trim();
  // Create the input prompt for renaming the transition condition
  var prompt = document.createElement('div');
  prompt.style.zIndex = "1000";
  prompt.style.border = "1px solid #ccc";
  prompt.style.backgroundColor = "#f8f8f8";
  prompt.style.padding = "5px";
  prompt.style.position = "absolute";
  prompt.style.left = '50%';
  prompt.style.top = '50%';
  prompt.style.transform = 'translate(-50%, -50%)';
  prompt.id = "promptBox";

  var input = document.createElement('input');
  input.type = 'text';
  input.value = eventName;
  input.style.padding = '5px';
  input.style.margin = '5px';
  input.style.width = '200px';

  var submitButton = document.createElement('button');
  submitButton.textContent = 'Change/Add Event Name';
  submitButton.style.padding = '5px';
  submitButton.style.marginLeft = '5px';

  // Append elements to the prompt
  prompt.appendChild(input);
  prompt.appendChild(submitButton);

  // Add the prompt to the document body
  document.body.appendChild(prompt);
  input.focus(); // Automatically focus the input
  var hider = function hidePrompt(e) {
      if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
          document.removeEventListener("mousedown", hidePrompt);
          prompt.remove();
      }
  };
  // Add a listener to hide the prompt when the user clicks outside of it
  document.addEventListener("mousedown", hider);
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      prompt.remove();
      document.removeEventListener("keydown", arguments.callee);
    }
  });
  // Event listener for the submit action
  submitButton.addEventListener('click', function() {
      // Validate input value is not empty
      if (input.value.trim() === "") {
          console.log("Input for new transition condition is empty.");
          return;
      }

      // Create the modified transition string
      let modifiedTransition = classCode.replace(eventName, input.value.trim());

      // Assuming classyCode is meant to represent the original content where the transition is to be found
      let orig = Page.codeMirrorEditor6.state.doc.toString();
      let before = orig.substring(0, startIndex);
    
      // Get the part of the string after the substring you want to replace
      let after = orig.substring(endIndex);
      let updatedContent = before + modifiedTransition +after;

      // Update the editor with the new content
      Page.setCodeMirror6Text(updatedContent);

      Action.removeContextMenu();
      TabControl.getCurrentHistory().save(Page.getUmpleCode(), "renameTransition");
      document.removeEventListener("mousedown", hider);
      prompt.remove(); // Remove the prompt after processing
      Action.selectMatchingText(modifiedTransition);
  });
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission behavior
      e.stopPropagation();
      submitButton.click();
    }
  });
};

//Searches the document for any element matching the "customContextMenu" tag, and removes it. 
//Removes context menu on state and class diagrams
//Part of Issue #1898, see wiki for more details: https://github.com/umple/umple/wiki/MenusInGraphviz
Action.removeContextMenu = function(){
  var o = document.getElementsByTagName('customContextMenu');
  if (o.length != 0) {
    o.item(0).remove();
  }
}


//Called from Action.drawInput(), searches for existing displayColor definitions in the class code, replaces it if it exists,
//prepends a new displayColor statement to the start of the class if one doesn't exist.
//Part of Issue #1898, see wiki for more details: https://github.com/umple/umple/wiki/MenusInGraphviz
Action.setColor=function(classCode,className,color){
  let classyCode=classCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
  if(!classyCode.includes("displayColor")){ //if color is not already set, we can prepend it to the start of the class
    let subtext="{  displayColor "+color+";\n"; 
    subtext=classyCode.substr(0,classyCode.indexOf("{"))+subtext+classyCode.substr(classyCode.indexOf("{")+1,classyCode.length-classyCode.indexOf("{")-1);
    Page.codeMirrorEditor6.dispatch({ changes: { from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: Page.codeMirrorEditor6.state.doc.toString().replace(classyCode,subtext) } });

  } else { //otherwise, use regex to replace existing displayColor statement
    let subtext="displayColor "+color+";"; 
    let regex=new RegExp("displayColor\\s+.*;");
    subtext=classyCode.replace(regex,subtext);

    Page.codeMirrorEditor6.dispatch({ changes: { from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: Page.codeMirrorEditor6.state.doc.toString().replace(classyCode,subtext) } });

    setTimeout(function(){
        TabControl.getCurrentHistory().save(Page.getUmpleCode(), "setColor");
    }, 100);

  }
}

// Get the positioning information for a given class as stored in the
// Umple model. 
Action.getGvPosition =function(positioningCode, className) {
  // Returns an structure with 
  //  all  matchedClassPos ... the overall match
  //  assoc1 any initial code describing assoc positions
  //  x  the X position (left)
  //  y  the y position (right)
  //  width the width (we will not edit)
  //  height the height (we will not edit)
  //  assoc2   any more code describing association locations
  
  // Find the positioning code for the class
  var regexForPositions = new RegExp(
    "class[\\s]*" +className +"[\\s]{"
    +"([\\sa-zA-Z\\:\\.\\,\\;\\-\\_0-9]*)"
    +"\\s*position ([\\d.]*) ([\\d.]*) ([\\d.]*) ([\\d.]*);"
    +"([\\sa-zA-Z\\:\\.\\,\\;\\-\\_0-9]*)}","s");
  var theMatch=positioningCode.match(regexForPositions);
  if(theMatch == null) {
    // This should be an error
    return null;
  }
  var positionStruct = {
    all: theMatch[0],
    assoc1: theMatch[1],
    x: theMatch[2],
    y: theMatch[3],
    width: theMatch[4],
    height: theMatch[5],
    assoc2: theMatch[6]
  };
  
  return positionStruct;
}

// Called when a class is being moved by direct manipulation
// To ways this could have been done:
// 1. Front end in CodeMirror6: Edit the text as above in setColor as per G mode
//   .. won't work as the diagram code is not necessarily in the visible text
// 2. Backend function as used by E mode as in DiagramEdit.classMoved and
//    DiagramEdit.updateUmpleText with editClass
//   .. won't work as we would have to have full details of the class parsed as Json
// Solution: Edit code in the layout editor, then trigger CodeMirror6 to send change
Action.updateGvPosition=function(className,deltaX,deltaY) {
  // Get the positioning code that we will update
  var positioningCode = jQuery("#umpleLayoutEditorText").val();

  // get astructure containing the umple positioning info in the current model
  var theMatch = Action.getGvPosition(positioningCode, className);

  if(theMatch == null) {
    // Could not find position for this class
//DEBUG
Page.catFeedbackMessage("NOPOS:"+className+" ");

    return null;
  }

  // Update the position for this class
  var matchedClassPos=theMatch.all; // full positioning text
  var xPos=theMatch.x; // left
  
  var yPos=theMatch.y; // top
  var associationPos1=theMatch.assoc1; // only used by E mode
  var associationPos2=theMatch.assoc2; // only used by E mode

  return Action.updateGVPositionBasic(className,deltaX,deltaY,positioningCode,
    matchedClassPos,xPos,yPos,associationPos1,associationPos2,true);
}

// Completion for the above, called both by the above on direct manip
// and also in updateUmpleDiagramCallback when gv is updated and
// gvmanual is set
Action.updateGVPositionBasic=function(className,deltaX,deltaY,positioningCode,
    matchedClassPos,xPos,yPos,associationPos1,associationPos2, doRedraw) {

  // Prevent positions from being set to values off or too close to diagram edge
  var newXpos = Math.round(Math.max(Number(xPos)+deltaX,5)); // just before left border
  var newYpos = Math.round(Math.max(Number(yPos)+deltaY,5)); // just below top border
//DEBUG
//if(isNaN(xPos)) Page.catFeedbackMessage("OXNAN");
//if(isNaN(yPos)) Page.catFeedbackMessage("OYNAN");
//if(isNaN(deltaX)) Page.catFeedbackMessage("DXNAN");
//if(isNaN(deltaY)) Page.catFeedbackMessage("DYNAN");
//if(isNaN(newXpos)) Page.catFeedbackMessage("NXNAN");
//if(isNaN(newYpos)) Page.catFeedbackMessage("NYNAN");

  var newClassPos=matchedClassPos.replace(
    "position "+xPos+" "+yPos,
    "position "+newXpos+" "+newYpos);

  // Remove any association positioning that has been left
  if(associationPos1 != null) {
    newClassPos=newClassPos.replace(""+associationPos1+"","\n");
  }
  if(associationPos2 != null) {
    newClassPos=newClassPos.replace(""+associationPos2+"","\n");
  }
//DEBUG next 6 lines
//if (matchedClassPos == newClassPos) {
//  Page.catFeedbackMessage(" @@@"+deltaX+"&"+xPos+"&"+newXpos+" ");
//}
//else {
//  Page.catFeedbackMessage("###"+deltaX);
//}
  
  //Update the text
  Page.setUmplePositioningCode(
    positioningCode.replace(matchedClassPos,newClassPos));

  if(doRedraw) {
    // Update the backend, triggering redraw
    setTimeout(function(){
      TabControl.getCurrentHistory().save(Page.getUmpleCode(), "moveClass");
    }, 100);
      Action.redrawDiagram();
  }
}


//Multiuse function called whenever a user wants to use a menu edit function that requires user input
//allows users to input their text/color selection, listens for "enter", then performs the relevant edit
//Part of Issue #1898, see wiki for more details: https://github.com/umple/umple/wiki/MenusInGraphviz
Action.drawInput = function(inputType,classCode,className){
  // creating input div
  var prompt = document.createElement('div');
  prompt.style.zIndex = "1000";
  prompt.style.border = "1px solid #ccc";
  prompt.style.backgroundColor = "#f8f8f8";
  prompt.style.padding = "5px";
  prompt.style.position = "fixed";
  prompt.id="promptBox";
  //draw at mouse location
  var promptRect=prompt.getBoundingClientRect();
  if(event.clientX+promptRect.width>window.innerWidth){
    prompt.style.right=(window.innerWidth-event.clientX)+"px";
  } else {
    prompt.style.left = event.clientX+"px";
  }
  if(event.clientY+promptRect.height>window.innerHeight){
    prompt.style.bottom=(window.innerHeight-event.clientY)+"px";
  } else {
    prompt.style.top = event.clientY+"px";
  }
  var input = document.createElement('input');
  input.type = 'text';
  input.style.padding = '5px';
  input.style.borderRadius = '3px';
  input.style.border = '1px solid #ccc';
  input.style.width = '200px';
  input.style.marginLeft = '5px';
  var inputErrorMsg = document.createElement('label');
  inputErrorMsg.type='label';
  inputErrorMsg.textContent='Error - Please enter an alphanumeric name.';
  inputErrorMsg.style.color="red";
  var hider=function hidePrompt(e) {
    if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
      document.removeEventListener("mousedown", hidePrompt);
      prompt.remove();
    }
  };
  // Add a listener to hide the prompt when the user clicks outside of it
  document.addEventListener("mousedown", hider);

  if(inputType=="attri"){
    //create the attribute dropdown list
    var select = document.createElement("select");
    var option1 = document.createElement("option");
    option1.value = "String";
    option1.text = "String";
    var option2 = document.createElement("option");
    option2.value = "Integer";
    option2.text = "Integer";
    var option3 = document.createElement("option");
    option3.value = "Double";
    option3.text = "Double";
    var option4 = document.createElement("option");
    option4.value = "Float";
    option4.text = "Float";
    var option5 = document.createElement("option");
    option5.value = "Boolean";
    option5.text = "Boolean";
    var option6 = document.createElement("option");
    option6.value = "Date";
    option6.text = "Date";
    var option7 = document.createElement("option");
    option7.value = "Time";
    option7.text = "Time";
    select.add(option1);
    select.add(option2);
    select.add(option3);
    select.add(option4);
    select.add(option5);
    select.add(option6);
    select.add(option7);
    prompt.appendChild(select);
    //create the text input for attribute name
    var input = document.createElement("input");
    input.type = "text";
    input.style.padding = "5px";
    input.style.borderRadius = "3px";
    input.style.border = "1px solid #ccc";
    input.style.width = "200px";
    input.style.marginLeft = "5px";
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        if(Action.validateAttributeName(input.value)){
          let orig=classCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
          let newClass;
          if(input.value.includes(":")){ //In the case users wish to type in the format - "newAttrName:Type" - instead of using dropdown
            let attriInput=input.value.split(":");
            newClass=orig.substr(0,orig.length-1)+"  "+attriInput[1].trim()+" "+attriInput[0].trim()+";\n}";
          } else { //if users use dropdown and type attribute name in text box
            newClass=orig.substr(0,orig.length-1)+"  "+select.value+" "+input.value+";\n}";
          }
          const textlength = Page.codeMirrorEditor6.state.doc.length
          const insertval = Page.codeMirrorEditor6.state.doc.toString().replace(orig,newClass)

          Page.codeMirrorEditor6.dispatch({ 
            changes: { 
              from: 0, 
              to: textlength,
              insert:  insertval
            } 
          });
          document.removeEventListener("mousedown", hider);
        
          prompt.remove();
          Action.removeContextMenu();
          TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
        } else if(!document.contains(inputErrorMsg)) {
          prompt.appendChild(inputErrorMsg);
        }
      }
    });
    prompt.appendChild(input);
  } else if(inputType=="rename"){
    var replaceAllLabel = document.createElement('label');
    replaceAllLabel.htmlFor = 'replace-all-checkbox';
    replaceAllLabel.style.marginRight = '5px';
    replaceAllLabel.appendChild(document.createTextNode("New name for \'"+className+"\'?"));
    input.value = className;
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        if(Action.validateAttributeName(input.value)){
        
          // Update core text
          let orig = Page.codeMirrorEditor6.state.doc.toString();
          orig = Action.renameClassAssistant(orig, className, input.value.trim());
          Page.codeMirrorEditor6.dispatch({ changes: { from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: orig } });
          
          // Update diagram text
          var positioningCode = jQuery("#umpleLayoutEditorText").val();
          positioningCode =  Action.renameClassAssistant(positioningCode, className, input.value.trim());
          Page.setUmplePositioningCode(positioningCode);
          
          document.removeEventListener("mousedown", hider);
          prompt.remove();
          Action.removeContextMenu();
          TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
        } else if(!document.contains(inputErrorMsg)) {
          prompt.appendChild(inputErrorMsg);
        }
      }
    });
    prompt.appendChild(replaceAllLabel);
    prompt.appendChild(input);    
  } else if(inputType=="subclass") {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        if(Action.validateAttributeName(input.value)){
          let subtext="\nclass "+input.value+"\n{\n  isA "+className+";\n}\n";
          Page.codeMirrorEditor6.dispatch({ changes: { from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: Page.codeMirrorEditor6.state.doc.toString() + subtext}});
          document.removeEventListener("mousedown", hider);
          TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
          prompt.remove();
          Action.removeContextMenu();
        } else if(!document.contains(inputErrorMsg)) {
          prompt.appendChild(inputErrorMsg);
        }
      }
    });
    prompt.appendChild(input);
  } else if(inputType=="color"){
    var label=document.createElement("label");
    label.textContent="Color - ";
    var arrow=document.createElement("span");
    arrow.innerHTML="&#8594;";
    arrow.style.cursor="pointer";
    arrow.fontSize="20px";
    arrow.style.paddingLeft="5px";
    input.style.width="30px";
    input.style.height="30px";
    input.type="color";
    var inputFunc=function setter(e) {
      if (e.key === 'Enter') {
        document.removeEventListener('keydown',setter);
        Action.setColor(classCode,className,input.value);
        prompt.remove();
        Action.removeContextMenu();
      }
    };
    document.addEventListener('keydown', inputFunc);
    arrow.addEventListener("click", function(){
      Action.setColor(classCode,className,input.value);
      document.removeEventListener('keydown',inputFunc);
      prompt.remove();
      Action.removeContextMenu();
    });
    // Add event listeners for hover
    arrow.addEventListener("mouseover", function() {
      arrow.style.color = "blue";
    });
    arrow.addEventListener("mouseout", function() {
      arrow.style.color = "black";
    });
    prompt.appendChild(label);
    prompt.appendChild(input);
    prompt.appendChild(arrow);
  }
  // Add the prompt to the page
  document.body.appendChild(prompt);
  input.focus();

}

//Replaces a word anywhere in the text repeatedly
//Used to rename classes ... both their definition() 
//including diagram layout
//and use as a type.
Action.renameClassAssistant = function(text, oldClassName, newClassName) {
  let newText= text;
  let regex=new RegExp("(\\W+)("+oldClassName+")(\\W+)");
  let res;
  while((res=newText.match(regex))!=null){
    newText=
      newText.substr(0,res.index+res[1].length)
      +newClassName
      +newText.substr(
        res.index+res[1].length+res[2].length,
        newText.length-(res.index+res[1].length+res[2].length)
      );
  }
  return newText;
}

//Searches for existing associations, children, and associationClasses related to the target class
//Associations are: deleted
//Children are: pointed to parent (if exists)
//associationClasses are: deleted
//Part of Issue #1898, see wiki for more details: https://github.com/umple/umple/wiki/MenusInGraphviz
Action.deleteClass = function(classCode, className){
  let orig=Page.codeMirrorEditor6.state.doc.toString();

  orig=orig.replace(classCode.replaceAll("&#10","\n").replaceAll("&#$quot","\""),"");
  //deletes all associations leading to target class
  let regex=new RegExp(".*\\s*(-|<)(>|-)\\s*.*\\s*"+className+"(\\s+\\w+)*\\s*;");
  let res;
  while((res=orig.match(regex))!=null){ 
    orig=orig.substr(0,res.index)+orig.substr(res.index+res[0].length,orig.length-(res.index+res[0].length));
  }
  regex=new RegExp(".*"+className+"\\s*(<|-)(>|-)\\s*.*\\s+\\w+;");
  while((res=orig.match(regex))!=null){ 
    orig=orig.substr(0,res.index)+orig.substr(res.index+res[0].length,orig.length-(res.index+res[0].length));
  }
  //finds all children of target class and connects them to parent of target, if it exists
  regex=new RegExp("isA\\s+"+className);
  if(orig.match(regex)!=null){
    let subregex=new RegExp("isA\\s+(\\w+);");
    let test;
    if((test=classCode.match(subregex))!=null){ //if parent class exists, link children to it
      let parentClass="isA "+test[1]+";";
      while((res=orig.match(regex))!=null){
        orig=orig.substr(0,res.index)+parentClass+orig.substr(res.index+res[0].length+1,orig.length-(res.index+res[0].length+1));
      }
    } else { //if parent class does not exist, delete relevant isA statements
      while((res=orig.match(regex))!=null){
        orig=orig.substr(0,res.index)+orig.substr(res.index+res[0].length+1,orig.length-(res.index+res[0].length+1));
      }
    }
  }
  //remove any associationClass definitions containing this class
  regex=new RegExp("associationClass\\s+\\w+\\s*\\n*{(\\n*\\W*\\w*;)*(\\s*CRUD_Value\\s*{(\\s*\\w*\\s*,*)*}\\s*\\n*)*(\\n*\\W*\\w*;)*([\\s|\\t]*[*]\\s+"+className+";)(\\n*\\W*\\w*;)*(\\s*CRUD_Value\\s*{(\\s*\\w*\\s*,*)*}\\s*\\n*)*(\\n*\\W*\\w*)*?}");
  res=null;
  while((res=orig.match(regex))!=null){ 
    orig=orig.substr(0,res.index)+orig.substr(res.index+res[0].length,orig.length-(res.index+res[0].length));
  }
  //set editor code, save new state, and remove the context menu
    Page.codeMirrorEditor6.dispatch({ changes: { from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: orig } });


  Action.removeContextMenu();
  TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
}



//Adds an association to a class, this function is called by Action.displayMenu() when the user selects "Add Association"
//Part of Issue #1898, see wiki for more details: https://github.com/umple/umple/wiki/MenusInGraphviz
Action.addAssociationGv = function(classCode, className){
  var elems=document.getElementsByClassName("node");
  var orig=classCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
  Action.removeContextMenu();
  //add event listener to Graphviz nodes for left click
  for(let i=0;i<elems.length;i++){
    elems[i].addEventListener("mousedown", function assocClass(event){
      var elemText=event.target;
      //iterate up to find class node
      while(elemText.parentElement.id!="graph0"){
        elemText=elemText.parentNode;
      }
      elemText=elemText.outerHTML.substr(elemText.outerHTML.indexOf("&nbsp;"),elemText.outerHTML.indexOf("</text>")-elemText.outerHTML.indexOf("&nbsp;")).replaceAll("&nbsp;","").trim();
      let subtext="  * -> 1 "+elemText+";\n}\n";
      let newClass=orig.substr(0,orig.length-1)+subtext;

      Page.codeMirrorEditor6.dispatch({ changes: { from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: Page.codeMirrorEditor6.state.doc.toString().replace(orig,newClass) } });

      TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
      let others=document.getElementsByClassName("node");
      for(let q=0;q<others.length;q++){
        others[q].removeEventListener("mousedown",assocClass);
      }
    });
  }
}

// Get the class name from a SVGGelement
Action.getGvClassName = function(event) {
  return Action.getGvClassNameFromNode(event.target);
}

// Get the class name from a selection event
Action.getGvClassNameFromNode = function(elemText) {
  //iterate up to top of class table
  while(elemText.parentElement.id!="graph0"){
    elemText=elemText.parentNode;
  }
  //unstable - grabs class name
  elemText=elemText.outerHTML.substr(elemText.outerHTML.indexOf("&nbsp;"),elemText.outerHTML.indexOf("</text>")-elemText.outerHTML.indexOf("&nbsp;")).replaceAll("&nbsp;","").trim();
  return(elemText);
}

//Action.displayMenu() is triggered by contextmenu event on Graphviz Class "node" elements
//Draws a div containing the editing options for class GV diagrams, as well as calling the related function when clicked
//Part of Issue #1898, see wiki for more details: https://github.com/umple/umple/wiki/MenusInGraphviz
Action.displayMenu = function(event) {
  if(!Action.diagramInSync){
    return;
  }
  // Remove old menu, if any
  Action.removeContextMenu();
  var elemText=Action.getGvClassName(event);

 var orig=Page.codeMirrorEditor6.state.doc.toString();

 var chosenClass=Action.splitStates(orig);
  for(let i=0;i<chosenClass.length;i++){
    if(chosenClass[i].startsWith("class "+elemText+"{")||chosenClass[i].startsWith("class "+elemText+" ")||chosenClass[i].startsWith("class "+elemText+"\n")){
      chosenClass=chosenClass[i];
    }
  }
  if(typeof chosenClass != 'string'){
    return;
  }
  var menu = document.createElement('customContextMenu');
  var rowContent = ["Add Attribute","Rename Class","Delete Class","Add Subclass","Add Association","Change Color"];
  var jsInput=chosenClass.replaceAll("\n","&#10").replaceAll("\"","&#$quot");
  var rowFuncs = ["Action.drawInput(\"attri\",\""+jsInput+"\",\""+elemText+"\")","Action.drawInput(\"rename\",\""+jsInput+"\",\""+elemText+"\")","Action.deleteClass(\""+jsInput+"\",\""+elemText+"\")","Action.drawInput(\"subclass\",\""+jsInput+"\",\""+elemText+"\")","Action.addAssociationGv(\""+jsInput+"\",\""+elemText+"\")","Action.drawInput(\"color\",\""+jsInput+"\",\""+elemText+"\")"];

  menu.style.zIndex = "1000";
  menu.style.border = "1px solid #ccc";
  menu.style.backgroundColor = "#f8f8f8";
  menu.style.padding = "5px";
  menu.style.position = "fixed";
  //add rows
  for (var i = 0; i < rowContent.length; i++) {
    var row = document.createElement("div");
    row.style.padding = "5px";
    row.style.borderRadius = "3px";
    row.style.cursor = "pointer";
    row.style.transition = "background-color 0.3s";
    row.textContent = rowContent[i];
    row.setAttribute('onclick',"javascript:"+rowFuncs[i]);
    // Highlight row on hover
    row.addEventListener("mouseover", function() {
      this.style.backgroundColor = "#ddd";
    });
    row.addEventListener("mouseout", function() {
      this.style.backgroundColor = "transparent";
    });

    //add row to context menu
    menu.appendChild(row);

  }

  //set menu location at mouse, while ensuring it is on screen
  var menuRect=menu.getBoundingClientRect();
  if(event.clientX+menuRect.width>window.innerWidth){
    menu.style.right=(window.innerWidth-event.clientX)+"px";
  } else {
    menu.style.left = event.clientX+"px";
  }
  if(event.clientY+menuRect.height>window.innerHeight){
    menu.style.bottom=(window.innerHieght-event.clientY)+"px";
  } else {
    menu.style.top = event.clientY+"px";
  }
  // Add a listener to hide the menu when the user clicks outside of it
  document.addEventListener('mousedown', function hideMenu(e) {
    var prompt=document.getElementById("promptBox");
    if (e.target != menu && !menu.contains(e.target)) {
      if(prompt!=null&&e.target != prompt && !prompt.contains(e.target)){

        document.removeEventListener('mousedown', hideMenu);
        Action.removeContextMenu();
        
      } else {


        document.removeEventListener('mousedown', hideMenu);
        Action.removeContextMenu();
      }
    }
  });
  document.body.appendChild(menu);
}

Action.displayAssociMenu = function(event, associationLink) {
  const regex = /Action\.selectAssociation\('([^']+)'\)/;

  // Use the regex to extract the content
  const associationDetails = associationLink.match(regex);


  // associationDetails array contains the extracted information
  let indices = Action.selectAssociation(associationDetails[1]);

  var detailsArray = associationDetails[1].split(',');

  if (detailsArray.length == 4) {
      var destination = detailsArray[1].trim();
      var className = detailsArray[0].trim();
      var endInfo = detailsArray[2].split(' ');
      var startInfo = detailsArray[3].split(' ');

  } else {
      var destination = detailsArray[1].trim();
      var endInfo = detailsArray[2].split(' ');
      var startInfo = detailsArray[2].split(' ');
      var className = detailsArray[0].trim();
  }
  
  var searchCursor = new RegExp("(associationClass|class|interface|trait) " + className + "($|\\\s|[{])");
  var nextCursor = new RegExp("(class|interface|trait) [A-Za-z]");
  if (Page.codeMirrorOn) {
      //get the class code for where the association belong
      var selectionIndiciesCM6 = Action.selectItemCM6(searchCursor);
      var classCode = Page.codeMirrorEditor6.state.sliceDoc(selectionIndiciesCM6.startIndex,selectionIndiciesCM6.endIndex) ;
      //get the class code f
      
      if (clientDebuggerFlag){
        console.warn("classCode: " + classCode);
      }

  }


  var jsInput = classCode.replaceAll("\n", "&#10").replaceAll("\"", "&#$quot");;
  let isEnd = 1; //0 as start 1 as end
  let startIndex = indices.startIndex;
  let endIndex = indices.endIndex;
  var selectedText = Page.codeMirrorEditor6.state.sliceDoc(startIndex,endIndex) ;

  if (clientDebuggerFlag){
    console.warn("selectedText: " + selectedText);  
  }


  if (selectedText.includes(endInfo[0].trim()) == false) {
      isEnd = 3;//association class
  }
  var menu = document.createElement('customContextMenu');
  //special menu for association class
  var rowContent = isEnd === 3 ?
  ["Alter " + className + " multiplicity", "Alter " + className + " role name", "Alter "+destination+" role name"] :
  ["Alter " + className + " multiplicity", "Alter " + className + " role name", "Alter "+destination+" multiplicity" , "Alter "+destination+" role name", "Delete the association"];
  //var rowContent = ["Alter " + className + " multiplicity", "Alter " + className + " role name", "Alter "+destination+" multiplicity" , "Alter "+destination+" role name", "Delete the association."];
  var rowFuncs = isEnd === 3 ?
        [
            "Action.modifyMultiplicity(\"" + jsInput + "\",\"" + selectedText + "\",\"" + startInfo[0] + "\",\"" + 0 + "\")",
            "Action.modifyRoleName(\"" + jsInput + "\",\"" + selectedText + "\",\"" + startInfo[1] + "\",\"" + startInfo[0] + "\",\"" + 0 + "\")",
            "Action.modifyRoleName(\"" + jsInput + "\",\"" + selectedText + "\",\"" + endInfo[1] + "\",\"" + startInfo[0] + "\",\"" + 1 + "\")"
        ] :[

        
      "Action.modifyMultiplicity(\"" + jsInput + "\",\"" + selectedText + "\",\"" + startInfo[0] + "\",\"" + 0 + "\")",
      "Action.modifyRoleName(\"" + jsInput + "\",\"" + selectedText + "\",\"" + startInfo[1] + "\",\"" + startInfo[0] + "\",\"" + 0 + "\")",
      "Action.modifyMultiplicity(\"" + jsInput + "\",\"" + selectedText + "\",\"" + endInfo[0] + "\",\"" + isEnd + "\")",
      "Action.modifyRoleName(\"" + jsInput + "\",\"" + selectedText + "\",\"" + endInfo[1] + "\",\"" + startInfo[0] + "\",\"" + 1 + "\")",
      "Action.deleteAssociation(\"" + jsInput + "\",\"" + selectedText + "\")"

  ];

  menu.style.zIndex = "1000";
  menu.style.border = "1px solid #ccc";
  menu.style.backgroundColor = "#f8f8f8";
  menu.style.padding = "5px";
  menu.style.position = "fixed";
  //add rows
  for (var i = 0; i < rowContent.length; i++) {
      var row = document.createElement("div");
      row.style.padding = "5px";
      row.style.borderRadius = "3px";
      row.style.cursor = "pointer";
      row.style.transition = "background-color 0.3s";
      row.textContent = rowContent[i];
      row.setAttribute('onclick', "javascript:" + rowFuncs[i]);
      // Highlight row on hover
      row.addEventListener("mouseover", function() {
          this.style.backgroundColor = "#ddd";
      });
      row.addEventListener("mouseout", function() {
          this.style.backgroundColor = "transparent";
      });

      //add row to context menu
      menu.appendChild(row);

  }

  //set menu location at mouse, while ensuring it is on screen
  var menuRect = menu.getBoundingClientRect();
  if (event.clientX + menuRect.width > window.innerWidth) {
      menu.style.right = (window.innerWidth - event.clientX) + "px";
  } else {
      menu.style.left = event.clientX + "px";
  }
  if (event.clientY + menuRect.height > window.innerHeight) {
      menu.style.bottom = (window.innerHieght - event.clientY) + "px";
  } else {
      menu.style.top = event.clientY + "px";
  }
  // Add a listener to hide the menu when the user clicks outside of it
  document.addEventListener('keydown', function hideMenu(e) {
    var prompt = document.getElementById("promptBox");
      if (e.target != menu && !menu.contains(e.target)&&e.key === "Escape") {
          if (prompt != null && e.target != prompt && !prompt.contains(e.target)) {

              document.removeEventListener('keydown', hideMenu);
              Action.removeContextMenu();

          } else {
              document.removeEventListener('keydown', hideMenu);
              Action.removeContextMenu();
          }
      }
  });
  document.addEventListener('mousedown', function hideMenu(e) {
      var prompt = document.getElementById("promptBox");
      if (e.target != menu && !menu.contains(e.target)) {
          if (prompt != null && e.target != prompt && !prompt.contains(e.target)) {

              document.removeEventListener('mousedown', hideMenu);
              Action.removeContextMenu();

          } else {
              document.removeEventListener('mousedown', hideMenu);
              Action.removeContextMenu();
          }
      }
  });
  document.body.appendChild(menu);
};




Action.validateMultiplicity = function(multiplicity) {
  // Check if not empty
  if (!multiplicity) return false;

  // Validate '*' or a single positive integer including '0'
  if (multiplicity === "*" || multiplicity.match(/^\d+$/)) return true;

  // Validate range formats including "n..m", "0..*", "1..*", "n..*", "0..m", "1..m"
  if (multiplicity.match(/^(\d+|\*)\.\.(\d+|\*)$/)) {
    const parts = multiplicity.split('..');
    const lowerBound = parts[0];
    const upperBound = parts[1];

    // Handle '*' in either part of the range
    if (lowerBound === '*' || upperBound === '*') {
      // Validate "0..*" or "n..*" where n > 0
      if (lowerBound === '0' || lowerBound.match(/^\d+$/) && lowerBound !== '0') return true;
    } else {
      // Validate "n..m" where n <= m
      const n = parseInt(lowerBound, 10);
      const m = parseInt(upperBound, 10);

      if (n <= m) return true;
    }
  }

  // If none of the above conditions met, return false
  return false;
};

Action.modifyMultiplicity = function(classCode,selectedText, mult, isStart){
  let classyCode=classCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
  if(isStart==1){
    var isEnd=true;
    
  }
  else if(isStart==3){
    //alert("unable to change end multiplicity for associationClass");
    Page.setFeedbackMessage(" unable to change end multiplicity for associationClass ");
    return;
  }
  else{
    var isEnd=false;
    ;
  }
  var prompt = document.createElement('div');
  prompt.style.zIndex = "1000";
  prompt.style.border = "1px solid #ccc";
  prompt.style.backgroundColor = "#f8f8f8";
  prompt.style.padding = "5px";
  prompt.style.position = "absolute";
  prompt.style.left = '50%';
  prompt.style.top = '50%';
  prompt.style.transform = 'translate(-50%, -50%)';
  prompt.id = "promptBox";
 
  var input = document.createElement('input');
  input.type = 'text';
  input.value = mult; // Pre-fill with the current attribute name
  input.style.padding = '5px';
  input.style.margin = '5px';
  input.style.width = '200px';
 
  var submitButton = document.createElement('button');
  submitButton.textContent = 'Change';
  submitButton.style.padding = '5px';
  submitButton.style.marginLeft = '5px';

  var inputErrorMsg = document.createElement('label');
  inputErrorMsg.type='label';
  inputErrorMsg.style.color = "red";
  inputErrorMsg.textContent = "Please enter a valid multiplicity format (e.g., '*', '1', '0..1', '1..*', '2..5').";
 
  // Append elements to the prompt
  prompt.appendChild(input);
  prompt.appendChild(submitButton);
  
  // Add the prompt to the document body
  document.body.appendChild(prompt);
  input.focus(); // Automatically focus the input
  var hider=function hidePrompt(e) {
    if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
      document.removeEventListener("mousedown", hidePrompt);
      prompt.remove();
    }
  };
  // Add a listener to hide the prompt when the user clicks outside of it
  document.addEventListener("mousedown", hider);

   // Add ESC key listener to close the prompt
   document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      prompt.remove();
      document.removeEventListener("keydown", arguments.callee);
    }
  });

  // Event listener for the submit action
  submitButton.addEventListener('click', function() {
    if(Action.validateMultiplicity(input.value.trim())){
    var escapedOldMult = mult.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    let updatedAssociationString;
    
    if (isEnd) {
        // If it's the end multiplicity and there are two occurrences, replace the second one
        const parts = selectedText.split(new RegExp(escapedOldMult));
        if (parts.length === 3) { // Assuming exactly two occurrences
            updatedAssociationString = parts[0] + mult.trim() + parts[1] + input.value.trim() + parts[2];
        } else if (parts.length === 2) { // Assuming only one occurrence (end multiplicity)
            updatedAssociationString = parts[0] + input.value.trim() + parts[1];
        }
    } else {
        // If it's the start multiplicity, simply replace the first occurrence
        updatedAssociationString = selectedText.replace(new RegExp(escapedOldMult), input.value.trim());
    }

    let orig=Page.codeMirrorEditor6.state.doc.toString();;
    if((classyCode.includes(selectedText))==false){
      orig=orig.replace(selectedText,updatedAssociationString);
    }
    else{
    let modifiedClassCode = classyCode;
    modifiedClassCode = modifiedClassCode.replace(selectedText,updatedAssociationString);
     orig=orig.replace(classyCode,modifiedClassCode);
    }
    
    Page.setCodeMirror6Text(orig);

    // Apply updatedAssociationString to the Umple code as needed
    
     Action.removeContextMenu();
     TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
     
     prompt.remove(); // Remove the prompt after processing
     Action.selectMatchingText(updatedAssociationString);
  }
  else {
    // If the format is invalid, display a message
    input.focus(); // Re-focus on the input to allow the user to correct it
    prompt.appendChild(inputErrorMsg);
      }
  });

  // Add Enter key listener to trigger the change
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission behavior
      e.stopPropagation();
      submitButton.click();
    }
  });
 };


Action.modifyRoleName = function(classCode,selectedText, roleName,mult,isStart){
  let classyCode=classCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
  if(isStart==1){
    var isEnd=true;
    
  }
  else{
    var isEnd=false;
    ;
  }
  var prompt = document.createElement('div');
  prompt.style.zIndex = "1000";
  prompt.style.border = "1px solid #ccc";
  prompt.style.backgroundColor = "#f8f8f8";
  prompt.style.padding = "5px";
  prompt.style.position = "absolute";
  prompt.style.left = '50%';
  prompt.style.top = '50%';
  prompt.style.transform = 'translate(-50%, -50%)';
  prompt.id = "promptBox";
 
  var input = document.createElement('input');
  input.type = 'text';
  input.value = roleName; // Pre-fill with the current attribute name
  input.style.padding = '5px';
  input.style.margin = '5px';
  input.style.width = '200px';
 
  var submitButton = document.createElement('button');
  submitButton.textContent = 'Change';
  submitButton.style.padding = '5px';
  submitButton.style.marginLeft = '5px';

  var inputErrorMsg = document.createElement('label');
  inputErrorMsg.type='label';
  inputErrorMsg.style.color = "red";
  inputErrorMsg.textContent = "To add a role name at this end there must be a role name at the other end first";
 
  // Append elements to the prompt
  prompt.appendChild(input);
  prompt.appendChild(submitButton);
 
  // Add the prompt to the document body
  document.body.appendChild(prompt);
  input.focus(); // Automatically focus the input
  var hider=function hidePrompt(e) {
    if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
      document.removeEventListener("mousedown", hidePrompt);
      prompt.remove();
    }
  };
  // Add a listener to hide the prompt when the user clicks outside of it
  document.addEventListener("mousedown", hider);
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      prompt.remove();
      document.removeEventListener("keydown", arguments.callee);
    }
  });
  // Event listener for the submit action
  submitButton.addEventListener('click', function() {
    var newRoleName = input.value.trim();
    if(roleName==""){
      var connectionPattern = /(\s*<-\s*|\s*><\s*|\s*--\s*|\s*->\s*|\s*<@>-\s*|\s*-\s*<@>\s*)/;
    var parts = selectedText.split(connectionPattern);
    var startPart = parts[0].trim(); // "1 parent"
    var updatedStartPart, updatedEndPart;
    var updatedAssociationString;
    if(parts.length>2){
      var endPart = parts[2].trim(); // "* FunctionalArea child;"
      if (isEnd) {
        if((endPart.includes("sorted"))){
          var endParts2 = endPart.split("sorted");
          var endParts = endPart.split(";");
          updatedEndPart = endParts2[0].trim()+" "+newRoleName+""+"sorted"+endParts2[1];
        }
        else{
        var endParts = endPart.split(";");
          updatedEndPart = endParts[0].trim()+" "+newRoleName+";";
        }
      } else {
        if((classyCode.includes(selectedText))==false){
          updatedStartPart = startPart.trim()+" "+newRoleName;
        }
        else{
          updatedStartPart = mult.trim()+" "+newRoleName;
        }
        if((startPart.includes("sorted"))){
          var startParts = startPart.split("sorted");

          updatedStartPart = mult.trim()+" "+newRoleName+""+"sorted"+startParts[1];
        }
      }
      updatedAssociationString = isEnd ? (startPart + parts[1] + updatedEndPart) : (updatedStartPart + parts[1] + endPart);
    }
    else{
      let parts2 = selectedText.split(";");
      parts=parts2[0].split(" ");
      if (isEnd==false) {
        updatedStartPart = mult.trim()+" "+newRoleName;
        if(parts.length>2){
          updatedAssociationString = updatedStartPart+" "+parts[1].trim()+" "+parts[2].trim()+";";
        }
        else{
          input.focus();
          prompt.appendChild(inputErrorMsg);
          return;
        }
      } else {
        endParts = selectedText.split(";");
        updatedAssociationString = endParts[0].trim()+" "+newRoleName+";";
      }
    }
    }
    else{
      updatedAssociationString = selectedText.replace(roleName, newRoleName);
    }
    
    let orig=Page.codeMirrorEditor6.state.doc.toString();

    if((classyCode.includes(selectedText))==false){
      orig=orig.replace(selectedText,updatedAssociationString);
    }
    else{
    let modifiedClassCode = classyCode;
    modifiedClassCode = modifiedClassCode.replace(selectedText,updatedAssociationString);
     orig=orig.replace(classyCode,modifiedClassCode);
    }
    
    Page.setCodeMirror6Text(orig);

    // Apply updatedAssociationString to the Umple code as needed
    Action.removeContextMenu();
    TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
    prompt.remove(); // Remove the prompt after processing
    Action.selectMatchingText(updatedAssociationString);
  });
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission behavior
      e.stopPropagation();
      submitButton.click();
    }
  });
 };

   
 Action.deleteAssociation = function(classCode, selectedText) {
  let orig = Page.codeMirrorEditor6.state.doc.toString();

  let classyCode = classCode.replaceAll("&#10", "\n").replaceAll("&#$quot", "\"");
  if ((classyCode.includes(selectedText)) == false) {
      orig = orig.replace(selectedText, "");
  } else {
      let modifiedClassCode = classyCode;
      modifiedClassCode = modifiedClassCode.replace(selectedText, "");

      orig = orig.replace(classyCode, modifiedClassCode);
  }

  Page.setCodeMirror6Text(orig);
  Action.removeContextMenu();
  TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
}

Action.displayAttributeMenu = function(event, attributeName, attributeType) {
  if(!Action.diagramInSync){
    return;
  }
  // Remove old menu, if any
  Action.removeContextMenu();
  var elemText=event.target;
  attributeName = attributeName.trim();
  //iterate up to top of class table
  while(elemText.parentElement.id!="graph0"){
    elemText=elemText.parentNode;
  }
  //unstable - grabs class name
  elemText=elemText.outerHTML.substr(elemText.outerHTML.indexOf("&nbsp;"),elemText.outerHTML.indexOf("</text>")-elemText.outerHTML.indexOf("&nbsp;")).replaceAll("&nbsp;","").trim();
  
  var orig=Page.codeMirrorEditor6.state.doc.toString();
  var chosenClass=Action.splitStates(orig);
  for(let i=0;i<chosenClass.length;i++){
    if(chosenClass[i].startsWith("class "+elemText+"{")||chosenClass[i].startsWith("class "+elemText+" ")||chosenClass[i].startsWith("class "+elemText+"\n")){
      chosenClass=chosenClass[i];
    }
  }
  if(typeof chosenClass != 'string'){
    return;
  }
  
  // Create context menu for attribute
  var menu = document.createElement('customContextMenu');
  var menuHeader = document.createElement('div');
  menuHeader.textContent = "Attribute: " + attributeName + "Type: " + attributeType;
  menuHeader.style.padding = "5px";
  menuHeader.style.borderBottom = "1px solid #ccc";
  menuHeader.style.fontWeight = "bold";
  menu.appendChild(menuHeader);
  var rowContent = ["Rename Attribute", "Change Type", "Delete Attribute"];
  var jsInput=chosenClass.replaceAll("\n","&#10").replaceAll("\"","&#$quot");;
  var rowFuncs = [
    "Action.renameAttribute(\""+jsInput+"\",\""+elemText+"\",\""+attributeName+"\",\""+attributeType+"\")",
    "Action.changeAttributeType(\""+jsInput+"\",\""+elemText+"\",\""+attributeName+"\",\""+attributeType+"\")",
    "Action.deleteAttribute(\""+jsInput+"\",\""+elemText+"\",\""+attributeName+"\",\""+attributeType+"\")"
  ];


  // Set common styles for the menu
  menu.style.zIndex = "1000";
  menu.style.border = "1px solid #ccc";
  menu.style.backgroundColor = "#f8f8f8";
  menu.style.padding = "5px";
  menu.style.position = "fixed";
  
  // Add rows for each action in the context menu
  for (var i = 0; i < rowContent.length; i++) {
    var row = document.createElement("div");
    row.style.padding = "5px";
    row.style.borderRadius = "3px";
    row.style.cursor = "pointer";
    row.style.transition = "background-color 0.3s";
    row.textContent = rowContent[i];
    row.setAttribute('onclick', "javascript:" + rowFuncs[i]);
    
    // Event listeners for visual feedback on hover
    row.addEventListener("mouseover", function() {
      this.style.backgroundColor = "#ddd";
    });
    row.addEventListener("mouseout", function() {
      this.style.backgroundColor = "transparent";
    });
    
    menu.appendChild(row); // Add row to context menu
  }

  // Position the menu at the mouse location while ensuring it is on screen
  var menuRect = menu.getBoundingClientRect();
  if (event.clientX + menuRect.width > window.innerWidth) {
    menu.style.right = (window.innerWidth - event.clientX) + "px";
  } else {
    menu.style.left = event.clientX + "px";
  }
  if (event.clientY + menuRect.height > window.innerHeight) {
    menu.style.bottom = (window.innerHeight - event.clientY) + "px";
  } else {
    menu.style.top = event.clientY + "px";
  }
  document.addEventListener('keydown', function hideMenu(e) {
    var prompt = document.getElementById("promptBox");
      if (e.target != menu && !menu.contains(e.target)&&e.key === "Escape") {
          if (prompt != null && e.target != prompt && !prompt.contains(e.target)) {

              document.removeEventListener('keydown', hideMenu);
              Action.removeContextMenu();

          } else {
              document.removeEventListener('keydown', hideMenu);
              Action.removeContextMenu();
          }
      }
  });
  // Add an event listener to hide the menu when the user clicks outside of it
  document.addEventListener('mousedown', function hideMenu(e) {
    if (e.target != menu && !menu.contains(e.target)) {
      document.removeEventListener('mousedown', hideMenu);
      Action.removeContextMenu();
    }
  });

  document.body.appendChild(menu); // Add the menu to the page
};

Action.renameAttribute = function(classCode, className, attributeName, attributeType) {
 // Create the input prompt for renaming an attribute
 var prompt = document.createElement('div');
 prompt.style.zIndex = "1000";
 prompt.style.border = "1px solid #ccc";
 prompt.style.backgroundColor = "#f8f8f8";
 prompt.style.padding = "5px";
 prompt.style.position = "absolute";
 prompt.style.left = '50%';
 prompt.style.top = '50%';
 prompt.style.transform = 'translate(-50%, -50%)';
 prompt.id = "promptBox";

 var input = document.createElement('input');
 input.type = 'text';
 input.value = attributeName; // Pre-fill with the current attribute name
 input.style.padding = '5px';
 input.style.margin = '5px';
 input.style.width = '200px';

 var submitButton = document.createElement('button');
 submitButton.textContent = 'Rename';
 submitButton.style.padding = '5px';
 submitButton.style.marginLeft = '5px';

 // Append elements to the prompt
 prompt.appendChild(input);
 prompt.appendChild(submitButton);

 // Add the prompt to the document body
 document.body.appendChild(prompt);
 input.focus(); // Automatically focus the input
 var hider=function hidePrompt(e) {
  if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
    document.removeEventListener("mousedown", hidePrompt);
    prompt.remove();
  }
};
document.addEventListener("mousedown", hider);
 // Event listener for the submit action
 submitButton.addEventListener('click', function() {
  if(Action.validateAttributeName(input.value.trim())){
    let classyCode=classCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
    let hasType = classyCode.includes(attributeName + " :");
    let attrRegexWithType = new RegExp("\\b" + attributeName + "\\s*:\\s*\\w+\\s*;\\n?", "g");
    let attrRegexWithoutType = new RegExp("\\b" + attributeName + "\\s*;\\n?", "g");
    let newAttributeDeclaration = hasType ?
      attributeType + " " + input.value.trim()+";\n" :
      input.value.trim()+";\n";
    let modifiedClassCode = classyCode;
    modifiedClassCode = modifiedClassCode.replace(attrRegexWithType, newAttributeDeclaration);
    modifiedClassCode = modifiedClassCode.replace(attrRegexWithoutType, newAttributeDeclaration);
    let globalAttrRegex = new RegExp("\\b" + attributeName + "\\b", "g");
    modifiedClassCode = modifiedClassCode.replace(globalAttrRegex, input.value.trim());

    let orig = Page.codeMirrorEditor6.state.doc.toString();

    orig=orig.replace(classyCode,modifiedClassCode);
    Page.codeMirrorEditor6.dispatch({ changes: { from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: orig } });

    Action.removeContextMenu();
    TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
    document.removeEventListener("mousedown", hider);
    prompt.remove(); // Remove the prompt after processing
    }
 });
};

Action.changeAttributeType = function(classCode, className, attributeName, currentType) {
  var prompt = document.createElement('div');
  prompt.style.zIndex = "1000";
  prompt.style.border = "1px solid #ccc";
  prompt.style.backgroundColor = "#f8f8f8";
  prompt.style.padding = "5px";
  prompt.style.position = "absolute";
  prompt.style.left = '50%';
  prompt.style.top = '50%';
  prompt.style.transform = 'translate(-50%, -50%)';
  prompt.id = "promptBox";

  var select = document.createElement("select");
  // Add options to the select
  ["String", "Integer", "Double", "Float", "Boolean", "Date", "Time"].forEach(function(type) {
    var option = document.createElement("option");
    option.value = type;
    option.text = type;
    if (type === currentType) { // Mark the current type as selected
      option.selected = true;
    }
    select.appendChild(option);
  });

  var submitButton = document.createElement('button');
  submitButton.textContent = 'Change Type';
  submitButton.style.padding = '5px';
  submitButton.style.margin = '5px';
  prompt.appendChild(select);
  prompt.appendChild(submitButton);

  document.body.appendChild(prompt);
  select.focus(); // Automatically focus the select dropdown
  var hider=function hidePrompt(e) {
    if (document.contains(prompt) && e.target != prompt && !prompt.contains(e.target)) {
      document.removeEventListener("mousedown", hidePrompt);
      prompt.remove();
    }
  };
  document.addEventListener("mousedown", hider);
  // Event listener for the submit button action
    submitButton.addEventListener('click', function() {
      var selectedType = select.options[select.selectedIndex].value;

      if (selectedType !== currentType) { // Proceed only if the type has been changed
        let classyCode=classCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
        let modifiedClassCode = classyCode;
        if(currentType !="String"){
          let attrRegexWithType = new RegExp("\\b" + currentType + "\\s" + attributeName,"g");
          modifiedClassCode = modifiedClassCode.replace(attrRegexWithType,  selectedType+" "+attributeName);
        }
        else{
          
          let attrRegexWithType = new RegExp("\\b" + currentType + "\\s" + attributeName, "g");
          let attrRegexWithoutType = new RegExp("\\b" + attributeName  , "g");
          modifiedClassCode = modifiedClassCode.replace(attrRegexWithType,  selectedType+" "+attributeName);
          modifiedClassCode = modifiedClassCode.replace(attrRegexWithoutType,  selectedType+" "+attributeName);
        }
        
        let orig=Page.codeMirrorEditor6.state.doc.toString();
        orig=orig.replace(classyCode,modifiedClassCode);
        // Update the editor with the new code

        Page.codeMirrorEditor6.dispatch({ changes: { from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: orig } });

        Action.removeContextMenu();
        TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
        document.removeEventListener("mousedown", hider);
        prompt.remove(); // Remove the prompt after processing

      }
      else{
        document.removeEventListener("mousedown", hider);
        prompt.remove();
      }
      })
    };


Action.deleteAttribute = function(classCode, className, attributeName, attributeType) {
  // Decode HTML entities in the classCode to work with actual line breaks and quotes
  let classyCode=classCode.replaceAll("&#10","\n").replaceAll("&#$quot","\"");
  let attrRegexWithType = new RegExp("\\b" + attributeType + "\\s" + attributeName + "\\s*;", "g");
  let attrRegexWithoutType = new RegExp("\\b" + attributeName + "\\s*;\\n?", "g");
  // Use the regex to replace the attribute line with an empty string
  let modifiedClassCode = classyCode;
  modifiedClassCode = modifiedClassCode.replace(attrRegexWithType, "");
  modifiedClassCode = modifiedClassCode.replace(attrRegexWithoutType, "");
  
  let orig = Page.codeMirrorEditor6.state.doc.toString();
  
  orig = orig.replace(classyCode,modifiedClassCode);
  
  // Update the editor with the new code
  Page.codeMirrorEditor6.dispatch({ changes: { from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: orig } });

  Action.removeContextMenu();
  TabControl.getCurrentHistory().save(Page.getUmpleCode(), "menuUpdate");
};




Action.classSelected = function(obj)
{
  var previouslySelected = Page.selectedClass;
  var newClassSelected = obj;
  
  if (previouslySelected != null)
  {
    Page.selectedClass = null;
    
    // Change background color to white
    jQuery("#"+previouslySelected.id).css('background-color','white');
    
    // Hide anchors on previous class
    var selector = "#" + previouslySelected.id + "_anchor";
    for (var i=0; i<8; i++) jQuery(selector + i).hide();
  }
 
  if (newClassSelected != null)
  {
    jQuery("#umpleCanvas").addClass("unscrollable");
    Page.selectedClass = UmpleSystem.find(newClassSelected.id);
    
    // Change background color to blue
    jQuery("#"+newClassSelected.id).css('background-color', '#F3F6FB');
    
    // Show anchors on new class and remove the hovers
    var selector = "#" + newClassSelected.id + "_anchor";
    var hover = "#" + newClassSelected.id + "_hover";
    for (var i=0; i<8; i++)
    {
      jQuery(selector + i).show();
      jQuery(hover + i).hide();
    }
  }
  else
  {
    jQuery("#umpleCanvas").removeClass("unscrollable");
  }
}

Action.classHover = function(event,isHovering)
{
  var updateClass = event.currentTarget;
  if (!Action.diagramInSync) return;
  if (Page.selectedClass != null && Page.selectedClass.id == updateClass.id) return;
  
  var displayType = isHovering ? "block" : "none";
  var umpleClass = jQuery("#" + updateClass.id);
  
  // change the background color
  if (isHovering) umpleClass.css("background-color", "#F3F6FB");
  else umpleClass.css("background-color", "white");
  
  // show or hide the hovers (if they are enabled)
  if (Page.canShowHovers())
  {
    var numHovers = 8;
    var hoverSelector = "#" + updateClass.id + "_hover";
    for (var i=0; i<numHovers; i++)
    {
      if (isHovering) jQuery(hoverSelector + i).show();
      else jQuery(hoverSelector + i).hide();  
    }
  }
}

Action.unselectAll = function()
{
  Action.classSelected(null);
  Action.associationSelected(null);
  Action.generalizationSelected(null);
  Action.transitionSelected(null);
}

Action.classClicked = function(event)
{
  // DEBUG F
  if (!Action.diagramInSync) return;
  Action.focusOn("umpleCanvas", true);
  Action.focusOn("umpleModelEditorText", false);

  Action.unselectAll();
  Action.elementClicked = true;
  var obj = event.currentTarget;

  Action.selectClass(obj.id);
  
  if (Page.selectedItem == "DeleteEntity")
  {
    DiagramEdit.classDeleted(obj.id);
  }
  else if (Page.selectedItem == "AddAssociation")
  {
    if (DiagramEdit.newAssociation == null)
    {
      Action.canCreateByDrag = false;
      DiagramEdit.createAssociationPartOne(event);
    }
    else
    {
      DiagramEdit.createAssociationPartTwo(event);
      setTimeout(function(){ Action.canCreateByDrag = true; }, 500);
    }
  }
  else if (Page.selectedItem == "AddGeneralization")
  {
    if (DiagramEdit.newGeneralization == null)
    {
      var successful = DiagramEdit.createGeneralizationPartOne(event);
      if (successful) Action.canCreateByDrag = false;
    }
    else
    {
      DiagramEdit.createGeneralizationPartTwo(event);
      setTimeout(function(){ Action.canCreateByDrag = true; }, 500);
    }
  }
  
  else
  {
    Action.classSelected(obj);
  }
}

/*
  Called whenever a state or nested state is clicked in a state diagram
  Internally calls Action.selectStateInClassCM6() if single-level state is clicked in diagram
  or
  calls Action.selectStateInStateCM6() if nested-state is clicked in  diagram
  Highlights the corresponding code for diagram part clicked, in the code editor

  Parameters: identifier - complete name of target that was clicked in state machine diagram (See example below)
              Single State -> CourseSection^*^status^*^Open
                              CourseSection - Class name
                              status - state-machine name
                              open - state name
              Nested State -> CourseSection^*^status^*^Open.NotEnoughStudents
                              CourseSection - class name
                              status - state-machine name
                              Open.NotEnoughStudents - nested state
*/
Action.stateClicked = function(identifier)
{
    if (!Action.diagramInSync) return;
    Action.focusOn("umpleCanvas", true);
    Action.focusOn("umpleModelEditorText", false);
    var idSplit=identifier.split("^*^");
    var identifierClass=idSplit[0]
    var identifierSM=idSplit[1]
    var identifierState=idSplit[2].replace("Entry:","").replace("Exit:","");
    identifierState=identifierState.replace("Exit:","");
    Action.unselectAll();
    Action.elementClicked = true;
    var selectionIndicies=null;
    var selectionIndiciesCM6=null;
    if(identifierState.includes('.')){ //nested case

      if (clientDebuggerFlag){
        console.log("stateClicked - nested state case");
      }
      
      identifierState=identifierState.split('.');
      selectionIndiciesCM6=Action.selectStateInClassCM6(identifierClass,identifierSM,identifierState[0]);
      for(let i=1;i<identifierState.length;i++){

        if (clientDebuggerFlag){
          console.log("Iterating states within Identified state ...");
        }

        selectionIndiciesCM6=Action.selectStateInStateCM6(selectionIndiciesCM6.startIndex,selectionIndiciesCM6.endIndex,identifierState[i]);
      }
    } else { //base case

      if (clientDebuggerFlag){
        console.log("stateClicked - else - base case");
      }

      selectionIndiciesCM6 = Action.selectStateInClassCM6(identifierClass,identifierSM,identifierState);

      if (clientDebuggerFlag){
        console.log("selectionIndiciesCM6: ", selectionIndiciesCM6);
      }

    }

    Action.highlightByIndexCM6(selectionIndiciesCM6.startIndex, selectionIndiciesCM6.endIndex);



   if (Page.selectedItem == "AddTransition")
    {
        if (DiagramEdit.newTransition == null)
        {
            Action.canCreateByDrag = false;
            DiagramEdit.createTransitionPartOne(event);
        }
        else
        {
            DiagramEdit.createTransitionPartTwo(event);
            setTimeout(function(){ Action.canCreateByDrag = true; }, 500);
        }
    }
    else
    {
        //Action.stateSelected(identifier);
    }
}

Action.associationClicked = function(event)
{
  if (!Action.diagramInSync) return;
  Action.elementClicked = true;
  Action.unselectAll();
  
  var obj = event.currentTarget;
  Action.associationSelected(obj);
}

/*
  Called when a transition is clicked in the state digram
  Internally calls Action.selectStateInClassCM6() and Action.selectStateInStateCM6() 
  to locate selected class, start and end states in the code present in code editor
  and highlights the target transition between the start and end states

  Parameters: identifier - complete name of target that was clicked in state machine diagram (See example below)
              CourseSection*^*status*^*openRegistration*^*Planned*^*Open.NotEnoughStudents*^*
              CourseSection - class name
              status - state-machine name
              openRegistration - transition name
              Planned - start state
              Open.NotEnoughStudents - end state
*/
Action.transitionClicked = function(identifier)
{
  if(!Action.diagramInSync) return;
  if(typeof identifier === "string" && identifier === null) return;
  Action.elementClicked = true;
  Action.unselectAll();
  let id = identifier.split("*^*");
  let identifierState=id[3].split(".");
  
  dest=id[4];
  var selection = Action.selectStateInClassCM6(id[0],id[1],identifierState[0]);
  dest=id[4].split(".");

  for (var i=1;i<identifierState.length;i++){
    selection=Action.selectStateInStateCM6(selection.startIndex,selection.endIndex,identifierState[i]);
  }
  let searchTerm=id[2].replaceAll("+","\\+").replaceAll("-","\\-").replaceAll("*","\\*").replaceAll("?","\\?").replaceAll("|","\\|"); //preceed any accidental quantifiers with escape character
  searchTerm=searchTerm.replace("after","after~`~?:Every`~`?"); //subpar solution, could be improved
  if(id[5]!=""){

    let guardStr=id[5].trim().replaceAll("+","\\+").replaceAll("-","\\-").replaceAll("*","\\*").replaceAll("?","\\?").replaceAll("|","\\|"); //preceed any accidental quantifiers with escape character
    searchTerm=searchTerm+"\\s*[\\s*"+guardStr.trim().slice(1,guardStr.trim().length-1)+"\\s*]";

  }
  searchTerm=searchTerm.replaceAll("]","\\]").replaceAll("[","\\[").replaceAll(")","\\)?").replaceAll("(","\\(?").replaceAll("~`~","(").replaceAll("`~`",")").replaceAll(" ","\\s*").replaceAll(",","\\s*,\\s*").replaceAll("!","\\s*!\\s*").replaceAll("/","\\s*/\\s*"); 
  searchTerm=searchTerm.replaceAll("&&","&{1,2}");
  let pattern= new RegExp(searchTerm+".*->","s");

  let startIndex=Page.codeMirrorEditor6.state.doc.toString().substr(selection.startIndex,selection.endIndex-selection.startIndex).search(pattern)+selection.startIndex;
  let cText = Page.codeMirrorEditor6.state.doc.toString().substr(startIndex);
  let line = Action.findEOL(cText);
  let endIndex=startIndex+line.length;
  Action.highlightByIndexCM6(startIndex,endIndex);

// DEBUG THE FOLLOWING MAY NEED CHANGING FOR CM6  
  if(!(line.split("->").length - 1 === 1) ){
    Page.setFeedbackMessage("Please edit this complex transition in the textual code.");
  }
  
  Action.highlightByIndexCM6(startIndex,endIndex);
}
Action.generalizationClicked = function(event)
{
  if (!Action.diagramInSync) return;
  Action.elementClicked = true;
  Action.unselectAll();
    
  var obj = event.currentTarget;
  Action.generalizationSelected(obj);
}

Action.associationHover = function(event,isHovering)
{
  if (!Action.diagramInSync) return;
  var updateAssociation = event.currentTarget;
  var umpleAssociation = UmpleSystem.findAssociation(updateAssociation.id);
  
  if (updateAssociation != null && Page.canShowHovers())
  {
    var hoverCount = 2;
    var selector = "#" + updateAssociation.id + "_hover";
    
    for (var i=0; i<hoverCount; i++)
    {
      if (isHovering) jQuery(selector+i).show();
      else jQuery(selector+i).hide();
    }
  }
}

Action.transitionHover = function(event,isHovering)
{
    if (!Action.diagramInSync) return;
    var updateTransition = event.currentTarget;
    var umpleTransition = UmpleSystem.findTransition(updateTransition.id);

    if (updateAssociation != null && Page.canShowHovers())
    {
        var hoverCount = 2;
        var selector = "#" + updateAssociation.id + "_hover";

        for (var i=0; i<hoverCount; i++)
        {
            if (isHovering) jQuery(selector+i).show();
            else jQuery(selector+i).hide();
        }
    }
}


Action.generalizationHover = function(event,isHovering)
{
  if (!Action.diagramInSync) return;
  var updateGeneralization = event.currentTarget;
  
  if (updateGeneralization != null && Page.canShowHovers())
  {
    var selector = "#" + updateGeneralization.id + "_hover";
    for (var i=0; i<3; i++)
    {
      if (isHovering) jQuery(selector+i).show();
      else jQuery(selector+i).hide();
    }
  }
}

Action.associationSelected = function(obj)
{
  var isSelected = (obj == null) ? false : true;
  var updateObj = null;
  
  if (Page.selectedItem == "DeleteEntity" && obj != null)
  {
    var addToQueue = false;
    DiagramEdit.associationDeleted(obj.id, addToQueue);
    return;
  }  
  
  if (obj != null)
  {
    Page.selectedAssociation = obj;
    updateObj = obj;
  }
  else if (Page.selectedAssociation != null)
  {
    updateObj = Page.selectedAssociation;
    Page.selectedAssociation = null;
  }
  else
  {
    return;  
  }
  
  var anchorCount = 2;
  var anchorSelector = "#" + updateObj.id + "_anchor";
  for (var i=0; i<anchorCount; i++)
  {
    if (isSelected) jQuery(anchorSelector + i).show();
    else jQuery(anchorSelector + i).hide();
  }
}

Action.transitionSelected = function(obj)
{
    var isSelected = (obj == null) ? false : true;
    var updateObj = null;

    if (Page.selectedItem == "DeleteEntity" && obj != null)
    {
        var addToQueue = false;
        DiagramEdit.transitionDeleted(obj.id, addToQueue);
        return;
    }

    if (obj != null)
    {
        Page.selectedTransition = obj;
        updateObj = obj;
    }
    else if (Page.selectedTransition != null)
    {
        updateObj = Page.selectedTransition;
        Page.selectedTransition = null;
    }
    else
    {
        return;
    }

    var anchorCount = 2;
    var anchorSelector = "#" + updateObj.id + "_anchor";
    for (var i=0; i<anchorCount; i++)
    {
        if (isSelected) jQuery(anchorSelector + i).show();
        else jQuery(anchorSelector + i).hide();
    }
}

Action.generalizationSelected = function(obj)
{
  var isSelected = (obj == null) ? false : true;
  var updateObj = null;
  
  if (Page.selectedItem == "DeleteEntity" && obj != null)
  {
    var addToQueue = false;
    DiagramEdit.generalizationDeleted(obj.id, addToQueue);
    return;
  }  
  
  if (obj != null)
  {
    Page.selectedGeneralization = obj;
    updateObj = obj;
  }
  else if (Page.selectedGeneralization != null)
  {
    updateObj = Page.selectedGeneralization;
    Page.selectedGeneralization = null;
  }
  else
  {
    return;  
  }

  var anchorCount = 3;
  var anchorSelector = "#" + updateObj.id + "_anchor";
  for (var i=0; i<anchorCount; i++)
  {
    if (isSelected) jQuery(anchorSelector + i).show();
    else jQuery(anchorSelector + i).hide();
  }
}

Action.executeCode = function(languageStyle, languageName)
{
  var executeCodeSelector = "#buttonExecuteCode";
  var actualLanguage = languageName;
  
  jQuery(executeCodeSelector).showLoading();
  Action.ajax(
    function(response) { 
      Action.executeCodeCallback(response); 
    },
    format("execute=true&language={0}&languageStyle={1}&model={2}", actualLanguage, languageStyle, Page.getModel()),
    "true"
  );
}

Action.generateCode = function(languageStyle, languageName)
{
  var generateCodeSelector = "#buttonGenerateCode";
  var actualLanguage = languageName;
  var additionalCallback;
  if (Page.getAdvancedMode() == 0 && (languageName === "Cpp"))
  {
    actualLanguage = "Experimental-"+languageName;
  }

  if(languageName === "StateTables")
  {
    additionalCallback = StateTree.colourStateTables;
  }

  if(languageName === "EventSequence")
  {
    additionalCallback = StateTree.colourEventSequences;
  }

  //Vahdat
  if(languageName === "stateDiagram")
  {
    actualLanguage = languageName+"."+$("inputGenerateCode").value.split(":")[1];
  }
  
  jQuery(generateCodeSelector).showLoading();
  Action.ajax(
    function(response) { 
      Action.generateCodeCallback(response, languageStyle, additionalCallback); 
    },
    format("language={0}&languageStyle={1}", actualLanguage, languageStyle),
    "true"
  );
}

Action.photoReady = function()
{
  var canvasSel = "#" + Page.umpleCanvasId();
  if (Page.isPhotoReady())
  {
    jQuery(canvasSel).addClass("photoReady");
  }
  else
  {
    jQuery(canvasSel).removeClass("photoReady");
  }
  
  UmpleSystem.redrawCanvas();
}

Action.executeCodeCallback = function(response)
{
  var executeCodeSelector = "#buttonExecuteCode";
  jQuery(executeCodeSelector).hideLoading();
  Page.showExecutionArea();
  Page.hideGeneratedCodeOnly();
  Page.showExecutedResponse(response.responseText);
  window.location.href='#codeExecutionArea';
}

Action.generateCodeCallback = function(response, language, optionalCallback)
{
  Page.showGeneratedCode(response.responseText,language);
  Page.hideExecutionArea();
  Action.gentime = new Date().getTime();

  if(optionalCallback !== undefined)
  {
    optionalCallback();
  }

  var generateCodeSelector = "#buttonGenerateCode";
  jQuery(generateCodeSelector).hideLoading();
  Page.showCodeDone();
  window.location.href='#genArea';
}

Action.classMouseDown = function(event)
{
  if (!Action.canCreateByDrag) return;
  
  if (Page.selectedItem == "AddAssociation" && DiagramEdit.newAssociation == null)
  {
    DiagramEdit.createAssociationPartOne(event);
  }
  else if (Page.selectedItem == "AddGeneralization" && DiagramEdit.newGeneralization == null)
  {
    DiagramEdit.createGeneralizationPartOne(event);
  }
  else if (Page.selectedItem == "AddTransition" && DiagramEdit.newTransition == null)
  {
      DiagramEdit.createTransitionPartOne(event);
  }
}

Action.classMouseUp = function(event)
{
  if (!Action.canCreateByDrag) return;
  
  if (Page.selectedItem == "AddAssociation" && DiagramEdit.newAssociation != null)
  {
    DiagramEdit.createAssociationPartTwo(event);
  }
  else if (Page.selectedItem == "AddGeneralization" && DiagramEdit.newGeneralization != null)
  {
    DiagramEdit.createGeneralizationPartTwo(event);
  }
  else if (Page.selectedItem == "AddTransition" && DiagramEdit.newTransition != null){
    DiagramEdit.createTransitionPartTwo(event);
  }
}

Action.mouseMove = function(event)
{
  Page.clickCount = 0;
  
  if (Page.selectedItem == "AddClass")
  {
    if (DiagramEdit.newClass == null)
    {
      DiagramEdit.newClass = new UmpleClass();
      DiagramEdit.newClass.name = "";
      DiagramEdit.newClass.id = "tempClass";
    }
    Action.drawClassOutline(event, DiagramEdit.newClass);
  }
  
  if (DiagramEdit.newAssociation != null && Page.selectedItem == "AddAssociation")
  {
    Action.drawAssociationLine(event, DiagramEdit.newAssociation);
  }
  if (DiagramEdit.newTransition != null && Page.selectedItem == "AddTransition")
  {
    Action.drawTransitionLine(event, Diagramedit.newTransition);
  }
  if (DiagramEdit.newGeneralization != null && Page.selectedItem == "AddGeneralization")
  {
    Action.drawGeneralizationLine(event, DiagramEdit.newGeneralization);
  }
}

Action.drawClassOutline = function(event, newClass)
{
  var canvasSelector = "#" + Page.umpleCanvasId();
  var screenPosition = new UmplePosition(event.pageX, event.pageY + 1,0,0);
  var mousePosition = screenPosition.subtract(UmpleSystem.position());
  
  newClass.position = new UmplePosition(mousePosition.x, mousePosition.y, UmpleClassFactory.defaultSize.width, UmpleClassFactory.defaultSize.height);
  var classOutline = newClass.drawableClassOutline();
  jQuery(canvasSelector).append(classOutline);
  
  var classSel = "#" + newClass.id;
  var widthSel = classSel + "_width";
  var heightSel = classSel + "_height";
  
  var offset = new Object();
  offset.left = screenPosition.x;
  offset.top = screenPosition.y;
  
  jQuery(classSel).offset(offset);
  jQuery(widthSel).width(newClass.position.width);
  jQuery(heightSel).height(newClass.position.height);
}

Action.drawAssociationLine = function(event, newAssociation)
{
  var canvasSelector = "#" + Page.umpleCanvasId();
  var mousePosition = new UmplePosition(event.pageX, event.pageY,0,0);
  newAssociation.classTwoPosition = mousePosition.subtract(UmpleSystem.position());
  jQuery(canvasSelector).append(newAssociation.drawable());
}

Action.drawTransitionLine = function(event, newTransition)
{
    var canvasSelector = "#" + Page.umpleCanvasId();
    var mousePosition = new UmplePosition(event.pageX, event.pageY,0,0);
    newTransition.toStatePosition = mousePosition.subtract(UmpleSystem.position());
    jQuery(canvasSelector).append(newTransition.drawable());
}


Action.drawGeneralizationLine = function(event, newGeneralization)
{
  var canvasSelector = "#" + Page.umpleCanvasId();
  var generalizationSelector = "#" + newGeneralization.getElementId();
  
  var umpleSystem = UmpleSystem.position();
  var parentX = event.pageX - 5 - umpleSystem.x;
  var parentY = event.pageY + 5 - umpleSystem.y; 
  newGeneralization.parentPosition = new UmplePosition(parentX,parentY,0,0);
  
  jQuery(generalizationSelector).remove();
  jQuery(canvasSelector).append(newGeneralization.drawable(false));
}

Action.umpleCanvasClicked = function(event)
{
  if (Action.elementClicked)
  {
    Action.elementClicked = false;
    return;
  }
  
  if (Page.selectedItem == "AddClass")
  {
    var position = new UmplePosition(Math.floor(event.pageX),Math.floor(event.pageY),0,0);
    DiagramEdit.addClass(position);
  }
  else if (Page.selectedItem == "AddAssociation" && DiagramEdit.newAssociation != null)
  {
    if (Page.clickCount > 1)
    {
      DiagramEdit.removeNewAssociation();
    }
  }
  else if (Page.selectedItem == "AddTransition" && DiagramEdit.newTransition != null)
  {
    if (Page.clickCount >1)
    {
      DiagramEdit.removeNewTransition();
    }
  }

  else if (Page.selectedItem == "AddGeneralization" && DiagramEdit.newGeneralization != null)
  {
    if (Page.clickCount > 1)
    {
    	DiagramEdit.removeNewGeneralization();
    }
  }
  else
  {
    Action.unselectAll();
  }
}

// Called when a change is made by a command that modifies the text, to refresh it
// and then refresh the diagram.
Action.directUpdateCommandCallback = function(response)
{
  Action.updateUmpleTextCallback(response);
  Action.redrawDiagram();
}

// Called whenever any change is made on the graphic pane
// such as adding/deleting/moving/renaming class/assoc/generalization
Action.updateUmpleTextCallback = function(response)
{
  // DEBUG
  // console.log("Inside updateUmpleTextCallback: ")
  if (!justUpdatetoSaveLater && !justUpdatetoSaveLaterForTextCallback){
    TabControl.getCurrentHistory().save(response.responseText, "TextCallback");
    Page.setExampleMessage("");
  }
  Action.freshLoad = true;
  
  Page.setUmpleCode(response.responseText, Action.update.codeChange);
  
  Page.hideLoading();

  if (DiagramEdit.textChangeQueue.length == 0) 
  {
    Action.freshLoad = false;
    DiagramEdit.pendingChanges = false;
    Action.setjustUpdatetoSaveLater(false);
    Action.setjustUpdatetoSaveLaterForTextCallback(false);
  }
  else{
    Action.setjustUpdatetoSaveLater(true);
    Action.setjustUpdatetoSaveLaterForTextCallback(true);
    DiagramEdit.doTextUpdate();
  }
  
  //Uncomment for testing purposes only - to update the image after updating the text
}

Action.setExampleType = function setExampleType()
{
  // Hide them all first
  jQuery("#itemLoadExamples").hide();
  jQuery("#itemLoadExamples2").hide();
  jQuery("#itemLoadExamples3").hide();
  jQuery("#itemLoadExamples4").hide();
  jQuery("#itemLoadExamples5").hide();
  jQuery("#itemLoadExamples6").hide();
  jQuery("#itemLoadExamples7").hide();
  jQuery("#itemLoadExamples8").hide();

     
  if(Page.getExampleType() == "cdModels") {
     jQuery("#itemLoadExamples").show();
     jQuery("#defaultExampleOption").prop("selected",true);
   }
   else if(Page.getExampleType() == "smModels") {
     jQuery("#itemLoadExamples2").show();
     jQuery("#defaultExampleOption2").prop("selected",true);
   }
   else if(Page.getExampleType() == "featureModels") {
     jQuery("#itemLoadExamples4").show();
     jQuery("#defaultExampleOption4").prop("selected",true);
   }
   else if(Page.getExampleType() == "extra1ModelsAD") {
     jQuery("#itemLoadExamples5").show();
     jQuery("#defaultExampleOption5").prop("selected",true);
   }
   else if(Page.getExampleType() == "extra1ModelsEL") {
     jQuery("#itemLoadExamples6").show();
     jQuery("#defaultExampleOption6").prop("selected",true);
   }
   else if(Page.getExampleType() == "extra1ModelsMP") {
     jQuery("#itemLoadExamples7").show();
     jQuery("#defaultExampleOption7").prop("selected",true);
   }
   else if(Page.getExampleType() == "extra1ModelsQZ") {
     jQuery("#itemLoadExamples8").show();
     jQuery("#defaultExampleOption8").prop("selected",true);
   }
   else {
     jQuery("#itemLoadExamples3").show();
     jQuery("#defaultExampleOption3").prop("selected",true);
   }   
}

Action.loadExample = function loadExample()
{
  var diagramType = this.dataset['diagramType'];
  var $option = jQuery(' option:selected', this);
  if ($option.hasClass('openUmprOption')) {
    // user wants to open the umpr repository
    location.href = "http://umple.org/umpr?diagram-type=" + diagramType;
    return;
  }

  UmpleSystem.merge(null);
  Page.showCanvasLoading(true);
  Page.showModelLoading(true);
  Page.showLayoutLoading(true);
  Ajax.sendRequest("scripts/compiler.php",Action.loadExampleCallback,"exampleCode=" + Page.getSelectedExample());
  var exampleName = Page.getSelectedExample().slice(0,-4);
  var diagramType="";
  if(Page.useGvStateDiagram) {
    diagramType="&diagramtype=state";
  }
 else if(Page.useGvFeatureDiagram) {
    diagramType="&diagramtype=GvFeature";
  }
  else if(Page.useStructureDiagram) {
    diagramType="&diagramtype=structure&generateDefault=cpp";
  }
  else {
    //jQuery("#genjava").prop("selected",true);
  }
  
  var largerSelector = "#buttonLarger";
  var smallerSelector = "#buttonSmaller";
  var canvasSelector = "#" + Page.umpleCanvasId();
  
  umpleCanvasWidth = jQuery(canvasSelector).width();
  umpleCanvasHeight = jQuery(canvasSelector).height();
  
  var sel = Page.getSelectedExample();
  
  if (exampleName.startsWith("https")) {
    var shortExampleName=exampleName.split("/").pop();
    var newURL="?filename="+exampleName.substr(8)+".ump"+diagramType;
  }
  else
  {
    var shortExampleName=exampleName;
    var newURL="?example="+shortExampleName+diagramType;
  }
  
  Page.setExampleMessage("<a href=\""+newURL+"\">URL for "+shortExampleName+" example</a>");

  // TODO - fix so history works nicely           
  jQuery("#inputExample").blur();
}

Action.loadExampleCallback = function(response)
{
  Action.freshLoad = true;
  Action.setjustUpdatetoSaveLater(true);
  Page.setUmpleCode(response.responseText, function(){
    Page.hideLoading();
    Action.updateUmpleDiagram()}
  );
  Action.setCaretPosition("0");
  Action.updateLineNumberDisplay();
  TabControl.getCurrentHistory().save(response.responseText, "loadExampleCallback");
}

Action.customSizeTyped = function()
{
  if (Action.oldTimeout != null)
  {
    clearTimeout(Action.oldTimeout);
  }
  
  var width = jQuery("#widthField").val();
  var height = jQuery("#heightField").val();
  
  Action.oldTimeout = setTimeout(function(){ Page.setUmpleCanvasSize(width, height); }, Action.waiting_time);
}

Action.moveSelectedClass = function(umpleClass, delta)
{
  if (umpleClass == null) return;
  
  umpleClass.position = umpleClass.position.add(delta);
  UmpleSystem.updateClass(umpleClass);
  Action.classSelected(umpleClass);
  
  if (Action.oldTimeout != null)
  {
    clearTimeout(Action.oldTimeout);
  }
  Action.oldTimeout = setTimeout(function() {DiagramEdit.classMoved(Page.selectedClass);}, 1000); 
}

Action.keyboardShortcut = function(event)
{
    
  if (!Page.shortcutsEnabled)
  {
    return;
  }
  
  var shortcut = event.which;

  if (shortcut == 27)    // escape
  {
    var shortcutDisabled = Page.unselectAllToggleTools();

    if(!shortcutDisabled)
    {
      jQuery(".visibleFocus").blur();
    }
  }
  else if ((shortcut == 8 || shortcut == 46) && jQuery('#umpleCanvasColumn').hasClass('focus'))
  {
    if(Page.selectedClass && jQuery('#' + Page.selectedClass.id).find("input").length == 0)
    {
      DiagramEdit.classDeleted(Page.selectedClass.id);
      event.preventDefault();	  
    }
    else if(Page.selectedAssociation)
    {
      DiagramEdit.associationDeleted(Page.selectedAssociation.id);
      event.preventDefault();	  
    }
    else if(Page.selectedGeneralization)
    {
      DiagramEdit.generalizationDeleted(Page.selectedGeneralization.id);
      event.preventDefault();
    }
  }
  else if ((shortcut == 8 || shortcut == 46) && jQuery(".umpleClass").is(":focus")){
  	DiagramEdit.classDeleted(document.activeElement.id);
  	event.preventDefault();
  }
  else if ((shortcut == 8 || shortcut == 46) && (jQuery(".untracedAssociation").is(":focus")||jQuery(".redTracedAssociation").is(":focus"))){
  	DiagramEdit.associationDeleted(document.activeElement.id);
  	event.preventDefault();
  }
  else if ((shortcut == 8 || shortcut == 46) && jQuery(".umpleGeneralization").is(":focus")){
  	DiagramEdit.generalizationDeleted(document.activeElement.id);
  	event.preventDefault();
  }
}


Action.getCaretPosition = function() // TIM Returns the line number
{
  return Page.codeMirrorEditor6.state.doc.lineAt(Page.codeMirrorEditor6.state.selection.main.head).number;
}

// we no longer need this for codemirror 6
// // The following from http://stackoverflow.com/questions/263743/how-to-get-cursor-position-in-textarea/3373056#3373056
Action.getInputSelectionStart = function(el) 
{
  var start = 0, normalizedValue, range, textInputRange, len, endRange;

  if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") 
  {
    start = el.selectionStart;
    // The following for debugging
    if (Page.getAdvancedMode() == 2) 
    { // debug
      Page.setFeedbackMessage("Non-IE browser ");
    }
  }
  else 
  { // IE Support
    // The following for debugging
    if (Page.getAdvancedMode() == 2) // debug
    { 
      Page.setFeedbackMessage("IE-type browser ");
    }
    range = document.selection.createRange();
    
    if (range && range.parentElement() == el) {
      len = el.value.length;
      normalizedValue = el.value.replace(/\r\n/g, "\n");
    
      // Create a working TextRange that lives only in the input
      textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());
    
      // Check if the start and end of the selection are at the very end
      // of the input, since moveStart/moveEnd doesn't return what we want
      // in those cases
      endRange = el.createTextRange();
      endRange.collapse(false);
    
      if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) 
      {
        start = len;
      } 
      else 
      {
        start = -textInputRange.moveStart("character", -len);
        start += normalizedValue.slice(0, start).split("\n").length - 1;
      }
    }
  }

  return start;
}


Action.setCaretPosition = function(line)
{
  if(isNaN(line-0)) 
  {
    // It is not a number so must be a special hidden command
    if(line=="gd") 
    {
      jQuery('#gdprtext').show();
      Action.gdprHidden = false;      
    }
    if(line=="av") 
    {
      // Special backdoor to turn on experimental features
      document.getElementById('advancedMode').value=1;


      Page.setFeedbackMessage("");
      return;
    }
    if(line=="db") 
    { // turn on debugging and do certain debugging options
      document.getElementById('advancedMode').value=2;
      Page.setFeedbackMessage("Debug Mode");
      return;
    }


      if(line.substr(0,4)=="clws") 
        {
          if (line.substr(4,1)=="+") 
          {
            Page.setFeedbackMessage("Collaboration logging Enabled");
            Collab.websocketLogging(0);
          }
          else if (line.substr(4,1)=="-")
          {
            Page.setFeedbackMessage("Collaboration logging disabled");
            Collab.websocketLogging(-1);
          }
          else if (line.substr(4,2)=="tq") 
            {
              Page.setFeedbackMessage("Ten seconds to timeout the client");
              Collab.clientSetTimeout(10);
            }
            else if (line.substr(4,2)=="tn")
            {
              Page.setFeedbackMessage("Turn the timeout back to normal");
              Collab.clientSetTimeout(-1);
            }
            else if (line.substr(4,2)=="tx")
            {
                Page.setFeedbackMessage("Disabled the timeout");
                Collab.clientSetTimeout(0);
            }
          return;    
        } 


    if(line=="sp")
    { // creates Survey Pass; modifies conditions to allow for survey to be displayed:
      // includes setting RandomizedFrequency to 1, MinutesBeforePrompt to 5 secs, EditsBeforePrompt to 1;
      if (existSCookie("surveyCookie")==null && window.localStorage.getItem("surveyShown")==null){
        if (document.getElementById("styleTip")!=null)
          document.getElementById("styleTip").innerHTML="";
        window.randomSurveyRoll = 1;
        window.surveyData.EditsBeforePrompt=1;
        timeSurveyUp = false;
        clearTimeout(timeSurvey);
        timeSurvey = setTimeout(function(){timeSurveyUp = true;}, 10000);
        timeSurvey;
        displayedText=false;
        if (!displayedText){
          beforeInstance = TabControl.getCurrentHistory().currentIndex;
          document.addEventListener("mouseover", function(){
            if (TabControl.getCurrentHistory().currentIndex-beforeInstance >= 1 && !displayedText && timeSurveyUp){
                displaySurvey();
                this.removeEventListener('mouseover', arguments.callee);
            }                        
          });
        }
      }
      
    }
    if (line=="sc")
    { // clears all survey cookies including whether URL has been shown already, whether the user has been skipped, and whether Survey Pass has been activated
      // run twice for it to be effective
      let setToExpire=new Date();
      setToExpire.setTime(setToExpire.getTime()-1000);
      document.cookie="surveyCookie=done; expires="+setToExpire.toUTCString()+"; path=/;";
      window.localStorage.removeItem("surveyShown");
      document.addEventListener("mouseover", function(){});
      setCookieBeforeClose("off");
    }
    if(line=="tc")
    { // resets cookies for tips
      Page.setFeedbackMessage("Clearing tip cookies");
      let currentTime=new Date();
      currentTime.setTime(currentTime.getTime()-1000);
      window.localStorage.removeItem("first_time");
      document.cookie="tipCookie=done; expires="+currentTime.toUTCString()+"; path=/;";
    }
    if(line.substr(0,2)=="cm") 
    {
      if(line.substr(2,1)=="0" && Page.codeMirrorOn) 
      {
        Page.setFeedbackMessage("Turning code mirroring off");
        Page.codeMirrorEditor.toTextArea();
        Page.codeMirrorOn=false;
        jQuery("#linenum").val("0");
      }
      else if(line.substr(2,1)=="1" && !Page.codeMirrorOn) 
      {
        Page.initCodeMirrorEditor();
        jQuery("#linenum").val("0");
      }
      return;
    }

    if(line.substr(0,2)=="bp") {  // Begin prompt - Also invoked by ctrl-b
      Action.promptAndExecuteTest();
      return;
    }
    else
    {
      if(!Action.selectMatchingText(line)) 
      {
        Page.setFeedbackMessage("Line number or word \""+line+"\" not located");
        setTimeout(function() {if(true) {Page.setFeedbackMessage("");}},3000);
      }
      return;
    }
  }
  if(Page.codeMirrorOn) 
  {
   Page.codeMirrorEditor6.focus();
    
    // DEBUG
    /* codemirror 6 line highlight by number*/
    if(line >= 1) {
      line = Math.min(line, Page.codeMirrorEditor6.state.doc.lines);
      const docPosition = Page.codeMirrorEditor6.state.doc.line(line).from;
      Page.codeMirrorEditor6.dispatch({
        selection: { anchor: docPosition },
        scrollIntoView: true
      })
    }
 
    return;
  }
  var ctrl = document.getElementById('umpleModelEditorText');
  var startPos=0;
  var endPos=-1;

  if(line<1)
  {
    endPos=0;
  }
  else
  {
    var theCode=Page.getRawUmpleCodeCM6();

    for(var ch=0; ch<theCode.length; ch++)
    {
      if(theCode.charAt(ch)=='\n')
      {
        line--;
        if(line==1) startPos=ch+1;
        if(line==0) {
          endPos=ch; 
          break;
        }
      }
    }
    if(endPos==-1) { // got to end
      endPos=theCode.length;
      if(line!=1) startPos=endPos;
    }
  }

  if(ctrl.setSelectionRange)
  {
    ctrl.focus();
    ctrl.setSelectionRange(startPos,endPos);
  }
  else if (ctrl.createTextRange) {
    var range = ctrl.createTextRange();
    range.collapse(true);
    range.moveEnd('character', endPos);
    range.moveStart('character', startPos);
    range.select();
  }
}

// This pops up a panel that can be used to execute certain specialized test commands
// This should be expanded to allow other commands
Action.promptAndExecuteTest = function() {

  // Get the arguments if any (separated by spaces)
  var testCommand=prompt("Umpleonline test prompt. Enter command e.g. 'ac Classname' to add a class","");

  var edargs=testCommand.substr(2,99).strip().split(" "); 
  if(testCommand.substr(0,1)=="a") {
    // add something
    if(testCommand.substr(1,1)=="c") {
      // add class - one argument
      if(edargs.length >=1) {
        Action.directAddClass(edargs[0]);
        return;
      }
    }
    else if (testCommand.substr(1,1)=="a") {
      // add attribute to class - two arguments
      if(edargs.length >=2) {
        Action.directAddAttribute(edargs[0],edargs[1]);
        return;
      }
    }
    else {
      Page.setFeedbackMessage("Syntax error in test add command");
    }
    Page.setFeedbackMessage("Syntax error in test command");
  }
  else {

  }
  return;
}

// Processes the filter
// If an integer treated as hops
// Then could be suboptions
// Second could be mixsets to turn on
// Otherwise treated as class filter patterns
Action.setFilter = function(newFilter)
{
  // Reset first
  Page.filterWordsOutput = "";
  
  var filterWordsInput=newFilter.split(" ");

  filterWordsInput.forEach(function(foundFilterWord) {
    var actualFilterWord = foundFilterWord;
    if(foundFilterWord.startsWith("gvseparator=")) {
      // transform any dot decimal so it does not get split in transfer
      actualFilterWord=foundFilterWord.replace(".","@@@");
    }
    
    Page.filterWordsOutput+=(actualFilterWord+"!@");

  });

  Action.redrawDiagram();
}

// Adds a class with the given name. The class may already be there. Just edits the text.
// This could be modified to 
Action.directAddClass = function(className) {

  var umpleJson = Json.toString({"position" : {"x" : "10","y" : "10","width" : "109","height" : "41"},"name" : className});

  Page.setFeedbackMessage("Adding class "+className);
  Action.setjustUpdatetoSaveLater(false);
  Action.ajax(Action.directUpdateCommandCallback,format("action=addClass&actionCode={0}",umpleJson));

  return;
}

// Adds an attribute to a class
Action.directAddAttribute = function(classname, attribute) {
  // This has to be written.
  // It should look for a matching class, and then look for the attributes in it, then
  // inject the new attribute after it. This assumes no type. That could be added by changing
  // this to have three arguments (if the third one was missing there would be no type, hence
  // string as default.
  // If there is no matching class, this should output a message 
  
  Page.setFeedbackMessage("((when written) Adding to class "+classname+" attribute "+attribute);  
  return;
}


Action.selectMatchingText = function(text) 
{
  // Does nothing if CodeMirror is off
  if (Page.codeMirrorOn) {
    const scursor = new cm6.SearchCursor(Page.codeMirrorEditor6.state.doc, text)
    
    if (!scursor.next()) {
      return false;
    }
      Page.codeMirrorEditor6.dispatch({
        selection: { anchor: scursor.value.from, head: scursor.value.to }
      });
          return true;

  }
  return false;
}


/*
  Called by Action.selectClass() or Action.selectMethod() or Action.selectState()
  Returns an object containing start and end indices of item (class or method or state)
  based on the searchCursor parameter
  Parameters: searchCursor - a regular expression object created in either of Caller methods 
                              with target class name or method name or state name
*/
Action.selectItemCM6 = function(searchCursor){
  // console.log("Debug F4: Inside selectItemCM6")
  if(Page.codeMirrorOn) {
    var text = Page.codeMirrorEditor6.state.doc.toString();
    let splitBuffer=Action.splitStates(text);
    let currClass=null;
    for(let i=0;i<splitBuffer.length;i++){
      if(splitBuffer[i].search(searchCursor)==0){
        currClass=splitBuffer[i];
        break;
      }
    }
    let startIndex = 0;
    let endIndex = 0;
    try{
      startIndex=text.indexOf(currClass);
      endIndex=startIndex+currClass.length;
      
    } catch(err){  
      console.log("Please wait a little more for diagram updates, and try again.") ;

    }

    var outputObj={startIndex: startIndex,endIndex: endIndex};
    return outputObj;
  }
}


// Highlights the text of the method that is currently selected.
Action.selectMethod = function(methodName, type, accessMod)
{
	var scursor = new RegExp(accessMod+" "+type+" "+methodName+"(\\\s|[(])");
	var ncursor = new RegExp("(public|protected|private|class) [A-Za-z]");

  var selectionIndiciesCM6 = Action.selectItemCM6(scursor);
  Action.highlightByIndexCM6(selectionIndiciesCM6.startIndex, selectionIndiciesCM6.endIndex) ;
}


Action.selectAssociation = function(associationDetails) {
  var detailsArray = associationDetails.split(',');
  var className = detailsArray[0];
  var searchCursor = new RegExp("(associationClass|class|interface|trait) " + className + "($|\\\s|[{])");
  var nextCursor = new RegExp("(class|interface|trait) [A-Za-z]");
  if (Page.codeMirrorOn) {

   var selectionIndiciesCM6 = Action.selectItemCM6(searchCursor);
   var selectedText = Page.codeMirrorEditor6.state.sliceDoc(selectionIndiciesCM6.startIndex,selectionIndiciesCM6.endIndex) ;//get the class code for where the association belong
  }
  
  var start, end;
  //for labelAssociation
  if (detailsArray.length > 3) {
      if (detailsArray[2].trim().includes(' ')) {
          // When there's a space, indicating the presence of a role name or additional details
          var array = detailsArray[2].split(' ');
          start = detailsArray[3].trim(); //.replace(/[\*+?.()|[\]\\{}^$]/g, "\\$&"); // Assuming the start multiplicity is always in the 4th segment
          if (array.length == 2) {
              // When there's more than just the multiplicity and class name, indicating a role name is present
              end = array[0].trim() + ' ' + detailsArray[1].trim() + ' ' + array[1].trim();
          } else {
              end = array[0].trim() + ' ' + detailsArray[1].trim();
          }
      } else {
          // When there's no space, meaning no role name is present
          start = detailsArray[3].trim(); //.replace(/[\*+?.()|[\]\\{}^$]/g, "\\$&");
          end = detailsArray[2].trim() + ' ' + detailsArray[1].trim();
      }


      var startEscaped = start.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var endEscaped = end.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var patternString = startEscaped + "(?:\\s+sorted\\s+{.*?})?" + "(\\s*<-\\s*|\\s*><\\s*|\\s*--\\s*|\\s*->\\s*|\\s*<@>\\-\\s*|\\s*-\\<@>\\s*)" + endEscaped + "(?:\\s+sorted\\s+{.*?})?" + "\\s*;";

      var pattern = new RegExp(patternString, "g");
      var code = Page.codeMirrorEditor6.state.doc.toString();
      //Finding matches using the constructed pattern
      var matches = selectedText.match(pattern);
      if (matches) {
          
          startIndex = code.indexOf(selectedText) + selectedText.indexOf(matches[0]);
          endIndex = startIndex + matches[0].length;
          
          Action.highlightByIndexCM6(startIndex, endIndex);

          return { startIndex: startIndex, endIndex: endIndex };
      } else {
          if (endEscaped.startsWith("1")) { // this for simple writing association
              end = endEscaped.substring(2).trim();
              endEscaped = end.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              patternString = startEscaped + "\\s+" + endEscaped+ "\\s*;";
              pattern = new RegExp(patternString, "g");
              matches = selectedText.match(pattern);
              if (matches == null) {
                  patternString = startEscaped + "\\s+.*?" + endEscaped+ "\\s*;";
                  pattern = new RegExp(patternString, "g");
                  matches = selectedText.match(pattern);
              }

              try {
              startIndex = code.indexOf(selectedText) + selectedText.indexOf(matches[0]);
              endIndex = startIndex + matches[0].length;
                
              } catch (error) {
                console.log("Please wait a little more for diagram updates, and try again.") ;     
              }

              Action.highlightByIndexCM6(startIndex, endIndex);
              return { startIndex: startIndex, endIndex: endIndex };
          } else {
              if (startEscaped.trim().includes(' ')) {
                  var newstart = startEscaped.split(' ');
                  startEscaped = newstart[0].trim() + " " + className + " " + newstart[1].trim();
              } else {
                  startEscaped += " " + className;
              }
              
              patternString = startEscaped + "(\\s*<-\\s*|\\s*><\\s*|\\s*--\\s*|\\s*->\\s*|\\s*<@>\\-\\s*|\\s*-\\<@>\\s*)" + endEscaped+ "\\s*;";

              pattern = new RegExp(patternString, "g");
              matches = code.match(pattern);
              if (matches == null) {
                  patternString = startEscaped + "\\s+.*?" + endEscaped+ "\\s*;";
                  pattern = new RegExp(patternString, "g");
                  matches = code.match(pattern);
              }
              
              try {
                
                    startIndex = code.indexOf(matches[0]);
                    endIndex = startIndex + matches[0].length;
                
              } catch (error) {
                console.log("Please wait a little more for diagram updates, and try again.") ;
              }
              Action.highlightByIndexCM6(startIndex, endIndex); 
              return { startIndex: startIndex, endIndex: endIndex };

          }
      }

  } else { //for two label association

      var array = detailsArray[2].split(' ');
      start = array[0].trim();
      end = array[1].trim();

      var startEscaped = start.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var endEscaped = end.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var patternString = startEscaped + ".*?" + endEscaped+ "\\s*;";
      var pattern = new RegExp(patternString, "g");
      var code = Page.codeMirrorEditor6.state.doc.toString();
      //Finding matches using the constructed pattern
      var matches = selectedText.match(pattern);
      if (matches) {
          startIndex = code.indexOf(selectedText) + selectedText.indexOf(matches[0]);
          endIndex = startIndex + matches[0].length;
          Action.highlightByIndexCM6(startIndex, endIndex);
          return { startIndex: startIndex, endIndex: endIndex };
      }

  }
}

// Highlights the text of the class that is currently selected.
Action.selectClass = function(className) 
{
	var scursor = new RegExp("(associationClass|class|interface|trait) "+className+"($|\\\s|[{])");
	var ncursor = new RegExp("(class|interface|trait) [A-Za-z]");

  var selectionIndiciesCM6 = Action.selectItemCM6(scursor);
  Action.highlightByIndexCM6(selectionIndiciesCM6.startIndex, selectionIndiciesCM6.endIndex);
}

// Highlights the text of the state that is currently selected.
Action.selectState = function(stateName)
{
    var scursor = new RegExp("(class|interface|trait) "+stateName+"($|\\\s|[{])");
    var ncursor = new RegExp("(class|interface|trait) [A-Za-z]");

  var selectionIndiciesCM6 = Action.selectItemCM6(scursor);
  Action.highlightByIndexCM6(selectionIndiciesCM6.startIndex, selectionIndiciesCM6.endIndex);
}

Action.splitStates=function(inputStr){
  let output=[];
  let temp="";
  let depth=0;
  let inComment=false;
  let EOLflag=false;
  for(var inChar in inputStr){
    let curChar=inputStr.charAt(inChar);
    if(EOLflag&&curChar!='\n'&&curChar!=" "){
      EOLflag=false;
      if(curChar!='{'){
        temp="";
      }
    }
    if(curChar=='/'&&inputStr.charAt((parseInt(inChar)+1))=='/'){
      inComment=true;
    }
    if(curChar=='\n'&&inComment){
         inComment=false;
    }

    if(curChar=='{'&&!inComment){ //increase depth
      temp=temp+curChar;
      depth++;
    }else if(curChar=='}'&&!inComment){ //decrease depth
      temp=temp+curChar;
      depth--;
      if(depth==0){
        output.push(temp.trim());
        temp="";
      }
    } else if(curChar=='\n'&&depth==0){ //flush temp at EOL when depth=0
      EOLflag=true;
      temp=temp+"\n";
    } else if(curChar==' '&&depth==0&&temp==""){//ignore empty spaces when depth=0
    }else { //push char to temp variable
        temp=temp+curChar;
    }

  }
  return output;
}
Action.indexToPos = function(index,inputText){
  var ch=0;
  var outputLine=0;
  var temp="";
  for(var i=0;i<index;i++){
    let curChar=inputText.charAt(i);
        if(curChar=="\n"){
      outputLine++;
      temp="";
    } else {
      temp=temp+curChar;
    }
  }
  ch=temp.length;
  output={line:outputLine,ch:ch};
  return  output;
}

/*
  Returns the start and ending position of state inside a state machine in a specific class
  Parameters: stateName - state that has to be searched
              smName - state machine inside which state has to be searched
              className - class inside which state machine containing the state exists
*/
Action.selectStateInClassCM6 = function(className, smName, stateName) 
{
  if(Page.codeMirrorOn) {
    var text = Page.codeMirrorEditor6.state.doc.toString();
    let splitBuffer=Action.splitStates(text);
    let currClass=null;
    let pattern = new RegExp("(?:class|queued)\\s+"+className,"");
    for(let i=0;i<splitBuffer.length;i++){
      if(splitBuffer[i].search(pattern)==0){
        currClass=splitBuffer[i]; //set currClass to class code
        break;
      }
    }
    splitBuffer=Action.splitStates(currClass.substr(currClass.indexOf("{")+1)); //split class into un-nested SMs
    let currSM=null;
    for(let i=0;i<splitBuffer.length;i++){
      let query=new RegExp("(?:queued\\s*)?"+smName);
      if(splitBuffer[i].search(query)==0){
        currSM=splitBuffer[i]; //set currSM to un-nested SM code
        break;
      }
    }
    splitBuffer=Action.splitStates(currSM.substr(currSM.indexOf("{")+1));
    if (splitBuffer!=null) {
      let states = splitBuffer;
      let finState=null;
      for(let i=0;i<states.length;i++){
        if(states[i].search(stateName)==0){
          finState=states[i];
          break;
        }
      }
      let startIndex=text.indexOf(currClass);//index of class start
      let endIndex=startIndex+currClass.length;
      startIndex=text.substr(startIndex,endIndex).indexOf(currSM)+startIndex;//match[1] contains the SM definition+name
      endIndex=startIndex+currSM.length;
      startIndex=text.substr(startIndex,endIndex).indexOf(finState)+startIndex;//finds target state definition within target class and state machine
      endIndex=startIndex+finState.length;
      var outputObj={startIndex:startIndex,endIndex:startIndex+finState.length};
      return outputObj;
      
    } else {
      console.log("No matching state found with regex:"+pattern);
    }
  } else {
    console.log("No matching class and state machine found for class: "+className+" and sm "+smName);
  }
  return null; 
}

/*
  Returns the start and ending position of target state within given indices range
*/
Action.selectStateInStateCM6 = function(startIndex,endIndex,target){
  var temp = Page.codeMirrorEditor6.state.doc.toString().substr(startIndex,endIndex-startIndex);
  let states=Action.splitStates(temp.substr(temp.indexOf("{")+1));
  var stateFin=null;
  for(let i=0;i<states.length;i++){
    if(states[i].startsWith(target)){
      stateFin=states[i];
      break;
    }
  }
  let outputStart=temp.indexOf(stateFin)+startIndex;
  let outputEnd=outputStart+stateFin.length;
  let outputObj={startIndex:outputStart,endIndex:outputEnd};
  return outputObj;
}

Action.highlightByIndex = function(startIndex,endIndex){
  Page.codeMirrorEditor.setSelection(Action.indexToPos(startIndex,Page.codeMirrorEditor.getValue()),
  Action.indexToPos(endIndex,Page.codeMirrorEditor.getValue()))
}

/*
  Highlights specific code in codemirror6 editor with startIndex and endIndex
  Parameters: startIndex, endIndex
              Exact position of start and end characters of code block to be highlighted in code-editor
*/
Action.highlightByIndexCM6 = function(startIndex,endIndex){
  let startSelection = Action.indexToPos(startIndex,Page.codeMirrorEditor6.state.doc.toString());
  let startDocPosition = Page.codeMirrorEditor6.state.doc.line(startSelection.line +1).from;
  let endSelection = Action.indexToPos(endIndex,Page.codeMirrorEditor6.state.doc.toString());
  let endLine = Math.min(endSelection.line +2, Page.codeMirrorEditor6.state.doc.lines);
  let endDocPosition = Page.codeMirrorEditor6.state.doc.line(endLine).from;

  // following is for multiple selection ranges
  Page.codeMirrorEditor6.dispatch({
    selection: cm6.EditorSelection.create([
      // Reversing selection to keep the active line on the top;
      cm6.EditorSelection.range(endDocPosition,startDocPosition),
    ]),
    scrollIntoView: true
  })
}

Action.findEOL = function(inputStr){ //returns ONLY depth==0 lines as an array without letting non-EOL \n's cause line breaks
  let output="";
  let temp="";
  let depth=0;
  let EOLflag=false;
  for(var inChar in inputStr){
    let curChar=inputStr.charAt(inChar);
    if(curChar=='{'){
      depth++;
      temp=temp+curChar;
    } else if(curChar=='}'){
      depth--;
      temp=temp+curChar;
    } else if(curChar==';'&&depth==0){
      output=temp+';';
      break;
    } else {
      temp=temp+curChar;
    }

  }
  return output;
}
Action.delayedFocus = function(ms) 
{
  var ctrl=document.getElementById('umpleModelEditorText');
  setTimeout(function() {ctrl.focus();},ms);
}

Action.updateLineNumberDisplay = function()
{
  jQuery("#linenum").val(Action.getCaretPosition());
}

Action.umpleTyped = function(eventObject)
{
  // DEBUG
  if (clientDebuggerFlag){
    console.log("Inside Action.umpleTyped()...");
  }

  // This function is not called by CodeMirror
  // See umpleCodeMirrorTypingActivity if CodeMirror is on (as it normally is)
  // debug - output key code
  if (Page.getAdvancedMode() == "2") { // debug
     Page.catFeedbackMessage("["+eventObject.keyCode+"] ");
  }
  Action.updateLineNumberDisplay();

  var eventCode = eventObject.keyCode;
  
  // Ignore 33=pgup 34=pgdn 35=end 36=hom 37=lef 38=up 39=rt 40=dn
  if(eventCode>=33 && eventCode <=40) return;

  var target = eventObject.target.id;
  Action.umpleTypingActivity(target);
}

Action.umpleCodeMirrorCursorActivity = function() {
  var docPosition = Page.codeMirrorEditor6.state.selection.main.head;
  var line = Page.codeMirrorEditor6.state.doc.lineAt(docPosition);
  jQuery("#linenum").val(line.number);
}

// Called whenever any text is changed in codemirror 6
Action.umpleCodeMirrorTypingActivity = function(editorThatChanged) {
  
  // DEBUG
  if (clientDebuggerFlag){
    console.log("Inside Action.umpleCodeMirrorTypingActivity...");
  }

  if(Action.freshLoad == false) {
    // Start/restart timer to eventually process this by triggerink disk save and diagram update
    Action.umpleTypingActivity(editorThatChanged);
    if(editorThatChanged == "codeMirrorEditor") {
      Page.codeMirrorEditor.save();
    }
  }
  else {
    Action.freshLoad = false;
    Action.setjustUpdatetoSaveLaterForTextCallback(false);
  }

}

Action.trimMultipleNonPrintingAndComments = function(text) {
  text = Action.removeComments(text);
  text = text.replace(/[^\x21-\x7E]+/g, ' '); // change non-printing chars to spaces
  text= text.replace(/^\s+|\s+$/g, '');      // remove leading/trailing spaces
  return text;
}

Action.removeComments = function(str) 
{
   // From http://james.padolsey.com/javascript/javascript-comment-removal-revisted/
 
    var uid = '_' + +new Date(),
        primatives = [],
        primIndex = 0;
 
    return (
        str
        /* Remove strings */
        .replace(/(['"])(\\\1|.)+?\1/g, function(match){
            primatives[primIndex] = match;
            return (uid + '') + primIndex++;
        })
 
        /* Remove Regexes */
        .replace(/([^\/])(\/(?!\*|\/)(\\\/|.)+?\/[gim]{0,3})/g, function(match, $1, $2){
            primatives[primIndex] = $2;
            return $1 + (uid + '') + primIndex++;
        })
 
        /*
        - Remove single-line comments that contain would-be multi-line delimiters
            E.g. // Comment /* <--
        - Remove multi-line comments that contain would be single-line delimiters
            E.g. /* // <-- 
       */
        .replace(/\/\/.*?\/?\*.+?(?=\n|\r|$)|\/\*[\s\S]*?\/\/[\s\S]*?\*\//g, ' ')
 
        /*
        Remove single and multi-line comments,
        no consideration of inner-contents
       */
        .replace(/\/\/.+?(?=\n|\r|$)|\/\*[\s\S]+?\*\//g, ' ')
 
        /*
        Remove multi-line comments that have a replaced ending (string/regex)
        Greedy, so no inner strings/regexes will stop it.
       */
        .replace(RegExp('\\/\\*[\\s\\S]+' + uid + '\\d+', 'g'), ' ')
 
        /* Bring back strings & regexes */
        .replace(RegExp(uid + '(\\d+)', 'g'), function(match, n){
            return primatives[n];
        })
    );
}

// Called each time a character is typed
// Sets a timer or resets the time such that the function processTyping
// ends up being called after a 3s gap in calls to this.
Action.umpleTypingActivity = function(target) {

  if (clientDebuggerFlag){
    console.log("Inside Action.umpleTypingActivity()...");
  }

  if (Action.manualSync && Action.diagramInSync)
  {
    if (jQuery("#umpleCanvasColumn").is(":visible")) Page.enablePaletteItem("buttonSyncDiagram", true);
    Action.diagramInSync = false;
    Page.enableDiagram(false);
  }
  if (Action.oldTimeout != null)
  {
    clearTimeout(Action.oldTimeout);
  }
  if(target == "diagramEdit") Action.oldTimeout = setTimeout('Action.processTyping("' + target + '",' + false + ')', 500);
  else Action.oldTimeout = setTimeout('Action.processTyping("' + target + '",' + false + ')', Action.waiting_time);
}

// Called after a 3s delay as controlled by umpleTypingActivity when
// text has been edited in any of the editors (indicated by target)
// Target can be diagramEdit (when diagram changed), newEditor for CM6, codeMirrorEditor (will be obsolete)
Action.processTyping = function(target, manuallySynchronized, currentCursorPosition)
{

  if (clientDebuggerFlag){
    console.log("Inside Action.processTyping ...", target);
  }

  document.getElementById("newEditor").value = Page.codeMirrorEditor6.state.doc.toString();


  // Save in history after a pause in typing
  if (target != "diagramEdit") 
  {
    Action.setjustUpdatetoSaveLaterForTextCallback(true);
  }
  else{
    Action.setjustUpdatetoSaveLaterForTextCallback(false);
  }
  // Cause changed in text to be made to the diagram
  if (!Action.manualSync || manuallySynchronized)
  {
    Action.diagramInSync = true;
    if (target == "umpleModelEditorText" || target == "codeMirrorEditor" || target == "newEditor") {
      Action.updateLayoutEditorAndDiagram(target); 
      // issue#1554
      var downloadLink = document.getElementById("downloadLink");
      if (downloadLink !== null){
        downloadLink.remove();
      }
      
      Page.enablePaletteItem("buttonSyncDiagram", false);
    }
    else if(target == "diagramEdit")
    {
      Action.ajax(Action.updateFromDiagramCallback,Action.getLanguage());
    }
    //Page.enableDiagram(true);
  }

  if (target != "diagramEdit"){
    if (!justUpdatetoSaveLater){
      TabControl.getCurrentHistory().save(Page.getUmpleCode(), "processTyping");
    }
    else if (target == "umpleModelEditorText" || target == "codeMirrorEditor" || target == "newEditor") {
      Action.setjustUpdatetoSaveLater(false);
    }
    Page.setExampleMessage("");
    
  }
}

// Refactoring definitive text location
// This function stores just the core umple code, NOT the layout
Action.updateCurrentUmpleTextBeingEdited = function(codeToSave){
  // console.log("Inside Action.updateCurrentUmpleTextBeingEdited() ...")
  // Back up the data in the main editor
  Page.currentUmpleTextBeingEdited = codeToSave;
  
  // Backup save for CM5 CodeMirror 5 to be deleted 
  jQuery("#umpleModelEditorText").val(codeToSave);
  
  // Update the content in CM6 CodeMirror 6
  Page.setCodeMirror6Text(codeToSave);
};

Action.updateLayoutEditorAndDiagram = function(target)
{
  Action.ajax(Action.updateUmpleLayoutEditor,"language=Json",target);
}

Action.updateUmpleLayoutEditor = function(response)
{
  // DEBUG
  // console.log("Inside Action.updateUmpleLayoutEditor()...")
  //Extract data from response
  var codeparts = response.responseText.split('URL_SPLIT');
  var errorMessage=codeparts[0];
  var umpleJson=codeparts[1];//Remove the URL_SPLIT in umpleJson

  //If anything failed, set umpleJson to response.responseText
  if(umpleJson == null || umpleJson == undefined)
  {
	  umpleJson = response.responseText;
  }
  
  Page.showLayoutLoading();
  //TODO: for some reason in the live version this call isnt being made
  //but oddly the diagram is updated, and that is done in the callback
      
  Action.ajax(Action.updateUmpleLayoutEditorCallback,format("action=addPositioning&actionCode={0}",umpleJson));  
}

Action.updateUmpleLayoutEditorCallback = function(response)
{
  // DEBUG
  // console.log("Inside updateUmpleLayoutEditorCallback")
  var umpleCode = response.responseText;
  var positioning = Page.splitUmpleCode(umpleCode)[1];
  Page.setUmplePositioningCode(positioning);
  Page.hideLoading();
  Action.updateUmpleDiagramForce(true);
}

Action.updateUmpleDiagram = function() {
 return Action.updateUmpleDiagramForce(true)
}

Action.updateUmpleDiagramForce = function(forceUpdate)
{
  // DEBUG
  // console.log("Inside updateUmpleDiagramForce")
  var canonical = Action.trimMultipleNonPrintingAndComments(Page.getUmpleCode());
  if(!forceUpdate) {
    if(canonical == Action.savedCanonical)   
    {
      // The umple code is as we last sent to the diagram, except for comment
      // changes, spaces, tabs and newlines, so we return without doing anything
      return;
    }
  }
  Action.savedCanonical=canonical;
  Page.showCanvasLoading();
  
  Action.ajax(Action.updateUmpleDiagramCallback, Action.getLanguage());

}

// Updates all formats of Umple diagram given the response from the
// backend. This can be svg or else node for Emode.
Action.updateUmpleDiagramCallback = function(response)
{
  // Get the canvas position information, used in several places
  var theCanvas = jQuery("#umpleCanvas");
  var canvasX=Math.round(theCanvas.offset().left);
  var canvasY=Math.round(theCanvas.offset().top);

  // console.log("Debug E6.1: Inside updateUmpleDiagramCallback")
  var diagramCode = "";
  var errorMessage = "";

  diagramCode = Action.getDiagramCode(response.responseText);
  errorMessage = Action.getErrorCode(response.responseText);
  Page.hideExecutionArea();

  if(diagramCode == null || diagramCode == "" || diagramCode == "null") 
  {
    Page.enableDiagram(false);
    Action.diagramInSync = false;
    Page.setFeedbackMessage("<a href=\"\#errorClick\">See message.</a> To fix: edit model or click undo");
  }
  else
  {
    Page.enableDiagram(true);
    // reset error message
    if(!Action.diagramInSync)
    {
      Action.diagramInSync = true;
    }

    Page.setFeedbackMessage("");
    Page.hideGeneratedCode();

    // Enable dynamic checkboxes of mixsets and named filters
    // Find any phrases describing
    // named mixsets of filters not commented out
    var dynamicCheckboxItems = Page.getUmpleCode()
      .match(/(((?<!(\/\/.*))(mixset))|((?<!(\/\/.*))(filter)))\s+[a-zA-Z1-9-_]+/g);
    // Add special suboptions
    if(dynamicCheckboxItems == null) dynamicCheckboxItems = new Array();
    dynamicCheckboxItems.push("gvmanual","gvdot","gvsfdp","gvcirco","gvortho");
    
    // Clear out previous
    // TODO. May need to keep some so as to preserve selections
    var spanToInjectItem = 
      document.getElementById("ShowMFDynamicArea");
    spanToInjectItem.innerHTML = "";

    if(! (dynamicCheckboxItems == null || dynamicCheckboxItems.length == 0)) {
      var boxesToActivate = new Array();
      // Iterate through all the named filters of mixsets
      dynamicCheckboxItems.forEach(
       function(aDynamicCheckboxItem) {
        // remove spaces from the item so it can also serve
        //  as part of the ID,
        // so idPart would be something like filterF1
        var idPart = aDynamicCheckboxItem.replace(/\s/g, '');

        var htmlToAdd = "<li id=\"tt"+idPart
          +"\" class=\"layoutListItem view_opt_class\">\
                <input id=\"button"+idPart+"\" class=\"checkbox\" type=\"checkbox\"/>\
                <a id=\"label"+idPart+"\" class=\"buttonExtend\">"+aDynamicCheckboxItem+"</a>\
              </li>";
        spanToInjectItem.innerHTML += htmlToAdd;
        // Make sure it is clickable ... have to do this after completion
        // Since activation is cancelled as new items are added
        boxesToActivate.push(idPart);
      });

      // If there are any items active that are not in the new set because
      // deleted or commented out, then remove them from being active
      Page.mixsetsActive = Page.mixsetsActive.filter(function(aMixset){
        return boxesToActivate.includes("mixset"+aMixset);
      });
      Page.filtersActive = Page.filtersActive.filter(function(aFilter){
        return boxesToActivate.includes("filter"+aFilter);
      });
      Page.specialSuboptionsActive = Page.specialSuboptionsActive.filter(function(aSuboption){
        return boxesToActivate.includes(aSuboption);
      });

      // Now activate the new ones found
      boxesToActivate.forEach(
       function(aBoxToActivate) {
        Page.initHighlighter("button"+aBoxToActivate);
        // Select it if it was already selected
        var buttonSetting = false;
        if(aBoxToActivate.substr(0,6)=="mixset"
          && Page.mixsetsActive.includes(aBoxToActivate.substr(6))) {
          buttonSetting = true;
        }
        else if(aBoxToActivate.substr(0,6)=="filter"
          && Page.filtersActive.includes(aBoxToActivate.substr(6))) {
          buttonSetting = true;
        }
        else if(aBoxToActivate.substr(0,2)=="gv"
          && Page.specialSuboptionsActive.includes(aBoxToActivate)) {
          buttonSetting = true;
        }        
        jQuery("#button"+aBoxToActivate).prop('checked',buttonSetting);       
        Page.initAction("button"+aBoxToActivate);
        Page.initLabel("label"+aBoxToActivate);
        ToolTips.setATooltipBasic(ToolTips.dynamicTooltips,"tt"+aBoxToActivate,"right");
        jQuery("#tt"+aBoxToActivate).show();
      });
    }

    // Display editable class diagram
    if(Page.useEditableClassDiagram) {
      var newSystem = Json.toObject(diagramCode);
      UmpleSystem.merge(newSystem);
      UmpleSystem.update(); 

      //Apply readonly styles
      if (Page.readOnly) 
      {
        jQuery("span.editable").addClass("uneditable");
      }
    }
    else if(Page.useJointJSClassDiagram) {
      // This code is deprecated as Joint.js functionality is no longer supported

      var model = JSON.parse(diagramCode.replace( new RegExp('} { "name": "', "gi"), '}, { "name": "' ));

      var umpleCanvas = jQuery("#umpleCanvas");

      var paper = JJSdiagram.initJJSDiagram(umpleCanvas, model);

      // zooming with the mouse wheel or finger swipe
      var MouseWheelHandler = function (event){
        var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        if (event.altKey === true) {
          var paperHeight = paper.options.height;
          var paperWidth = paper.options.width;
          // scaleFactor is either 1.1 or 0.9
          var scaleFactor = 1 + (Math.abs(delta) / (delta * 10));
          paper.setDimensions(paperWidth * scaleFactor, paperHeight * scaleFactor)

          //correct paper sizing
          if( JJSdiagram.paper ) 
          JJSdiagram.paper.setDimensions(jQuery("#umpleCanvas")[0].clientWidth, jQuery("#umpleCanvas")[0].clientHeight);

        }
      };
      // using the umpleCanvas as the mouse wheel event target, as it is a stable entity
      var paperHolder = document.getElementById("umpleCanvas");

      if (paperHolder.addEventListener) {
        // IE9, Chrome, Safari, Opera
        paperHolder.addEventListener("mousewheel", MouseWheelHandler, false);
        // Firefox
        paperHolder.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
      }
      // IE 6/7/8
      else {paperHolder.attachEvent("onmousewheel", MouseWheelHandler);}

      // Simulate a click on the canvas to draw focus and enable keyboard shortcuts.
      jQuery("#jjsPaper").click(function(){ Action.focusOn(Page.umpleCanvasId(), true);});

    }
    // Display static svg diagram
    else if(Page.useGvClassDiagram || Page.useGvStateDiagram || Page.useGvFeatureDiagram )
    {
      theCanvas.html(format('{0}', diagramCode));
      theCanvas.children().first().attr("id", "svgCanvas");

      // If gv class mode is gvmanual then we need to update all the umple 
      // positioning information given the diagram locations
      if(Page.useGvClassDiagram && Page.isGvManual()) {

        // First, in case we have used a special algorithm to reformulate we first turn them all off
        // This will not have effect if the algorithm is specified in the code.
        var algoWasRemoved = Action.deactivateSpecialLayoutAlgorithmsExcept(null);

// DEBUG
// Page.catFeedbackMessage("updating class diagram layout due to gvmanual "+canvasX+" "+canvasY+" | ");

        // For each of the nodes loop through it
        var positioningCode = jQuery("#umpleLayoutEditorText").val();
        var elems=document.getElementsByClassName("node");
        var posMap = new Array();
        var minUmpleLeft = 9999999;
        var minUmpleTop = 9999999;
        var minRectLeft = 9999999;
        var minRectTop = 9999999;

        for(let i=0;i<elems.length;i++){
          var currentClassForPos = Action.getGvClassNameFromNode(elems[i]);
          var umplePosOfCurrentClass = Action.getGvPosition(positioningCode, currentClassForPos);

          if (umplePosOfCurrentClass == null) {
            // Position not found ... this is actually a bug caused
            // when updating the name of a class in the text ... needs fixing
            continue;
          }
          var theRect=Action.getRectFromSvgNode(elems[i], canvasX, canvasY);
          var rectLeft = theRect.left;
          var rectTop = theRect.top;
          // Get the centre of the rectangle as
          // the gv positions are also centre-focused
          var rectCentreX = theRect.centreX;
          var rectCentreY = theRect.centreY;
          var uLeft = umplePosOfCurrentClass.x;
          var uTop = umplePosOfCurrentClass.y;

// DEBUG
//Page.setFeedbackMessage(".."+currentClassForPos
//  +" "+umplePosOfCurrentClass.x+"/"+rectCentreX
//  +" "+umplePosOfCurrentClass.y+"/"+rectCentreY);

          posMap.push({className: currentClassForPos,
            fullUmplePosOfCurrentClass: umplePosOfCurrentClass.all,
            left: uLeft,
            umpleX: Number(umplePosOfCurrentClass.x)
              + Number(umplePosOfCurrentClass.width) / 2,
            rectCentreX: rectCentreX,
            top: uTop,
            umpleY: Number(umplePosOfCurrentClass.y)
              + Number(umplePosOfCurrentClass.height) / 2,
            rectCentreY: rectCentreY,
            associationPos1: umplePosOfCurrentClass.assoc1,
            associationPos2: umplePosOfCurrentClass.assoc2
          });
          minUmpleLeft=Math.min(minUmpleLeft,uLeft);
          minUmpleTop=Math.min(minUmpleTop,uTop);
          minRectLeft=Math.min(minRectLeft,rectLeft);
          minRectTop=Math.min(minRectTop,rectTop);
        }

        let diffX=minUmpleLeft-minRectLeft;
        let diffY=minUmpleTop-minRectTop;
// DEBUG
// Page.catFeedbackMessage("In process of updating nodes from gv diffx="+diffX+" diffy="+diffY+" ");
        // Now loop through the Map updating the Umple code if needed
        var nodesMoved = 0;
        posMap.forEach(function(thePos) {
          const changeThreshold = 10;
          var deltaX= Math.round((thePos.rectCentreX+diffX)-thePos.umpleX);
          var deltaY= Math.round((thePos.rectCentreY+diffY)-thePos.umpleY);
          if(Math.abs(deltaX) > changeThreshold || Math.abs(deltaY) > changeThreshold) {
             // Update Umple text, 
             nodesMoved++;
             Action.updateGVPositionBasic(thePos.className,deltaX,deltaY,
               positioningCode,
               thePos.fullUmplePosOfCurrentClass,
               thePos.left,
               thePos.top,
               thePos.associationPos1,
               thePos.associationPos2,
               false);
// DEBUG
// Page.catFeedbackMessage(" redrawn: "+thePos.className+" //x"+thePos.umpleX+"->"+deltaX+"/"+(thePos.rectCentreX+diffX)
//  +" y"+thePos.umpleY+"->"+deltaY+"/"+(thePos.rectCentreY+diffY));

          }
        });
//DEBUG
//Page.catFeedbackMessage(" Moved "+nodesMoved+" nodes");
        if(algoWasRemoved) {
          // We are coming back from an algo update so we need to push to history
          TabControl.getCurrentHistory().save(Page.getUmpleCode(), "moveClass");
        }
      }
      Action.setupPinch();
    }
    //Display structure diagram
    else if(Page.useStructureDiagram)
    {
      jQuery("#umpleCanvas").html('<svg id="svgCanvas"></svg>');
      eval(diagramCode);
    }   
  }

  //Show the error message
  if(errorMessage != "")
  {
    Page.showGeneratedCode(errorMessage, "diagramUpdate");
  }
  
  Page.hideLoading();
  if(Page.useGvClassDiagram){

    // If we are in gvmanual mode, then allow node movement, otherwise do not
    allowNodeMovement = true;
    if(!Page.isGvManual()) {
      allowNodeMovement = false;
    }
    var elems=document.getElementsByClassName("node");

    // Add event listener to Graphviz Class nodes for right click
    for(let i=0;i<elems.length;i++){
      let theNode = elems[i];
      theNode.addEventListener("contextmenu", function(event){
        event.preventDefault();
        Action.displayMenu(event);
      });
      // Add event listener for double click, calling the same function as right-click
      theNode.addEventListener("dblclick", function(event){
        event.preventDefault(); // Prevent the default double-click behavior
        Action.displayMenu(event); // Call the same function to display the menu
      });
      // Add event listener for mousedown to  initiate a move (drag)
      theNode.addEventListener("mousedown", function(event){
        event.preventDefault();

        // Total amount moved
        let deltaXSum=0;
        let deltaYSum=0;
        let didAMove=false;

        Page.selectedGvClass=Action.getGvClassName(event);
        Page.initialMouseDownX = event.clientX;
        Page.initialMouseDownY = event.clientY;
        let prevX = Page.initialMouseDownX;
        let prevY = Page.initialMouseDownY;
        let classRect = Action.getRectFromSvgNode(theNode, canvasX, canvasY);
        let currentTop = classRect.top;
        let currentLeft = classRect.left;        
//Debug
        Page.setFeedbackMessage("!! down!! "+Page.selectedGvClass + " X="+currentLeft +  " Y="+currentTop);

        function moveClass(moveEvent) {
          moveEvent.preventDefault();
          let currentX = moveEvent.clientX;
          let currentY = moveEvent.clientY;
          classRect = Action.getRectFromSvgNode(theNode, canvasX, canvasY);
          currentTop = classRect.top;
          currentLeft = classRect.left;

          let deltaX = currentX - prevX;
          let deltaY = currentY - prevY;
          deltaXSum+=deltaX;
          deltaYSum+=deltaY;

          if(allowNodeMovement  && (didAMove || Math.abs(deltaXSum+deltaYSum)>10)) {
            theNode.setAttribute('transform', ' translate(' + deltaXSum + ',' + deltaYSum + ')');
            didAMove=true;
          }

          prevX = currentX;
          prevY = currentY;
          if(!allowNodeMovement) {
            Page.setFeedbackMessage("To enable moving of classes in G mode, set gvmanual in the Show and Hide menu");
          }
          else {
//DebugPosition
Page.setFeedbackMessage("Moving "+Page.selectedGvClass + "to "+currentLeft+", "+currentTop+" dx="+deltaXSum+" dy="+deltaYSum);
          }
        }

        function stopMovingClass(stopEvent) {
          if(allowNodeMovement && (didAMove && (deltaXSum != 0 || deltaXSum != 0)) ) {
//DebugPosition
Page.setFeedbackMessage("!!moved!! "+Page.selectedGvClass + " dx="+deltaXSum+" dy="+deltaYSum);
            // Update the text and get thebackend to refresh
            Action.updateGvPosition(Page.selectedGvClass,deltaXSum,deltaYSum);
          }
        
          document.removeEventListener('mousemove', moveClass);
          document.removeEventListener('mouseup', stopMovingClass);
        }

        document.addEventListener('mousemove', moveClass);
        document.addEventListener('mouseup', stopMovingClass);
      });

      var attributeAnchors = elems[i].getElementsByTagName("a");
      // Start from 1 to skip the first <a> element which is for the class name
      for (let j = 1; j < attributeAnchors.length; j++) {
        let titleText = attributeAnchors[j].getAttribute("xlink:title");
        let [attributeType, attributeName] = titleText.split(' ');
        attributeAnchors[j].addEventListener("dblclick", function (event) {
          event.preventDefault();
          Action.displayAttributeMenu(event, attributeName, attributeType); // Calls the testing function
        });
        attributeAnchors[j].addEventListener("contextmenu", function (event) {
          event.preventDefault();
          event.stopPropagation();
          Action.displayAttributeMenu(event, attributeName, attributeType); // Calls the testing function
        });
      }
    }
      var associationElems = document.getElementsByClassName("edge");
    for (let i = 0; i < associationElems.length; i++) {
      var associationAnchors = associationElems[i].getElementsByTagName("a");
      for (let j = 0; j < associationAnchors.length; j++) {
        let associationLink = associationAnchors[j].getAttribute("xlink:href");
        associationAnchors[j].addEventListener("dblclick", function(event) {
            event.preventDefault(); // Prevent the default click behavior
            Action.displayAssociMenu(event,associationLink);
        });
        associationAnchors[j].addEventListener("contextmenu", function(event) {
          event.preventDefault(); // Prevent the default click behavior
          Action.displayAssociMenu(event,associationLink);
        });
      }
    }
  }

  if(Page.useGvStateDiagram){
    //add double click to display menu, issue#2081
    var elems=document.getElementsByClassName("node");
    // Add event listener to Graphviz state nodes for right click
    for(let i=0;i<elems.length;i++){
      elems[i].addEventListener("contextmenu", function(event){
        event.preventDefault();
        Action.drawStateMenu(event);
      });
      // Add event listener for double click, calling the same function as right-click
      elems[i].addEventListener("dblclick", function(event){
        event.preventDefault(); // Prevent the default double-click behavior
        Action.drawStateMenu(event); // Call the same function to display the menu
      });
    }
    elems=document.getElementsByClassName("cluster");
    // Add event listener to Graphviz clusters for right click
    for(let i=0;i<elems.length;i++){
      elems[i].addEventListener("contextmenu", function(event){
        event.preventDefault();
        Action.drawStateMenu(event);
      });
      // Add event listener for double click on clusters, calling the same function as right-click
      elems[i].addEventListener("dblclick", function(event){
        event.preventDefault(); // Prevent the default double-click behavior
        Action.drawStateMenu(event); // Call the same function to display the menu
      });
    }
    var transitionElems = document.getElementsByClassName("edge");

    for (let i = 0; i < transitionElems.length; i++) {
      transitionElems[i].addEventListener("dblclick", function(event) {
        event.preventDefault(); // Prevent the default click behavior
        Action.displayTransitionMenu(event);
    });
    transitionElems[i].addEventListener("contextmenu", function(event) {
        event.preventDefault();
        Action.displayTransitionMenu(event);
    });
    }
  }  
}

// Called when a layout algorithm is clicked, in order to unselect the others
// Can also be used to unselect all of them when gvmanual is active and
// we are in the update callback
Action.deactivateSpecialLayoutAlgorithmsExcept = function(onlyAlgoToKeep) {
  var specialAlgos = new Array();
  var didRemove = false;
  specialAlgos.push("gvdot","gvsfdp","gvcirco");

  // If the one to keep is not a special algo such as gvortho then do nothing
  if(onlyAlgoToKeep != null && (! specialAlgos.includes(onlyAlgoToKeep)) ) {
    return false;
  }
 
  // Search for any of the specialAlgos and turn off except the one to keep
  specialAlgos.forEach(function(anAlgo) {
    if(onlyAlgoToKeep == null || anAlgo != onlyAlgoToKeep) {
      jQuery("#button"+anAlgo).prop('checked',false);
      var index = Page.specialSuboptionsActive.indexOf(anAlgo);
      if(index !== -1) {
        // remove an algo that was selected
        Page.specialSuboptionsActive.splice(index,1);
        didRemove = true;
      }
    }
  });
  return didRemove;
}

Action.getRectFromSvgNode = function(node,canvasX, canvasY) {
  var svgRect = node.getBoundingClientRect();
  return {
    left: Math.round(svgRect.left-canvasX),
    top: Math.round(svgRect.top-canvasY),
    // Get the centre of the rectangle as it actually appears
    // as the gv positions are also centre-focused
    centreX: Math.round(svgRect.left-canvasX + (Math.abs(svgRect.width/2))),
    centreY: Math.round(svgRect.top-canvasY  + (Math.abs(svgRect.height/2)))
  };
}

Action.updateFromDiagramCallback = function(response)
{
  var diagramCode = "";
  var errorMessage = "";
  
  diagramCode = Action.getDiagramCode(response.responseText);
  errorMessage = Action.getErrorCode(response.responseText);
  
  if((diagramCode == null || diagramCode == "" || diagramCode == "null") && Action.diagramInSync) 
  {
    Page.enableDiagram(false);
    Action.diagramInSync = false;
    Page.setFeedbackMessage("<a href=\"\#errorClick\">See message.</a> To fix: edit model or click undo");
  }
  else
  {
    Page.enableDiagram(true);
    Action.diagramInSync = true;
  }
  
  //Show the error message
  if(errorMessage != "")
  {
    Page.showGeneratedCode(errorMessage, "diagramUpdate");
  }  
}

// Gets the code to display from the AJAX response
Action.getDiagramCode = function(responseText)
{
  var output = "";
  
  // Also want to use the same response for JointJS
  if(Page.useEditableClassDiagram || Page.useJointJSClassDiagram)
  {
    output = responseText.split('URL_SPLIT')[1];
    
    if(output == "null") output = "";
    
  }
  else if(Page.useGvClassDiagram || Page.useGvStateDiagram || Page.useGvFeatureDiagram)
  {
    // The graphviz diagrams are taken from the inner svg tag only. 
    // This allows the website to have a dynamic canvas size around the diagram
    var codeparts = responseText.split('<svg width=');
    
    //Put the start of the svg back together. 
    if(codeparts.length>1 && codeparts[1].length>100) {
      output = "<svg width="+codeparts[1];
      //remove the redundant svg closing tag
      output = output.replace(/<\/svg>$/, "");
    }
  }
  else if(Page.useStructureDiagram)
  {
    output = responseText.split("<p>URL_SPLIT")[1];
    output = output.replace(/##CANVAS_ID##/g, "svgCanvas");
    // Converts html encoded special characters to plaintext
    output = jQuery("<div/>").html(output).text();
  }
  
  return output;
}

// Gets any error code from the AJAX response
Action.getErrorCode = function(responseText)
{
  var output = "";
  if(Page.useEditableClassDiagram || Page.useStructureDiagram)
  {
    output = responseText.split('URL_SPLIT')[0];
    
    if(output == "<p>") output = "";
  }
  else if(Page.useGvClassDiagram || Page.useGvStateDiagram || Page.useGvFeatureDiagram)
  {
    var miscStuffAndErrorMessages = responseText.split('<svg width=')[0];
    var prelimparts = miscStuffAndErrorMessages.split('errorRow');
    if(prelimparts.length > 1) {
      output = miscStuffAndErrorMessages.split("</script>&nbsp;")[0];
    }
  }

  return output;
}

// This function is no longer being called as its caller has been commented out
Action.classResizing = function(event, ui)
{
  var classId = event.target.id;
  var umpleClass = UmpleSystem.find(classId);
  var classSel = "#" + classId;
  
  var newWidth = Math.round(jQuery(classSel).width());
  var newHeight = Math.round(jQuery(classSel).height());
  
  UmpleSystem.updatingSize(umpleClass,newWidth,newHeight);
}

Action.associationSnap = function(x, y, dragDivSel) 
{
  var id = jQuery(dragDivSel).prop("id");
  var elementId = id.substr(0,id.lastIndexOf("_"));
  var index = id.substr(id.lastIndexOf("_") + "anchor".length + 1);
  var association = UmpleSystem.findAssociation(elementId);
  var umpleClass = association.getClass(index);
  var perimeter = UmpleClassFactory.perimeterPosition(umpleClass,new UmplePosition(x,y,0,0),UmpleSystem.position());
  return [perimeter.x, perimeter.y];
}

Action.associationSnapClassReady = function(x,y,umpleClass)
{
  var perimeter = UmpleClassFactory.perimeterPosition(umpleClass,new UmplePosition(x,y,0,0),UmpleSystem.position());
  return [perimeter.x, perimeter.y];
}

Action.updateMovedAssociation = function(dragDivSel, association)
{
  jQuery(dragDivSel).show();
  var dragOffset = jQuery(dragDivSel).offset();
  var dragDivId = jQuery(dragDivSel).prop("id");
  jQuery(dragDivSel).hide();
  
  var left = Math.round(dragOffset.left);
  var top = Math.round(dragOffset.top);
  
  var xys = Action.associationSnap(left,top,dragDivSel);
  var screenPosition = (new UmplePosition(xys[0],xys[1],0,0));  
  
  if (dragDivId.endsWith("_anchor0"))
  {
    association.setOffsetOnePosition(screenPosition);
  }
  else
  {
    association.setOffsetTwoPosition(screenPosition);
  }
  
  UmpleSystem.redrawAssociation(association);
  Action.associationSelected(null);
}

Action.validateAttributeName = function(newAttribute)
{
  return newAttribute.length!=0  && (
     newAttribute.match(/^[_a-zA-Z0-9]+$/) ||
     newAttribute.match(/^[_a-zA-Z0-9]+[\u0020]*:[\u0020]*[_a-zA-Z0-9]+(\[\])?$/)
     );
}

Action.validateMethodName = function(newMethod)
{
  return newMethod.length!=0 &&
     newMethod.match(/^[-+#]?\s*[_a-zA-Z0-9]+\s*\(([_a-zA-Z0-9]+(\[\])?(,\s*[_a-zA-Z0-9]+(\[\])?)*)?\)(\s*:\s*[_a-zA-Z0-9]+(\[\])?)?$/);
}

Action.toggleAttributes = function()
{
  Page.showAttributes = !Page.showAttributes;
  Action.redrawDiagram();
}
  
Action.toggleMethods = function()
{
  Page.showMethods = !Page.showMethods;
  Action.redrawDiagram();
}

Action.toggleActions = function()
{
  Page.showActions = !Page.showActions;
  Action.redrawDiagram();
}

Action.toggleTransitionLabels = function()
{
  Page.showTransitionLabels = !Page.showTransitionLabels;
  Action.redrawDiagram();
}

Action.toggleGuards = function()
{
  Page.showGuards = !Page.showGuards;
  Action.redrawDiagram();
}
Action.toggleGuardLabels = function()
{
  Page.showGuardLabels = !Page.showGuardLabels;
  Action.redrawDiagram();
}
Action.allowPinch = function()
{
  Page.allowPinch = !Page.allowPinch;
  Action.redrawDiagram();
}
Action.toggleFeatureDependency = function()
{
  Page.showFeatureDependency = !Page.showFeatureDependency;
  Action.redrawDiagram();
}
Action.toggleTraits = function()
{
  Page.showTraits = !Page.showTraits;
  Action.redrawDiagram();
}


Action.redrawDiagram = function()
{
    UmpleSystem.merge(null);    // Clear the diagram
    var canvas = jQuery("#umpleCanvas");
    canvas.html("");
    if (!Action.manualSync) 
    {
      Action.updateUmpleDiagram();
      Action.diagramInSync = true;
      //Page.enableDiagram(true);
    }
    if (Action.manualSync && !Action.diagramInSync) Page.enablePaletteItem('buttonSyncDiagram', true);
    if (!Action.manualSync || Action.diagramInSync)
    {
      Page.enableCheckBoxItem("buttonPhotoReady", "ttPhotoReady", true);
      Page.enableCheckBoxItem("buttonManualSync", "ttManualSync", true);

      Page.enablePaletteItem('buttonAddClass', true);
      Page.enablePaletteItem('buttonAddAssociation', true);
      Page.enablePaletteItem('buttonAddTransition', true);
      Page.enablePaletteItem('buttonAddGeneralization', true);
      Page.enablePaletteItem('buttonDeleteEntity', true);
    
      Page.initToggleTool('buttonAddClass');
      Page.initToggleTool('buttonAddAssociation');
      Page.initToggleTool('buttonAddTransition');
      Page.initToggleTool('buttonAddGeneralization');
      Page.initToggleTool('buttonDeleteEntity');
    }
}

InlineEditor.elementChanged = function(obj, oldVal, newVal)
{
  var editType = obj.attr("name");
  var objId = obj.attr("id");

  if (editType == "className")
  {
    var id = objId.substr(0,objId.length - "_name".length);
    DiagramEdit.classNameChanged(id,oldVal,newVal);
  }
  else if (editType == "attributeEdit")
  {
    var index = objId.substr(objId.lastIndexOf("_") + 1);
    var id = objId.substr(0,objId.length - "_attribute_".length - index.length);
    DiagramEdit.attributeNameChanged(id,index,oldVal,newVal);
  }
  else if(editType == "methodEdit")
  {
    var index = objId.substr(objId.lastIndexOf("_") + 1);
    var id = objId.substr(0,objId.length - "_method_".length - index.length);
    DiagramEdit.methodChanged(id,index,oldVal,newVal);
  }
  else if (editType == "attributeNew")
  {
    var id = objId.substr(0,objId.length - "_newAttribute".length);
    DiagramEdit.attributeNew(id,newVal);
  }
  else if(editType == "methodNew")
  {
    var id = objId.substr(0,objId.length - "_newMethod".length);
    DiagramEdit.methodNew(id,newVal);
  }
}

Action.enableManualSync = function(enable)
{
  var checkbox = jQuery("#buttonManualSync");
  var syncDiagram = jQuery("#buttonSyncDiagram");
  if (enable == undefined) enable = checkbox.is(":checked");
  
  if (enable)
  {
  Action.manualSync = true;
  }
  else
  {
    Action.manualSync = false;
    Action.processTyping("umpleModelEditorText",true);
    Page.enablePaletteItem("buttonSyncDiagram", false);
  }
}

Action.generateStructureDiagramFile = function()
{
  var filename = Page.getFilename().slice(0, -9) + "structureDiagram.svg";

  var svgContents =  jQuery("#innerGeneratedCodeRow").html().slice(4, -1);

  svgContents = format('<svg xmlns="http://www.w3.org/2000/svg" {0}>', svgContents);

  jQuery("#buttonStructureLink").showLoading();

  Ajax.sendRequest("scripts/compiler.php", Action.generateStructureDiagramFileCallback, 
    format("save=1&filename={0}&svgContent={1}", filename, svgContents));
}

Action.generateStructureDiagramFileCallback = function(response)
{
  jQuery("#buttonStructureLink").hideLoading();
  Page.toggleStructureDiagramLink(true, response.responseText);
}

Action.ajax = function(callback,post,target,errors,tabIndependent)
{
  var modelAndPositioning = null;
  modelAndPositioning = Page.getUmpleCode();
  var umpleCode = encodeURIComponent(modelAndPositioning);
  var filename = Page.getFilename();
  var errors = "true";
  TabControl.useActiveTabTo(TabControl.saveTab)(umpleCode);

  var tabContextOld = TabControl.getActiveTabId();
  var wrappedCallback = !tabIndependent? function(response){
    var tabContextNew = TabControl.getActiveTabId();
    if (tabContextNew !== tabContextOld){
      Page.hideLoading();
      return;
    }
    callback(response);
  } : callback;
  Ajax.sendRequest("scripts/compiler.php",wrappedCallback,format("{0}&error={3}&umpleCode={1}&filename={2}",post,umpleCode,filename,errors));
}

//Mac Keyboard Shortcut
if (navigator.appVersion.indexOf("Mac")!=-1)
{
  jQuery(document).ready(function(){
    jQuery('#undosmall').html('[cmd+z]');
    jQuery('#redosmall').html('[cmd+shift+z]');
  });
  Mousetrap.bind(['command+z'], function(e) {
    if(jQuery('#umpleCanvasColumn').hasClass('focus'))
    {      
      Action.undo();
    }
    e.preventDefault();
  });  
  Mousetrap.bind(['command+shift+z'], function(e) {
    if(jQuery('#umpleCanvasColumn').hasClass('focus'))
    {      
      Action.redo();
    }
    e.preventDefault();
  });
}
else //Non Mac
{
  jQuery(document).ready(function(){
    jQuery('#undosmall').html('[ctrl+z]');
    jQuery('#redosmall').html('[ctrl+y]');
  });
  Mousetrap.bind(['ctrl+z'], function(e) {
    if(jQuery('#umpleCanvasColumn').hasClass('focus'))
    {      
      Action.undo();
    }
    e.preventDefault();
  });  
  Mousetrap.bind(['ctrl+y'], function(e) {
    if(jQuery('#umpleCanvasColumn').hasClass('focus'))
    {      
      Action.redo();
    }
    e.preventDefault();
  });
}

//Arrow Up
Mousetrap.bind(['up'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus'))
  {
    Action.moveSelectedClass(Page.selectedClass, new UmplePosition(0,-5,0,0));
    return false; //equivalent to e.preventDefault();
  }
});
Mousetrap.bind(['shift+up'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus'))
  {
    Action.moveSelectedClass(Page.selectedClass, new UmplePosition(0,-1,0,0));
    return false; //equivalent to e.preventDefault();
  }
});

//Arrow Down
Mousetrap.bind(['down'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus'))
  {
    Action.moveSelectedClass(Page.selectedClass, new UmplePosition(0,5,0,0));
    return false; //equivalent to e.preventDefault();
  } 
});
Mousetrap.bind(['shift+down'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus'))
  {
    Action.moveSelectedClass(Page.selectedClass, new UmplePosition(0,1,0,0));
    return false; //equivalent to e.preventDefault();
  }
});

//Arrow Left
Mousetrap.bind(['left'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus'))
  {
    Action.moveSelectedClass(Page.selectedClass, new UmplePosition(-5,0,0,0));
    return false; //equivalent to e.preventDefault();
  }
});
Mousetrap.bind(['shift+left'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus'))
  {
    Action.moveSelectedClass(Page.selectedClass, new UmplePosition(-1,0,0,0));
    return false; //equivalent to e.preventDefault();
  }
});

//Arrow Right
Mousetrap.bind(['right'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus'))
  {
    Action.moveSelectedClass(Page.selectedClass, new UmplePosition(5,0,0,0));
    return false; //equivalent to e.preventDefault();
  }
});
Mousetrap.bind(['shift+right'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus'))
  {
    Action.moveSelectedClass(Page.selectedClass, new UmplePosition(1,0,0,0));
    return false; //equivalent to e.preventDefault();
  }
});

//Functions for changing diagram view - change consistently in umple_page.js
Mousetrap.bind(['ctrl+e'], function(e){
  Page.clickShowEditableClassDiagram();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+j'], function(e){
  Page.clickShowJointJSClassDiagram();
  return false; //equivalent to e.preventDefault();
});


Mousetrap.bind(['ctrl+g'], function(e){
  Page.clickShowGvClassDiagram();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+s'], function(e){
  Page.clickShowGvStateDiagram();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+l'], function(e){
  Page.clickShowStructureDiagram();
  return false; //equivalent to e.preventDefault();
});

//Functions for showing and hiding parts of the view
Mousetrap.bind(['ctrl+t', 'ctrl+alt+shift+t'], function(e){
  Page.clickShowHideText();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+d'], function(e){
  Page.clickShowHideCanvas();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+n', 'ctrl+alt+n'], function(e){
  Page.clickShowHideMenu();
  return false; //equivalent to e.preventDefault();
});

// Functions for changing what is shown on the diagram
Mousetrap.bind(['shift+ctrl+a'], function(e){
  Page.clickToggleAttributes();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+m'], function(e){
  Page.clickToggleMethods();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+r'], function(e){
  Page.clickToggleTraits();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+i'], function(e){
  Page.clickToggleTransitionLabels();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+k'], function(e){
  Page.clickToggleGuardLabels();
  return false; //equivalent to e.preventDefault();
});

Mousetrap.bind(['ctrl+b'], function(e){
  Action.promptAndExecuteTest();
  return false;
});

Mousetrap.bind(['ctrl+o'], function(e){
  Action.copyCommandLineCode();
  return false;
});

// Functions for editing the diagram - using shift
Mousetrap.bind(['g'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus') 
    && Page.selectedAssociation == null && Page.selectedGeneralization == null)
  {      
    if(Page.selectedClass == null || (Page.selectedClass && jQuery('#' + Page.selectedClass.id).find("input").length == 0))
    {
      jQuery('#buttonAddGeneralization').click();
    }        
  }  
});

Mousetrap.bind(['a'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus') 
    && Page.selectedAssociation == null && Page.selectedGeneralization == null)
  {
    if(Page.selectedClass == null || (Page.selectedClass && jQuery('#' + Page.selectedClass.id).find("input").length == 0))
    {
      jQuery('#buttonAddAssociation').click();
    }
  }
});

Mousetrap.bind(['c'], function(e){
  if(jQuery('#umpleCanvasColumn').hasClass('focus') 
    && Page.selectedAssociation == null && Page.selectedGeneralization == null)
  {
    if(Page.selectedClass == null || (Page.selectedClass && jQuery('#' + Page.selectedClass.id).find("input").length == 0))
    {        
      jQuery('#buttonAddClass').click();
    }        
  }
});

Action.toggleTabsCheckbox = function(language)
{
  // Workaround for TextUml having java prefix
  if($("inputGenerateCode").value.split(":")[1] == "TextUml"){
    language = "TextUml";
  }

  if(language == "java" || language == "php" || language == "cpp" ||
    language == "python" || language == "ruby" || language == "sql") {
    jQuery("#ttTabsCheckbox").show();
    jQuery("#tabRow").show();

    if ($("inputGenerateCode").value.split(":")[1] == "USE" || $("inputGenerateCode").value.split(":")[1] == "UmpleSelf" || $("inputGenerateCode").value.split(":")[1] == "Json") {
      jQuery("#ttTabsCheckbox").hide();
      jQuery("#tabRow").hide();
    }
  }
  else {
    jQuery("#ttTabsCheckbox").hide();
    jQuery("#tabRow").hide();
    if(jQuery('#buttonTabsCheckbox').is(':checked')){
      jQuery('#buttonTabsCheckbox').click();
    }
  }
}

// Function for splitting code into tabs for every new file, activated when checking the Show Tabs checkbox
Action.toggleTabs = function()
{
  // Checking on the checkbox
  if(jQuery('#buttonTabsCheckbox').is(':checked')){

    // Show row with buttons for each filename
    jQuery('#tabRow').show();

    // Hide main code window with glommed files
    jQuery('#innerGeneratedCodeRow').hide();

    // Show first file codeblock
    jQuery('#tabButton1').click();

  }
  // Checking off the checkbox
  else{

    // Hide row with buttons
    jQuery('#tabRow').hide();

    // Show main code window with glommed files
    jQuery('#innerGeneratedCodeRow').show();

    // Hide all file codeblocks
    jQuery('#innerGeneratedCodeRow').nextAll().hide();

  }
}

Action.generateTabsCode = function(theCode)
{
  var arrCodeFiles = [];
  var intFileCounter = 0;
  var strFileContents = "";
  var arrFileNames = [];
  var strNewLine = "";
  var skipSpace = false;

  // Read full code output line by line
  theCode.split('URL_SPLIT')[1].split("\n").forEach(function(theLine){

    // If New File Beginning
    if( (theLine.indexOf("//%%") >= 0) || (theLine.indexOf("# %%") >= 0)){
      intFileCounter++;
      strFileName = theLine.slice(14);
      strFileName = strFileName.substr(0, strFileName.indexOf(' '));
      arrFileNames[intFileCounter] = strFileName;
      jQuery('#generatedCodeRow').append("<div id='innerGeneratedCodeRow" + intFileCounter + "'></div>");
      arrCodeFiles[intFileCounter] = "";
      skipSpace = true;
    }
    else{
      if(!skipSpace){
         arrCodeFiles[intFileCounter] += theLine + "\n";
      }
      else{
        skipSpace = false;
      }
    }
  });

  // Output buttons for number of files found
  for (i=1; i <= intFileCounter; i++){
    jQuery('#tabRow').append("<button type='button' id='tabButton" + i + "'>" + arrFileNames[i] + "</button>");
    jQuery('#tabButton' + i).click({code: arrCodeFiles[i], tabnumber: i}, showTab);
  }
}

Action.getLanguage = function() 
{
  var language = "";
  if(Page.useEditableClassDiagram) {language="language=Json";}
    // JointJS receives the full model (class and state machine) in JSON
  else if(Page.useJointJSClassDiagram) {language="language=JsonMixed";}
  else if(Page.useGvClassDiagram) {
    if(Page.showTraits) {
      language="language=traitDiagram";
    }
    else {
      language="language=classDiagram";
    }
  }
  else if(Page.useGvStateDiagram) {language="language=stateDiagram"}
  else if(Page.useStructureDiagram) {language="language=StructureDiagram"}
 

  // append any suboptions needed for GvStateDiagram
  if(Page.useGvStateDiagram) { 
    if(!Page.showActions) language=language+".hideactions";
    if(Page.showTransitionLabels) language=language+".showtransitionlabels";
    if(!Page.showGuards) language=language+".hideguards";    
    if(Page.showGuardLabels) language=language+".showguardlabels";
    language=language+"."+$("inputGenerateCode").value.split(":")[1];
  }
  // append any suboptions needed for GvClassDiagram
  if(Page.useGvClassDiagram) { 
    if(Page.showMethods) language=language+".showmethods";
    if(!Page.showAttributes) language=language+".hideattributes";
  }
  // append any suboptions needed for GvFeatureDiagram
  if(Page.useGvFeatureDiagram) {
    language="language=featureDiagram";
    if(Page.showFeatureDependency) language=language+".showFeatureDependency";
  }
  // append the list of words specified in the filterwords
  // Also gather together copyable code to create a mixset from these
  copyableMixset ="";
  if(Page.filterWordsOutput != "") {
    language=language+".!@FW!@"+Page.filterWordsOutput;

    // Grab the words people have typed in manually for use in mixset
    var copyableIncludeStatements = "";
    Page.filterWordsOutput.split("!@").forEach(function(aFilterWord){
      if(aFilterWord != "") {
        // If it is a number then add a hops clause
        if(!isNaN(aFilterWord)) {
          copyableIncludeStatements+="  hops { association "+aFilterWord+";} ";
        }
        // If it starts with gv it is a filter word and if separator needs cleaning
        else if(aFilterWord.substr(0,2) == "gv") {
          if(aFilterWord.substr(0,11) == "gvseparator") {
            copyableMixset+="  suboption \""+aFilterWord.replace("@@@","")+"\";\n";
          }
          else {
            copyableMixset+="  suboption \""+aFilterWord+"\";\n";
          }
        }
        // If it starts with mixset or filter then process as named
        else if(aFilterWord.substr(0,6) == "filter") {
          copyableMixset+="  filter {includeFilter "+aFilterWord.substr(6)+";}\n";
        }
        else if(aFilterWord.substr(0,6) == "mixset") {
          copyableMixset+="  use "+aFilterWord.substr(6)+";\n";        
        }
        // Otherwise process as a filter pattern
        else {
          copyableIncludeStatements+=" include "+aFilterWord+";";
        }
      }
    });
    if(copyableIncludeStatements != "") {
      copyableMixset += "  filter {"+copyableIncludeStatements+"}\n";
    }
  }   
  // append any of the mixsets of filters
  // words in checkboxes that start with filter, followed by a named filter name
  Page.filtersActive.forEach(function(aNamedFilter){
    language=language+".filter"+aNamedFilter;
    copyableMixset+="  filter {includeFilter "+aNamedFilter+";}\n";
  });
  // words in checkboxes that start with mixset, followed by a mixset name
  Page.mixsetsActive.forEach(function(aMixset){
    language=language+".mixset"+aMixset;
    copyableMixset+="  use "+aMixset+";\n";
  });
  // words in checkboxes starting gv  
  Page.specialSuboptionsActive.forEach(function(aSpecialSuboption){
    language=language+"."+aSpecialSuboption;
    copyableMixset+="  suboption \""+aSpecialSuboption+"\";\n";
  });
  // Generate the actual copyable mixset, calling M followed by 3 digits
  var randomMixsetNumber = Math.floor(Math.random() * 899.0 + 100.0);
  Page.copyableMixset="\/\/ The following was generated from the show and hide options\n"
    +"\/\/ Rename the mixset and paste into the code so you can invoke it at any time\n"
    +"mixset M"+randomMixsetNumber+" {\n"+copyableMixset+"}";
  return language;
}

function showTab(event)
{
  // Hide all file codeblocks
  jQuery('#innerGeneratedCodeRow').nextAll().hide();

  // Show only relevant file codeblock
  jQuery('#innerGeneratedCodeRow' + event.data.tabnumber).show();

  // Highlight code for specific file only
  Page.showGeneratedCode(event.data.code, $("inputGenerateCode").value.split(":")[0], event.data.tabnumber);

  // Hide main code window with glommed files
  jQuery('#innerGeneratedCodeRow').hide();
}

Action.hidegdpr = function() 
{
  jQuery('#gdprtext').hide();
  Action.gdprHidden = true;
}

Action.reindent = function(lines, cursorPos)
{
  var offset = "";
  var codeAfterIndent = "";
  var len = lines.length;
  var inBlockComment = false;
  var statementEnd = true; // i.e. have semicolon at the end of the statement.
  var statementEndIndentSpace = 0;
  var indexOfCursor = -1;
  for (var i = 0; i < len; i++) 
  {
    var trimmedLine = lines[i].trim();

    // remove quotation
    var indexOfFirstQuote  = trimmedLine.indexOf("\"");
    var indexOfLastQuote = trimmedLine.indexOf("\"", indexOfFirstQuote + 1);
    while (indexOfFirstQuote != -1 && indexOfLastQuote != -1)
    {
      trimmedLine = trimmedLine.slice(0, indexOfFirstQuote) + trimmedLine.slice(indexOfLastQuote+1, trimmedLine.length);
      indexOfFirstQuote  = trimmedLine.indexOf("\"");
      indexOfLastQuote = trimmedLine.indexOf("\"", indexOfFirstQuote + 1);
    }

    // remove comment
    if (trimmedLine.indexOf("//") != -1)
    {
      trimmedLine = trimmedLine.substr(0, trimmedLine.indexOf("//")).trim();
    }

    if (inBlockComment)
    {
      if (trimmedLine.indexOf("*/") != -1)
      {
        trimmedLine = trimmedLine.substr(trimmedLine.indexOf("*/") + 2).trim();
        inBlockComment = false;
      }
      else {
        if (i != lines.length -1)
        {
          codeAfterIndent += lines[i] + "\n";
        } else {
          codeAfterIndent += lines[i];
        }
        continue;
      }
    }
    else if (trimmedLine.indexOf("/*") != -1)
    {
      if (trimmedLine.indexOf("*/") == -1)
      {
        inBlockComment = true;
        trimmedLine = trimmedLine.substr(0, trimmedLine.indexOf("/*")).trim();
      }
      else
      {
        trimmedLine = trimmedLine.substr(0, trimmedLine.indexOf("/*")) + trimmedLine.substr(trimmedLine.indexOf("*/") + 2).trim(); // remove block comment for trimmed line
      }
      
    }
    
    var indexOfOpenCurlyBrace = trimmedLine.indexOf("{");
    var indexOfCloseCurlyBrace = trimmedLine.indexOf("}");
    var indexOfSemiColon = trimmedLine.indexOf(";");

    
    if (indexOfSemiColon != -1 && indexOfSemiColon != trimmedLine.length - 1 && trimmedLine.substr(indexOfSemiColon+1).trim().charAt(0) != "}")
    {
      lines.splice(i + 1, 0, trimmedLine.substr(indexOfSemiColon + 1));
      if (i <= cursorPos.line)
      {
        cursorPos.line++;
      }
      lines[i] = lines[i].substr(0, lines[i].match(/^\s*/)[0].length + indexOfSemiColon + 1);
      Action.reindent(lines, cursorPos);
      return;
    }

    var doNotIndent = indexOfOpenCurlyBrace != -1 && indexOfCloseCurlyBrace != -1 && indexOfCloseCurlyBrace - indexOfOpenCurlyBrace < 40 && trimmedLine.substr(0, indexOfCloseCurlyBrace).indexOf("{", indexOfOpenCurlyBrace + 1) == -1;
    if (doNotIndent)
    {
      if (indexOfCloseCurlyBrace != trimmedLine.length - 1)
      {
        lines.splice(i + 1, 0, trimmedLine.substr(indexOfCloseCurlyBrace + 1));
        if (i <= cursorPos.line)
        {
          cursorPos.line++;
        }
        lines[i] = lines[i].substr(0, lines[i].match(/^\s*/)[0].length + indexOfCloseCurlyBrace + 1);
        Action.reindent(lines, cursorPos);
        return;
      }
      
      if (!statementEnd)
      {
        if (trimmedLine.slice(-1) == "{")
        {
          statementEnd = true;
        } 
        else 
        {
          lines[i] = offset + lines[i].match(/^\s*/)[0].substr(statementEndIndentSpace) + lines[i].trim();
          if (trimmedLine.indexOf(";") == trimmedLine.length - 1)
          {
            statementEnd = true;
          }
        }
      }
      else
      {
        lines[i] = offset + lines[i].trim();
      }
    }
    else 
    {
      if (indexOfOpenCurlyBrace != -1 && indexOfOpenCurlyBrace != trimmedLine.length - 1) // put code after an open curly bracket to next line
      {
        lines.splice(i + 1, 0, trimmedLine.substr(indexOfOpenCurlyBrace + 1));
        lines[i] = lines[i].substr(0, lines[i].match(/^\s*/)[0].length + indexOfOpenCurlyBrace + 1);
        if (i <= cursorPos.line)
        {
          cursorPos.line++;
        }
        Action.reindent(lines, cursorPos);
        return;
      }

      if (indexOfCloseCurlyBrace != -1 && trimmedLine.length > 1)
      {
        if (indexOfCloseCurlyBrace == 0)
        {
          lines.splice(i + 1, 0, trimmedLine.substr(1));
          lines[i] = "}";
          if (i <= cursorPos.line)
          {
            cursorPos.line++;
          }
        } else {
          lines.splice(i + 1, 0, "}");
          if (i <= cursorPos.line)
          {
            cursorPos.line++;
          }
          if (indexOfCloseCurlyBrace != trimmedLine.length - 1) // there is code after close curly bracket
          {
            lines.splice(i + 2, 0, trimmedLine.substr(indexOfCloseCurlyBrace + 1));
            if (i <= cursorPos.line)
            {
              cursorPos.line++;
            }
          }
          lines[i] = lines[i].substr(0, lines[i].match(/^\s*/)[0].length + indexOfCloseCurlyBrace);
        }
        Action.reindent(lines, cursorPos);
        return;
      }


      if (statementEnd && trimmedLine.indexOf(";") != trimmedLine.length - 1 && trimmedLine.slice(-1) != "{" && trimmedLine.slice(-1) != "}" && trimmedLine.slice(-2) != "||")
      {
        statementEnd = false;
        statementEndIndentSpace = lines[i].match(/^\s*/)[0].length;
      }

      if (indexOfCloseCurlyBrace != -1)
      {
        offset = offset.substr(2);
      }

      if (!statementEnd)
      {
        if (trimmedLine.slice(-1) == "{" || trimmedLine.slice(-2) == "||" && trimmedLine.slice(-1) == "}")
        {
          statementEnd = true;
          lines[i] = offset + lines[i].trim();
        } 
        else 
        {
          lines[i] = offset + lines[i].match(/^\s*/)[0].substr(statementEndIndentSpace) + lines[i].trim();
          if (trimmedLine.indexOf(";") == trimmedLine.length - 1)
          {
            statementEnd = true;
          }
        }
      }
      else
      {
        lines[i] = offset + lines[i].trim();
      }

      if (indexOfOpenCurlyBrace != -1)
      {
        offset += "  ";
      }
    }

    if (i != lines.length -1)
    {
      codeAfterIndent += lines[i] + "\n";
    } else {
      codeAfterIndent += lines[i];
    }
  }
  
  if(Page.codeMirrorOn) 
  {
    Page.codeMirrorEditor6.dispatch({
      changes: {from: 0, to: Page.codeMirrorEditor6.state.doc.length, insert: codeAfterIndent}
    })

  }
  
  // Refactoring definitive text location
  Action.updateCurrentUmpleTextBeingEdited(codeAfterIndent);

  var cursorLine = Page.getRawUmpleCodeCM6().split("\n")[Page.codeMirrorEditor6.state.doc.lineAt(Page.codeMirrorEditor6.state.selection.main.head).number];
  var whiteSpace = cursorLine.match(/^\s*/)[0].length;

  if (cursorPos.ch >= cursorLine.trim().length) 
  {
    Page.codeMirrorEditor6.dispatch({selection: {anchor: (cursorPos.line), head: (cursorLine.trim().length + whiteSpace)}});
  }
  else if (cursorPos.ch >= 0)
  {
    Page.codeMirrorEditor6.dispatch({selection: {anchor: (cursorPos.line), head: (cursorPos.ch+whiteSpace)}});  
  }
  else
  {
   const position = Page.codeMirrorEditor6.state.selection.main.head;
   Page.codeMirrorEditor6.dispatch({selection: {anchor: position, head: position}});
  }

  Page.codeMirrorEditor6.focus();
}