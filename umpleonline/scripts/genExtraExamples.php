<?php
/*
Run periodically to regenerate the menu listings for extra
example menus in UmpleOnline

If run manually you must be in the umpleonline directory and run
php scripts/genExtraExamples.php
*/


try {
  $dirIterator = new DirectoryIterator('umplibrary/extraExamples1');
}
catch (Exception $e) {
  echo "umplibrary/extraExamples1 ... likely not being run from umpleonline dir";
}
// Loop through each file in the examples1 directory
foreach ($dirIterator as $fileInfo) {
  if($fileInfo->isDot()) continue;
  $fileNameFound = $fileInfo->getFilename();
  if(substr($fileNameFound,-4,4) != ".ump") continue;
  $file = $fileInfo->openFile();
  // Loop through each line in the file, to obtain the Title
  while (!$file->eof()) {
    // get the current line
    $line  =  $file->fgets();

    // extract the title, when found
    if (!strcmp("Title: ",substr($line,0,7))) {
      $titleFound=substr($line,7,-1);

      $newLine = "<option name = \"optionExample\" value=\"extraExamples1/".
        $fileNameFound."\">".$titleFound."</option>\n";
     // We will store the menu items in an associative array so we can sort it

      $foundOptions[$titleFound] = $newLine;
      
      break;
    }
  }
  $file = null; // documentation says need to do this to close file
}

// Sort the found items


//Prepare to re-create the data files containing the menu items
$fhandleAD = fopen("generatedExtraExample1OptionsAD.html","w");
$fhandleEL = fopen("generatedExtraExample1OptionsEL.html","w");
$fhandleMP = fopen("generatedExtraExample1OptionsMP.html","w");
$fhandleQZ = fopen("generatedExtraExample1OptionsQZ.html","w");

// Sort the array
ksort($foundOptions);

// Output the groups
foreach($foundOptions as $title => $line) {
  if(substr($title,0,1)<="D") {
    fwrite($fhandleAD,$line);
  }
  else if(substr($title,0,1)<="L") {
    fwrite($fhandleEL,$line);
  }
  else if(substr($title,0,1)<="P") {
    fwrite($fhandleMP,$line);
  }
  else {
    fwrite($fhandleQZ,$line);
  }

}

fclose($fhandleAD);
fclose($fhandleEL);
fclose($fhandleMP);
fclose($fhandleQZ);

?>