%--------------------%
%     Methods        %
%--------------------%
%This file contains logic for python translation at the method level

function replaceAllMethods memberVariables [repeat id]
    replace [repeat class_body_element]
        elems [repeat class_body_element]
    construct filtered [repeat class_body_element]
        _ [filterOutFunctions each elems]
    by
        filtered
            [replaceConstructor memberVariables]
            [fixMultipleConstructors]
            [removeOverrideDecorator]
            [removeSurpressWarningDecorator]
            [replaceAbstractMethod]
            [replaceUserMethod]
            [replaceConcreteMethod]
            [addGetState]
            [addDisambiguationMethods]
end function

%No need to specify overrides in python
rule removeOverrideDecorator
    replace [opt decorator]
        '@Override
    by
        _
end rule

%DEBUG
function removeSynchronizedInMethod
    replace [id]
        'synchronized
    by
        's
end function

%function replaceToStringMethodName
%    replace [id]
%        'toString
%    by
%        '__str__
%end function

%Not needed in python
rule removeSurpressWarningDecorator
    replace [opt decorator]
        '@SuppressWarnings( _ [list base_value] ')
    by
        _
end rule

%Replaces concrete, non user methods
%DEBUG
rule replaceConcreteMethod
    replace [concrete_method_declaration]
        _[acess_modifier] possibleSynchronized [opt synchronized] possibleStatic [opt static] _[nested_identifier] methodName [id]'( params [list method_parameter] ') _ [opt throws] '{ statements [repeat statement] '}
    export possibleSynchronized
    construct newParams [list method_parameter]
        _ [getPythonParams params possibleStatic]
    construct possibleStaticDecorator [repeat decorator]
        _ [createStaticDecorator possibleStatic]
    construct newSyncStatements [repeat statement]
        _ [createNewSyncStatements statements possibleSynchronized]
    construct nonSyncStatements [repeat statement]
        _ [createNonSyncStatements statements possibleSynchronized]
    by
        possibleStaticDecorator 'def methodName [replaceSpecificMethodNames] [changeOverloadedMethodName params] '( newParams '):  newSyncStatements [. nonSyncStatements]
            [manageSpecialTypes params]
            [replaceStatements]
            [changeKeyArgumentNameInNestedIdentifier]
            [addFunctionImports]
            [addStrIfNeeded methodName]
end rule

%DEBUG
function createNewSyncStatements statements [repeat statement] possibleSynchronized [opt synchronized]
    replace [repeat statement]
        s [repeat statement]
    deconstruct possibleSynchronized
        _ [synchronized]
    import className [nested_identifier]
    construct stateDeclaration [statement]
        className '. 'umplePythonSyncLock '. 'acquire '( ')
    construct stateDeclaration2 [statement]
        className '. 'umplePythonSyncLock '. 'release '( ')
    by
         stateDeclaration statements [. stateDeclaration2]
end function

%DEBUG
function createNonSyncStatements statements [repeat statement] possibleSynchronized [opt synchronized]
    replace [repeat statement]
        s [repeat statement]
    deconstruct not possibleSynchronized
        _ [synchronized]
    by
        statements
end function

% s [. stateDeclaration] [. stateDeclaration2]
%Creates a static decorator if needed. Otherwise returns empty
function createStaticDecorator possibleStatic [opt static]
    replace [repeat decorator]
        result [repeat decorator]
    deconstruct possibleStatic
        _ [static]
    construct staticDecorator [decorator]
        '@staticmethod
    by
        result [. staticDecorator]
end function

%DEBUG
%should create lock statement if sync keyword is used else return empty
function createSyncDecorator possibleSync [opt synchronized]
    replace [lock_statement]
        result [lock_statement]
    deconstruct possibleSync
        _ [synchronized]
    construct lock [lock_statement]
        'lockacquire
    by
        lock
end function

%DEBUG
%function replaceSynchronizedWithLocksInsideMethods possibleSynchronized [opt synchronized]
%    replace [repeat decorator]
%        result [repeat decorator]
%    deconstruct possibleSynchronized
%        _ [synchronized]
%    construct staticDecorator [decorator]
%        '@staticmethod
%    by
%        result [. staticDecorator]
%end function

