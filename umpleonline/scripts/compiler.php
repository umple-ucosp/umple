<?php
// Copyright: All contributers to the Umple Project
// This file is made available subject to the open source license found at:
// http://umple.org/license
//
// Invoked on the UmpleOnline server to cause one of the
// two jars to be run with appropriate arguments (umple.jar or umplesync.jar)
//
// Involed as an Ajax call by umple_action.js in the following places:
// Action.ajax - near the end of that file - for most compilation tasks
// Action.loadFile using ajax.js - argument load  - load a user saved file
// Action.loadExample - argument exampleCode - one of the pre-canned examples
// Action.saveNewFile using ajax.js - argument save 
// Action.pngImage, Action.ymlImageCallback
// Action.uiguCallback - argument asUI
//
// This file also formats the output from the jars for presentation back on
// the UmpleOnline screen
//
// Most of the helper methods are in compiler_config.php, except
// getErrorHtml, which reads the generated error file, and jsonDecode
//

require_once("compiler_config.php");
require_once("Parsedown.php");

// Allow CORS so that any site may use the Umple compiler.
header("Access-Control-Allow-Origin: *");

if (isset($_REQUEST["save"]))
{
  if(isset($_REQUEST["svgContent"]))
  {
    $input = $_REQUEST["svgContent"];

    if(isset($_REQUEST["filename"]))
    {
      $filename = basename($_REQUEST['filename']);
      $modelId = dirname($_REQUEST['filename']);
      $dataHandle = dataStore()->openData($modelId);
      $dataHandle->writeData($filename, $input);
    }
    else
    {
      // this makes no sense, but mimic old behaviour for now
      $filename = 'model.ump';
      $dataHandle = dataStore()->createData();
      $dataHandle->writeData($filename, $input);
    }
    $workDir = $dataHandle->getWorkDir();
    // it will inserted into an href, so we should actually permalink
    // the resulting file
    echo $workDir->makePermalink($filename);
  }
  else
  {
    $input = $_REQUEST["umpleCode"];
    list($dataname, $dataHandle) = getOrCreateDataHandle();
    if (isset($_REQUEST["lock"]) && isset($_REQUEST["model"])){
      $model = $_REQUEST["model"];
  //file_put_contents("/home/jpan/test.html", ' ' . $model, FILE_APPEND);

  //file_put_contents("/home/jpan/test.html", "111 " . $dataHandle->getWorkDir()->getPath(), FILE_APPEND);
      $lock_file = "../ump/".$model."/.lockfile";
      $fp = fopen($lock_file, "w");
      if (flock($fp, LOCK_EX)) {
        try {
          $dataHandle->writeData($dataname, $input);
        } catch (Exception $e) {
          // Do nothing for now here
        } finally {
          flock($fp, LOCK_UN);
        }
      }
    }
    else
    {
      $dataHandle->writeData($dataname, $input);
    }
    // pretend this is still the old system and mimic the kind of path
    // the JavaScript expects
    echo '../ump/'.$dataHandle->getName().'/'.$dataname;
  }
  
}
else if (isset($_REQUEST["load"]))
{
  // extract the model ID and filename from the old-style path
  $filename = basename($_REQUEST["filename"]);
  $modelId = basename(dirname($_REQUEST["filename"]));
  // echo $filename;
  // echo $modelId;
  if (isset($_REQUEST["isTask"]))
  {
    $modelId = "tasks/" . $modelId;
  }
  //file_put_contents("/home/jpan/test.html", $modelId . "///", FILE_APPEND);
  $dataHandle = dataStore()->openData($modelId);
  $outputUmple = $dataHandle->readData($filename);
  echo $outputUmple;
}
else if (isset($_REQUEST["loadTask"])) //load the task in the tasks dir
{
  foreach (new DirectoryIterator("../ump/tasks") as $file) 
  {
    if ($file->isDot()) continue;

    if ($file->isDir() && substr($file->getFilename(), 0, 8) == "taskroot") 
    {
      $taskName = explode("-", $file->getFilename())[1];
        if ($taskName == strtolower($_REQUEST["filename"]))
        {
          $dataHandle = dataStore()->openData("tasks/" . $file->getFilename());
          $umpleCode = $dataHandle->readData("model.ump");
          if (isset($_REQUEST["loadInstructionAsHTML"]))
          {
            $Parsedown = new Parsedown();
            $instructions = $Parsedown->text($dataHandle->readData("instructions.md")); # prints: <p>Hello <em>Parsedown</em>!</p>
          }
          else
          {
            $instructions = $dataHandle->readData("instructions.md");
          }
          $json = json_decode($dataHandle->readData("taskdetails.json"), true);
          $requestorName = $json["requestorName"];
          $completionURL = $json["completionURL"];
          echo $umpleCode . "task delimiter" . $instructions . "task delimiter" . $json["taskName"] . "task delimiter" . $file->getFilename() . "task delimiter" . $requestorName . "task delimiter" . $completionURL . "task delimiter" . $json["isExperiment"];
          break;
        }
    }
  }
}
else if (isset($_REQUEST["action"]))
{
  handleUmpleTextChange();
}
else if (isset($_REQUEST["umpleCode"]))
{
  //file_put_contents("/home/jpan/test.html", "BBBBBBBBBBBBBBBBBBBB", FILE_APPEND);
  $input = $_REQUEST["umpleCode"];
  $fulllanguage = $_REQUEST["language"];
  
  // If there are suboptions in the language string, parse them out
  // Language stringh could be cpp or cpp.opt1.opt2.opt3
  $langparts = explode('.',$fulllanguage);
  $language = $langparts[0];
  $suboptions = "";
  $filterPats = "";
  $mixsetsToAdd = "";
// DEBUG MAYBE DELETE AND DELETE LATER USES of $extradotargs
  $extradotargs = "";
  for($i=1; $i<count($langparts); $i++){
    $potentialSuboption = $langparts[$i];
    if(substr($potentialSuboption,0,6) == "!@FW!@") {
      $filterwords = explode('!@',substr($potentialSuboption,6));
      for($fw=0;$fw<count($filterwords);$fw++){
        $afilterword=$filterwords[$fw];
        if ($afilterword =="") {continue;}
        
        // if a filter word is numeric then we assume it is for hops
        if(is_numeric($afilterword)) {
          $filterPats = $filterPats . " hops { association ".round($afilterword).";} ";
          continue;
        }
        
        // If a filter word is the separator subopttion, use it
        if(substr($afilterword,0,12) == "gvseparator=") {
          // decimal place had been changed to @@@ so replace
          $suboptions = $suboptions . " -s " . str_replace("@@@",".",$afilterword);
          continue;
        }
                
        // If a filter word is a standard single word suboption use it
        $foundsuboption = false;
        switch ($afilterword) {
          case 'gvneato': case 'gvspring': case 'gvfdp': case 'gvsfdp': case 'gvcirco':
          case 'gvtwopi': case 'gvdot':
          case 'gvortho': case 'gvpolyline': case 'gvdeoverlapscale': case 'gvdeoverlaportho':
          case 'gvdeoverlapprism':
            $suboptions = $suboptions . " -s " . $afilterword;
            $foundsuboption = true;
            break;
        }
        if ($foundsuboption) continue;
        
        // A named mixset then we add this as a direct argument (use statement)
        // warning nearly-dup code below (TODO fix)
        if(substr($afilterword,0,6) == "mixset") {
          $mixsetsToAdd = $mixsetsToAdd . " use ".substr($afilterword,6)."; ";
          continue;
        }

        // Named filter then we need to add an includefilter code block
        // warning nearly-dup code below (TODO fix)
        if(substr($afilterword,0,6) == "filter") {
          $filterPats= $filterPats . " includeFilter ".substr($afilterword,6).";";
          continue;
        }

        // Any pattern starting gv would just be a mis-spelling so we don't want that to have effect
        if(substr($afilterword,0,2) == "gv") {
          continue;
        }
        
        // To make else ... if a filter word is not blank then filter in this set of words
        if ($afilterword !="") {
          $filterPats = $filterPats . " include ".$afilterword.";";
        }
      } // end of processing the words generated from the filter text panel

    }
    else {
      // A suboption specified as a checkbox as opposed to the filter line

      // A named mixset then we add this as a direct argument (use statement)
      // warning nearly-dup code above (TODO fix)
      if(substr($potentialSuboption,0,6) == "mixset") {
        $mixsetsToAdd = $mixsetsToAdd . " use ".substr($potentialSuboption,6)."; ";      
      }

      // Named filter then we need to add an includefilter code block
      // warning nearly-dup code below (TODO fix)
      else if(substr($potentialSuboption,0,6) == "filter") {
        $filterPats = $filterPats . " includeFilter ".substr($potentialSuboption,6).";";
      }
      else {
        $suboptions = $suboptions . " -s " . $potentialSuboption;
      }
    }
  } // end of loop of langparts that had been separated by dots

  // At this point we have collected together all filter patterns and mixsets
  $umpleDirectToAdd="";
  if($mixsetsToAdd != "") {
    $umpleDirectToAdd = $mixsetsToAdd;
  }
  if($filterPats != "") {
    $umpleDirectToAdd = $umpleDirectToAdd . "filter {".$filterPats."} ";
  }
  if($umpleDirectToAdd != "") {
    $suboptions = $suboptions . " -u \"" . $umpleDirectToAdd . "\"";
  }

  $languageStyle = isset($_REQUEST["languageStyle"])?
    $_REQUEST["languageStyle"] : false;
  $outputErr = isset($_REQUEST["error"])?$_REQUEST["error"]:false;
  $execute = isset($_REQUEST["execute"]) ? true : false;
  $modelName = isset($_REQUEST["model"])? $_REQUEST["model"] : false;
  $uigu = False;

  $javadoc = false;
  $stateDiagram = false;
  $featureDiagram = false;
  $classDiagram = false;
  $entityRelationshipDiagram = false;
  $yumlDiagram = false;
  $uigu = false;
  $Uigu2 = false;
  $htmlContents = false;
  $generatorType = "";
  $svg_regex= "/scale\([0-9]*(\.([0-9])*)? [0-9]*(\.([0-9])*)?\) rotate\(0\)/";
  $svg_scale="scale(0.75 0.75) rotate(0)";
  
  //featureDiagram

  if ($language == "javadoc")
  {
     $language = "Java";
     $javadoc = True;
  }
  else if ($language == "stateDiagram")
  {
     $language = "GvStateDiagram";
     $generatorType = "";
     $stateDiagram = True;
  }
  else if ($language == "featureDiagram")
  {
      $language = "GvFeatureDiagram";
      $generatorType = "";
      $featureDiagram = True;
      $featureDependency = (strpos($suboptions, 'showFeatureDependency') !== false); 
      
  }
  else if ($language == "classDiagram")
  {
     $language = "GvClassDiagram";
     $generatorType = "cd";     
     $classDiagram = True;
  }
  else if ($language == "traitDiagram")
  {
     $language = "GvClassTraitDiagram";
     $generatorType = "cdt";
     $classDiagram = True;
  }
  else if ($language == "entityRelationshipDiagram")
  {
     $language = "GvEntityRelationshipDiagram";
     $generatorType = "erd";
     $entityRelationshipDiagram = True;
  }
  else if ($language == "yumlDiagram")
  {
     $language = "Yuml";
     $yumlDiagram = True;
  }    
  else if ($language == "uigu")
  {
     $language = "Uigu";
     $uigu = True;
  }
  else if ($language == "Uigu2")
  {
    $Uigu2 = True;
    $htmlContents = True;
  }
  
  if ($languageStyle == "html")
  {
     $htmlContents = true;
  }
  
  if ($language == "Simulate")
  {
    list($dataname, $dataHandle) = getOrCreateDataHandle();
    $dataHandle->writeData($dataname, "generate Php \"./\" --override-all;\n" . $input);
    $workDir = $dataHandle->getWorkDir();
    $filename = $workDir->getPath().'/'.$dataname;
    executeCommand("java -jar umple.jar {$filename}");
    $workDir->saveModel();
    
    $dataHandle->writeData($dataname, "generate Simulate \"./\" --override-all;\n" . $input);
    $workDir = $dataHandle->getWorkDir();
    $filename = $workDir->getPath().'/'.$dataname;
    executeCommand("java -jar umple.jar {$filename}");
    $workDir->saveModel();
    // Restore file so it doesn't have the 'generate' command in front
    $dataHandle->writeData($dataname, $input);
    echo $dataHandle->getName();
    return;
  }
  elseif ($uigu)
  {
    list($dataname, $dataHandle) = getOrCreateDataHandle();
    $dataHandle->writeData($dataname, $input);
    $workDir = showUserInterface($dataname, $dataHandle);
/*  chdir("JSFProvider");
    if (file_exists("JSFProvider/model.ump"))
      unlink("JSFProvider/model.ump");
    copy("$filename", "JSFProvider/model.ump");
    executeCommand("java -cp GUIModel.jar;JSFProvider.jar;GUIGenerator.jar cruise.generator.UIGU UmpleProject.xml model.ump TempDir TempApp");*/
  }

  else if ($htmlContents) {
    list($dataname, $dataHandle) = getOrCreateDataHandle();
    $dataHandle->writeData($dataname, $input);
    $workDir = $dataHandle->getWorkDir();
    $filename = $workDir->getPath().'/'.$dataname;
    // note: this does not create the error output in the working directory, and likely never did
    $errorFilename = "{$filename}.erroroutput";
    $sourceCode = executeCommand("java -jar umplesync.jar -generate {$language} {$filename} 2> {$errorFilename}");
    $errors = getErrorHtml($errorFilename, 0);
    if($outputErr == "true")
      echo $errors . "<p>URL_SPLIT";
    $workDir->saveModel();
    if($Uigu2) {
       $uigu2dir = $workDir->getPath();
       if (!file_exists($uigu2dir."/app")) {
         symlink("../../scripts/uigu2/app",$uigu2dir."/app");
       }
       // exec("cd $uigu2dir; ln -s ../../scripts/uigu2/app .");    
       $uigu2file = $workDir->makePermalink('index.php');
       // DEBUG - to display as a link Uncomment the following line, and comment out the subsequent 4
       //  $html = "{$errhtml} <b> <a target=\"otherone\" href=\"" . $uigu2file . "\">$uigu2file</a> </b>";  
       $html = "
      <iframe width=100% height=1000 src=\"" . $uigu2file . "\">This browser does not
      support iframes, so the uigu cannot be displayed</iframe> 
      ";
       echo $html;
    }
    else {
      echo $sourceCode;
    }
    return;      
  } // end html content      

  elseif (!in_array($language,array("Php","Java","Ruby","Python","RTCpp","Cpp","Sql","GvFeatureDiagram","GvStateDiagram","GvClassDiagram","GvEntityRelationshipDiagram","GvClassTraitDiagram","Yuml")))
  {  // If NOT one of the basic languages, then use umplesync.jar
    list($dataname, $dataHandle) = getOrCreateDataHandle();
    $dataHandle->writeData($dataname, $input);
    $workDir = $dataHandle->getWorkDir();
    $filename = $workDir->getPath().'/'.$dataname;
    $errorFilename = "{$filename}.erroroutput";
    
    if ($language == "Experimental-Cpp" || $language == "Experimental-Sql") {
      $sourceCode = executeCommand("echo \"{$language} is under development. Output is currently only available to developers of Umple\" 2> {$errorFilename}");
    } elseif ($language == "Papyrus") {
      $sourceCode = executeCommand("java -jar umplesync.jar -generate {$language} {$filename} 2> {$errorFilename}");
      $papyrusProjectRootPath = $workDir->getPath();
      $command = "cd {$papyrusProjectRootPath}; rm {$language}FromUmple.zip; zip -r {$language}FromUmple.zip model";
      exec($command);
      $archivelink = $workDir->makePermalink($language.'FromUmple.zip');
      echo "<a href=\"$archivelink\" class=\"zipDownloadLink\" title=\"Download the generated code as a zip file. You can then unzip the result, compile it and run it on your own computer.\">Download the following Papyrus project as a zip file</a >";
    }
    else {
      $sourceCode = executeCommand("java -jar umplesync.jar -generate {$language} {$filename} 2> {$errorFilename}");
    }
    $errors = getErrorHtml($errorFilename, 0);
    
    if ($language != "Json" && $language != "JsonMixed")
    {
      $sourceCode = htmlspecialchars($sourceCode);
    }
    
    if($outputErr == "true")
        echo $errors ."<p>URL_SPLIT";

    $workDir->saveModel();
    echo $sourceCode;
    return;
  }

  if ($language == "Python")
  {
    echo "Generated Python has a few limitations. For more information please <a target='pythoninfo' href='https://cruise.umple.org/umple/Python.html'>click here</a>.<br>";
  }

  if (!$uigu)
  { // NOTuigu
  // Generate the Java, PHP, RTCpp, Ruby, Python, Cpp or Sql and put it into the right directory
  list($dataname, $dataHandle) = getOrCreateDataHandle();
  $dataHandle->writeData($dataname, "generate {$language} \"./{$language}/\" --override-all;\n" . $input);
  $workDir = $dataHandle->getWorkDir();
  $filename = $workDir->getPath().'/'.$dataname;
  
  $outputFilename = "{$filename}.output";
  $errorFilename = "{$filename}.erroroutput";
  $executionErrorFilename = "{$filename}.executionerror";
  
  // Clean up any pre-existing java. php, RTCpp, ruby, python or cpp files
  $thedir = dirname($outputFilename);
  $toRemove = False;
  $rmcommand = "rm -rf ";
  foreach (glob("$thedir/{$language}") as $afile) {
    $rmcommand = $rmcommand . " " . $afile;
    $toRemove = True;
  }    
  if($toRemove) { exec($rmcommand); }
  
  //
  if($execute) 
  {
    $language = $_REQUEST['language'];
    $command = "java -jar umplesync.jar -generate {$language} {$filename} -cx 2> {$executionErrorFilename}";
    executeCommand($command);
    $errhtml = getErrorHtml($executionErrorFilename);
    if($errhtml != "") {
      echo translateToLineNums($errhtml);
    }
    $content = executeCode($modelName, $errhtml != "");
    $output = json_decode($content, false);
    if (json_last_error() === JSON_ERROR_NONE) {
      if($output->output || $output->errors) {
        echo "<p><strong class='executionHeader'>Execution Output</strong></p>";
        echo translateToLineNums($output->output.$output->errors);
      }
    } else {
      echo $content;
    }
    return;
  } // The following is a hack. The arguments to umplesync need fixing
  else if (!$stateDiagram && !$classDiagram && !$entityRelationshipDiagram && !$yumlDiagram && !$featureDiagram) {  
    $command = "java -jar umplesync.jar -source {$filename} 2> {$errorFilename}";
  }
  else {
      // The following is used for outputting diagrams only
      $thedir = dirname($outputFilename);
      exec("rm -rf " . $thedir . "/modelcd.gv " . $thedir . "/model.gv " . $thedir . "modelcdt.gv " . $thedir . "/modelerd.gv");
      $command = "java -jar umplesync.jar -generate " . $language . " {$filename} " . $suboptions . " 2> {$errorFilename}";
  }
  // Took off 1> {$outputFilename}  in two commands above
  $resultFromCommand = executeCommand($command);

  $dataHandle->writeData(basename($outputFilename), $resultFromCommand);
  //exec("( ulimit -t 10; " . $command . ")");
  
  // Restore file so it doesn't have the 'generate' command in front
  $dataHandle->writeData($dataname, $input);
  
  $sourceCode = $resultFromCommand;
  
  $sourceCode = str_replace("<?php","",$sourceCode);
  $sourceCode = str_replace("?>","",$sourceCode);
  $sourceCode = htmlspecialchars($sourceCode);
  
  $errhtml = getErrorHtml($errorFilename);
  
  if ($sourceCode == "")
  {
    if($input == "//$?[End_of_model]$?") {
      $html = "
        Please create an Umple model textually (on the left side of the screen)
        or visually (on the right side of the screen),
        and then choose Generate Code again.";
    }
    else
    {
      $html = "
        An error occurred interpreting your Umple code, please review it and try again.
        If the problem persists, please consult the user manual or ask a question on Stack Overflow with the umple tag";
    }
    echo $errhtml ."<p>URL_SPLIT" . $html;
    
  }
  else
  {
    if ($javadoc)
    {
       $thedir = dirname($outputFilename);
       exec("rm -rf " . $thedir . "/javadoc");

        $command = "javadoc -d " . $thedir . "/javadoc -footer \"Generated by Umple\" " ;
              
      foreach (glob("$thedir/{$language}/*/*/*/*.java") as $afile) {
          $command = $command . " " . $afile;
       }
       
       foreach (glob("$thedir/{$language}/*/*/*.java") as $afile) {
          $command = $command . " " . $afile;
       }    
       
       foreach (glob("$thedir/{$language}/*/*.java") as $afile) {
          $command = $command . " " . $afile;
       }    
       
       foreach (glob("$thedir/{$language}/*.java") as $afile) {
          $command = $command . " " . $afile;
       }                  
       
       exec($command." 2>&1",$outputlines,$retcode);
       if(!file_exists("$thedir/javadoc")) {
         // Javadoc failed
         $html="Javadoc was not able to produced any output, since there are errors in the embedded Java. Look for syntax errors the embedded code in methods, guards, conditions and aspects . ";
         foreach($outputlines as $outputline){
           $foundresult=strstr($outputline,"error:");
           if($foundresult != FALSE) $html = $html . "<br/><b>".$foundresult."</b>\n";
         }
       }
       else {
         exec("cd $thedir; rm javadocFromUmple.zip; zip -r javadocFromUmple javadoc");
       
         $javadocdir = $workDir->makePermalink('javadoc/');
         $javadoczip = $workDir->makePermalink('javadocFromUmple.zip');
         $html = "<a href=\"{$javadoczip}\" title=\"Download the Javadoc website as a Zip file if you would like to be able to install it locally\">Download the following as a zip file</a>&nbsp;{$errhtml}
         <iframe width=100% height=1000 src=\"" . $javadocdir . "\">This browser does not
         support iframes, so the javadoc cannot be displayed</iframe> 
         ";
       }
       echo $html;
    }  // end javadoc
    
    else if ($stateDiagram) {
      $thedir = dirname($outputFilename);
      exec("rm -rf " . $thedir . "/stateDiagram.svg");
      $command = "dot -Tsvg " . $thedir . "/model.gv -o " . $thedir .  "/stateDiagram.svg"; 
      exec($command);
            if (!file_exists($thedir . "/stateDiagram.svg") && file_exists("doterr.svg"))
            {
                exec("cp " . "./doterr.svg " . $thedir . "/stateDiagram.svg");
            }
      $svgcode = readTemporaryFile("{$thedir}/stateDiagram.svg");
      $gvlink = $workDir->makePermalink('model'.$generatorType.'.gv');      
      $svglink = $workDir->makePermalink('stateDiagram.svg');
      $html = "<a href=\"$gvlink\">Download the GraphViz file for the following</a>&nbsp;<a target=\"_GraphVizOutput\" href=\"$svglink\">Download the SVG file for the following</a>&nbsp;<br/>{$errhtml}&nbsp;
      <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" height=\"2000\" width=\"2000\">";
      echo $html;
      $changesToMake = 1;
      $shrunksvgcode = preg_replace($svg_regex,$svg_scale,$svgcode,$changesToMake);
      echo $shrunksvgcode;
      echo "</svg>"; 
    } // end state diagram

    else if ($featureDiagram) {
      $thedir = dirname($outputFilename);
      exec("rm -rf " . $thedir . "/featureDiagram.svg");
      $graphviz_layout = "dot"; //default layout for feature diagram.
      if($featureDependency)
      $graphviz_layout = "circo";
      $command = $graphviz_layout ." -Tsvg " . $thedir . "/modelGvFeatureDiagram.gv -o " . $thedir .  "/featureDiagram.svg";
      exec($command);
      if (!file_exists($thedir . "/featureDiagram.svg") && file_exists("doterr.svg"))
      {
        exec("cp " . "./doterr.svg " . $thedir . "/featureDiagram.svg");
      }
      $svgcode = readTemporaryFile("{$thedir}/featureDiagram.svg");
      $gvlink = $workDir->makePermalink('modelGvFeatureDiagram.gv');
      $svglink = $workDir->makePermalink('featureDiagram.svg');
      
      $html = "<a href=\"$gvlink\">Download the GraphViz file for the following</a>&nbsp;<a target=\"_GraphVizOutput\" href=\"$svglink\">Download the SVG file for the following</a>&nbsp;<br/>{$errhtml}&nbsp;
      <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" height=\"2000\" width=\"2000\">";
      echo $html;
      $changesToMake = 1;
      $shrunksvgcode = preg_replace($svg_regex,$svg_scale,$svgcode,$changesToMake);
      echo $shrunksvgcode;
      echo "</svg>";   
    }
    
    else if ($classDiagram) {
      $thedir = dirname($outputFilename);
      exec("rm -rf " . $thedir . "/classDiagram.svg");
      $command = "dot -Tsvg " . $extradotargs . $thedir . "/model" . $generatorType . ".gv -o " . $thedir .  "/classDiagram.svg";
      exec($command);
            if (!file_exists($thedir . "/classDiagram.svg") && file_exists("doterr.svg"))
            {
                exec("cp " . "./doterr.svg " . $thedir . "/classDiagram.svg");
            }
      $svgcode = readTemporaryFile("{$thedir}/classDiagram.svg");
      $gvlink = $workDir->makePermalink('model'.$generatorType.'.gv');
      $svglink = $workDir->makePermalink('classDiagram.svg');
      $html = "<a href=\"$gvlink\">Download the GraphViz file for the following</a>&nbsp;<a target=\"_GraphVizOutput\" href=\"$svglink\">Download the SVG file for the following</a>&nbsp;<br/>{$errhtml}&nbsp;
      <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" height=\"2000\" width=\"2000\">";
      echo $html;
      $changesToMake = 1;
      $shrunksvgcode = preg_replace($svg_regex,$svg_scale,$svgcode,$changesToMake);
      echo $shrunksvgcode;
      echo "</svg>";      
    } // end graphViz class diagram

    else if ($entityRelationshipDiagram) {
      $thedir = dirname($outputFilename);
      exec("rm -rf " . $thedir . "/entityRelationshipDiagram.svg");
      $command = "dot -Tsvg " . $extradotargs . $thedir . "/modelerd.gv -o " . $thedir .  "/entityRelationshipDiagram.svg";
      exec($command);
      if (!file_exists($thedir . "/entityRelationshipDiagram.svg") && file_exists("doterr.svg"))
      {
        exec("cp " . "./doterr.svg " . $thedir . "/entityRelationshipDiagram.svg");
      }
      $svgcode = readTemporaryFile("{$thedir}/entityRelationshipDiagram.svg");
      $gvlink = $workDir->makePermalink('modelerd.gv');
      $erdiagramlink = $workDir->makePermalink('entityRelationshipDiagram.svg');
      $html = "<a href=\"$gvlink\">Download the GraphViz file for the following</a>&nbsp;<a target=\"_GraphVizOutput\" href=\"$erdiagramlink\">Download the SVG file for the following</a>&nbsp;<br/>{$errhtml}&nbsp;
      <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" height=\"2000\" width=\"2000\">";
      echo $html;
      $changesToMake = 1;
      $shrunksvgcode = preg_replace($svg_regex,$svg_scale,$svgcode,$changesToMake);
      echo $shrunksvgcode;
      echo "</svg>";      
    } // end graphViz entity relationship diagram
    
    else if ($yumlDiagram) {
      $thedir = dirname($outputFilename);
      exec("rm -rf " . $thedir . "/yuml.txt");
      copy($thedir . "/model.ump.output", $thedir .  "/yuml.txt");
      $command = "python yuml.py -i " . $thedir . "/yuml.txt -o " . $thedir .  "/yuml.png -s plain ";   
      $res = shell_exec($command . " 2>&1");           
      $yumllink = $workDir->makePermalink('yuml.txt');
      $imglink = $workDir->makePermalink('yuml.png');
      
      if (file_exists($thedir . "/yuml.png"))
      {
        $dltext = "&nbsp;<a target=\"YmlImage\" href=\"$imglink\">Download the PNG file for the image</a>&nbsp;<br/>
      <img src=\"$imglink\"\>";
      }
      else
      {
        // could not generate either because of Python problem
        // or the yuml server not delivering because it doesn't like automated systems
        $yumltxt = file_get_contents($thedir."/yuml.txt");        
        $dltext = "<a target=\"yumlimg\" href=\"http://yuml.me/diagram/plain/class/".$yumltxt.".php\">Click on this link to display the png in a different Tab (yuml.me doesn't like automated systems generating their images)</a>&nbsp;";
      }  

      $html = "<a target=\"YmlImage\" href=\"$yumllink\">Download the Yuml text for the yuml image</a>. You can then use this text to generate various image formats at <a target=\"yumlimg\" href=\"https://yuml.me/diagram/plain/class/draw\">yuml.me</a>&nbsp;<br/>$dltext";
      echo $html;
    } // end yuml diagram  

    else // This is where the Java, PHP and other output is placed on the screen
    {
       exec("cd $thedir; rm {$language}FromUmple.zip; zip -r {$language}FromUmple {$language}");
       if($language=="Java") {
         $controloextra=" As an alternative, you could also use control-o on a Mac or Linux machine to copy the Java code as well as compilation commands into your copy buffer; then in any terminal you would be able to paste the result to compile the Umple file to Java, with instructions on how to run any main program";
       }
       else {
         $controloextra="";
       }
       $archivelink = $workDir->makePermalink($language.'FromUmple.zip');
       echo "<a href=\"$archivelink\" class=\"zipDownloadLink\" title=\"Download the generated code as a zip file. You can then unzip the result, compile it and run it on your own computer.".$controloextra."\">Download the following as a zip file</a>&nbsp;{$errhtml}<p>URL_SPLIT";
       echo $sourceCode;
    }
  }
  } // end not UIGU
  else
  {  // is UIGU
    // variables here come from the uigu clause in the previous if statement
    // for all relative paths we assume we are chdir'd into a specific directory by showUserInterface
    $theurldir = $workDir->getPath();
    $filename = $theurldir.'/'.$dataname;
    $errorFilename = "{$filename}.erroroutput";
    $errhtml = getErrorHtml($errorFilename);
    $uiguDir=file_get_contents("uigudir.txt");
    $uiguIframe = $workDir->makePermalink('');
    $warlink = $workDir->makePermalink('umpleUIGU.war');
    $html = "<a href=\"$warlink\">Download the generated application as web archive (WAR) file.</a>&nbsp;{$errhtml}
      <iframe width=100% height=300 src='$uiguIframe/'></iframe>
     ";
     echo $html;
  }
}  // end request has umpleCode

