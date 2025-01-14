<?php
// Copyright: All contributors to the Umple Project
// This file is made available subject to the open source license found at:
// https://umple.org/license
//
// Main program that generates UmpleOnline
require_once ("scripts/compiler_config.php");
cleanupOldFiles();

if (isset($_REQUEST["model"])) {
  if (isset($_REQUEST["task"]))
  {
    $dataHandle = dataStore()->openData("tasks/" . $_REQUEST['model']);
  }
  else
  {
    $dataHandle = dataStore()->openData($_REQUEST['model']);
  }
  if (!$dataHandle) {
    header('HTTP/1.0 404 Not Found');
    readfile('404.shtml');
    exit();
  }
}


$diagramtype = "";
$isCachedExample = false;
$imageoutput="";
$messageURL="";
$actualExample="";
if (isset($_REQUEST['example']) && $_REQUEST["example"] != "") {
  $actualExample=preg_replace("/[^a-zA-Z0-9_\-\/]/",'',$_REQUEST["example"]);
  $cachedimage= "umplibrary/imagecache/".$actualExample.".svg";
  if (file_exists($cachedimage))
  {
    $isCachedExample=true;
  }
  else
  {
    $cachedimage= "umplibrary/imagecachesm/".$actualExample.".svg";
    if (file_exists($cachedimage))
    {
      $isCachedExample=true;
      $diagramtype="&diagramtype=state";
    }
    else
    {
      $cachedimage= "umplibrary/imagecachestructure/".$actualExample.".svg";
      if (file_exists($cachedimage))
      {
        $isCachedExample=true;
        $diagramtype="&diagramtype=structureDiagram&generateDefault=cpp";
      }    
    }
  }
  if($isCachedExample) {
    $imageoutput = "<br/><iframe src=\"".$cachedimage."\"></iframe><br\>";
    $messageURL = "<a href=\"?example=".$actualExample.$diagramtype."\">URL for ".$actualExample." example</a>";
  }
}

$dataHandle = extractFilename();
if (substr($dataHandle->getName(), 0, 4) == "task")
{
  $doLoadTaskInstruction = true;
} else {
  $doLoadTaskInstruction = false;
}

$canCreateTask = true;
if (isset($_REQUEST["model"]) && substr(explode("-", $_REQUEST["model"])[0], 0, 4) == "task")
{
  $canCreateTask = false;
}
// Core options after ? and between &. One of the first four is allowed

// example=xxx means load the .ump file named xxx

// filename=xxx means load the URL named xxx (but without the leading http:// or https://

// model=nnnn means load the saved bookmark

// text=zzzzz means load the URLencoded text for short examples (as in the user manual)

// nochrome means hide the banner at the top to save real estate
if (isset($_REQUEST["nochrome"])) {$showChrome=false;} else {$showChrome=true;}

// nodiagram means suppress creation of the diagram - passed to JavaScript
if (isset($_REQUEST["nodiagram"])) {$showDiagram=false;} else {$showDiagram=true;}

// diagramtype means choose some diagram other than the default which is class
$diagramType = "class";
if (isset($_REQUEST["diagramtype"])) {
  $diagramType=$_REQUEST["diagramtype"];
  if ($diagramType=="state") $diagramType = "GvState";
  else if ($diagramType=="structure") $diagramType = "structureDiagram";
  else if ($diagramType !="GvState" && $diagramType !="GvClass" && $diagramType !="structureDiagram" && $diagramType !="GvFeature" && $diagramType !="GvClassTrait" ) $diagramType = "class";
}
if ($diagramtype=="") $diagramtype = "&diagramtype=".$diagramType;

// notext means suppress creation of the text pane - passed to JavaScript
// ignored if nodiagram is also set
if ($showDiagram && isset($_REQUEST["notext"])) {$showText=false;} else {$showText=true;}

// showlayout means allow the layout editor to appear
// ignored if notext is also set
if ($showText && isset($_REQUEST["showlayout"])) {$showLayout=true;} else {$showLayout=false;}

// nomenu means suppress display of menu. Can only happen if diagram OR text hidden
if (isset($_REQUEST["nomenu"])) {$showMenu=false;} else {$showMenu=true;}

// readOnly means suppress ability to edit - passed to JavaScript
$readOnly = isset($_REQUEST["readOnly"]);
if (isset($_REQUEST["model"]) && explode("-", $_REQUEST["model"])[0] == "task")
{
  foreach (new DirectoryIterator("ump/" . $_REQUEST['model']) as $file)
  {
    if ($file->getFilename() == "submitted.md")
    {
      $readOnly = true;
    }
  }
}

//
$generateDefault="#genclass";
if (isset($_REQUEST['generateDefault']) && $_REQUEST["generateDefault"] != "") {
  $generateDefault="#gen".$_REQUEST['generateDefault'];
}