%Translates abstract methods
rule replaceAbstractMethod
    replace [abstract_method_declaration]
        _[acess_modifier] _ [opt 'abstract] _[nested_identifier] methodName [id] '( params [list method_parameter] ');
    construct empty [opt static]
        _
    construct newParams [list method_parameter]
        _ [getPythonParams params empty]
    by
        '@abstractmethod 'def methodName [replaceSpecificMethodNames] '( newParams '): 'pass
end rule

%TODO
%Implment synchronized logic for user methods?
%Translates user methods, methods that contain tagged user specified code
rule replaceUserMethod
    replace [concrete_method_declaration]
        _[acess_modifier] possibleStatic [opt static] _[nested_identifier] methodName [id]'( params [list method_parameter] ') _ [opt throws] '{ _ [repeat statement] content [usercode] _[repeat statement] '}
    construct newParams [list method_parameter]
        _ [getPythonParams params possibleStatic]
    construct possibleStaticDecorator [repeat decorator]
        _ [createStaticDecorator possibleStatic]
    by
        possibleStaticDecorator 'def methodName '( newParams '):  content
end rule

%Given java params, which includes classes (ex: int num, String name), extracts the python params (ex: self, num, name)
function getPythonParams javaParams [list method_parameter] possibleStatic [opt static]
    replace [list method_parameter]
        _ [list method_parameter]
    construct selfParam [list method_parameter]
        _ [addSelfIfNotStatic possibleStatic]
    construct modifiedParams [list method_parameter]
        _ [translateParam each javaParams]
    by
        selfParam [, modifiedParams] [changeKeyArgumentNames]

end function

%Adds the self param to param list if the method is not static
function addSelfIfNotStatic possibleStatic [opt static]
    replace [list method_parameter]
        result [list method_parameter]
    deconstruct possibleStatic
        _ [empty]
    construct selfParam [method_parameter]
        'self
    by
        result [, selfParam]
end function

%Some methods' names are changed during translation to match python standard
function replaceSpecificMethodNames
    replace [id]
        funcName [id]
    by
        funcName
            [removeSynchronizedInMethod]
            [replaceToStringMethodName]
            [replaceHashCodeMethodName]
end function

function replaceToStringMethodName
    replace [id]
        'toString
    by
        '__str__
end function

function replaceHashCodeMethodName
    replace [id]
        'hashCode
    by
        '__hash__
end function

%In toString functions, this rule adds str() around all the non string values in the concatenation
%This is because python does not allow string/number concatenantion like java
rule addStrIfNeeded functionName [id]
    where functionName [= 'toString]
    skipping [parentheses_value]
    replace $ [value]
        baseVal [base_value] cont [value_continuation]
    where not
        baseVal [isString]
    by
        'str( baseVal ') cont
end rule

function isString
    match [base_value]
        _ [stringlit]
end function

%Replaces class constructor
rule replaceConstructor memberVariables [repeat id]
    replace [constructor]
         mod [acess_modifier] className [id]'( params [list method_parameter] ') _ [opt throws] '{ statements [repeat statement]  '}
    construct selfParam [list method_parameter]
        'self
    construct modifiedParams [list method_parameter]
        _ [translateParam each params]
    construct newParams [list method_parameter]
        selfParam [, modifiedParams] [changeKeyArgumentNames]
    by
        'def '__init__( newParams '):
            statements
                [addNoneAssignments each memberVariables]
                [manageSpecialTypes params]
                [replaceStatements]
                [changeKeyArgumentNameInNestedIdentifier]
                [addFunctionImports]
end rule

%For serialzation
%In Java transient members are not serialized. If there are transient members, we then add this __getState__ function.
%This is called when serializing the object. We can then specify not to serialize the transient members.
function addGetState
    replace [repeat class_body_element]
        rep [repeat class_body_element]
    import transientMembers [repeat id]
    construct transientCount [number]
        _ [length transientMembers]
    where
        transientCount [> 0]
    construct stateDeclaration [repeat statement]
        'state '= 'dict(self '.__dict__ ')
    construct pops [repeat statement]
        _ [createGetStatePop each transientMembers]
    construct returnStatement [statement]
        'return 'state
    construct getStateStatements [repeat statement]
        stateDeclaration [. pops] [.returnStatement]
    construct getStateFunc [class_body_element]
        'def '__getstate__(self):
            getStateStatements
    by
        rep [. getStateFunc]
end function

%Pops a transient member from the returned state so we dont serialize it
function createGetStatePop id [id]
    replace [repeat statement]
        result [repeat statement]
    construct memberAsString [stringlit]
        _ [unparse id]
    construct underscore [stringlit]
        "_"
    construct memberAsStringWithUnderscore [stringlit]
        underscore [+ memberAsString]
    construct pop [statement]
        'state '.pop( memberAsStringWithUnderscore ')
    by
        result [. pop]
end function

%Rule replaces argument names that are illegal in python
rule changeKeyArgumentNames
    skipping [nested_identifier]
    replace $ [id]
        argName [id]
    by
        argName
            [replaceInKeyArgument]
end rule

%Argument names that were replaced in the rule changeKeyArgumentNames are also changed in the method code
rule changeKeyArgumentNameInNestedIdentifier
    replace $ [nested_identifier]
        root [id] rep [repeat attribute_access]
    by
        root [changeKeyArgumentNames]  rep
end rule

%in is a keyword in python, but is somethimes an argument name generated by the umple java generator
rule replaceInKeyArgument
    replace [id]
        'in
    by
        'input
end rule

%At the start of constructors, we instatiate every member variable to None
%In java we do not need this as member variable are declared before the constructor
%This prevents error when we try to access variables that have not been instantiated yet
function addNoneAssignments memberVariable [id]
    replace [repeat statement]
        stmts [repeat statement]
    construct noneAssignment [repeat statement]
        memberVariable '= 'None
    by
        noneAssignment [. stmts]
end function

%Given a java method parameter (Ex: String name), adds the python method paramter (ex: name) to the list
function translateParam PreviousParam [method_parameter]
    replace [list method_parameter]
        SequenceSoFar [list method_parameter]
    construct translated [method_parameter]
        PreviousParam [translateRegularParam] [translateVarArgParam]
    by
        SequenceSoFar [, translated]
end function

%In this case, we just retrun the param name without the java class before it
function translateRegularParam
    replace [method_parameter]
        _ [nested_identifier] paramName [id]
    construct cleanName [id]
        paramName [changeKeyArgumentNames]
    by
        cleanName
end function

%Syntax for variable arguments differs between python and java
function translateVarArgParam
    replace [method_parameter]
        _ [nested_identifier] '... paramName [id]
    construct cleanName [id]
        paramName [changeKeyArgumentNames]
    by
        '* cleanName
end function

%To avoid circular imports, we attempt to import most modules inside of functions
%If any of the ids we have exported as possible imports are present in the function code,
% we import the module at the beginning of the function
function addFunctionImports
    replace [repeat statement]
        stmts [repeat statement]
    import possibleFunctionImports [repeat id]
    by
        stmts [addFunctionImport each possibleFunctionImports][addTimerImport each possibleFunctionImports]
end function

%Creates specific function import if needed
function addFunctionImport seeking [id]
    replace [repeat statement]
        stmts [repeat statement]
    where
        stmts [containsId seeking]
    construct imp [import_statement]
        'from seeking 'import seeking
    where not 
        seeking [= 'Timer]
	where not 
		seeking [= 'TimedEventHandler]
    construct funcImport [repeat statement]
        imp
    by
        funcImport [. stmts]
end function

function addTimerImport seeking [id]
    replace [repeat statement]
        stmts [repeat statement]
    where
        stmts [containsId 'Timer]
	where
		seeking [= 'Timer]
    construct imp [import_statement]
        'from 'threading 'import seeking
    construct funcImport [repeat statement]
        imp
    by
        funcImport [. stmts]
end function

%This function takes care of a lot of messier types.
%The function compiles a repeat of ids of lists from various sources (the func params, the class members, declarations inside the function)
%It does something similar for dicts
%The repeats of lists and dicts are then used to translate functions called from them to python equivalents
%It also adds a line to translate the varArg argument from a tuple to a list. (Making it mutable like java varArgs)
%If a function has a VarArg param and want to pass it on to another function with a VarArg param, it needs to add a * before the varArgName
%This function also takes care of doing this

function manageSpecialTypes params [list method_parameter]
    replace [repeat statement]
        stmts [repeat statement]
    construct possibleVarArgName [opt id]
        _ [extractVarArgName params]
    import listMemberVariables [repeat id]
    construct paramLists [repeat id]
        _ [extractListNameFromMethodParam each params] [extractArrayListListNameFromMethodParam each params]
    construct paramArrays [repeat id]
        _ [extractArrayNameFromMethodParam each params]
    construct varArgRepeat [repeat id]
        _ [reparse possibleVarArgName]
    construct allDeclerations [repeat statement]
        _ [extractDeclarationFromStatement each stmts]
    construct statementLists [repeat id]
        _ [extractListNameFromVariableDeclaration each allDeclerations]
    construct allLists [repeat id]
        _ [. listMemberVariables] [. paramLists] [. paramArrays] [. varArgRepeat] [. statementLists]
    import dictMemberVariables [repeat id]
    construct allHashMaps [repeat id]
        _ [extractHashMapNameFromVariableDeclaration each allDeclerations] [. dictMemberVariables]
    by
        stmts
            [changeVarArgTypeToList possibleVarArgName]
            [addAsterixToVarArgInSuperInit possibleVarArgName]
            [replaceAllSpecialTypes allLists allHashMaps]
            [addAsterixToInternalFuncCalls allLists]

end function

%Returns all the declarations inside the function code.
%These are then used to identify the ids of special type (lists, dicts)
function extractDeclarationFromStatement stmt [statement]
    replace [repeat statement]
        result [repeat statement]
    deconstruct stmt
        _ [value] _ [value] ';
    by
        result [. stmt]
end function

%If we are passing a varArg to another function that takes one, add an * before the id
rule addAsterixToInternalFuncCalls allIterables [repeat id]
    replace $ [nested_identifier]
        funcName [id] '( args [list value+] ')
    construct zero [number]
        '0
    construct argsLength [number]
        zero [length args]
    construct lastArgList [list value]
        args [tail argsLength]
    deconstruct lastArgList
        lastArg [nested_identifier]
    deconstruct lastArg
        root [id] rep [repeat attribute_access]
    where
        allIterables [containsId root]
    import classMethods [repeat method_declaration]
    where
        classMethods [doesMethodHaveVarArg funcName]
    construct argsLengthMinusOne [number]
        argsLength [- 1]
    construct allArgsButLast [list value]
        args [head argsLengthMinusOne]
    construct unpacked [value]
        '* lastArg
    by
        funcName'( allArgsButLast [, unpacked] ')
end rule

rule doesMethodHaveVarArg seeking [id]
    match [concrete_method_declaration]
        _ [opt decorator] _ [acess_modifier] _ [opt static] _ [nested_identifier] methodName [id] '( params [list method_parameter] ') _ [opt throws] '{ _ [repeat statement] '}
    where
        seeking [= methodName]
    construct varArgs [repeat var_arg]
        _ [^ params]
    construct zero [number]
        '0
    construct varArgsLength [number]
        zero [length varArgs]
    where
        varArgsLength [= 1]
end rule

function extractListNameFromVariableDeclaration decl [statement]
    replace [repeat id]
        results [repeat id]
    deconstruct decl
        'ArrayList '< _ [id] '> listName [id] _ [opt value_continuation] ';
    by
        results [. listName]
end function

function extractHashMapNameFromVariableDeclaration decl [statement]
    replace [repeat id]
        results [repeat id]
    deconstruct decl
        'HashMap< _ [id] ', _ [id] '> listName [id] _ [opt value_continuation] ';
    by
        results [. listName]
end function

function extractListNameFromMethodParam param [method_parameter]
    replace [repeat id]
        result [repeat id]
    deconstruct param
        'List< _ [id] '> paramName [id]
    by
        result [. paramName]
end function

function extractArrayListListNameFromMethodParam param [method_parameter]
    replace [repeat id]
        result [repeat id]
    deconstruct param
        'ArrayList< _ [id] '> paramName [id]
    by
        result [. paramName]
end function


function extractArrayNameFromMethodParam param [method_parameter]
    replace [repeat id]
        result [repeat id]
    deconstruct param
        nested [nested_identifier] paramName [id]
    construct nestables [repeat nestable_value]
        _ [^ nested]
    construct zero [number]
        '0
    construct length [number]
        zero [length nestables]
    construct lastNestableRepeat [repeat nestable_value]
        nestables [tail length]
    deconstruct lastNestableRepeat
        _ [id] '[ ']
    by
        result [. paramName]
end function

%Whenever a VarARg argument is passed to a parent constructor, it needs the * before the id
rule addAsterixToVarArgInSuperInit possibleVarArgName [opt id]
    replace $ [nested_identifier]
        'super( vals [list value] ')
    deconstruct possibleVarArgName
        varArgName [id]
    by
        'super( vals [addAsterixOnMatch varArgName] ')