// Load an official UmpleOnline example
else if (isset($_REQUEST["exampleCode"]))
{
  $exampleName=$_REQUEST["exampleCode"];
  if (substr($exampleName,0,4) == 'http') {
     // Load from a separate URL (new off-repo examples)
     // This code is similar to if #_REQUEST is load as earlier
     $outputUmple = file_get_contents($exampleName);
     echo $outputUmple;     
  }
  else {
    // Load from the umplibrary directory (normal case)
    $filename = rootDir()."/umplibrary/" . $exampleName;
    $outputUmple = readTemporaryFile($filename);
    echo $outputUmple;
  }
}
else if (isset($_REQUEST["asImage"]))
{
  $asImage = $_REQUEST["asImage"];
  $json = json_decode($asImage);
  showUmlImage($json);
}
else if (isset($_REQUEST["asYuml"]))
{
  showYumlImage($_REQUEST["asYuml"]);
}
else if (isset($_REQUEST["asUI"]))
{ 
  showUserInterface($_REQUEST["asUI"]);
}
else
{
  echo "Invalid use of compiler";
}

function translateToLineNums($errortext) {
  $repPattern= '/model.ump:(\d+)/';

  $findRegPattern= '/.*model.ump:(\d+).*/';
  $findRepl='$1';

  $output="";
  $numout="";

  $separator = "\r\n";
  $line = strtok($errortext, $separator);
  while ($line !== false) {
    $numout =preg_replace($findRegPattern,$findRepl, $line,1,$numfound);
    if($numfound==0) {
      $numout="";
    }
    else
    {
      $numout -=1;
    }
    $replacement= '<a href="javascript:Action.setCaretPosition('.$numout.');Action.updateLineNumberDisplay();">model.ump:'.$numout.'</a>';

    $output .=preg_replace($repPattern,$replacement, $line)."\n";
    //$output = $output.$line."\n";
    $line = strtok($separator); // get next one
  }

  return $output;
}

