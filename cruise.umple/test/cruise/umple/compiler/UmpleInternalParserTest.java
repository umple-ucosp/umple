/*

 Copyright: All contributers to the Umple Project
 
 This file is made available subject to the open source license found at:
 https://umple.org/license

*/

package cruise.umple.compiler;

import java.util.*;
import org.junit.*;

import cruise.umple.util.AssertHelper;

public class UmpleInternalParserTest extends UmpleParserTest
{
  
  public static Map<String,String> fileToOutputs;
  
  static {
    fileToOutputs = new HashMap<String,String>();

    String expectedResult = null;
    String iExpectedResults = null; // for interface testing
    
    fileToOutputs.put("001_empty.ump", "");
    fileToOutputs.put("001_empty.ump", "");
    fileToOutputs.put("001_emptyComment.ump", "[inlineComment:][classDefinition][name:Student]");
	fileToOutputs.put("001_pythonStyleEmptyComment.ump", "[inlineComment:][classDefinition][name:Student]");
    fileToOutputs.put("001_emptyCommentWithSpaces.ump", "[inlineComment:][classDefinition][name:Student]");
    fileToOutputs.put("001_multipleEmptyComments.ump", "[inlineComment:][classDefinition][name:Student][inlineComment:][classDefinition][name:Mentor][inlineComment:][classDefinition][name:Teacher]");
    fileToOutputs.put("001_multipleEmptyCommentsWithSpaces.ump", "[inlineComment:][classDefinition][name:Foo][inlineComment:][classDefinition][name:Bar][inlineComment:][inlineComment:][inlineComment:][classDefinition][name:Foobar][inlineComment:][classDefinition][name:Student][inlineComment:][classDefinition][name:Mentor]");
    fileToOutputs.put("001_emptyMultiLineComment.ump", "[multilineComment:][classDefinition][name:Student]");
    fileToOutputs.put("001_emptyMultiLineCommentWithSpaces.ump", "[multilineComment:][classDefinition][name:Student]");
    
    expectedResult = "[multilineComment:][classDefinition][name:Foo][multilineComment:][classDefinition][name:Bar][multilineComment:*][classDefinition][name:Foobar][multilineComment:* ";
    fileToOutputs.put("001_multipleEmptyMultiLineCommentsWithSpaces.ump", expectedResult);
        
    expectedResult = "[classDefinition][name:Foo][inlineComment:I am a comment above a method.]" + 
    		"[concreteMethodDeclaration][type:void][methodDeclarator]" + 
    		"[methodName:testMethod][parameterList][code:// I am a comment inside a method.\n" +
    		"    System.out.println(\"Hello world!\");]";
    
    fileToOutputs.put("001_methodInlineComment.ump", expectedResult);
    
    expectedResult = "[classDefinition][name:Foo][multilineComment:* I am a comment above a method.][concreteMethodDeclaration][type:void][methodDeclarator][methodName:testMethod][parameterList][code:System.out.println(\"Hello world!\");]";
    
    fileToOutputs.put("001_methodMultilineComment.ump", expectedResult);
    
    expectedResult = "[classDefinition][name:Foo]" + 
    		"[inlineComment:Inline comment above method.][concreteMethodDeclaration]" +
    		"[type:void][methodDeclarator][methodName:testMethod1][parameterList]" +
    		"[code:System.out.println(\"Hello world!\");]" +
    		"[inlineComment:Multiple inline comments][inlineComment:above method.]" +
    		"[concreteMethodDeclaration][type:void][methodDeclarator]" +
    		"[methodName:testMethod2][parameterList]" +
    		"[code:System.out.println(\"Hello world!\");]" +
    		"[multilineComment:Multiline comment above method.]" + 
    		"[concreteMethodDeclaration][type:void][methodDeclarator]" +
    		"[methodName:testMethod3][parameterList]" +
    		"[code:System.out.println(\"Hello world!\");]" +
    		"[multilineComment:* Multiple multiline comments\n\t * above method.]" +
    		"[concreteMethodDeclaration][type:void][methodDeclarator]" +
    		"[methodName:testMethod4][parameterList]" +
    		"[code:System.out.println(\"Hello world!\");]";
    
    fileToOutputs.put("001_multipleMethodComments.ump", expectedResult);
    
    expectedResult = "[classDefinition][name:Foo][inlineComment:I am a inline comment above an attribute.][attribute][name:bar]";
    fileToOutputs.put("001_attributeInlineComment.ump", expectedResult);
	fileToOutputs.put("001_pythonStyleAttributeInlineComment.ump", expectedResult);
    
    expectedResult = "[classDefinition][name:Foo][multilineComment:* I am a multiline comment above an attribute.][attribute][name:name]";
    fileToOutputs.put("001_attributeMultilineComment.ump", expectedResult);
    
    expectedResult = "[classDefinition][name:Foo][inlineComment:Inline comment above attribute.][attribute][name:testAttribute1]" +
    		"[inlineComment:Multiple inline comments][inlineComment:above attribute.][attribute][name:testAttribute2]" +
    		"[multilineComment:Multiline comment above attribute.][attribute][name:testAttribute3]" +
    		"[multilineComment:* Multiple multiline comments\n\t * above attribute.][attribute][name:testAttribute4]";
    
    fileToOutputs.put("001_multipleAttributeComments.ump", expectedResult);
    
    expectedResult = "[classDefinition][name:Foo][inlineComment:I am a inline comment above an association.]" +
    		"[inlineAssociation][inlineAssociationEnd][bound:1][arrow:--][associationEnd][bound:*][type:Bar]" +
    		"[classDefinition][name:Bar]";
    
    fileToOutputs.put("001_associationInlineComment.ump", expectedResult);
	fileToOutputs.put("001_pythonStyleAssociationInlineComment.ump", expectedResult);
    
    expectedResult = "[classDefinition][name:Foo][multilineComment:* I am a multiline comment above an association.]" +
    		"[inlineAssociation][inlineAssociationEnd][bound:1][arrow:--][associationEnd][bound:*][type:Bar]" +
    		"[classDefinition][name:Bar]";
    
    fileToOutputs.put("001_associationMultilineComment.ump", expectedResult);
    
    expectedResult = "[classDefinition][name:Foo][inlineComment:Inline comment above association.][inlineAssociation]" +
    		"[inlineAssociationEnd][bound:1][arrow:--][associationEnd][bound:*][type:Bar1][inlineComment:Multiple inline comments]" +
    		"[inlineComment:above association.][inlineAssociation][inlineAssociationEnd][bound:1][arrow:--][associationEnd][bound:*]" +
    		"[type:Bar2][multilineComment:Multiline comment above association.][inlineAssociation][inlineAssociationEnd][bound:1]" +
    		"[arrow:--][associationEnd][bound:*][type:Bar3]" +
    		"[multilineComment:* Multiple multiline comments\n\t * above association.][inlineAssociation][inlineAssociationEnd]" +
    		"[bound:1][arrow:--][associationEnd][bound:*][type:Bar4][classDefinition][name:Bar1][classDefinition][name:Bar2]" +
    		"[classDefinition][name:Bar3][classDefinition][name:Bar4]";
    
    fileToOutputs.put("001_multipleAssociationComments.ump", expectedResult);
    
    fileToOutputs.put("001_oneCharacterMethod.ump", "[classDefinition][name:X][concreteMethodDeclaration][type:void][methodDeclarator][methodName:m][parameterList][code:z=1;]");
    fileToOutputs.put("001_twoCharacterMethod.ump", "[classDefinition][name:X][concreteMethodDeclaration][type:void][methodDeclarator][methodName:m1][parameterList][code:z=1;]");
    
    fileToOutputs.put("001_javaLanguage.ump","[generate][language:Java]");
    fileToOutputs.put("001_phpLanguage.ump","[generate][language:Php]");
    fileToOutputs.put("001_rubyLanguage.ump","[generate][language:Ruby]");
    fileToOutputs.put("001_outputLanguage.ump","[generate_path][language:Ruby][output:blah/blah/blah][generate_path][language:Java][output:blue/blue/blue][override:--override][generate_path][language:Php][output:path/to/php]");
    fileToOutputs.put("001_outputLanguageOverride.ump","[generate_path][language:Java][output:1][generate_path][language:Java][output:2][generate_path][language:Java][output:3][override:--override][generate_path][language:Java][output:4][override:--override][generate_path][language:Java][output:5]");
    fileToOutputs.put("001_outputLanguageOverrideAll.ump","[generate_path][language:Php][output:1][generate_path][language:Java][output:2][generate_path][language:Ruby][output:3][override:--override][generate_path][language:Java][output:4][override:--override-all][generate_path][language:Java][output:5][override:--override-all][generate_path][language:Php][output:6][generate_path][language:Ruby][output:7][override:--override]");
    fileToOutputs.put("002_namespace.ump", "[namespace:cruise][namespace:cruise.umple][namespace:example]");
    fileToOutputs.put("003_emptyClass.ump", "[classDefinition][name:Student]");
    fileToOutputs.put("003_multipleExtraCode.ump","[classDefinition][name:Student][extraCode:blahblah][classDefinition][name:Student][extraCode:moreblah]");
    fileToOutputs.put("003_constructorExtraCode.ump","[classDefinition][name:Student][concreteMethodDeclaration][modifier:public][methodDeclarator][methodName:Student][parameterList][parameter][type:String][name:x][code:blah();]");  
    fileToOutputs.put("003_innerClass.ump", "[classDefinition][name:Person][attribute][name:name][classDefinition][name:Student][attribute][name:Integer]");
    fileToOutputs.put("003_commentsInClass.ump", "[classDefinition][name:Student][inlineComment:A name][attribute][name:name][inlineComment:the time][attribute][type:Time][name:t]");
    fileToOutputs.put("004_depend.ump", "[classDefinition][name:Student][depend:java.util.Map]");
    fileToOutputs.put("004_multipleClasses.ump", "[classDefinition][name:Student][classDefinition][name:Mentor]");
    fileToOutputs.put("004_multipleClassesAndNamespaces.ump", "[namespace:cruise.util][classDefinition][name:Student][namespace:cruise.core][classDefinition][name:Mentor]");
    fileToOutputs.put("004_referencedPackages.ump", "[namespace:example][classDefinition][name:Student][inlineAssociation][inlineAssociationEnd][lowerBound:0][upperBound:1][arrow:--][associationEnd][lowerBound:0][upperBound:1][type:Mentor][namespace:anotherExample][classDefinition][name:Mentor]");
    fileToOutputs.put("007_isA_OnlyOne.ump", "[classDefinition][name:Student][extendsName:Person][classDefinition][name:Person]");
    fileToOutputs.put("007_isA_MultipleTimesInTheSameLine.ump", "[classDefinition][name:Student][extendsName:Person][extendsName:Worker][classDefinition][name:Person][interfaceDefinition][name:Worker]");
    fileToOutputs.put("007_isA_ListForm.ump", "[classDefinition][name:Student][extendsName:Person][extendsName:Worker][classDefinition][name:Person][interfaceDefinition][name:Worker]");
    fileToOutputs.put("007_implements.ump", "[classDefinition][name:Student][extendsName:IStudent][interfaceDefinition][name:IStudent]");

     expectedResult = "[classDefinition][name:Student]" +
         "[extendsName:IStudent][extendsName:IPerson][extendsName:IMan]" +
         "[interfaceDefinition][name:IStudent]" +
         "[interfaceDefinition][name:IPerson]" +
         "[interfaceDefinition][name:IMan]";
    fileToOutputs.put("007_isAMultipleInterfaces.ump", expectedResult);

    expectedResult = "[classDefinition][name:Student][extendsName:Human]" +
         "[extendsName:IStudent][extendsName:IPerson][extendsName:IMan]" +
         "[interfaceDefinition][name:IStudent]" +
         "[interfaceDefinition][name:IPerson]" +
         "[interfaceDefinition][name:IMan]" +
         "[classDefinition][name:Human]";
    fileToOutputs.put("007_isAMultipleInterfacesAndClasses.ump", expectedResult);
  
    expectedResult = "[classDefinition][name:Student][extendsName:Human]" +
         "[extendsName:IStudent][extendsName:IPerson][extendsName:IMan]" +
         "[interfaceDefinition][name:IStudent]" +
         "[interfaceDefinition][name:IPerson]" +
         "[interfaceDefinition][name:IMan]" +
         "[classDefinition][name:Human]";
    fileToOutputs.put("007_isAMultipleInterfacesAndClassesV2.ump", expectedResult);
    fileToOutputs.put("007_isAGrouped.ump", "[classDefinition][name:Student][extendsName:Person][classDefinition][name:Student][classDefinition][name:Person]");
    fileToOutputs.put("007_singleton.ump", "[classDefinition][name:Airline][singleton:singleton]");
    fileToOutputs.put("007_isANonExistingSuperClass.ump","[classDefinition][name:Lecturer][extendsName:Person]");
    fileToOutputs.put("008_isABlahAttribute.ump", "[classDefinition][name:Student][attribute][type:Boolean][name:isActNow]");
    fileToOutputs.put("008_simpleAttribute.ump", "[classDefinition][name:Student][attribute][name:number]");
    fileToOutputs.put("008_listAttribute.ump", "[classDefinition][name:Token][attribute][list:[]][name:blah][attribute][type:String][list:[]][name:name][attribute][type:Position][list:[]][name:start][attribute][type:Integer][list:[]][name:number][classDefinition][name:Position][attribute][type:Integer][name:lineNumber][attribute][type:Integer][name:offset]");
    fileToOutputs.put("008_derivedAttribute.ump", "[classDefinition][name:Position][attribute][type:Integer][name:perimeter][code:2*l + 2*w][attribute][type:Integer][name:w][attribute][type:Integer][name:l]");
    fileToOutputs.put("008_associationAttribute.ump", "[classDefinition][name:Token][attribute][name:number][attribute][type:Position][name:startPosition][classDefinition][name:Position][attribute][type:Integer][name:lineNumber][attribute][type:Integer][name:offset]");
    fileToOutputs.put("008_typeAttribute.ump", "[classDefinition][name:Student][attribute][type:Integer][name:name][attribute][type:String][name:name2][attribute][type:Time][name:name3][attribute][type:Date][name:name4][attribute][type:Double][name:name5]");
    fileToOutputs.put("008_uniqueAttribute.ump", "[classDefinition][name:Student][attribute][unique:unique][name:number]");
    fileToOutputs.put("008_assignedValueAttribute.ump", "[classDefinition][name:Student][attribute][modifier:settable][type:String][name:s][value:\"s\"][attribute][name:s2][value:\"s2\"]");
    fileToOutputs.put("008_autouniqueAttribute.ump", "[classDefinition][name:Student][attribute][autounique:autounique][name:id]");
    fileToOutputs.put("008_complexAssignedAttribute.ump", "[classDefinition][name:Student][attribute][type:Time][name:t][value:new Time(\"now\")]");
    fileToOutputs.put("009_externalNamedAssociation.ump", "[classDefinition][name:Student][classDefinition][name:Mentor][associationDefinition][name:Counsellor][association][associationEnd][lowerBound:4][upperBound:5][type:Student][arrow:--][associationEnd][lowerBound:6][upperBound:9][type:Mentor]");
    fileToOutputs.put("009_association.ump", "[classDefinition][name:Student][inlineAssociation][inlineAssociationEnd][lowerBound:2][upperBound:3][arrow:--][associationEnd][lowerBound:0][upperBound:1][type:Mentor][roleName:aMentor][inlineAssociation][inlineAssociationEnd][bound:*][roleName:me][arrow:--][associationEnd][bound:*][type:Student][roleName:them][classDefinition][name:Mentor]");
    fileToOutputs.put("009_externalAssociation.ump", "[classDefinition][name:Student][classDefinition][name:Mentor][associationDefinition][association][associationEnd][lowerBound:4][upperBound:5][type:Student][arrow:--][associationEnd][lowerBound:6][upperBound:9][type:Mentor][roleName:myMentor][association][associationEnd][bound:*][type:Student][roleName:me][arrow:--][associationEnd][bound:*][type:Student][roleName:them]");
    fileToOutputs.put("009_oneWayAssociation.ump", "[classDefinition][name:Student][inlineAssociation][inlineAssociationEnd][lowerBound:0][upperBound:1][arrow:->][associationEnd][lowerBound:0][upperBound:1][type:Mentor][classDefinition][name:Mentor]");
    fileToOutputs.put("009_otherWayAssociation.ump", "[classDefinition][name:Student][inlineAssociation][inlineAssociationEnd][lowerBound:0][upperBound:1][arrow:<-][associationEnd][lowerBound:0][upperBound:1][type:Mentor][classDefinition][name:Mentor]");
    fileToOutputs.put("009_reflexiveSymmetricAssociation.ump", "[classDefinition][name:Student][symmetricReflexiveAssociation][lowerBound:0][upperBound:1][roleName:partner]");
    fileToOutputs.put("009_multipleSymmetricReflexiveAssociations.ump", "[classDefinition][name:Student][symmetricReflexiveAssociation][bound:*][roleName:peer][symmetricReflexiveAssociation][bound:*][roleName:roleModel]");
    fileToOutputs.put("009_associationByItself.ump", "[associationDefinition][association][associationEnd][lowerBound:0][upperBound:1][type:Student][roleName:aStudent][arrow:--][associationEnd][lowerBound:0][upperBound:1][type:Mentor][roleName:aMentor][association][associationEnd][bound:*][type:Event][arrow:--][associationEnd][bound:*][type:Location][classDefinition][name:Event][classDefinition][name:Location][classDefinition][name:Student][classDefinition][name:Mentor]");
    fileToOutputs.put("010_associationClassMultipleDefinitions.ump", "[associationClassDefinition][name:Relationship][singleAssociationEnd][bound:*][type:Student][singleAssociationEnd][bound:*][type:Mentor][classDefinition][name:Student][classDefinition][name:Mentor][classDefinition][name:Relationship][elementPosition][x:1][y:2][width:3][height:4]");
    fileToOutputs.put("010_associationClassOtherAssociations.ump", "[associationClassDefinition][name:VotesInPoll][singleAssociationEnd][bound:*][type:Candidature][singleAssociationEnd][bound:*][type:PollInElection][inlineAssociation][inlineAssociationEnd][bound:*][arrow:--][associationEnd][bound:*][type:Location][classDefinition][name:Candidature][classDefinition][name:PollInElection][classDefinition][name:Location]");
    fileToOutputs.put("010_associationClass.ump", "[namespace:example][classDefinition][name:Thing][associationClassDefinition][name:Ticket][extendsName:Thing][attribute][name:name][attribute][type:Integer][name:type][value:1][singleAssociationEnd][bound:*][type:Event][roleName:event][singleAssociationEnd][bound:*][type:Location][extraCode:public int one() {return 1;}][classDefinition][name:Event][classDefinition][name:Location]");
    fileToOutputs.put("010_associationClassNewSyntaxAssociation.ump", "[classDefinition][name:Student][classDefinition][name:CourseSection][associationClassDefinition][name:Registration][association][associationEnd][bound:*][type:Student][arrow:--][associationEnd][bound:*][type:CourseSection][attribute][type:String][name:grade]"); 
    fileToOutputs.put("010_associationClassSeveralAssociationsAttributes.ump", "[classDefinition][name:A][classDefinition][name:B][classDefinition][name:C][classDefinition][name:D][classDefinition][name:E][classDefinition][name:F][associationClassDefinition][name:G][attribute][type:String][name:att1][attribute][type:Integer][name:att2][value:1][singleAssociationEnd][bound:*][type:A][singleAssociationEnd][bound:*][type:B][singleAssociationEnd][bound:*][type:C][attribute][name:att3][singleAssociationEnd][bound:*][type:D][attribute][type:String][name:att4][association][associationEnd][bound:*][type:E][arrow:--][associationEnd][bound:*][type:F][attribute][type:Integer][name:att5]"); 
    
    fileToOutputs.put("010_associationClassWithMultipleAssocToSameClassOneSetRoleName.ump", "[classDefinition][name:A][associationClassDefinition][name:B][singleAssociationEnd][bound:*][otherEndroleName:b1][type:A][roleName:a1][singleAssociationEnd][bound:*][type:A]"); 
    fileToOutputs.put("010_associationClassWithMultipleAssocToSameClassWithRoleName.ump", "[classDefinition][name:A][associationClassDefinition][name:B][singleAssociationEnd][bound:*][otherEndroleName:b1][type:A][roleName:a1][singleAssociationEnd][bound:*][otherEndroleName:b2][type:A][roleName:a2]"); 
    
    iExpectedResults = "[interfaceDefinition][name:Cat][interfaceMemberDeclaration][constantDeclaration][name:legs][value:4][interfaceMemberDeclaration][exception][malformedStatement1][stuff:meow meowww purrr][interfaceMemberDeclaration][abstractMethodDeclaration][type:void][methodDeclarator][methodName:Meow][parameterList]";
    fileToOutputs.put("011_multipleExtraCodeInterfaces.ump", iExpectedResults );
    iExpectedResults = "[interfaceDefinition][name:A][interfaceMemberDeclaration][abstractMethodDeclaration][type:void][methodDeclarator][methodName:FunB][parameterList][interfaceMemberDeclaration][exception][malformedStatement1][stuff:blah blah blah][interfaceMemberDeclaration][abstractMethodDeclaration][type:void][methodDeclarator][methodName:FunA][parameterList]";
    fileToOutputs.put("011_extraCodeInterfaces.ump", iExpectedResults);
    iExpectedResults = "[interfaceDefinition][name:A][interfaceMemberDeclaration][exception][malformedStatement1][stuff:constantinople = 1][interfaceMemberDeclaration][exception][malformedStatement1][stuff:constantinople i = 1][interfaceMemberDeclaration][exception][misnamedAttribute][name:dfdfdfdf][interfaceMemberDeclaration][constantDeclaration][name:blah]";
    fileToOutputs.put( "011_multipleExtraCodeDoubleDeclaration.ump", iExpectedResults );
    
    fileToOutputs.put("013_inlineComments.ump", "[inlineComment:c 5][inlineComment:c 5b][namespace:example][inlineComment:c 6][inlineComment:c 7][inlineComment:c 7b][inlineComment:c 7c]");
    fileToOutputs.put("013_multilineComments.ump", "[multilineComment:c 1\n  c 1b][multilineComment:c 1c\n  c 1d][multilineComment:c 2][multilineComment:c 2b\n  c 2c][multilineComment:c 2d\n  c 2e][multilineComment:c 2f\n  c 2g][multilineComment:c 3][multilineComment:c 3b\n  c 3c][namespace:example][multilineComment:c 4][multilineComment:c 4b\n  c 4c][multilineComment:c 4d\n  c 4e]");
    fileToOutputs.put("012_attributesAndAssociations.ump", "[namespace:example][classDefinition][name:Mentor][attribute][name:name][inlineAssociation][inlineAssociationEnd][bound:*][arrow:->][associationEnd][bound:*][type:Student][classDefinition][name:Student][attribute][name:number]");
    fileToOutputs.put("014_interface_implementation.ump", "[interfaceDefinition][name:ISomething][classDefinition][name:Something][extendsName:ISomething]");
    fileToOutputs.put("014_interface_methodAndParam.ump", "[interfaceDefinition][name:ISomething][interfaceMemberDeclaration][abstractMethodDeclaration][type:String[]][methodDeclarator][methodName:getMethod][parameterList][parameter][type:String][list:[]][name:aname][parameter][type:Integer][name:anotherType]");
    fileToOutputs.put("014_interface_position.ump", "[interfaceDefinition][name:ISomething][interfaceMemberDeclaration][elementPosition][x:10][y:20][width:30][height:40]");
    fileToOutputs.put("014_interface_methodNoParam.ump","[interfaceDefinition][name:I_Something][interfaceMemberDeclaration][abstractMethodDeclaration][type:String][methodDeclarator][methodName:getSomething][parameterList]");
    fileToOutputs.put("014_interface_constant.ump", "[interfaceDefinition][name:ISomething][interfaceMemberDeclaration][constantDeclaration][type:String][name:aVariable][value:aValue]");
    expectedResult = "[interfaceDefinition][name:ISomething][interfaceMemberDeclaration][constantDeclaration][type:String][name:aVariable][value:aValue]" +
              "[interfaceMemberDeclaration][constantDeclaration][type:String][name:aSecondVariable][value:aSecondValue]"+
              "[interfaceMemberDeclaration][abstractMethodDeclaration][type:String][methodDeclarator][methodName:getMethod][parameterList][parameter][type:String][name:name]";
    fileToOutputs.put("014_interface_allMembers.ump", expectedResult);
    fileToOutputs.put("014_interfaceDepend.ump", "[interfaceDefinition][name:IMe][depend:java.util.*]");
    fileToOutputs.put("014_interface_extracode.ump", "[interfaceDefinition][name:ISomething][interfaceMemberDeclaration][exception][malformedStatement1][stuff:public void getCode()]");
    fileToOutputs.put("014_interfaceImplements.ump", "[interfaceDefinition][name:ISomething][interfaceMemberDeclaration][extendsName:ISuper][interfaceDefinition][name:ISuper]");
    fileToOutputs.put("014_interfaceMultipleImplements.ump", "[interfaceDefinition][name:ISuper][interfaceDefinition][name:IOtherSuper][interfaceDefinition][name:IOther][interfaceMemberDeclaration][extendsName:ISuper][extendsName:IOtherSuper]");
    fileToOutputs.put("015_ClassWithImplementedMethods.ump", "[interfaceDefinition][name:ISomething][interfaceMemberDeclaration][abstractMethodDeclaration][type:String][methodDeclarator][methodName:getCode][parameterList][classDefinition][name:Something][attribute][type:implements][name:ISomething][concreteMethodDeclaration][type:String][methodDeclarator][methodName:getCode][parameterList][code:return 0;]");
    fileToOutputs.put("015_classMethods.ump", "[classDefinition][name:Student][concreteMethodDeclaration][type:String][methodDeclarator][methodName:getCode][parameterList][code:return 0;]");
    
    fileToOutputs.put("015_base.ump", "[useStatement][use:015_Student.ump][classDefinition][name:Student][useStatement][use:015_Mentor.ump][useStatement][use:015_Student.ump][classDefinition][name:Mentor][extendsName:Student]");
    fileToOutputs.put("016_classPosition.ump", "[classDefinition][name:Student][elementPosition][x:10][y:20][width:30][height:40]");
    fileToOutputs.put("016_defaultClassPosition.ump", "[classDefinition][name:Student][elementPosition][x:10][y:20][width:30][height:40]");
    fileToOutputs.put("016_associationPosition.ump", "[classDefinition][name:Student][inlineAssociation][inlineAssociationEnd][bound:1][arrow:--][associationEnd][bound:*][type:Mentor][elementPosition][x:10][y:20][width:30][height:40][associationPosition][name:Mentor__Student][coordinate][x:1][y:2][coordinate][x:3][y:4][classDefinition][name:Mentor]");
    fileToOutputs.put("016_associationClassMixinPosition.ump", "");
    fileToOutputs.put("016_associationClassRelationshipNotDefined.ump", "fill_me_in");
    fileToOutputs.put("016_unknownAssociationPosition.ump", "[classDefinition][name:Student][elementPosition][x:10][y:20][width:30][height:40][associationPosition][name:Mentor__Student][coordinate][x:1][y:2][coordinate][x:3][y:4]");
    fileToOutputs.put("016_associationClassPosition.ump", "[classDefinition][name:Student][inlineAssociation][inlineAssociationEnd][bound:1][arrow:--][associationEnd][bound:*][type:Mentor][elementPosition][x:1][y:2][width:3][height:4][associationPosition][name:Mentor__Student][coordinate][x:1][y:2][coordinate][x:3][y:4][classDefinition][name:Mentor][associationClassDefinition][name:Relationship][singleAssociationEnd][bound:*][type:Student][singleAssociationEnd][bound:*][type:Mentor][elementPosition][x:10][y:20][width:30][height:40]");
    fileToOutputs.put("017_glossary.ump","[glossary][word][singular:entity][plural:entities]");
    fileToOutputs.put("018_key.ump","[classDefinition][name:Student][attribute][name:id][attribute][name:name][key][keyId:id][keyId:name][classDefinition][name:Mentor][attribute][name:employeeId][key][keyId:employeeId][classDefinition][name:Course][attribute][name:code][defaultKey]");
    fileToOutputs.put("018_cannotHaveDuplicateKeys.ump", "[classDefinition][name:Student][attribute][name:id][attribute][name:name][attribute][name:age][key][keyId:id][keyId:name][key][keyId:age]");
    fileToOutputs.put("018_inheritedKeys.ump", "[classDefinition][name:Student][attribute][type:Integer][name:a][classDefinition][name:Mentor][extendsName:Student][attribute][type:Integer][name:b][key][keyId:a][keyId:b]");
    fileToOutputs.put("019_before.ump","[classDefinition][name:Student][attribute][name:name][beforeCode][injectionOperation][operationName:setName][code:doSomething();]");
    fileToOutputs.put("019_after.ump","[classDefinition][name:Student][attribute][name:name][afterCode][injectionOperation][operationName:getName][code:notReallyPossible();]");
    fileToOutputs.put("020_enumEmpty.ump","[classDefinition][name:Student][stateMachine][enum][name:status]");
    fileToOutputs.put("020_enum.ump","[classDefinition][name:Student][stateMachine][enum][name:status][stateName:FullTime][stateName:PartTime][stateName:MidTime][stateMachine][enum][name:grade][stateName:High]");
    fileToOutputs.put("020_enumLongHand.ump","[classDefinition][name:Student][stateMachine][inlineStateMachine][name:status][state][stateName:FullTime][state][stateName:PartTime]");
    fileToOutputs.put("021_nestedUse.ump","[classDefinition][name:Student][attribute][name:fisrtName][useStatement][use:021_nestedUse_B.ump][classDefinition][name:Student][attribute][name:lastName][useStatement][use:021_nestedUse_C.ump][classDefinition][name:Student][attribute][name:middleName]");
    fileToOutputs.put("022_immutableClass.ump","[classDefinition][name:Student][immutable:immutable][classDefinition][name:Mentor]");
    fileToOutputs.put("022_mutableToImmutableAssocRight.ump", "[classDefinition][name:StudentA][inlineAssociation][inlineAssociationEnd][bound:1][arrow:->][associationEnd][bound:1][type:MentorA][classDefinition][name:MentorA][immutable:immutable]");
    fileToOutputs.put("022_mutableToImmutableAssocLeft.ump", "[classDefinition][name:StudentB][immutable:immutable][inlineAssociation][inlineAssociationEnd][bound:1][arrow:<-][associationEnd][bound:1][type:MentorB][classDefinition][name:MentorB]");
    fileToOutputs.put("022_immutableToImmutableAssocRight.ump", "[classDefinition][name:StudentC][immutable:immutable][inlineAssociation][inlineAssociationEnd][bound:1][arrow:->][associationEnd][bound:*][type:MentorC][classDefinition][name:MentorC][immutable:immutable]");
    fileToOutputs.put("022_immutableToImmutableAssocLeft.ump", "[classDefinition][name:StudentD][immutable:immutable][inlineAssociation][inlineAssociationEnd][bound:*][arrow:<-][associationEnd][bound:1][type:MentorD][classDefinition][name:MentorD][immutable:immutable]");
    fileToOutputs.put("022_immutableClass.ump","[classDefinition][name:Student][immutable:immutable][classDefinition][name:Mentor]");
    fileToOutputs.put("022_mutableToImmutableAssocRightIndependent.ump", "[classDefinition][name:StudentA][classDefinition][name:MentorA][immutable:immutable][associationDefinition][association][associationEnd][bound:1][type:StudentA][arrow:->][associationEnd][bound:1][type:MentorA]");
    fileToOutputs.put("022_mutableToImmutableAssocLeftIndependent.ump", "[classDefinition][name:StudentB][immutable:immutable][classDefinition][name:MentorB][associationDefinition][association][associationEnd][bound:1][type:StudentB][arrow:<-][associationEnd][bound:1][type:MentorB]");
    fileToOutputs.put("022_immutableToImmutableAssocRightIndependent.ump", "[classDefinition][name:StudentC][immutable:immutable][classDefinition][name:MentorC][immutable:immutable][associationDefinition][association][associationEnd][bound:1][type:StudentC][arrow:->][associationEnd][bound:*][type:MentorC]");
    fileToOutputs.put("022_immutableToImmutableAssocLeftIndependent.ump", "[classDefinition][name:StudentD][immutable:immutable][classDefinition][name:MentorD][immutable:immutable][associationDefinition][association][associationEnd][bound:*][type:StudentD][arrow:<-][associationEnd][bound:1][type:MentorD]");
    
    expectedResult = "[classDefinition][name:A][inlineAssociation][inlineAssociationEnd][bound:*][arrow:--][associationEnd][bound:*][type:B][inlineAssociation][inlineAssociationEnd][bound:1][arrow:->][associationEnd][bound:*][type:C][inlineAssociation][inlineAssociationEnd][bound:*][arrow:<-][associationEnd][lowerBound:0][upperBound:2][type:D][classDefinition][name:B][inlineAssociation][inlineAssociationEnd][bound:1][arrow:--][associationEnd][bound:1][type:D]" 
                + "[classDefinition][name:C][classDefinition][name:D][associationDefinition][association][associationEnd][lowerBound:0][upperBound:5][type:B][roleName:someBs][arrow:--][associationEnd][lowerBound:0][upperBound:5][type:C][association][associationEnd][bound:1][type:D][arrow:<-][associationEnd][bound:1][type:A][association][associationEnd][bound:1][type:C][arrow:->][associationEnd][bound:*][type:B][associationClassDefinition][name:CToD][singleAssociationEnd][bound:*][type:C][singleAssociationEnd][bound:*][type:D]";
    fileToOutputs.put("022_mutableClassesValidAssociations.ump", expectedResult);    
    fileToOutputs.put("023_immutableInternalAssociation.ump", "[classDefinition][name:Student][immutable:immutable][inlineAssociation][modifier:immutable][inlineAssociationEnd][bound:1][arrow:->][associationEnd][bound:*][type:Mentor][roleName:aMentor][inlineAssociation][modifier:immutable][inlineAssociationEnd][bound:*][roleName:me][arrow:->][associationEnd][bound:*][type:Student][roleName:them][classDefinition][name:Mentor][immutable:immutable]");
    fileToOutputs.put("023_immutableInternalOtherWayAssociation.ump", "[classDefinition][name:Student][immutable:immutable][inlineAssociation][modifier:immutable][inlineAssociationEnd][bound:*][roleName:them][arrow:<-][associationEnd][bound:1][type:Student][roleName:me][classDefinition][name:Mentor][immutable:immutable][inlineAssociation][modifier:immutable][inlineAssociationEnd][bound:*][roleName:aMentor][arrow:<-][associationEnd][bound:1][type:Student]");
    fileToOutputs.put("023_immutableExternalAssociation.ump","[classDefinition][name:Student][immutable:immutable][classDefinition][name:Mentor][immutable:immutable][associationDefinition][association][modifier:immutable][associationEnd][bound:1][type:Student][arrow:->][associationEnd][lowerBound:6][upperBound:9][type:Mentor][roleName:myMentor][association][modifier:immutable][associationEnd][bound:*][type:Student][roleName:me][arrow:->][associationEnd][bound:*][type:Student][roleName:them]");
    fileToOutputs.put("023_immutableExternalOtherWayAssociation.ump","[classDefinition][name:Student][immutable:immutable][classDefinition][name:Mentor][immutable:immutable][associationDefinition][association][modifier:immutable][associationEnd][lowerBound:6][upperBound:9][type:Mentor][roleName:myMentor][arrow:<-][associationEnd][bound:1][type:Student][association][modifier:immutable][associationEnd][bound:*][type:Student][roleName:them][arrow:<-][associationEnd][bound:*][type:Student][roleName:me]");
    fileToOutputs.put("024_multipleUnnamedOneWayAssociationsToSameClass.ump", "[classDefinition][name:TestClass][inlineAssociation][inlineAssociationEnd][bound:*][arrow:->][associationEnd][lowerBound:3][upperBound:5][type:OtherClass][roleName:othersOne][inlineAssociation][inlineAssociationEnd][bound:*][arrow:->][associationEnd][lowerBound:1][upperBound:3][type:OtherClass][roleName:othersTwo][classDefinition][name:OtherClass]");
    fileToOutputs.put("024_multiAssocToSameClassWithOneRoleName.ump", "[classDefinition][name:Person][classDefinition][name:Course][inlineAssociation][inlineAssociationEnd][bound:*][roleName:courseProf][arrow:--][associationEnd][bound:1][type:Person][roleName:prof][inlineAssociation][inlineAssociationEnd][bound:*][arrow:--][associationEnd][lowerBound:1][upperBound:*][type:Person][roleName:students]");
    fileToOutputs.put("024_multiAssocToSameClassWithMultiRoleName.ump", "[classDefinition][name:Person][classDefinition][name:Course][inlineAssociation][inlineAssociationEnd][bound:*][roleName:courseProf][arrow:--][associationEnd][bound:1][type:Person][roleName:prof][inlineAssociation][inlineAssociationEnd][bound:*][roleName:courseStudent][arrow:--][associationEnd][lowerBound:1][upperBound:*][type:Person][roleName:students]");
    fileToOutputs.put("024_multiAssocToAnotherClassWithOneRuleName.ump", "[classDefinition][name:Person][classDefinition][name:Course][inlineAssociation][inlineAssociationEnd][bound:*][roleName:instructor][arrow:--][associationEnd][bound:*][type:Person][roleName:prof][inlineAssociation][inlineAssociationEnd][bound:*][roleName:student][arrow:--][associationEnd][bound:*][type:Person]");
    
    fileToOutputs.put("030_mixingRegularAndDerivedAttributes_bug201.ump","[namespace:example][classDefinition][name:Student][attribute][name:one][attribute][name:two][attribute][name:three][code:one + \":\" + two]");
    
    fileToOutputs.put("032_abstractClass.ump", "[classDefinition][name:Foo][abstract:abstract][classDefinition][name:Bar]");
    
    fileToOutputs.put("400_commentsBeforeClasses.ump", "[namespace:example][inlineComment:This is a simple comment][classDefinition][name:Student]");
    fileToOutputs.put("400_commentsBeforeMultipleClasses.ump", "[namespace:example][inlineComment:This is a simple comment][classDefinition][name:Student][classDefinition][name:Mentor][inlineComment:This is a course file][classDefinition][name:Course]");
    fileToOutputs.put("400_commentsWayBeforeClass.ump", "[inlineComment:This is a simple comment][namespace:example][classDefinition][name:Student]");
    fileToOutputs.put("400_multiCommentsBeforeClassesTest.ump", "[namespace:example][inlineComment:This is a simple comment][inlineComment:Multiline comment test][classDefinition][name:Student]");
    fileToOutputs.put("500_DebugMode.ump", "[debug:debug][classDefinition][name:Student]");
    fileToOutputs.put("213_mixin_namespaces_1.ump", "[namespace:A][classDefinition][name:X][namespace:B][classDefinition][name:Y][classDefinition][name:X]");

    fileToOutputs.put("213_mixin_namespaces_2.ump", "[classDefinition][name:X][namespace:B][classDefinition][name:Y][classDefinition][name:X]");
    
    fileToOutputs.put("026_externalDefinitionAndClassDefinition_first.ump", "[externalDefinition][name:X][classDefinition][name:X][attribute][name:abcd]");
    fileToOutputs.put("026_externalDefinitionAndClassDefinition_last.ump", "[classDefinition][name:X][attribute][name:abcd][externalDefinition][name:X]");
    fileToOutputs.put("026_externalDefinitionAndClassDefinition_middle.ump", "[classDefinition][name:X][attribute][name:abcd][externalDefinition][name:X][classDefinition][name:X][attribute][name:xyz]");

    fileToOutputs.put("412_association_comment.ump", "[classDefinition][name:A][attribute][name:aName][classDefinition][name:B][attribute][name:bName][associationDefinition][association][associationEnd][bound:1][type:A][arrow:--][associationEnd][bound:*][type:B][inlineComment:comment....]");
    
    fileToOutputs.put("027_generateSuboption.ump", "[generate][language:GvClassDiagram][suboptionIndicator:--suboption][suboption:hideattributes][suboptionIndicator:-s][suboption:showmethods]");
    fileToOutputs.put("027_generateSuboptionOverride.ump", "[generate_path][language:GvClassDiagram][output:blah/blah/blah][override:--override][suboptionIndicator:-s][suboption:hideattributes]");
  }

  @Before
  public void mySetUp()
  {
    umpleParserName = "cruise.umple.compiler.UmpleInternalParser";
  }
  
  @Override
  public void assertParse(String filename)
  {
    if (fileToOutputs.containsKey(filename))
    {
      String expectedResult = fileToOutputs.get(filename);
      assertParse(filename, expectedResult);
      System.out.println("Result: " + expectedResult);
    }
    else
    {
      // There should be an expected result, but there wasn't
      // Go ahead and try parsing anyway so in the error message we can say what
      // the parse was. This output needs to be put in fileToOutputs above
      parse(filename);
      Assert.fail("Please provide a expected output of the tokenized string. If you don't want to do that, use assertSimpleParse. Output found which should be compared: "+parser.toString());
    }
  }

  private void assertParse(String filename, String expectedOutput)
  {
	  
    boolean answer = parse(filename);
    if (answer != true)
    {
      Assert.fail("Did no parse:" + parser.getParseResult().getErrorMessages());
    }
    Assert.assertEquals(true, answer);
    AssertHelper.assertEqualsSafe(expectedOutput, parser.toString());  
  }
  
  
}