end rule

rule addAsterixOnMatch seeking [id]
    replace $ [value]
        identifier [id]
    where
        identifier [= seeking]
    by
        '* identifier
end rule

%Translates the varArg to a list (from tuple) so it is mutable like java VarArgs
function changeVarArgTypeToList possibleVarArgName [opt id]
    replace [repeat statement]
        stmts [repeat statement]
    deconstruct possibleVarArgName
        varArgName [id]
    construct newStatement [repeat statement]
        varArgName '= 'list( varArgName ')
    by
        newStatement [. stmts]
end function

%Extracts varArg id if there is one. Empty if not.
function extractVarArgName params [list method_parameter]
    replace [opt id]
        res [opt id]
    construct varArgs [repeat var_arg]
        _ [^ params]
    construct zero [number]
        '0
    construct length [number]
        zero [length varArgs]
    where
        length [= 1]
    construct optVarArg [opt var_arg]
        _ [reparse varArgs]
    deconstruct optVarArg
        _ [nested_identifier] '... varArgName [id]
    by
        varArgName
end function

%This function is used to filter out function from the translated class
function filterOutFunctions elem [class_body_element]
    replace $ [repeat class_body_element]
        result [repeat class_body_element]
    where not
        elem
            [checkAlreadyStrFunc]
            [checkAlreadyHashFunc]
    by
        result [. elem]
end function

%If the user already defined a __str__ function, we can throw out the toString function generated by umple
function checkAlreadyStrFunc
    match [class_body_element]
        _[opt decorator] _[acess_modifier] _[nested_identifier] 'toString '( _ [list method_parameter] ') '{ _ [method_content] '}
    import classMethodNames [repeat id]
    where
        classMethodNames [containsId '__str__]
end function

%If the user already defined a __hash__ function, we can throw out the hashCode function generated by umple
function checkAlreadyHashFunc
    match [class_body_element]
        _[opt decorator] _[acess_modifier] _[nested_identifier] 'hashCode '( _ [list method_parameter] ') '{ _ [method_content] '}
    import classMethodNames [repeat id]
    where
        classMethodNames [containsId '__hash__]
end function

%-----------------------%
% Multiple constructors %
%-----------------------%
%Java support method overloading. Python does not.
%To solve this we transform one of the constructors into a class method
%There are two possible cases where this happens
%1 In one to one relations (with other classes or with itself)
%2 Sometimes there is one default constructor (no args) and one with args

%This function takes care of both cases
function fixMultipleConstructors
    replace [repeat class_body_element]
        rep [repeat class_body_element]
    import constructorCount [number]
    where
        constructorCount [> 1]
    by
        rep [fixNoArgDefaultMultipleConstructors] [fixOneToOneMultipleConstructors]

end function

function fixOneToOneMultipleConstructors
    replace [repeat class_body_element]
        elems [repeat class_body_element]
    where
        elems [existsOneToOneConstructor]
    by
        elems [replaceOneToOneConstructor] [targetRemainingConstructor]
end function

function fixNoArgDefaultMultipleConstructors
    replace [repeat class_body_element]
        elems [repeat class_body_element]
    where not
        elems [existsOneToOneConstructor]
    by
        elems [replaceExtraConstructorNoArgs]
end function

%Checks to see if a one to one constructor exists, letting us know which case of mutliple constructors we are dealing with
rule existsOneToOneConstructor
    match [constructor]
        'def '__init__( _ [list method_parameter] '):  stmts [repeat statement]
    where
        stmts [containConstructorWithSelfParam]
end rule

%Replace constructor with no args with a class method
rule replaceExtraConstructorNoArgs
    replace [class_body_element]
        'def '__init__(self):  stmts [repeat statement]
    construct newConstructorStatements [repeat statement]
        'self '= 'cls.__new__(cls)
    construct returnStatement [statement]
        'return 'self
    by
        '@classmethod 'def 'alternateConstructor(cls): newConstructorStatements [. stmts] [. returnStatement]
end rule

%Replace one to one constructor that is only to be used inside the linked classes' constructor
rule replaceOneToOneConstructor
    replace [class_body_element]
        'def '__init__( params [list method_parameter] '):  stmts [repeat statement]
    where not
        stmts [containConstructorWithSelfParam]
    construct paramsWithoutSelf [list method_parameter]
        params [tail 2]
    construct clsParam [list method_parameter]
        'cls
    construct newConstructorStatements [repeat statement]
        'self '= 'cls.__new__(cls)
    construct returnStatement [statement]
        'return 'self
    by
        '@classmethod 'def 'alternateConstructor( clsParam [, paramsWithoutSelf] '): newConstructorStatements [. stmts] [. returnStatement]
end rule

%In the one to one case, the constructor that is not translated calls the constructor for the linked class.
%That other constructor has been changed to a class method, so we need to call it differently.
rule targetRemainingConstructor
    replace $ [class_body_element]
        'def '__init__( params [list method_parameter] '):  stmts [repeat statement]
    where
        stmts [containConstructorWithSelfParam]
    by
        'def '__init__( params '):  stmts [replaceOneToOneConstructorCall]
end rule

%Changes one to one contructor call to a class method call
rule replaceOneToOneConstructorCall
    replace $ [value]
        call [nested_identifier]
    where
        call [containConstructorWithSelfParam]
    deconstruct call
        className [id] '( args [list value] ')
    by
        className '. 'alternateConstructor( args ')
end rule

%Checks if there is a contructor called that passes self as a param, indicating a one to one constructor call
rule containConstructorWithSelfParam
    match [nested_identifier]
        instantiatedClass [id] '( params [list value]')
    deconstruct instantiatedClass
        instantiatedClassGeneric [any]
    construct optInstantiatedClassName [opt id]
        _ [extractClassId instantiatedClassGeneric]
    deconstruct optInstantiatedClassName
        instantiatedClassName [id]
    import possibleFunctionImports [repeat id]
    import className [nested_identifier]
    deconstruct className
        classNameGeneric [any]
    construct optCurrentClassName [opt id]
        _ [extractClassId instantiatedClass]
    deconstruct optCurrentClassName
        currentClassName [id]
    construct possibleImportsPlusCurrentClass [repeat id]
        possibleFunctionImports [. currentClassName]
    where
        possibleImportsPlusCurrentClass [containsId instantiatedClassName]
    where
        params [containsSelfValue]
end rule

%Extracts the class name as an id, works for both generic and regular classes
function extractClassId target [any]
    replace [opt id]
        result [opt id]
    by
        result [extractIdFromNonGenericClass target] [extractIdFromGenericClass target]
end function

function extractIdFromGenericClass class [any]
    replace [opt id]
        result [opt id]
    deconstruct * [nested_identifier] class
        genericClass [nested_identifier]
    deconstruct genericClass
        className[id] '< _[list id] '>
    by
        className
end function

function extractIdFromNonGenericClass class [any]
    replace [opt id]
        result [opt id]
    skipping [list id]
    deconstruct * [id] class
        className [id]
    by
        className
end function


rule containsSelfValue
    skipping [nested_identifier]
    match [value]
        'self
end rule

%-----------------------%
%   Overloaded methods  %
%-----------------------%
%Java supports overloaded methods. Python does not.
%The java generator will create overloaded methods in some instances.
%To get arround this, we rename the overloaded methods by adding numbers at the end (ex: def functionName1(): )
%We then create a disambiguation function with the original name and takes varArg
%This function checks the number and types passed in the varArg to decide which of the renamed functions to call

%Before creating the disambiguation functions, we need to keep track of which method is linked to what parameters
%To do this, we are using the following three intermediate types

%Overload data is the type that stores all the information to overload a method
%The first id is the original name of the function (ex: funcName)
define overload_data
    [id] [repeat specific_overload]
end define

%Specific overload contains all the information for a specific implementation of an overloaded method
%The first id is the new name of the overloaded function (ex: funcName1)
define specific_overload
    [id] [repeat overload_data_arg]
end define

%Overload data arg describes the type of an parameter. All together a repeat of these is used to describe the types of all the parameters of a method
%The types used are pythonic types (so bool instead of boolean).
%The optional second id is to specify if the arg is a list. (ex: "list bool" is a list of booleans)
define overload_data_arg
    [id] [opt id]
end define

%Given a java param, adds the appropriate python type to the list of method param types
%Ex: if given the param "String[]"
%Will add "list str"
function addOverloadArg javaParam [method_parameter]
    replace [repeat overload_data_arg]
        res [repeat overload_data_arg]
    deconstruct javaParam
        type [nested_identifier] _ [id]
    construct optAdding [opt overload_data_arg]
        _
            [translateArrayListType type]
            [translateArrayType type]
            [translateListType type]
            [translateBaseTypesOverload type]
    deconstruct optAdding
        adding [overload_data_arg]
    by
        res [. adding]
end function

%Translates a java base type to a python overloading arg
function translateBaseTypesOverload javaType [nested_identifier]
    replace [opt overload_data_arg]
    deconstruct javaType
        baseType [id]
    by
        baseType [translateBaseTypes]
end function

%Translates java base type to python
function translateBaseTypes
    replace [id]
        baseType [id]
    by
        baseType [translateStringType]  [translateBooleanType] [translateDoubleType]
end function

function translateStringType
    replace [id]
        'String
    by
        'str
end function

%Translates a java arrayList to a python overloading arg (list ___ )
function translateArrayListType javaType [nested_identifier]
    replace [opt overload_data_arg]
    deconstruct javaType
        'ArrayList< type [id] '>
    by
        'list type [translateBaseTypes]
end function

%Translates a java array to a python overloading arg (list ___ )
function translateArrayType javaType [nested_identifier]
    replace [opt overload_data_arg]
    deconstruct javaType
        type [id] '[ ']
    by
        'list type [translateBaseTypes]
end function

%Translates a java list to a python overloading arg (list ___ )
function translateListType javaType [nested_identifier]
    replace [opt overload_data_arg]
    deconstruct javaType
        'List< type [id] '>
    by
        'list type [translateBaseTypes]
end function

function translateBooleanType
    replace [id]
        'boolean
    by
        'bool
end function

function translateDoubleType
    replace [id]
        'double
    by
        'float
end function

%Checks the list of method names to see if the matched name is there twice. If so the method is overloaded.
function isMethodOverloaded
    match [id]
        methodName [id]
    import classMethodNames [repeat id]
    construct zero [number]
        '0
    construct count [number]
        zero [incrementIfMatch methodName each classMethodNames]
    where
        count [> 1]
end function

function incrementIfMatch id1[id] id2[id]
    replace [number]
        result [number]
    where
        id1 [= id2]
    by
        result [+ 1]
end function

%Replaces a functionName with a unique one by adding a number at the end
function changeOverloadedMethodName params [list method_parameter]
    replace [id]
        methodName [id]
    where
        methodName [isMethodOverloaded]
    import overloadData [repeat overload_data]
    %TXL built in function ! is doing all the work here
    construct newMethodName [id]
        methodName [!]
    export overloadData
        overloadData [appendToOverloadData methodName newMethodName params]
    by
        newMethodName
end function

%Given an old function name, a new one (with a number at the end), and a list of java method parameters,
%Either appends to the repeat overload_data if this is the first time we are adding an entry for oldName
%Or appends to an already existing overload_data entry for oldName if it exists
function appendToOverloadData oldName [id] newName [id] params [list method_parameter]
    replace [repeat overload_data]
        data [repeat overload_data]
    by
        data [appendToExistingOverloadEntry oldName newName params] [createNewOverloadEntry oldName newName params]
end function

%Checks if an overload already exists given an old functionName
rule doesOverloadEntryExist oldName [id]
    match [overload_data]
        dataOldName [id] _ [repeat specific_overload]
    where
        dataOldName [= oldName]
end rule

%Appends to a overload_data entry if the oldName provided matches the oldName of the entry
rule appendToExistingOverloadEntry oldName [id] newName [id] param [list method_parameter]
    replace $ [overload_data]
        data [overload_data]
    deconstruct data
        dataOldName [id] overloads [repeat specific_overload]
    where
        dataOldName [= oldName]
    construct overloadArgs [repeat overload_data_arg]
        _ [addOverloadArg each param]
    construct newOverload [specific_overload]
        newName overloadArgs
    by
        dataOldName overloads [. newOverload]
end rule

%Creates a new overload_data if it does not exist already
function createNewOverloadEntry oldName [id] newName [id] param [list method_parameter]
    replace [repeat overload_data]
        results [repeat overload_data]
    where not
        results [doesOverloadEntryExist oldName]
    construct overloadArgs [repeat overload_data_arg]
        _ [addOverloadArg each param]
    construct newOverloadEntry [overload_data]
        oldName newName overloadArgs
    by
        results [. newOverloadEntry]

end function

%Given an overlad_data, creates a disambiguation function
%This function will check the params passed to it and decide which alternate function to call (ex: return funcName2())
%This function will throw an error if there is no match
function createDisambiguationMethod data [overload_data]
    replace [repeat class_body_element]
        results [repeat class_body_element]
    deconstruct data
        name [id] overloads [repeat specific_overload]
    construct stmts [repeat statement]
        _ [addDisambiguationIf each overloads]
    construct throwStmt [statement]
        'raise 'TypeError( "No method matches provided parameters" ')
    construct method [class_body_element]
        'def name '(self, '*argv): stmts [. throwStmt] [addFunctionImports]
    by
        results [. method]
end function

%Adds an if statement to the disambiguation function. The if statement check to see if the args match a specific function implementation
%Inside the if we call that specific function
function addDisambiguationIf over [specific_overload]
    replace [repeat statement]
        results [repeat statement]
    deconstruct over
        newName [id] args [repeat overload_data_arg]
    construct zero [number]
        '0
    construct argLength [number]
        zero [length args]
    construct typeChecks [opt value_continuation]
        _ [createDisambiguationTypeChecks args '0]
    %A check for the lenght of the args is also added first to avoid out of range errors when checking arg types
    construct condition [value]
        'len(argv) '== argLength typeChecks
    construct funcCall [repeat statement]
        _ [createDisambiguatedMethodCall newName argLength]
    construct ifStatement [statement]
        'if condition ':
            funcCall
    by
        results [. ifStatement]
end function

%Creates the checks for types used in the disambiguation if statements
function createDisambiguationTypeChecks args [repeat overload_data_arg] counter [number]
    replace [opt value_continuation]
    construct repFirstElem [repeat overload_data_arg]
        args [head 1]
    construct otherElems [repeat overload_data_arg]
        args [tail 2]
    deconstruct repFirstElem
        head  [overload_data_arg]
    construct optTypeCheck [opt value]
        _ [createTypeCheck head counter]
    deconstruct optTypeCheck
        typeCheck [value]
    construct increment [number]
        counter [+ 1]
    construct optTypeCheckContinuation [opt value_continuation]
        _ [createDisambiguationTypeChecks otherElems increment]
    by
        'and typeCheck [appendOptToValue optTypeCheckContinuation]
end function

%Creates a type check for one argument
%The check is different if the overload_data_arg represents a list or not
function createTypeCheck arg [overload_data_arg] counter [number]
    replace [opt value]
    construct result [opt value]
        _
        [createListTypeCheck arg counter]
        [createNormalTypeCheck arg counter]
    by
        result
end function

%In the case where overload_data_arg does not represent a list, we simply check if the arg is of a specific type
function createNormalTypeCheck arg [overload_data_arg] counter [number]
    replace [opt value]
    deconstruct arg
        type [id]
    construct castedType [value]
        type
    by
        'isinstance( 'argv '[ counter '], castedType [mutlipleTypeCheck]')
end function

function createListTypeCheck arg [overload_data_arg] counter [number]
    replace [opt value]
    deconstruct arg
        'list type [id]
    construct castedType [value]
        type
    by
        '( 'isinstance(argv '[ counter '], 'list) 'and '( 'not 'len(argv '[ counter ']) 'or 'isinstance(argv '[ counter '] '[ '0 '], castedType [mutlipleTypeCheck]')))
end function

%Function used to check many types instead of just one given a specific type to check
%This is to emulate java automatic casting behavior, (ex: you could pass an int to a function with a float arg in java)
function mutlipleTypeCheck
    replace [value]
        original [value]
    by
        original [floatToFloatInt]
end function

function floatToFloatInt
    replace [value]
        'float
    by
        '( 'float, 'int)
end function

%Imports the global list of overloadData and creates all the disambiguation methods
function addDisambiguationMethods
    replace [repeat class_body_element]
        results [repeat class_body_element]
    import overloadData [repeat overload_data]
    construct disambiguationMethods [repeat class_body_element]
        _ [createDisambiguationMethod each overloadData]
    by
        results [. disambiguationMethods]
end function

%Creates the call to the specific method overload with a newName (ex: return functionName2() )
function createDisambiguatedMethodCall funcName [id] argLength [number]
    replace [repeat statement]
    construct funcCallArgs [list value]
        _ [addArgvParam 0 argLength]
    by
        'return 'self '. funcName '( funcCallArgs ')
end function

%The args passed to the specific method overload are constructed here.
function addArgvParam count [number] argLength [number]
    replace [list value]
        result [list value]
    where
        argLength [> count]
    construct param [value]
        'argv '[ count ']
    construct increment [number]
        count [+ 1]
    by
        result [, param] [addArgvParam increment argLength]
end function