function getErrorHtml($errorFilename, $offset = 1) 
{
    
  $errorMessage = readTemporaryFile($errorFilename);

  if($errorMessage != "") 
  {
     savefile("",$errorFilename); // Clean error so it is gone for next time
     $errInfo = jsonDecode($errorMessage);
     $errhtml = "<a href='#' id='errorClick'>Show/Hide errors and warnings</a>";
     $errhtml .= "<div id='errorRow' colspan='3' >";  // style='display:none'
     
     if($errInfo == null)
     {
        $errhtml .= "<pre>".$errorMessage."</pre>";
     }
     else
     {
        $results = $errInfo["results"];
        
        
        foreach($results as $result)
        {
            $url = $result["url"];
            $line = intval($result["line"]) - $offset; 
            $errorCode = $result["errorCode"];
            $severityInt = intval($result["severity"]);
            if($severityInt > 2) {
              $severity = "Warning";
              $textcolor = "<font color=\"black\">";
            }
            else
            {
              $severity = "Error";
              $textcolor = "<font color=\"red\">";
            }
            $msg = htmlspecialchars($result["message"]);
                        
            $errhtml .= $textcolor." {$severity} on <a href=\"javascript:Action.setCaretPosition({$line});Action.updateLineNumberDisplay();\">line {$line}</a> : {$msg}.</font> <i><a href=\"{$url}\" target=\"helppage\">More information ({$errorCode})</a></i></br>";
        }
     }
    
     $errhtml .= "</div>";
        
     $errhtml .= "<script type=\"text/javascript\">jQuery(\"#errorClick\").click(function(a){a.preventDefault();jQuery(\"#errorRow\").toggle();});</script>";
     return $errhtml;
  }
  return "";
}

