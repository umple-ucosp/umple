%File contains logic related to generating imports


%Given a certain list of classes/interfaces a class imports/implements,
% the class body pre translation and
% the class body post translation,
% generates all imports for that class
function createImports classBody [class_body_decl] inheritances [repeat inheritance_list] translatedBody [class_body_decl]
    replace [repeat import_statement]
        empty [repeat import_statement]
    construct declarations [repeat member_variable_declaration]
        _ [^ classBody]
    construct inheritanceImports [repeat id]
        _ [extractInheritanceImportClasses each inheritances]
    construct allImports [repeat import_statement]
        _ [addImportStatement each inheritanceImports] [addExternalImports translatedBody]
    by
        allImports
end function

%Creates the basic import template and adds it to the repeat
function addImportStatement a [id]
    replace [repeat import_statement]
        imports [repeat import_statement]
    construct newImport [import_statement]
        'from a 'import a
    by
        imports [. newImport]
end function

%Extracts classes from the declarations that are not class enums or default java types
%These classes are added to a repeat
%This repeat is used inside class methods
%If a class method contains any of these Ids they are imported at the top of the class
function extractPossibleFunctionImports declaration [member_variable_declaration]
    replace [repeat id]
        empty [repeat id]
    deconstruct declaration
        _[opt acess_modifier] _[opt static] _[opt final] _[opt volatile] class [nested_identifier] _[id] _[opt member_variable_assignment] ';
    construct classesToImport [repeat id]
        _ [extractListClass class] [extractRegularClass class]
    by
        empty [addToRepeatIfNotThere each classesToImport]
end function