$output = $dataHandle->readData('model.ump');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <script src="scripts/_load.js" type="text/javascript"></script>
  <?php ?>
  <title>UmpleOnline: Generate Java, C++, PHP, Alloy, NuSMV or Ruby code from Umple</title>
  <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" /> 
  <style>
  .button2 {
   border-top: 1px solid #d3bc8f;
   line-height: 1.6;
   background: #d8a695;
   background: -webkit-gradient(linear, left top, left bottom, from(#e5bcae), to(#d8a695));
   background: -webkit-linear-gradient(top, #e5bcae, #d8a695);
   background: -moz-linear-gradient(top, #e5bcae, #d8a695);
   background: -ms-linear-gradient(top, #e5bcae, #d8a695);
   background: -o-linear-gradient(top, #e5bcae, #d8a695);
   padding: 2px 5px;
   -webkit-border-radius: 6px;
   -moz-border-radius: 6px;
   border-radius: 6px;
   -webkit-box-shadow: rgba(0,0,0,1) 0 1px 0;
   -moz-box-shadow: rgba(0,0,0,1) 0 1px 0;
   box-shadow: rgba(0,0,0,1) 0 1px 0;
   text-shadow: rgba(0,0,0,.4) 0 1px 0;
   color: white;
   font-size: 14px;
   font-family: 'Lucida Grande', Helvetica, Arial, Sans-Serif;
   text-decoration: none;
   vertical-align: middle;
   }
.button2:hover {
   border-top-color: #810b09;
   background: #810b09;
   color: #ccc;
   }

  .active {
    background: #B06C5B;
  }

  .cm-editor ::selection {
  color: #DD0033;
}

:root {
 --tooltipDwellTime: 3.5s;
}

  .ui-tooltip{
  animation: myDisplayNone var(--tooltipDwellTime) forwards;
  -webkit-animation: myDisplayNone var(--tooltipDwellTime) forwards;
  -moz-animation: myDisplayNone var(--tooltipDwellTime) forwards;
  -o-animation: myDisplayNone var(--tooltipDwellTime) forwards;
}

 /* .ui-tooltip:hover{
    animation-play-state: paused !important;
  
}  */

@keyframes myDisplayNone{
  0%   {
  /* opacity: 1; */
  }

  100% { 
    display:none;
    /* opacity: 0.99;  */

  }
}


/*
  .ͼ2 .cm-activeLine{
  background-color: #d9d9d9;!important;
  /* animation: myfadeIn 4s forwards;
  -webkit-animation: myfadeIn 4s forwards;
  -moz-animation: myfadeIn 4s forwards;
  -o-animation: myfadeIn 4s forwards; 
}
/*

/*
@keyframes myfadeIn {
  0%   { background: #d9d9d9;!important; }
  100% { background: transparent; }
}
*/


.led {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    position: relative;
    top:1px;

    /* vertical-align: middle; */
    /* alighn: center; */
    /* margin:0.3% 0.3% 0 0.5%; */
    background-color: gray; /* Default color */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    transition: background-color 0.3s ease;
}

.LEDOne {
    background-color: #49d3ff !important;
    transition: background-color 0.2s ease !important;
}

.LEDTwo {
    background-color: #04ca04 !important;
    transition: background-color 0.2s ease !important;
}

.LEDMoreThanTwo {
    background-color: green !important;
    transition: background-color 0.2s ease !important;
}


.LEDon {
    background-color: #fcff06 !important;
    transition: background-color 0.2s ease !important;
}

.LEDonError {
    background-color: red !important;
    transition: background-color 0.2s ease !important;
}

.LEDonDisconnect {
    background-color: orange !important;
    transition: background-color 0.2s ease !important;
}
.LEDonReceive {
    background-color: #e021cd !important;
    transition: background-color 0.2s ease !important;
}



/* .modal-container{
  background-color: rgba(0, 0, 0, 0.3);
  display:flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  opacity: 0;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  trsnsition: opacity 0.3s ease;
  z-index: 100000;
  display: none;
}

.modal-container.show{
  pointer-events: auto;
  opacity: 1;
  display: flex;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  top: -20%;
  text-align: center;
  position: relative;
} */



</style>
<link rel="stylesheet" href="scripts/styleSurvey.css"> 
<link rel="apple-touch-icon" sizes="57x57" href="https://cruise.umple.org/apple-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="https://cruise.umple.org/apple-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="https://cruise.umple.org/apple-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="https://cruise.umple.org/apple-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="https://cruise.umple.org/apple-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="https://cruise.umple.org/apple-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="https://cruise.umple.org/apple-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="https://cruise.umple.org/apple-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="https://cruise.umple.org/apple-icon-180x180.png">
<link rel="icon" type="image/png" sizes="192x192"  href="https://cruise.umple.org/android-icon-192x192.png">
<link rel="icon" type="image/png" sizes="32x32" href="https://cruise.umple.org/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="96x96" href="https://cruise.umple.org/favicon-96x96.png">
<link rel="icon" type="image/png" sizes="16x16" href="https://cruise.umple.org/favicon-16x16.png">
<!-- <link rel="manifest" href="https://cruise.umple.org/manifest.json"> -->
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="msapplication-TileImage" content="https://cruise.umple.org/ms-icon-144x144.png">
<meta name="theme-color" content="#8f001a">
</head>
<body>

<!-- you can use this to show a modal if you need this in future

<div id="modal-container" class="modal-container">
  <div class="modal">

    <h2>Reconnect to Collaboration session</h2>

    <p>Reconnecting your previous session? </p>
    <button id="collabReconnectmodal" onclick= "reconnect()" >Reconnect
    </button>

    <div>
    <p>Reconnecting to specific session with URL: </p>
    <input type="text" id="collabSessionURL" placeholder="Enter your session URL"></input>
    <button id="collabReconnectmodal2" onclick="reconnectToSpecificlocation()">Reconnect to this URL</button>
    </div>

    <p>start a new session?</p>
    <button id="collabStartNew" onclick="javascript:Page.createBookmark()">Start New</button>
    <br>
    <br>
    <button id="closeModal">Close</button>

  </div>
</div> -->


  <?php if($showChrome) { ?> 
    <div id="header" class="row">
        <span style="float: right">
          <a href="https://www.uottawa.ca" target="uottawatab"><img height="33px" src="scripts/uottawa_ver_black.png" alt="University of Ottawa logo / Université d'Ottawa" /></a>        
        </span>       
      <div class="inRow logo">
        <a href="https://cruise.umple.org/umple"><img src="scripts/umpleonline_title.jpg" alt="UmpleOnline logo" /></a>     
      </div>

      <div class="inRow" style = "width: 77%">
        
        <p class="pagedescription">

        <span class="pretext">
          Draw on the right, write (Umple) model code on the left. Analyse models and generate code.<br/>
           <?php
            $passToTip = FALSE; // dictates appearance of TOTD
            //alert message
            $alertMessage = @file_get_contents("ump/aalertMessage.txt");
            if($alertMessage != FALSE && !empty($alertMessage)) {
              echo "<span style=\"color: red\">$alertMessage<br/></span>";
            }
            else {
              //survey
              $surveyMessage = @file_get_contents("ump/aaSurvey.txt");
              if ($surveyMessage != FALSE && !empty($surveyMessage)){ // confirm file exists
                $surveyData = json_decode($surveyMessage);
                $randomSurveyRoll = mt_rand(1 , $surveyData->RandomizedFrequency);           
                ?>
                <script> // pass JSON file and rolled number to js
                  window.randomSurveyRoll = <?php echo $randomSurveyRoll; ?>;
                  window.surveyData = <?php echo json_encode($surveyData); ?>;
                </script>
                <span id="mainSurveySpan">
                  <script src="scripts/umple_survey.js"></script>
                </span>
                <?php
                if ($randomSurveyRoll != 1){
                  $passToTip = TRUE;
                }
              }
              else { 
                $passToTip = TRUE;
              }
            }
            
            if(isset($_POST['surveyLogInfo'])){
              $data = $_POST['surveyLogInfo'];              
              $file = fopen('ump/aaSurveyLog.txt', 'a');
              fwrite($file, $data);
              fclose($file);
            }

            if(isset($_POST['surveyLogInfo2'])){
              $data = $_POST['surveyLogInfo2'];              
              $file = fopen('ump/aaSurveyLog.txt', 'a');
              fwrite($file, $data);
              fclose($file);
            }

            if ($passToTip){ //tip of the day
              $tipOutput = readfile("scripts/tipProcessor.html");
              if ($tipOutput != FALSE && !empty($tipOutput)){
                $tipOutput;
              }
            }
          ?>
        </span>
        <span id="gdprtext" class="pretext">        
          This tool stores your data in cookies and on a server. <a href="javascript:Action.hidegdpr()">I understand</a>. &nbsp; <a href="https://umple.org/privacy" target="privacy">Click to learn about privacy.</a>
        <br/></span>

        
        
        <span style="font-size: 30%; white-space:nowrap;">
          <a class="button2" style="padding-top:auto; padding-bottom: auto;" href="https://umple.org/dl" target="dlpage" title="Go to the page that gives instructions on how to download Umple for use in Docker, or Eclipse or on the command line">Download</a>&nbsp;
          <a class="button2" style="padding-top:auto; padding-bottom: auto;" href="https://umple.org/donate" target="donatepage" title="Go to a University of Ottawa page that will enable you to donate to support Umple; even a few dollars will be much appreciated">Donate</a>&nbsp;
          
          </span>&nbsp;
             
    <span> &nbsp; For help: </span>
    <?php if(strpos($_SERVER['REQUEST_URI'], 'umple.php') !== false && strpos($_SERVER['REQUEST_URI'], 'umpleonline/umple.php') === false ) {$manpage="/manual/GettingStarted.html";} else {$manpage="https://manual.umple.org";} ?>                
    <span style="font-size: 30%; white-space:nowrap;">
    <a class="button2" style="line-height: 1; padding-top:auto; padding-bottom: auto;" href="<?php echo $manpage ?>" target="helppage" title="Open the Umple user manual in a separate tab" >User manual</a>&nbsp;
    <a class="button2" style="line-height: 1; padding-top:auto; padding-bottom: auto;" href="https://umple.org/questions"
       target="questionpage" title="Open a separate tab on the StackOverflow page where you can ask Umple community members questions">Ask questions</a>&nbsp;
    <a class="button2" style="line-height: 1; padding-top:auto; padding-bottom: auto;" href="https://github.com/umple/umple/issues/new" target="issuepage" title="Open a separate tab on the page where you can report an Umple bug or request an improvement">Report issue</a>&nbsp;
    </span>
        </p>
        
      </div>
    </div>
  <?php } ?>

  <noscript>
    <br/><font color="red">JavaScript is disabled so the dynamic features of this page will not work. To use UmpleOnline, turn Javascript on. Otherwise you can download the command-line Umple compiler or use Eclipse.</font>
    <?php echo $imageoutput ?>
    <pre>
      <?php echo $output ?>
    </pre>
  </noscript> 
      
  <input id="filename" type="hidden" value="<?php if (isset($_REQUEST["task"])) { echo '../ump/tasks/'.$dataHandle->getName().'/model.ump'; } else {echo '../ump/'.$dataHandle->getName().'/model.ump'; }?>" />
  <input id="advancedMode" type="hidden" value="0" />
  <input id="model" type="hidden" value="<?php echo $dataHandle->getName()?>" />

  <div id="taskArea" style="display: none;">
    
      <table>
        <tr style="text-align:left;">
          <th id="labelTaskName" style="display: none;"><label for="taskName"><span style="color:red">&#42;</span>Task Name:</label></th>
          <th><label id="labelRequestorName" for="requestorName">Requestor Name:</label></th>
          <th id="labelCompletionURL"><label>Completion Survey URL:</label></th>
        </tr>
        <tr>
          <th id="taskNameCell" style="display: none;" title="This name should describe the experiment or course assignment.
            It can contain alphanumeric characters as well as _ and .
            It is case sensitive. Responders will be able to use this
            to look up the task from the 'Load a task' menu item"><input type="text" id="taskName" name="fname"></th>
          <th title="This is optional. It will help reassure responders that they
            are responding to the correct task for the correct person
            or organization."><input type="text" id="requestorName"></th>
          <th id="completionURLCell" title="This is optional. Upon submitting a task, UmpleOnline will
            take responders to this URL with two arguments: task: the task name
            url: the URL of the completed task (with the model read-only)
            Requestors can use this to gather responses and/or
            to ask survey questions about the experiment or assignment"><input type="text" id="completionURL" width="70ch"></th>
          <th id="isExperimentCell" style="display: none; "title=" Check this to initiate logging of every command the user does.
            You should have ethics committee approval if you wish to use this
            and publish the results. Also, you should
            When you download the task you will be able to analyse the
            complete evolution of the model as the user works on it."><input id="isExperiment" type="checkbox" value="isExperiment"><label>isExperiment</label></th>
        </tr>
      </table>
     
    
      <b><label id="labelInstructions" for="instructions">Task Instructions:</label></b>
      <div id="instructionsHTML"></div>
      <textarea id="instructions" style="display: none;" title="Write task instructions in Markdown format.
        Lines starting with # are headings
        Lines starting with * are bullet points
        URLs will become links that take a user to another tab
        (You can use such URLs to tell users where to find more information
        about the task)
        The instructions might be requirements you want responders to
        implement. You can also create a complete model in the main
        area and then ask for reponders to make changes.
        If you need to be able to identify the responders you should
        ask them to include their name and/or ID in a comment
        in their model."></textarea>

    <div style="margin-top: 5px;">
    <?php if (!isset($_REQUEST["task"]) && !$doLoadTaskInstruction) { ?>
      <a class="button2" href="javascript:Page.createTask()" title="Click this to submit the task.
        After you click you will be taken to a page to edit the task
        You must bookmark that page so you can edit the task repeatedly.
        ">Submit Task</a> 
        <a class = "button2" href = "javascript: Page.cancelTask()" title= "Click this to discard your task" style = "margin-left: 5px" id = "buttonCancelTask">Cancel Task</a>
    <?php } else if (isset($_REQUEST["task"])) { ?>
      <a class="button2" href="javascript:Page.editTask()" title="Each time you click this, the instructions and model given to participants will be
        updated, although existing participants will see the original
        instructions and model. Use this link to polish your task.
        Don't forget to bookmark this page so you can return to modify the task.">Save changes to this Task</a> &nbsp;&nbsp;&nbsp;
      <a class="button2" href="javascript:Action.copyParticipantURL()" title="Click to put the participant URL in your clipboard. You can then send
        the link to participants so they can do the task">Copy Participant URL</a> &nbsp;&nbsp;&nbsp;
      <a class="button2" href="javascript:Action.launchParticipantURL()" title="Click to generate an answer to this task in the same way
        a participant would. Do this to test the task. Note that your response will appear if you later     
        download all the responses unless you cancel the submission.">Launch Participant URL in a new tab</a>
        <a class="button2" title="Click this to close the task editing panel and return to a normal layout." href="javascript:Page.endTaskEdit()">Exit task editing mode</a>
    <?php } else if ($doLoadTaskInstruction && substr($dataHandle->getName(), 0, 8) != "taskroot") {?>
      <a class="button2" href="javascript:Action.openInstructionInNewTab()">Open instruction in a new tab</a>&nbsp;&nbsp;
      <a id="buttonReshowInstructions" class="button2" href="javascript:Action.reshowInstructions()" style="display: none;">Re-show Instructions</a>&nbsp;&nbsp;
      <a id="buttonHideInstructions" class="button2" href="javascript:Action.hideInstructions()">Hide Instructions</a>&nbsp;&nbsp;&nbsp;
      <?php if (!$readOnly) { ?>
        <a class="button2" href="javascript:Action.submitTaskWork()" title=" When you submit, the requestor will be able to see your response
          and it will no longer be editable. Make sure your name is in a
          comment in the response if that has been requested in the instructions.">Submit Response</a>&nbsp;&nbsp;&nbsp;
        <a class="button2" href="javascript:Page.cancelTaskResponse()" title="Cancel this submission. Your data will be deleted.">Cancel this task response</a>&nbsp;
        <a class="button2" href="javascript:Page.hideTask()" title="Click to cancel this submission without losing your data.">Exit task submission</a>
      <?php } else { ?>
        <a class="button2" href="javascript:Action.openStartFreshWork()">Start Fresh Work</a>&nbsp;&nbsp;
        This task response has already been submitted and is now read-only.
    <?php }} ?>
    </div>

    <span id="buttonCopyParticipantURL">
      
    </span>
    <br>
  </div>


  <div id="topLine" class="bookmarkableUrl">
   <span id="linetext">Line=<input size=2 style="font-size: 12px;" id="linenum" value=1 onChange="Action.setCaretPosition(value);"></input>&nbsp; &nbsp;</span>   

    <span style="font-size: 30%">
    <a id="ECD_button" class="button2 active" href="javascript:Page.clickShowEditableClassDiagram()">E</a>&nbsp;
    <a id="GCD_button" class="button2" href="javascript:Page.clickShowGvClassDiagram()">G</a>&nbsp;
    <a id="SD_button" class="button2" href="javascript:Page.clickShowGvStateDiagram()">S</a>&nbsp;
    </span>
 
    &nbsp; 
    <span style="font-size: 30%">
    <a id="SHT_button" class="button2 active" href="javascript:Page.clickShowHideText()">T</a>&nbsp;
    <a id="SHD_button" class="button2 active" href="javascript:Page.clickShowHideCanvas()">D</a>&nbsp;
    </span>

    &nbsp; 
    <span style="font-size: 30%">
    <a id="SHA_button" class="button2 active" href="javascript:Page.clickToggleAttributes()">A</a>&nbsp;
    <a id="SHM_button" class="button2" href="javascript:Page.clickToggleMethods()">M</a>&nbsp;
    </span>

    &nbsp; 
    <span style="font-size: 30%; white-space:nowrap;">
    <a id="GenJavaButton" class="button2" href="javascript:Action.generateCode('java','Java');">Generate Java</a>&nbsp;
    </span>    

    <!-- disabling the save as URL feature and activating collaboration feature-->
    <!--
    <span style="font-size: 30%; white-space:nowrap;">
          <a class="button2" id="topBookmarkable" href="javascript:Page.createBookmark()" title="Create a URL for this model that you can bookmark and will allow you to come back and edit again. The URL will persist for a year after its last edit.">Save as URL</a>
    </span> -->



<!-- collaboration button -->
         
<span style="font-size: 30%; white-space:nowrap;">
             <?php if (isBookmark($dataHandle) && !isset($_REQUEST["task"])) { ?>
               <!-- <a class="button2" id="topBookmarkable" href="umple.php?model=<?php echo $dataHandle->getName() ?>">Collaborating at this URL  -->
               
              <span id="changableButton">
              <a class="button2" id="topBookmarkable" href="javascript:copyBookmarkURL()"><span>&#128279;</span> Copy collaboration URL
              <span id="led" class="led"> </span>
              <span id="activeUsersIcon" style="display:none">&#128100;</span>&nbsp;<span id="activeUsers" style="display:none" ></span>
              </a>
              </span>
              &nbsp;
    
               <a class="button2" id="collabDisconnect" style="display:none" href="javascript:Collab.disconnectFromServer('Disconnected from the server, the collaboration session has ended at the user\'s request.');"> Disconnect </a>
               &nbsp;
             <?php } else if (!isset($_REQUEST["task"])) { ?>
               <a class="button2" id="ttSaveNCollab" href="javascript:Page.createBookmark()">Save & Collaborate 
               </a>
               &nbsp;
             <?php } ?>
         
             </span>
             
              <!-- collaboration LED -->

    <span style="font-size: 30%; white-space:nowrap; display:none;">  
    <a id="toggleTabsButton" class="button2" href="javascript:Page.toggleTabs()" title="Hide tabs to add a little extra vertical space if you are not going to edit multiple files; click again to show the tabs.">Hide Tabs</a>
    </span>

    <span id="restorecode" > &nbsp; <a href="#"> Restore Saved State</a></span>

    &nbsp;<span id=exampleMessage><?php echo $messageURL ?></span> <span id=feedbackMessage></span>
  </div>

  <div id="tabControl">
    <ul id="tabs" class="tabrow">
      
        <li id="createTabBtn" class="unsortable"><a href="javascript:TabControl.createTab('afterTabControlInit');">+</a></li>
      
    </ul>
  </div>

  <div id="mainApplication" class="row"> 
    <div id="textEditorColumn"  tabIndex="2"  class="inRow"> 

      <!-- codemirror 6 editor -->
      <div id="newEditor" style="width:100%">
      </div>
      <div id="bottomTextEditor">
        <textarea id="umpleLayoutEditorText" class="umpleLayoutEditor" wrap="off"></textarea>
      </div>
    </div>
    
    <div id="paletteColumn" class="inRow" ondrop="Action.dropHandler(event);" ondragover="Action.dragOverHandler(event);">
      <div id="palette" class="palette">

        <!-- GROUP 1 OF OPTIONS -->
        <h3><a href="#saveload">SAVE & LOAD</a></h3>
        <div class="section">
          <ul class="first" id="saveLoad">
            <li class="subtitle">SAVE</li>
            <?php if (isBookmark($dataHandle) && !isset($_REQUEST["task"])) { ?>
            <?php } else if (!isset($_REQUEST["task"])) { ?>
            <li id="ttSaveModel"> 
              <div id="menuBookmarkable" class="bookmarkableUrl">
                <a href="bookmark.php?model=<?php echo $dataHandle->getName() ?>">Save & Collaborate</a>
              </div>
            </li>
            <?php } ?>
            <li id="buttonCopyClip" class="copyClip" >
              <img src="scripts/copy.png" alt="Copy to Clipboard icon"/> 
               Copy to Clipboard
            </li>           

            <li id="buttonCollabFork" class="buttonCollabFork" style="display:none">
              <img src="scripts/copy.png" alt="Fork"/> 
              <a href="javascript:Page.createBookmarkFork();"  style="text-decoration:none;">Fork</a>
            </li>     

            <li id="buttonCopy" class="copy">
              <img src="scripts/copy.png" alt="Source to Copy icon"/> 
               Source to Copy
            </li>
            <li id="buttonCopyEncodedURL" class="copyEncoded">
              <img src="scripts/copy.png" alt="Copy Encoded URL icon"/> 
              Encoded URL
            </li>
            <li id="buttonCopyCommandLine" class="copyCommandLine">
              <img src="scripts/copy.png" alt="Copy Command Line Script icon"/> 
              Command Script
            </li>
            <li id="buttonCopyLocalBrowser" class="copyLocalBrowser">
              <img src="scripts/copy.png" alt="Store in Local Browser icon"/> 
              Store in Browser
            </li>

            <li id="buttonDownloadFiles" class="downloadFiles">
              <img src="scripts/copy.png"/> 
               Download Files
            <li class="subtitle">LOAD</li>
            <li id="buttonLoadLocalBrowser" class="loadLocalBrowser">
              <img src="scripts/copy.png"/> 
              Load from Browser
            </li>
            <li>Drag and drop a .ump file here to load it, or drag it to any place in the text area.</li>
          </ul>

          <ul class="second center-children">
            <li class="subtitle">RESET</li>
            <li id="ttLoadBlankModel">
              <div id="buttonLoadBlankModel" class="jQuery-palette-button" value="Load Blank Model"></div>
            </li>
            <li id="ttShowRefreshUmpleCompletely">
            	<div id="buttonShowRefreshUmpleOnlineCompletely" class="jQuery-palette-button" value="Reset Completely"></div>
            </li>
            <li id="ttStartOver"> 
              <div id="buttonStartOver" style="display: none;" value="Click here to completely refresh UmpleOnline (cannot be undone)"></div> 
            </li>
            
          </ul>
        </div>
        
        <!-- GROUP 2 OF OPTIONS -->
        <h3><a href="#tools">TOOLS</a></h3>
        
        <div class="section">
          <?php if (!$readOnly) { ?>
          <ul id="mainLoadMenu" class="first center-children">
            <li class="subtitle"> Examples </li>
            <li id="exampleType">
              <select id="inputExampleType" name="inputExampleType" class="button" size = "1">
                <option name = "optionExampleType" id = "cdModels" value="cdModels">Class Diagrams</option>
                <option name = "optionExampleType" id = "smModels" value="smModels">State Machines</option>
                <option name = "optionExampleType" id = "structureModels" value="structureModels">Composite Structure</option>
                <option name = "optionExampleType" id = "featureModels" value="featureModels">Feature Diagram</option>
                <option name = "optionExampleType" id = "extra1ModelsAD" value="extra1ModelsAD">Extra Class Diagrams A-D</option>
                <option name = "optionExampleType" id = "extra1ModelsEL" value="extra1ModelsEL">Extra Class Diagrams E-L</option>
                <option name = "optionExampleType" id = "extra1ModelsMP" value="extra1ModelsMP">Extra Class Diagrams M-P</option>
                <option name = "optionExampleType" id = "extra1ModelsQZ" value="extra1ModelsQZ">Extra Class Diagrams Q-Z</option>

              </select>
            </li>
            <li id="itemLoadExamples">
              <select id="inputExample" name="inputExample" class="button" size = "1" data-diagram-type="class">
                <option name = "optionExample" id = "defaultExampleOption" value="">Select Example</option>
                <option name = "optionExample" value="2DShapes.ump">2DShapes *</option>
                <option name = "optionExample" value="AccessControl.ump">Access Control</option>
                <option name = "optionExample" value="AccessControl2.ump">Access Control 2</option>
                <option name = "optionExample" value="Accidents.ump">Accidents</option>
                <option name = "optionExample" value="Accommodations.ump">Accommodations</option>
                <option name = "optionExample" value="AfghanRainDesign.ump">Afghan Rain Design</option>

                <option name = "optionExample" value="https://raw.githubusercontent.com/umple/agreementNegotiation/main/negotiationMetamodel/src/Negotiations.ump">Agreement Negotiation</option>
                
                <option name = "optionExample" value="AirlineExample.ump">Airline *</option>
                <option name = "optionExample" value="Auction.ump">Auction *</option>                
                <option name = "optionExample" value="BankingSystemA.ump">Banking System A</option>
                <option name = "optionExample" value="BankingSystemB.ump">Banking System B</option>
                <option name = "optionExample" value="CanalSystem.ump">Canal</option>
                <option name = "optionExample" value="Decisions.ump">Decisions</option>
                <option name = "optionExample" value="OhHellWhist.ump">Card Games</option>
                <option name = "optionExample" value="Claim.ump">Claim (Insurance)</option>
                <option name = "optionExample" value="CommunityAssociation.ump">Community Association</option>
                <option name = "optionExample" value="Compositions.ump">Compositions</option>
                <option name = "optionExample" value="CoOpSystem.ump">Co-Op System</option>
                <option name = "optionExample" value="DMMOverview.ump">DMM Overview</option>
                <!-- <option name = "optionExample" value="DMMModelElementHierarchy.ump">DMM Model Element Hierarchy</option> -->
                <option name = "optionExample" value="DMMSourceObjectHierarchy.ump">DMM Source Object Hierarchy</option>
                <option name = "optionExample" value="DMMRelationshipHierarchy.ump">DMM Relationship Hierarchy</option>
                <option name = "optionExample" value="DMMExtensionCTF.ump">DMM CTF</option>
                <option name = "optionExample" value="ElectionSystem.ump">Election System</option>
                <option name = "optionExample" value="ElevatorSystemA.ump">Elevator System A</option>
                <option name = "optionExample" value="ElevatorSystemB.ump">Elevator System B</option>
                <option name = "optionExample" value="GenealogyA.ump">Genealogy A</option>
                <option name = "optionExample" value="GenealogyB.ump">Genealogy B</option>
                <option name = "optionExample" value="GenealogyC.ump">Genealogy C</option>
                <option name = "optionExample" value="GeographicalInformationSystem.ump">Geographical Information System</option>
                <option name = "optionExample" value="GeometricSystem.ump">Geometric system</option>
                <option name = "optionExample" value="Hospital.ump">Hospital</option>
                <option name = "optionExample" value="Hotel.ump">Hotel</option>
                <option name = "optionExample" value="Insurance.ump">Insurance</option>
                <option name = "optionExample" value="InventoryManagement.ump">Inventory Management</option>
                <option name = "optionExample" value="Library.ump">Library</option>
                <option name = "optionExample" value="MailOrderSystemClientOrder.ump">Mail Order System- Client Order</option>
                <option name = "optionExample" value="ManufacturingPlantController.ump">Manufacturing Plant Controller</option>   
                <option name = "optionExample" value="Pizza.ump">Pizza System</option>  
                <option name = "optionExample" value="PoliceSystem.ump">Police System</option>
                <option name = "optionExample" value="PoliticalEntities.ump">Political Entities</option>
                <option name = "optionExample" value="realestate.ump">Real Estate</option>
                <option name = "optionExample" value="RoutesAndLocations.ump">Routes And Locations</option>
                <option name = "optionExample" value="School.ump">School</option>
                <option name = "optionExample" value="TelephoneSystem.ump">Telephone System</option>
                <option name = "optionExample" value="UniversitySystem.ump">University System</option>
                <option name = "optionExample" value="VendingMachineClassDiagram.ump">Vending Machine</option>
                <option name = "optionExample" value="WarehouseSystem.ump">Warehouse System</option>
                <option name="optionExample" class="openUmprOption" value="">Select from Umpr Repository...</option>
              </select>
            </li>
            <li id="itemLoadExamples2">
              <select id="inputExample2" name="inputExample2" class="button" size="1" data-diagram-type="state">
                <option name = "optionExample2" id = "defaultExampleOption2" value="">Select Example</option>
                <option name = "optionExample" value="AgentsCommunication.ump">Agents Communicating *</option>
                <option name = "optionExample" value="ApplicationProcessing.ump">Application for a Grant</option>
                <option name = "optionExample" value="Auction.ump">Auction *</option>                  
                <option name = "optionExample" value="Booking.ump">Booking (Airline)</option>
                <option name = "optionExample" value="CanalLockStateMachine.ump">Canal Lock</option>
                <option name = "optionExample" value="CarTransmission.ump">Car Transmission</option>
                <option name = "optionExample" value="CollisionAvoidance.ump">Collision Avoidance With And-Cross Transition</option>
                <option name = "optionExample" value="CollisionAvoidanceA1.ump">Collision Avoidance - Alternative 1</option>
                <option name = "optionExample" value="CollisionAvoidanceA2.ump">Collision Avoidance - Alternative 2</option>
                <option name = "optionExample" value="CollisionAvoidanceA3.ump">Collision Avoidance - Alternative 3</option>
                <option name = "optionExample" value="ComplexStateMachine.ump">Complex Symbolic *</option>
                <option name = "optionExample" value="CourseSectionFlat.ump">Course Section</option>
                <option name = "optionExample" value="CourseSectionNested.ump">Course Section (Nested)</option>
                <option name = "optionExample" value="DigitalWatchNested.ump">Digital Watch Nested *</option>
                <option name = "optionExample" value="DigitalWatchFlat.ump">Digital Watch (Flat) *</option>
                <option name = "optionExample" value="Dishwasher.ump">Dishwasher</option>                
                <option name = "optionExample" value="Elevator_State_Machine.ump">Elevator</option>
                <option name = "optionExample" value="GarageDoor.ump">Garage Door</option>
                <option name = "optionExample" value="HomeHeater.ump">Home Heating System</option>
                <option name = "optionExample" value="LibraryLoanStateMachine.ump">Library Loan</option>
                <option name = "optionExample" value="Lights.ump">Light (3 alternatives)</option>
                <option name = "optionExample" value="MicrowaveOven2.ump">Microwave Oven *</option>
                <option name = "optionExample" value="Ovens.ump">Oven (3 alternatives)</option>
                <option name = "optionExample" value="ParliamentBill.ump">Parliament Bill</option>
                <option name = "optionExample" value="Phone.ump">Phone and Lines</option>
                <option name = "optionExample" value="Runway.ump">Runway</option>
                <option name = "optionExample" value="SecurityLight.ump">Security Light</option>
                <option name = "optionExample" value="SpecificFlight.ump">Specific Flight (Airline)</option>
                <option name = "optionExample" value="SpecificFlightFlat.ump">Specific Flight (Airline - Flat)</option>
                <option name = "optionExample" value="TcpIpSimulation.ump">TCP/IP Simulation *</option>
                <option name = "optionExample" value="TelephoneSystem2.ump">Telephone Set Modes</option>
                <option name = "optionExample" value="TicTacToe.ump">Tic Tac Toe or Noughts and Crosses</option>
                <option name = "optionExample" value="TimedCommands.ump">Timed Commands *</option>                     
                <option name = "optionExample" value="TollBooth.ump">Toll Booth</option>
                <option name = "optionExample" value="TrafficLightsA.ump">Traffic Lights A</option>
                <option name = "optionExample" value="TrafficLightsB.ump">Traffic Lights B</option>
                <option name="optionExample" class="openUmprOption" value="">Select from Umpr Repository...</option>
              </select>
            </li>

            <li id="itemLoadExamples3">
              <select id="inputExample3" name="inputExample3" class="button" size="1" data-diagram-type="composite">
                <option name = "optionExample3" id = "defaultExampleOption3" value="">Select Example</option>
                <!-- <option name = "optionExample" value="OBDCarSystem.ump">OBD Car System</option> -->
                <option name = "optionExample" value="PingPong.ump">Ping Pong</option>
              </select>
            </li>

            <li id="itemLoadExamples4">
              <select id="inputExample4" name="inputExample4" class="button" size="1" data-diagram-type="feature">
                <option name = "optionExample4" id = "defaultExampleOption4" value="">Select Example</option>
                <option name = "optionExample" value="BerkeleyDB_SPL.ump"> BerkeleyDB SPL </option>
                <option name = "optionExample" value="HelloWorld_SPL.ump"> HelloWorld SPL </option>
                <option name = "optionExample" value="BerkeleyDB_SP_featureDepend.ump"> Feature Dependencies of BerkeleyDB SPL </option>

              </select>
            </li>
  
            <li id="itemLoadExamples5">
              <select id="inputExample5" name="inputExample5" class="button" size="1" data-diagram-type="class">
                <option name = "optionExample5" id = "defaultExampleOption5" value="">Select Example</option>
                <?php

                // generate file if it does not exist or is older than 24h
                $genFileName = "generatedExtraExample1OptionsAD.html";
                if((!file_exists($genFileName)) || (time()-filemtime($genFileName) > 60 * 60 * 24)) {
                  include("scripts/genExtraExamples.php");
                }

                $exampleHtmlOptionLines=file_get_contents("generatedExtraExample1OptionsAD.html");
                if($exampleHtmlOptionLines) {
                  echo $exampleHtmlOptionLines;
                }
                else {
                   ?><option name = "optionExample" value="invalid.ump">Could not find AD 5 set of extra files </option> <?php
                }
                ?>
              </select>
            </li>

            <li id="itemLoadExamples6">
              <select id="inputExample6" name="inputExample6" class="button" size="1" data-diagram-type="class">
                <option name = "optionExample6" id = "defaultExampleOption5" value="">Select Example</option>
                <?php

                $exampleHtmlOptionLines=file_get_contents("generatedExtraExample1OptionsEL.html");
                if($exampleHtmlOptionLines) {
                  echo $exampleHtmlOptionLines;
                }
                else {
                   ?><option name = "optionExample" value="invalid.ump">Could not find EL 6 set of extra files </option> <?php
                }
                ?>
              </select>
            </li>

            <li id="itemLoadExamples7">
              <select id="inputExample7" name="inputExample7" class="button" size="1" data-diagram-type="class">
                <option name = "optionExample7" id = "defaultExampleOption7" value="">Select Example</option>
                <?php

                $exampleHtmlOptionLines=file_get_contents("generatedExtraExample1OptionsMP.html");
                if($exampleHtmlOptionLines) {
                  echo $exampleHtmlOptionLines;
                }
                else {
                   ?><option name = "optionExample" value="invalid.ump">Could not find MP 7 set of extra files </option> <?php
                }
                ?>
              </select>
            </li>

            <li id="itemLoadExamples8">
              <select id="inputExample8" name="inputExample6" class="button" size="1" data-diagram-type="class">
                <option name = "optionExample8" id = "defaultExampleOption8" value="">Select Example</option>
                <?php

                $exampleHtmlOptionLines=file_get_contents("generatedExtraExample1OptionsQZ.html");
                if($exampleHtmlOptionLines) {
                  echo $exampleHtmlOptionLines;
                }
                else {
                   ?><option name = "optionExample" value="invalid.ump">Could not find QZ 8 set of extra files </option> <?php
                }
                ?>
              </select>
            </li>

          
            <!-- <li class="dropbox-add-chooser"></li> --> 
          </ul>

          <?php } ?>
      
          <ul id="mainDrawMenu" class="second toggle">
            <li class="subtitle"> Draw </li>
            <li id="buttonAddClass" class="toggleToolItem view_opt_class_palette layoutListItem" name="paletteItem" title="Select and click on the canvas to add a new class." tabindex="0">
              <img src="scripts/class.png" alt="Icon to click on to create a new class in editable mode"/> 
              Class
            </li>
            <li id="buttonAddAssociation" class="toggleToolItem view_opt_class_palette layoutListItem" name="paletteItem" title="Select and click on a class to draw an association." tabindex="0">
              <img src="scripts/assoc.png" alt="Icon to click on to create an association in editable mode"/> 
              Association
            </li>
            <li id="buttonAddTransition" class="toggleToolItem view_opt_state layoutListItem" name="paletteItem" title="Select and click on a state to draw a transition." tabindex="0">
               <img src="scripts/assoc.png" alt="Icon to click on to create a new transition in certain state modes"/>
               Transition
             </li>            
            <li id="buttonAddGeneralization" class="toggleToolItem view_opt_class_palette layoutListItem" name="paletteItem" title="Select and click on the child class to draw a generalization line to the parent class." tabindex="0">
              <img src="scripts/generalization.png" alt="Icon to click on to create a generalization (subclass relationship) in editable mode"/> 
              Generalization
            </li>
            <li id="buttonDeleteEntity" class="toggleToolItem view_opt_class_palette layoutListItem" name="paletteItem" title="Select and click on an element to remove it from your model." tabindex="0">
              <img src="scripts/delete.png" alt="Icon to click on to delete and item in editable mode"/>
               Delete
             </li>
            <li id="buttonUndo" name="paletteItem" tabindex="0">
              <img src="scripts/undo.png" alt="Icon to click on to undo the last action"> 
              Undo
            </li>
            <li id="buttonRedo" name="paletteItem" tabindex="0">
              <img src="scripts/redo.png" alt="Icon to click on to redo an undone item in editable mode"> 
              Redo
            </li>
            <li id="buttonReindent" name="paletteItem" tabindex="0">
              <img src="scripts/sync_diagram.png" alt="Icon to click on to reindent the code"/> 
              Reindent Code
            </li>
            <li id="buttonSyncDiagram" name="paletteItem" tabindex="0">
              <img src="scripts/sync_diagram.png" alt="Icon to sync the diagram manually when automatic syncing is off"/> 
              Sync Diagram 
            </li>
        </ul>
        <?php generateMenu("") ?>
                  
          <!-- SHOW And Hide OPTIONS -->
          <ul id="ShowHideOptionsList" class="second">
            <li id="ShowMF" class="subtitle"> Show and Hide </li>

            <span id="filtertext"><input size=22
           style="font-size: 12px;" id="filtervalues" value="*" onChange="Action.setFilter(value);"></input>&nbsp; </span>   

            <!-- Location to inject mixsets and filters found ... used by Action.updateUmpleDiagramCallback -->
            <span id="ShowMFDynamicArea">
            </span>

            <li id="ttToggleAttributes" class="layoutListItem view_opt_class"> 
              <input id="buttonToggleAttributes" class="checkbox" type="checkbox"/> 
              <a id="labelToggleAttributes" class="buttonExtend">Attributes</a>
            </li>
            <li id="ttToggleMethods" class="layoutListItem view_opt_class"> 
              <input id="buttonToggleMethods" class="checkbox" type="checkbox"/> 
              <a id="labelToggleMethods" class="buttonExtend">Methods</a>
            </li>
            <li id="ttToggleActions" class="layoutListItem view_opt_state"> 
              <input id="buttonToggleActions" class="checkbox" type="checkbox"/> 
              <a id="labelToggleActions" class="buttonExtend">Actions</a> 
            </li>
            <li id="ttToggleTraits" class="layoutListItem view_opt_class"> 
              <input id="buttonToggleTraits" class="checkbox" type="checkbox"/> 
              <a id="labelToggleTraits" class="buttonExtend">Traits</a> 
            </li>
            <li id="ttToggleTransitionLabels" class="layoutListItem view_opt_state"> 
              <input id="buttonToggleTransitionLabels" class="checkbox" type="checkbox"/> 
              <a id="labelToggleTransitionLabels" class="buttonExtend">Transition Labels</a> 
            </li>
            <li id="ttToggleGuards" class="layoutListItem view_opt_state"> 
              <input id="buttonToggleGuards" class="checkbox" type="checkbox"/> 
              <a id="labelToggleGuards" class="buttonExtend">Guards</a> 
            </li>
            <li id="ttToggleGuardLabels" class="layoutListItem view_opt_state"> 
              <input id="buttonToggleGuardLabels" class="checkbox" type="checkbox"/> 
              <a id="labelToggleGuardLabels" class="buttonExtend">Guard Labels</a> 
            </li>
            <li id="ttToggleFeatureDependencyLabels" class="layoutListItem view_opt_feature"> 
              <input id="buttonToggleFeatureDependency" class="checkbox" type="checkbox"/> 
              <a id="labelToggleFeatureDependencyLabels" class="buttonExtend">Feature Dependency</a> 
            </li>
            <li id="ttAllowPinch">
              <input id="buttonAllowPinch" class="checkbox" type="checkbox" name="allowPinch" value="allowPinch"/> 
              <a id="labelAllowPinch" class="buttonExtend">Pinch to Zoom</a>
            </li> 
            <li id="buttonCopyMix" class="copyMix" >
              <img src="scripts/copy.png" alt="Copy Mixset with Above"/> 
               Make Mixset
            </li>              
          </ul>
      </div>
      
      <!-- GROUP 3 OF OPTIONS -->
      <h3><a href="#options">OTHER OPTIONS</a></h3>
      
      <div class="section">
        <div id="buttonViewComplete" title="View Complete">Selected view has opened in a new window.</div>
         <!-- DIAGRAM TYPE OPTIONS -->
          <ul class="first toggle">
            <li class="subtitle">  Diagram Type </li>
              
            <li id="ttShowEditableClassDiagram"> 
              <input id="buttonShowEditableClassDiagram" class="radio" type="radio" name="buttonCanvasType" value="buttonCanvasTypeEditableClassDiagram"/> 
              <a id="labelShowEditableClassDiagram" class="buttonExtend">Editable Class</a> 
            </li>
            <li id="ttShowGvClassDiagram"> 
              <input id="buttonShowGvClassDiagram" class="radio" type="radio"  name="buttonCanvasType" value="buttonCanvasTypeGvClassDiagram"/> 
              <a id="labelShowGvClassDiagram" class="buttonExtend">GraphViz Class</a> 
            </li>
            <li id="ttShowGvStateDiagram"> 
              <input id="buttonShowGvStateDiagram" class="radio" type="radio"  name="buttonCanvasType" value="buttonCanvasTypeGVStateDiagram"/> 
              <a id="labelShowGvStateDiagram" class="buttonExtend">GraphViz State</a> 
            </li>
	    <li id="ttShowGvFeatureDiagram"> 
              <input id="buttonShowGvFeatureDiagram" class="radio" type="radio"  name="buttonCanvasType" value="buttonCanvasTypeGVFeatureDiagram"/> 
              <a id="labelShowGvFeatureDiagram" class="buttonExtend">GraphViz Feature</a> 
            </li>
            <li id="ttShowStructureDiagram"> 
              <input id="buttonShowStructureDiagram" class="radio" type="radio" name="buttonCanvasType" value="buttonCanvasTypeStructureDiagram"/> 
              <a id="labelShowStructureDiagram" class="buttonExtend">Composite Structure</a> 
            </li>
          </ul>

          <!-- SHOW VIEW OPTIONS -->
          <ul class="second">
          <li id="ShowViewTitle" class="subtitle"> Show View </li>
          <li id="ttShowHideCanvas"> 
              <input id="buttonShowHideCanvas" class="checkbox" type="checkbox" name="buttonShowHideCanvas" value="buttonShowHideCanvas"/> 
              <a id="labelShowHideCanvas" class="buttonExtend">Diagram (Canvas)</a>
            </li>
            <li id="ttShowHideTextEditor"> 
              <input id="buttonShowHideTextEditor" class="checkbox" type="checkbox" name="buttonShowHideTextEditor" value="buttonShowHideTextEditor"/> 
              <a id="labelShowHideTextEditor" class="buttonExtend">Text Editor</a>
            </li>
            <li id="ttShowHideLayoutEditor" class="layoutListItem view_opt_class"> 
              <input id="buttonShowHideLayoutEditor" class="checkbox" type="checkbox" name="buttonShowHideLayoutEditor" value="buttonShowHideLayoutEditor"/> 
              <a id="labelShowHideLayoutEditor" class="buttonExtend">Layout Editor</a> 
            </li>          
            
          </ul>
          <!-- PREFERENCES OPTIONS -->
          <ul class="second">
            <li id="preferencesTitle" class="subtitle"> Preferences </li>
            <li id="ttPhotoReady" class="layoutListItem view_opt_class"> 
              <input id="buttonPhotoReady" class="checkbox" type="checkbox" name="photoReady" value="photoReady"/> 
              <a id="labelPhotoReady" class="buttonExtend">Photo Ready</a> 
            </li>
            <li id="ttManualSync">
              <input id="buttonManualSync" class="checkbox" type="checkbox" name="manualSync" value="manualSync"/> 
              <a id="labelManualSync" class="buttonExtend">Manual Sync</a>              
            </li>
          </ul>
         </div>


      <!-- GROUP 4 OF OPTIONS -->
      <h3><a href="#options">TASKS</a></h3>

      <div class="section">
          <ul id="taskSubmenu">
            
            <?php if ($canCreateTask) { ?>
              <li id="buttonCreateTask">
                <img src="scripts/copy.png" alt="Icon to click on to create a task"/>
                Create a Task
              </li>
            <?php } ?>

            <li id="buttonLoadTask">
              <img src="scripts/copy.png" alt="Icon to click on to load a task"/>
              Load a Task
            </li>

            <?php if (isset($_REQUEST["task"])) { ?>
            <li id="buttonRequestAllZip">
              <img src="scripts/copy.png" alt="Icon to click on to get a zip file with task submissions"/> 
              Request all Directories as a zip under this task
            </li>
            <?php } ?>
            

            <div id="loadTaskNameArea" style="display: none;">
              <label id="labelLoadTaskName" for="inputLoadTaskName">Task name:</label><br>
              <input type="text" id="inputLoadTaskName"><br>
              
              <span id="buttonSubmitLoadTask">
              <a href="javascript:Action.submitLoadTask()">Load Task</a> </span>
            </div>
          </ul>


      </div>

      </div> 
    </div>
   
    <div id="umpleCanvasColumn" class="umpleCanvasColumn inRow">
      <div id="umpleCanvas"  tabIndex="1" class="surface"></div>
    </div>
  </div>

  <!-- Added for including codemirror6 editor -->
  <script src="./scripts/codemirror6/editor.bundle.js"></script>
  <!-- Added for sockets usage in client-side -->
  <script src="./scripts/socket.io/socket.io.js"></script>

  <a name="genArea"/>  
  <div id="generatedCodeRow" class="row">
		<li id="ttTabsCheckbox">
			<input id="buttonTabsCheckbox" type="checkbox" class="checkbox" name="buttonTabsCheckbox" value="buttonTabsCheckbox"/>
			<a id="labelTabsCheckbox" class="buttonExtend">Show Files in Separate Tabs</a>
		</li>
    <div id="messageArea"></div>
    <div id ="downloadArea"></div>
    <div id="tabRow"></div>
    <div id="innerGeneratedCodeRow"></div>
  </div>
  <div id="codeExecutionArea">
    <pre id="executionMessage"></pre>
  </div>

  <?php if($showChrome) { ?>
    <div class="spacer row"></div>
  <?php } ?>

  <script src="scripts/pinch.js" type="text/javascript"></script>

  <script>
    Page.init(
      <?php if($showDiagram) { ?> true  <?php } else { ?> false <?php } ?>,
      <?php if($showText) { ?> true  <?php } else { ?> false <?php } ?>,
      <?php if($showMenu) { ?> true  <?php } else { ?> false <?php } ?>,
      <?php if($readOnly) { ?> true  <?php } else { ?> false <?php } ?>,
      <?php if($showLayout) { ?> true <?php } else { ?> false <?php } ?>,
      "<?php echo $diagramType ?>",
      "<?php echo $generateDefault ?>",
      <?php if($doLoadTaskInstruction) { ?> true  <?php } else { ?> false <?php } ?>,
      <?php if(isset($_REQUEST["task"])) { ?> true <?php } else { ?> false <?php } ?>,
      <?php if($canCreateTask) { ?> true <?php } else { ?> false <?php } ?>
      ); 
      <?php if (isset($_REQUEST['example']) && $actualExample != ""){?> 
      Page.setExamples("<?php echo $actualExample ?>")
      <?php } ?> 
      //
  </script>

  <script>
    Collab.connectCollabServer();
  </script>

  <script>
    function reconnect() {
      var currentaddress = document.location.href;
      window.location.href = currentaddress;
    }
  </script>

<script>
      copyBookmarkURL = function(){
      // Get the current URL
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(currentUrl);
      Page.setFeedbackMessage("URL copied to clipboard");
      console.log("URL copied to clipboard");
    }
  </script>

  <?php if ($showChrome) { ?>
    <div class="visitors-count" align="right">
        <?php include "counter.php"; ?>
    </div>
  <?php } ?>


</body>
</html>