function executeCode($modelName, $error) 
{
  $language=$_REQUEST['language'];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL,"{$GLOBALS['EXECUTION_SERVER']}/run");
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, "path={$modelName}&error={$error}&language={$language}");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $content = curl_exec($ch);
  if (curl_errno($ch)) {
      $error_msg = curl_error($ch);
  }
  curl_close($ch);

  if (isset($error_msg)) {
    return "The docker service to execute code is not working. Please contact the system administrator for help.\n".$error_msg;
  } else {
    return $content;
  }
}

// taken from http://php.net/manual/en/function.json-decode.php
function jsonDecode ($json) 
{ 
      $json = str_replace(array("\\\\", "\\\""), array("&#92;", "&#34;"), $json); 
      $parts = preg_split("@(\"[^\"]*\")|([\[\]\{\},:])|\s@is", $json, -1, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE); 
      foreach ($parts as $index => $part) 
      { 
          if (strlen($part) == 1) 
          { 
              switch ($part) 
              { 
                  case "[": 
                  case "{": 
                      $parts[$index] = "array("; 
                      break; 
                  case "]": 
                  case "}": 
                      $parts[$index] = ")"; 
                      break; 
                  case ":": 
                    $parts[$index] = "=>"; 
                    break;    
                  case ",": 
                    break; 
                  default: 
                      return null; 
              } 
          } 
          else 
          { 
              if ((substr($part, 0, 1) != "\"") || (substr($part, -1, 1) != "\"")) 
              { 
                  return null; 
              } 
          } 
      } 
      $json = str_replace(array("&#92;", "&#34;", "$"), array("\\\\", "\\\"", "\\$"), implode("", $parts)); 
      return eval("return $json;"); 
} 
?>