%Checks if arg Id is the name of an Enum
function isTypeEnum typeName [id]
    match * [enum_declaration]
        _ [opt acess_modifier] 'enum enumName [id] '{ _ [list id]'}
    where
        enumName [= typeName]
end function

%Extracts names of every inherited class and implemented interface if they pass the filter
%The outputed list is then used for the python class extends
function extractInheritanceBlockClasses inheritanceList [inheritance_list]
    replace [list nested_identifier]
        classes [list nested_identifier]
    deconstruct inheritanceList
        _[inheritance_statement] classesToAdd [list nested_identifier]
    by
        classes [inheritanceClassFilter each classesToAdd]
end function

%Inherited class / implemented interface name filter
function inheritanceClassFilter class [nested_identifier]
    replace [list nested_identifier]
        classes [list nested_identifier]
    construct unparsed [stringlit]
        _ [unparse class]
    construct filter [repeat nested_identifier]
        'java.io.Serializable
    where not
        filter [containsNestedClass class]
	where not
		unparsed [= 'TimerTask]
    by
        classes [, class]
end function

%From the list of inherited classes / implemented interfaces
% extracts class names that need to be imported at the top of the python file
function extractInheritanceImportClasses inheritanceList [inheritance_list]
    replace [repeat id]
        classesToImport [repeat id]
    deconstruct inheritanceList
        _[inheritance_statement] classesToAdd [list nested_identifier]
    construct classIds [repeat id]
        _ [extractListClass each classesToAdd] [extractRegularClass each classesToAdd]
    by
        classesToImport [. classIds]
end function

%Used to merge to repeats and ensure there are no duplicates
%Assumes the list being matched has no duplicates already
function concatenateRepeatNoDuplicates elems [repeat id]
    replace [repeat id]
        currentList [repeat id]
    by
        currentList [addToRepeatIfNotThere each elems]
end function

%Add an id to repeat id if it is not already present
function addToRepeatIfNotThere elem [id]
    replace [repeat id]
        currentList [repeat id]
    where not
        currentList [containsId elem]
    by
        currentList [. elem]
end function

% extracts ids from generic class arguments, usually ArrayLists<> but possibly other types
% extracted types that pass the filter for default java types and class enums are added to results
function extractListClass class [nested_identifier]
    replace [repeat id]
        empty [repeat id]
    deconstruct class
        _ [id]'< ids [list id] '>
    construct unfiltered [repeat id]
        _ [listToRepeat ids]
    construct filtered [repeat id]
        _ [filterOutUnwantedTypes unfiltered]
    by
        filtered
end function

%Filters types from a repeat id
function filterOutUnwantedTypes ids [repeat id]
    replace [repeat id]
        empty [repeat id]
    by
        empty [importClassFilter each ids]
end function

%Filters out default java types and Enum names
function importClassFilter type [id]
    replace [repeat id]
        current [repeat id]
    where not
        type [matchDefaultType]
    import enumeratorDeclerations [repeat enum_declaration]
    where not
        enumeratorDeclerations [isTypeEnum type]
    import className [nested_identifier]
    deconstruct className
        classNameId [id]
    where not
        classNameId [= type]
	where not
		type [= 'TimerTask]
    by
        current [. type]
end function

%Checks if type is a default Java type
rule matchDefaultType
    match [id]
        id [id]
    construct defaults [repeat id]
        'byte 'short 'int 'long 'float 'double 'boolean 'char 'String 'Array
    where
        defaults [containsId id]
end rule

%Given a nested_identifier class, extracts id className if it passes filter
function extractRegularClass class [nested_identifier]
    replace [repeat id]
        empty [repeat id]
    deconstruct class
        id [id]
    by
        empty [importClassFilter id]
end function

%Translates an id list to an id repeat
function listToRepeat ids [list id]
    replace [repeat id]
        aRep [repeat id]
    by
        aRep [. each ids]
end function

%Utility function used to check if an id is present
%Used a little everywhere
rule containsId Object [id]
    match [id]
        Object
end rule

%Utility function used to check if an nested_identifier is present
rule containsNestedClass Object [nested_identifier]
    match [nested_identifier]
        Object
end rule

%--------------------%
%  External imports  %
%--------------------%
%The following sections takes care of managing imports to external module
%THe classes imported have nothing to do with the Umple classes defined by the user,
% but are needed to replicate some java functionalities in python


%Func compiles all the external imports
function addExternalImports translatedBody [class_body_decl]
    replace [repeat import_statement]
        imports [repeat import_statement]
    by
        imports [addOSImportIfNeeded translatedBody]
        [addThreadImportForSynchronizedIfNeeded translatedBody]
        [addEnumImportIfNeeded translatedBody]
        [addPickleImportIfNeeded]
        [addSysImportIfNeeded translatedBody]
        [addThreadImportIfNeeded translatedBody]
        [addTimeImportIfNeeded translatedBody]
end function

%Adds an Os import if needed. os is used in the __str__ methods for newLines
function addOSImportIfNeeded body [class_body_decl]
    replace [repeat import_statement]
        imports [repeat import_statement]
    where
        body [shouldOsImport]
    construct newImport [import_statement]
        'import 'os
    by
        imports [. newImport]
end function

%Checks for newline in translated class body
function shouldOsImport
    match * [nested_identifier]
        'os.linesep
end function

%Adds an ENum import if needed. Enum is needed as default python doesnt handle Enums easily
function addEnumImportIfNeeded body [class_body_decl]
    replace [repeat import_statement]
        imports [repeat import_statement]
    where
        body [shouldEnumImport]
    construct newImport [import_statement]
        'from 'enum 'import 'Enum, 'auto
    by
        imports [. newImport]
end function

%Check for an Enum declaration in class body
function shouldEnumImport
    match * [enum_declaration]
        _ [enum_declaration]
end function

%Adds a Pickle import if needed. Pickle is used for serialization, while Java classes can implement serializable
function addPickleImportIfNeeded
    replace [repeat import_statement]
        imports [repeat import_statement]
    import Imports [repeat import_statement]
    where
        Imports [shouldImportPickle]
    construct newImport [import_statement]
        'import 'pickle
    by
        imports [. newImport]
end function

%Checks if java class imported Serializable
function shouldImportPickle
    match * [import_statement]
        'import 'java.io.Serializable;
end function

%Adds sys import if needed . Sys is used to pass console args to the main method (to emulate java behavior)
function addSysImportIfNeeded body [class_body_decl]
    replace [repeat import_statement]
        imports [repeat import_statement]
    where
        body [matchMainMethod]
    construct newImport [import_statement]
        'import 'sys
    by
        imports [. newImport]
end function

%Adds Thread import if needed
function addThreadImportIfNeeded body [class_body_decl]
    replace [repeat import_statement]
        imports [repeat import_statement]
    where
        body [shouldThreadImport]
    construct newImport [import_statement]
        'from 'threading 'import 'Thread
    by
        imports [. newImport]
end function

%Adds time import if needed
function addTimeImportIfNeeded body [class_body_decl]
    replace [repeat import_statement]
        imports [repeat import_statement]
    where
        body [shouldTimeImport]
    construct newImport [import_statement]
        'import 'time
    by
        imports [. newImport]
end function

%Adds an Thread import if synchronized keyword is being used
function addThreadImportForSynchronizedIfNeeded body [class_body_decl]
    replace [repeat import_statement]
        imports [repeat import_statement]
    import possibleSynchronized [opt synchronized]
    deconstruct possibleSynchronized
      _ [synchronized]
    construct newImport [import_statement]
        'from ' threading 'import 'Lock
    by
        imports [. newImport]
end function

%Checks for time.sleep in translated class body
function shouldTimeImport
    match * [nested_identifier]
        'Thread
end function

%Checks for thread in translated class body
function shouldThreadImport
    match * [nested_identifier]
        'Thread
end function
