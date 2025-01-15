%This files contains logic related to higher level class translation
%--------------------%
%     Classes        %
%--------------------%

%Rule to translate concrete classes
rule replaceConcreteClasses
    replace $ [concrete_class_declaration]
        _ [opt acess_modifier] 'class className [nested_identifier] inheritances [repeat inheritance_list] '{ classBody [class_body_decl] '}
    export className
    construct inheritanceClasses [list nested_identifier]
        _ [extractInheritanceBlockClasses each inheritances]
    construct translatedBody [class_body_decl]
        classBody  [replaceClassBody]
    construct imports [repeat import_statement]
        _ [createImports classBody inheritances translatedBody]
    construct runMain [opt run_main]
        _ [constructRunMain translatedBody]
    construct emptyDeclaration [repeat statement]
        %none
    construct umplePythonSyncLockStatement [repeat statement]
        emptyDeclaration [createUmplePythonSyncLock translatedBody]
    %import possibleSynchronized [opt synchronized]
    by
        imports
        'class className '( inheritanceClasses ')':  umplePythonSyncLockStatement translatedBody runMain
end rule


function createUmplePythonSyncLock translatedBody [class_body_decl]
    replace [repeat statement]
      s [repeat statement]

    import possibleSynchronized [opt synchronized]
    deconstruct possibleSynchronized
      _ [synchronized]
    construct stateDeclaration2 [repeat statement]
        'umplePythonSyncLock '= 'Lock '( ')
    by
      stateDeclaration2
end function


%Rule to translate nested classes
rule replaceInnerClasses
    replace $ [inner_class_declaration]
        _ [opt acess_modifier] 'class className  [nested_identifier] inheritances [repeat inheritance_list] '{ classBody [class_body_decl] '}
    export className  %This was originally className
    construct inheritanceInnerClasses [list nested_identifier]
        _ [extractInheritanceBlockClasses each inheritances][print]
    export inheritanceInnerClasses
    construct translatedBody [class_body_decl]
       classBody  [replaceClassBody]
    construct emptyDeclaration [repeat statement]
        %none
    construct umplePythonSyncLockStatement [repeat statement]
        emptyDeclaration [createUmplePythonSyncLock translatedBody]
    by
        'class className  '( inheritanceInnerClasses ')': umplePythonSyncLockStatement translatedBody
end rule

%Rule to translate abstract classes
rule replaceAbstractClass
    replace [concrete_class_declaration]
        _ [opt acess_modifier] 'abstract 'class className [nested_identifier] inheritances [repeat inheritance_list] '{ classBody [class_body_decl] '}
    export className
    construct inheritanceClasses [list nested_identifier]
        _ [extractInheritanceBlockClasses each inheritances]
    construct translatedBody [class_body_decl]
        classBody  [replaceClassBody]
    construct imports [repeat import_statement]
        _ [createImports classBody inheritances translatedBody]
    construct AbcClass [list nested_identifier]
        'ABC
    construct finalInheritances [list nested_identifier]
        AbcClass [, inheritanceClasses]
    construct runMain [opt run_main]
        _ [constructRunMain translatedBody]
    by
        'from 'abc 'import 'ABC, 'abstractmethod
        imports
        'class className '(  finalInheritances '):  translatedBody runMain
end rule

%This func creates the if statement at the bottom of python classes when they have a static main function
%This allows the main function to be run when we run the python file, emulating Java behavior
function constructRunMain body [class_body_decl]
    replace [opt run_main]
        _ [opt run_main]
    where
        body [matchMainMethod]
    import className [nested_identifier]
    construct optClassId [opt id]
        _ [extractClassId className]
    deconstruct optClassId
        classId [id]
    by
        'if '__name__ '== '"__main__" ':
        classId '.main(sys.argv)
end function

%Match rule to check if there is a static main method
rule matchMainMethod
    match [concrete_method_declaration]
        '@staticmethod
        'def 'main( _[list method_parameter+] '): _ [method_content]
end rule

%Rule used to translate interfaces
rule replaceInterfaces
    replace [class_declaration]
        _ [opt acess_modifier] 'interface className [nested_identifier] inheritances [repeat inheritance_list] '{ classBody [class_body_decl] '}
    export className
    construct inheritanceClasses [list nested_identifier]
        _ [extractInheritanceBlockClasses each inheritances]
    construct translatedBody [class_body_decl]
        classBody  [replaceClassBody] [replaceInterfaceBody]
    construct imports [repeat import_statement]
        _ [createImports classBody inheritances translatedBody]
    construct AbcClass [list nested_identifier]
        'ABC
    construct finalInheritances [list nested_identifier]
        AbcClass [, inheritanceClasses]
    by
        'from 'abc 'import 'ABC, 'abstractmethod
        imports
        'class className '(  finalInheritances '):  translatedBody
end rule

%Func contains logic to translate interface bodies
function replaceInterfaceBody
   replace [class_body_decl]
        elements [repeat class_body_element]
    construct declarations [repeat member_variable_declaration]
        _ [^ elements]
    export enumeratorDeclerations [repeat enum_declaration]
        _ [^ elements]
    construct possibleSynchronized [opt synchronized]
        %None
    export possibleSynchronized
    construct memberVariables [repeat id]
        _ [addMemberVariable each declarations]
    construct listMemberVariables [repeat id]
        _ [addListMemberVariable each declarations]
    by
        '@abstractmethod 'def '__init__(self): 'pass elements [replaceAllMethods memberVariables]
end function

%Func contains logic to translate class bodies
%A lot of information is exported here, to be used in functions/rules all over
function  replaceClassBody
    replace [class_body_decl]
        body [class_body_decl]
    deconstruct body
        elements [repeat class_body_element]
    construct declarations [repeat member_variable_declaration]
        _ [^ elements]
    construct transientMembers [repeat id]
        _ [addIfTransient each declarations]
    export transientMembers
    export memberVariables [repeat id]
        _ [addMemberVariable each declarations]
    export classMethods [repeat method_declaration]
        _ [^ elements]
    export staticElements [repeat id]
        _ [addStaticMemberVariable each declarations] [addStaticMethod each classMethods]
    export listMemberVariables [repeat id]
        _ [addListMemberVariable each declarations]
    export dictMemberVariables [repeat id]
        _ [addDictMemberVariable each declarations]
    export enumeratorDeclerations [repeat enum_declaration]
        _ [^ elements]
    export nestedClassDeclerations [repeat inner_class_declaration]
        _ [^ elements]
    export classMethodNames [repeat id]
        _ [extractClassMethodName each classMethods]
    construct possibleFunctionImports [repeat id]
        _ [extractPossibleFunctionImports each declarations]
    export overloadData [repeat overload_data]
        _
    export possibleFunctionImports
    construct disambiguationFunctions [repeat class_body_element]
        _
    by

         elements  [exportConstructorCount] [removeMemberVariableDeclarations]  [replaceInnerClasses]  [replaceEnumDeclaration]
        [replaceAllMethods memberVariables]

end function


%If the argument is a memberVariable, add it to results
function addListMemberVariable MemberVariable [member_variable_declaration]
    replace [repeat id]
        SequenceSoFar [repeat id]
    deconstruct MemberVariable
        _[opt acess_modifier] _[opt transient] _[opt static] _[opt final] _[opt volatile] 'List '< _ [list id] '> memberName [id] _[opt member_variable_assignment]';
    by
        SequenceSoFar [. memberName]
end function

%If the argument is a Map (sometimes refered to as Dict internally), add it to results
function addDictMemberVariable MemberVariable [member_variable_declaration]
    replace [repeat id]
        SequenceSoFar [repeat id]
    deconstruct MemberVariable
        _[opt acess_modifier] _[opt transient] _[opt static] _[opt final] _[opt volatile] 'Map '< _ [list id] '> memberName [id] _[opt member_variable_assignment]';
    by
        SequenceSoFar [. memberName]
end function

%Class methods can be concrete or abstract. This will extract the method name from either and add it to the result repeat.
function extractClassMethodName method [method_declaration]
    replace [repeat id]
        result [repeat id]
    by
        result [extractConcreteMethodName method] [extractAbstractMethodName method]
end function

%Adds concrete method name to repeat
function extractConcreteMethodName method [method_declaration]
    replace [repeat id]
        result [repeat id]
    deconstruct method
        _[opt decorator] _[acess_modifier] _[opt static] _[nested_identifier] methodName [id] '( _[list method_parameter] ') _[opt throws] '{ _[method_content] '}
    by
        result [. methodName]
end function

%Adds abstract method name to repeat
function extractAbstractMethodName method [method_declaration]
    replace [repeat id]
        result [repeat id]
    deconstruct method
        _[acess_modifier] _[nested_identifier] methodName [id] '( _ [list method_parameter] ');
    by
        result [. methodName]
end function

%Adds transient attributeName to result repeat
function addIfTransient decl [member_variable_declaration]
    replace [repeat id]
        result [repeat id]
    deconstruct decl
        _[opt acess_modifier] 'transient _[opt static] _[opt final] _[opt volatile] _[nested_identifier] memberName [id] _[opt member_variable_assignment]';
    by
        result [. memberName]
end function



%Python does not have member variable declarations like Java does
%This function removes all member variable declarations, except the static ones which are translated and kept
function removeMemberVariableDeclarations
    replace [repeat class_body_element]
        elems [repeat class_body_element]
    construct empty [repeat class_body_element]
        _
    by
        empty [addTranslatedStaticMember each elems] [addIfNotMemberDecleration each elems]
end function

%If the argument is not a member variable, add it to results
function addIfNotMemberDecleration elem [class_body_element]
    replace [repeat class_body_element]
        keepers [repeat class_body_element]
    construct declerations [repeat member_variable_declaration]
        _ [^ elem]
    construct declerationSize [number]
        _ [length declerations]
    where
        declerationSize [= 0]
    by
        keepers [. elem]
end function

%If the argument is a static member variable declaration, translates it and adds it to result repeat
function addTranslatedStaticMember elem [class_body_element]
    replace [repeat class_body_element]
        keepers [repeat class_body_element]
    construct declerations [repeat member_variable_declaration]
        _ [^ elem]
    deconstruct declerations
        _[opt acess_modifier] _[opt transient] 'static  _[opt final] _[opt volatile] _ [nested_identifier] staticMemberName [id] '= val [value] ';
    construct elemToAdd [class_body_element]
        staticMemberName '= val [replaceStatements]
    by
        keepers [. elemToAdd]
end function

%If arg is a member variable declaration, add its name to results
function addMemberVariable MemberVariable [member_variable_declaration]
    replace [repeat id]
        SequenceSoFar [repeat id]
    deconstruct MemberVariable
        _[opt acess_modifier] _[opt transient] _[opt final] _[opt volatile]  _ [nested_identifier] memberName [id] _[opt member_variable_assignment] ';
    by
        SequenceSoFar [. memberName]
end function



%If arg is a static member variable declaration, add its name to results
function addStaticMemberVariable MemberVariable [member_variable_declaration]
    replace [repeat id]
        SequenceSoFar [repeat id]
    deconstruct MemberVariable
        _[opt acess_modifier] _[opt transient] 'static  _[opt final] _[opt volatile] _ [nested_identifier] memberName [id] '= _ [value] ';
    by
        SequenceSoFar [. memberName]
end function

%If arg is a static method declaration, add its name to results
function addStaticMethod method [method_declaration]
    replace [repeat id]
        SequenceSoFar [repeat id]
    deconstruct method
        _[opt decorator] _[acess_modifier] 'static _[nested_identifier] methodName [id] '( _[list method_parameter] ') _[opt throws] '{ _[repeat statement] '}
    by
        SequenceSoFar [. methodName]
end function

%Counts how many constructors there are and exports it
%Number is used to determin wether we need to translate constructors in a special way
%since Python does not support multiple contructors
function exportConstructorCount
    match [repeat class_body_element]
        rep [repeat class_body_element]
    construct zero [number]
        '0
    construct constructorCount [number]
        zero [incrementIfConstructor each rep]
    export constructorCount
end function

%If arg is a constructor, increase count
function incrementIfConstructor elem [class_body_element]
    replace [number]
        count [number]
    deconstruct elem
        _ [constructor]
    by
        count [+ '1]
end function



%-----------------------%
%   ENUM DECLARATIONS   %
%-----------------------%
% The following rules/funcs are responsible for translating java Enums to python enum nested classes

%Translates the enum. The member functions are there to change the class behavior to better match Java
rule replaceEnumDeclaration
    replace [enum_declaration]
        _ [opt acess_modifier] 'enum enumName [id] '{ vals [list id] '}
    construct enumValDeclarations [repeat enum_value_declaration]
        _ [generateEnumValue each vals]
    by
        'class enumName '(Enum'):
            'def '_generate_next_value_('name, 'start, 'count, 'last_values)':
                'return 'name
            'def '__str__'(self):
                'return 'str(self. 'value)
        enumValDeclarations
end rule

%Every enum member is assigned the value auto(), which corresponds to the output of the _generate_next_value_ function.
function generateEnumValue val [id]
    replace [repeat enum_value_declaration]
        decls [repeat enum_value_declaration]
    construct decl [enum_value_declaration]
        val '= 'auto()
    by decls [. decl]
end function
