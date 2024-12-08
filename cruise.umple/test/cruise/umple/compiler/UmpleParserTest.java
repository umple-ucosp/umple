/*

 Copyright: All contributers to the Umple Project

 This file is made available subject to the open source license found at:
 https://umple.org/license

*/

package cruise.umple.compiler;

import java.io.File;
import java.util.*;

import org.junit.*;

import cruise.umple.parser.ErrorMessage;
import cruise.umple.parser.ErrorTypeSingleton;
import cruise.umple.parser.ParseResult;
import cruise.umple.parser.Position;
import cruise.umple.parser.analysis.RuleBasedParser;
import cruise.umple.util.*;

import java.io.*;

import cruise.umple.parser.Token;
import cruise.umple.parser.Position;
import cruise.umple.util.SampleFileWriter;
import cruise.umple.compiler.exceptions.*;

public class UmpleParserTest
{

  public UmpleParser parser;
  public UmpleModel model;
  public String pathToInput;
  public String umpleParserName;

  @Before
  public void setUp()
  {
    pathToInput = SampleFileWriter.rationalize("test/cruise/umple/compiler");
    umpleParserName = "cruise.umple.compiler.UmpleInternalParser";
  }


  @Test
  public void compositionParseTest() {
	  assertSimpleParse("011_compositionParseTest_indDef.ump");
	  assertSimpleParse("011_compositionParseTest_inlineDef.ump");
  }

  @Test
  public void compositionParseTest_leftVarNames() {
	  assertSimpleParse("011_compositionParseTest_leftVarNames.ump");
  }

  @Test
  public void compositionParseTest_DoubleDefinition() {
	  assertFailedParse("011_compositionParseTest_doubleDirected.ump", 1502);
  }

  @Test
  public void toplevelExtracode()
  {
    assertSimpleParse("001_toplevelExtracode.ump");
    Assert.assertNotNull(model.getExtraCodes());
    CodeBlock extraCode = model.getExtraCode(0);
    Assert.assertNotNull(extraCode);
    Assert.assertEquals("Day",extraCode.getName());
    String extraCppCode = extraCode.getCode("RTCpp");
    Assert.assertEquals("enum Day { MONDAY=0, FRIDAY=1, SUNDAY=2;}", extraCppCode);
  }

  @Test
  public void toplevelExtracodeNoCodeLang()
  {
    assertSimpleParse("001_toplevelExtracode_withoutCodeLang.ump");
    Assert.assertNotNull(model.getExtraCodes());
    CodeBlock extraCode = model.getExtraCode(0);
    Assert.assertNotNull(extraCode);
    String extraJavaCode = extraCode.getCode("");
    Assert.assertEquals("Day",extraCode.getName());
    Assert.assertEquals("enum Day { MONDAY=0, FRIDAY=1, SUNDAY=2;}", extraJavaCode);
  }

  @Test
  public void empty()
  {
    assertParse("001_empty.ump");
    Assert.assertEquals(0,model.numberOfUmpleClasses());
  }

  //Issue 451
  @Test
  public void extraCodeInterfaces()
  {
    assertHasWarningsParse("011_extraCodeInterfaces.ump", 1007);
  }

//Issue 451
  @Test
  public void parseInterfaceCode()
  {
	assertParse("011_extraCodeInterfaces.ump");
  }


//Issue 451b
//A continuation of issue 451, now we're trying to make it so that
//one instance of extra code in an interface doesn't gobble up the
//rest of the interface
  @Test
  public void multipleExtraCodeInterfaces()
  {
    assertParse("011_multipleExtraCodeInterfaces.ump");
  }

//Issue 451b
//The issue word for word from the website.
  @Test
  public void multipleExtraCodeDoubleDeclaration()
  {
    assertParse("011_multipleExtraCodeDoubleDeclaration.ump");
  }

  //Issue 559b
  @Test
  public void multLanguageImplementation()
  {
	  assertNoWarningsParse("015_multLanguageImplementation.ump");
	  assertNoWarningsParse("015_multLanguageImplementation2.ump");
	  assertHasWarningsParse("015_multLanguageImplementation3.ump", 49);
	  assertHasWarningsParse("015_multLanguageImplementation4.ump", 49);
	  assertHasWarningsParse("015_multLanguageImplementation5.ump", 49);
	  assertHasWarningsParse("015_multLanguageImplementation6.ump", 49);
	  assertNoWarningsParse("015_multLanguageImplementation7.ump");

  }

  //Issue 595
  @Test
  public void unknownInterface()
  {
	  assertHasWarningsParse("014_unknownInterface.ump", 39);
	  assertHasWarningsParse("014_unknownInterface2.ump", 39);

  }

  //Issue 596
  @Test
  public void interfaceBodyWithComments()
  {
	  assertHasWarningsParse("014_interfaceTest.ump", 39);
	  assertHasWarningsParse("014_interfaceTest2.ump", 39);

  }

  @Test
  public void emptyComment()
  {
	  assertParse("001_emptyComment.ump");
	  Assert.assertEquals(1, model.numberOfUmpleClasses());
  }
  
  @Test
   public void pythonStyleEmptyComment()
   {
 	  assertParse("001_pythonStyleEmptyComment.ump");
 	  Assert.assertEquals(1, model.numberOfUmpleClasses());
   }

  @Test
  public void multipleEmptyComments()
  {
	  assertParse("001_multipleEmptyComments.ump");
	  Assert.assertEquals(3, model.numberOfUmpleClasses());
  }

  @Test
  public void emptyCommentWithSpaces()
  {
	  assertParse("001_emptyCommentWithSpaces.ump");
	  Assert.assertEquals(1, model.numberOfUmpleClasses());
  }

  @Test
  public void multipleEmptyCommentsWithSpaces()
  {
	  assertParse("001_multipleEmptyCommentsWithSpaces.ump");
	  Assert.assertEquals(5, model.numberOfUmpleClasses());
  }

  @Test
  public void emptyMultiLineComment()
  {
	  assertParse("001_emptyMultiLineComment.ump");
	  Assert.assertEquals(1, model.numberOfUmpleClasses());
  }

  @Test
  public void emptyMultiLineCommentWithSpaces()
  {
	  assertParse("001_emptyMultiLineCommentWithSpaces.ump");
	  Assert.assertEquals(1, model.numberOfUmpleClasses());
  }

  @Test
  public void multipleEmptyMultiLineCommentsWithSpaces()
  {
	  assertParse("001_multipleEmptyMultiLineCommentsWithSpaces.ump");
	  Assert.assertEquals(6, model.numberOfUmpleClasses());
  }

  @Test
  public void methodDetection()
  {
	  assertParse("001_methodInlineComment.ump");
	  Assert.assertEquals(true, model.getUmpleClass(0).numberOfMethods() == 1);
  }

  @Test
  public void methodInlineComment()
  {
	  assertParse("001_methodInlineComment.ump");
	  Assert.assertEquals(1, model.getUmpleClass(0).getMethod(0).numberOfComments());
  }

  @Test
  public void methodMultilineComment()
  {
	  assertParse("001_methodMultilineComment.ump");
	  Assert.assertEquals(1, model.getUmpleClass(0).getMethod(0).numberOfComments());
  }

  @Test
  public void multipleMethodComments()
  {
	  assertParse("001_multipleMethodComments.ump");

	  // Check to see if the methods have the correct number of comments associated with them.
	  Assert.assertEquals(1, model.getUmpleClass(0).getMethod(0).numberOfComments());
	  Assert.assertEquals(2, model.getUmpleClass(0).getMethod(1).numberOfComments());
	  Assert.assertEquals(1, model.getUmpleClass(0).getMethod(2).numberOfComments());
	  Assert.assertEquals(2, model.getUmpleClass(0).getMethod(3).numberOfComments());
  }

  @Test
  public void methodBodyGenerationMultiLanguage()
  {
    assertSimpleParse("001_methodBodyGenerationMultiLanguage.ump");
    Assert.assertEquals(1, model.numberOfUmpleClasses());
    UmpleClass c = model.getUmpleClass(0);
    Assert.assertEquals(2, c.numberOfMethods());
    Method m = c.getMethod(0);

    Assert.assertEquals(false,m.getExistsInLanguage("Php"));
    Assert.assertEquals(true,m.getExistsInLanguage("Java"));
    Assert.assertEquals(false,m.getExistsInLanguage("Cpp"));

    Method m2 = c.getMethod(1);
    Assert.assertEquals(true,m2.getExistsInLanguage("Php"));
    Assert.assertEquals(true,m2.getExistsInLanguage("Java"));
    Assert.assertEquals(true,m2.getExistsInLanguage("Cpp"));
  }

  @Test
  public void codeBlockMultiLanguage()
  {
    assertSimpleParse("001_methodBodyGenerationMultiLanguage.ump");
    Assert.assertEquals(1, model.numberOfUmpleClasses());
    UmpleClass c = model.getUmpleClass(0);
    Assert.assertEquals(2, c.numberOfMethods());

    CodeBlock cb1 = c.getMethod(0).getMethodBody().getCodeblock();
    Assert.assertEquals(true, cb1.hasAnAssociatedLanguage());
    Assert.assertEquals(true,cb1.hasCode("Java"));
    Assert.assertEquals(false,cb1.hasCode("Php"));
    Assert.assertEquals(false,cb1.hasCode("Cpp"));

    CodeBlock cb2 = c.getMethod(1).getMethodBody().getCodeblock();
    Assert.assertEquals(false, cb2.hasAnAssociatedLanguage());
    Assert.assertEquals(false,cb2.hasCode("Java"));
    Assert.assertEquals(false,cb2.hasCode("Php"));
    Assert.assertEquals(false,cb2.hasCode("Cpp"));
  }


  @Test
  public void attributeInlineComment()
  {
	  assertParse("001_attributeInlineComment.ump");
	  Assert.assertEquals(1, model.getUmpleClass(0).getAttribute(0).numberOfComments());
  }

  @Test
  public void pythonStyleAttributeInlineComment()
  {
 	  assertParse("001_pythonStyleAttributeInlineComment.ump");
 	  Assert.assertEquals(1, model.getUmpleClass(0).getAttribute(0).numberOfComments());
   }
  
  @Test
  public void attributeMultilineComment()
  {
	  assertParse("001_attributeMultilineComment.ump");
	  Assert.assertEquals(1, model.getUmpleClass(0).getAttribute(0).numberOfComments());
  }

  @Test
  public void multipleAttributeComments()
  {
	  assertParse("001_multipleAttributeComments.ump");

	  // Check to see if the attributes have the correct number of comments associated with them.
	  Assert.assertEquals(1, model.getUmpleClass(0).getAttribute(0).numberOfComments());
	  Assert.assertEquals(2, model.getUmpleClass(0).getAttribute(1).numberOfComments());
	  Assert.assertEquals(1, model.getUmpleClass(0).getAttribute(2).numberOfComments());
	  Assert.assertEquals(2, model.getUmpleClass(0).getAttribute(3).numberOfComments());
  }

  @Test
  public void associationInlineComment()
  {
	  assertParse("001_associationInlineComment.ump");
	  Assert.assertEquals(1, model.getUmpleClass(0).getAssociationVariable(0).numberOfComments());
  }

  @Test
  public void pythonStyleAssociationInlineComment()
  {
 	  assertParse("001_pythonStyleAssociationInlineComment.ump");
	  Assert.assertEquals(1, model.getUmpleClass(0).getAssociationVariable(0).numberOfComments());
  }

  @Test
  public void associationMultilineComment()
  {
	  assertParse("001_associationMultilineComment.ump");
	  Assert.assertEquals(1, model.getUmpleClass(0).getAssociationVariable(0).numberOfComments());
  }

  @Test
  public void multipleAssociationComments()
  {
	  assertParse("001_multipleAssociationComments.ump");

	  // Check to see if the attributes have the correct number of comments associated with them.
	  Assert.assertEquals(1, model.getUmpleClass(0).getAssociationVariable(0).numberOfComments());
	  Assert.assertEquals(2, model.getUmpleClass(0).getAssociationVariable(1).numberOfComments());
	  Assert.assertEquals(1, model.getUmpleClass(0).getAssociationVariable(2).numberOfComments());
	  Assert.assertEquals(2, model.getUmpleClass(0).getAssociationVariable(3).numberOfComments());
  }

  @Test
  public void oneCharacterMethod()
  {
	  assertParse("001_oneCharacterMethod.ump");

	  /*
	  model.generate();
	  Collection<String> c = model.getGeneratedCode().values();
	  String generatedCode = (String)c.iterator().next();
	  System.out.println("GENERATED CODE: [" + generatedCode + "]");
	  */

	  // Ensure that a class exists, along with a method when the method name is short.
	  Assert.assertEquals(1, model.numberOfUmpleClasses());
	  Assert.assertEquals(1, model.getUmpleClass(0).numberOfMethods());
	  Assert.assertEquals("m", model.getUmpleClass(0).getMethod(0).getName());
  }

  @Test
  public void twoCharacterMethod()
  {
	  assertParse("001_twoCharacterMethod.ump");

	  /*
	  model.generate();
	  Collection<String> c = model.getGeneratedCode().values();
	  String generatedCode = (String)c.iterator().next();
	  System.out.println("GENERATED CODE: [" + generatedCode + "]");
	  */

	  // Ensure that a class exists, along with a method when the method name is short.
	  Assert.assertEquals(1, model.numberOfUmpleClasses());
	  Assert.assertEquals(1, model.getUmpleClass(0).numberOfMethods());
	  Assert.assertEquals("m1", model.getUmpleClass(0).getMethod(0).getName());
  }

  @Test
  public void internalAttributeGetterMethod()
  {
    assertSimpleParse("008_internalAttributeNotAllowedGetterMethod.ump");
    Assert.assertEquals(1, model.numberOfUmpleClasses());
    Assert.assertEquals(1, model.getUmpleClass(0).numberOfAttributes());
    Assert.assertEquals("internal", model.getUmpleClass(0).getAttribute(0).getModifier());
    Assert.assertEquals(1, model.getUmpleClass(0).numberOfMethods());
    Assert.assertEquals("getTest",model.getUmpleClass(0).getMethod(0).getName());
    Assert.assertEquals("MyOtherObject", model.getUmpleClass(0).getMethod(0).getType());
  }

  @Test
  public void languageDefault()
  {
    assertParse("001_empty.ump");
    Assert.assertEquals("Java", model.getDefaultGenerate());
  }

  @Test
  public void abstractClass()
  {
	  assertParse("032_abstractClass.ump");

	  /*
	  model.generate();
	  Collection<String> c = model.getGeneratedCode().values();
	  String generatedCode = (String)c.iterator().next();
	  System.out.println("GENERATED CODE: [" + generatedCode + "]");
	  */

	  Assert.assertEquals(true, model.getUmpleClass("Foo").getIsAbstract());
	  Assert.assertEquals(false, model.getUmpleClass("Bar").getIsAbstract());
  }

  @Test
  public void abstractMethod()
  {
    assertSimpleParse("422_abstractMethod.ump");

    Assert.assertEquals(1, model.getUmpleClass("Foome").numberOfMethods());
    Assert.assertEquals("barme", model.getUmpleClass("Foome").getMethod(0).getName());
    Assert.assertEquals(true, model.getUmpleClass("Foome").getMethod(0).getIsAbstract());
  }

  @Test
  public void abstractInheritanceClass()
  {
    assertSimpleParse("422_abstractInheritanceClass.ump");

    Assert.assertEquals(true,model.getUmpleClass("A").getIsAbstract());
    Assert.assertEquals(true,model.getUmpleClass("B").getIsAbstract());
    Assert.assertEquals(true,model.getUmpleClass("C").getIsAbstract());
    Assert.assertEquals(false,model.getUmpleClass("D").getIsAbstract());
    Assert.assertEquals(false,model.getUmpleClass("E").getIsAbstract());
  }
  
  @Test
  public void abstractClassAssociation()
  {
    assertFailedParse("422_abstractClassAssociation1.ump",80);
    assertFailedParse("422_abstractClassAssociation2.ump",80);
    assertFailedParse("422_abstractClassAssociation3.ump",80);
    assertFailedParse("422_abstractClassAssociation4.ump",80);
  }

  //Issue 1159
  @Test
  public void nestedClassCyclicInheritance() {
    assertFailedParse("422_nestedClassCyclicInheritance1.ump",11);
    assertFailedParse("422_nestedClassCyclicInheritance2.ump",12);
    assertFailedParse("422_nestedClassCyclicInheritance3.ump",12);
    assertFailedParse("422_nestedClassCyclicInheritance4.ump",12);
    assertFailedParse("422_nestedClassCyclicInheritance5.ump",11);
    assertFailedParse("422_nestedClassCyclicInheritance6.ump",12);
  }

  //Issue 1159
  @Test
  public void nestedClassMultipleInheritance() {
    assertFailedParse("422_nestedClassMultipleInheritance1.ump",34);
    assertFailedParse("422_nestedClassMultipleInheritance2.ump",34);
    assertFailedParse("422_nestedClassMultipleInheritance3.ump",34);
  }
  
  //Issue 1181
  @Test
  public void multipleClassBlockInheritance() {
    assertFailedParse("422_multipleClassBlockInheritance1.ump",34);
    assertSimpleParse("422_multipleClassBlockInheritance2.ump");
  }
 
  @Test
  public void abstractInterfaceExtends()
  {
    assertSimpleParse("423_interfaceInheritanceAbstract.ump");

    Assert.assertEquals(1,model.getUmpleInterface("I").numberOfMethods());
    Assert.assertEquals("I1",model.getUmpleInterface("I").getMethod(0).getName());
    Assert.assertEquals(1,model.getUmpleClass("A").numberOfMethods());
    Assert.assertEquals("I1",model.getUmpleClass("A").getMethod(0).getName());
    Assert.assertEquals(0,model.getUmpleClass("B").numberOfMethods());
    Assert.assertEquals(0,model.getUmpleClass("C").numberOfMethods());
    Assert.assertEquals(1,model.getUmpleClass("D").numberOfMethods());
    Assert.assertEquals("I1",model.getUmpleClass("D").getMethod(0).getName());
  }

  @Test
  public void immutableClass()
  {
    assertParse("022_immutableClass.ump");
    Assert.assertEquals(true,model.getUmpleClass("Student").isImmutable());
    Assert.assertEquals(false,model.getUmpleClass("Mentor").isImmutable());
  }

//Issue 1152
  @Test
  public void propagateImmutabilityToAllRelationships(){
    assertSimpleParse("022_propagateImmutabilityToAllRelationships.ump");
    Assert.assertEquals(false,model.getUmpleClass("URLMS").isImmutable());
    Assert.assertEquals(false,model.getUmpleClass("Staff").isImmutable());
    Assert.assertEquals(false,model.getUmpleClass("FundingAccount").isImmutable());
    Assert.assertEquals(false,model.getUmpleClass("Report").isImmutable());
    Assert.assertEquals(false,model.getUmpleClass("LabExpense").isImmutable());
    Assert.assertEquals(false,model.getUmpleClass("Equipment").isImmutable());
    Assert.assertEquals(false,model.getUmpleClass("Supply").isImmutable());
  }
  
  //Issue 559
  @Test
  public void mixin_redefiningAMethod()
  {
    assertHasWarningsParse("015_mixin_sameMethod.ump", 49);
    assertHasWarningsParse("015_mixin_sameMethod2.ump", 49);
    assertHasWarningsParse("015_mixin_sameMethod3.ump", 49);
    assertSimpleParse("015_mixin_sameMethod4.ump");
    assertHasWarningsParse("015_mixin_sameMethod5.ump", 49);
    assertHasWarningsParse("015_mixin_sameMethod6.ump", 49);
    
    //Issue 771
    //same method name, different types
    assertHasWarningsParse("015_mixin_sameMethod7.ump", 71);
    assertHasWarningsParse("015_mixin_sameMethod8.ump", 71);
    assertHasWarningsParse("015_mixin_sameMethod9.ump", 71);
    assertHasWarningsParse("015_mixin_sameMethod10.ump", 71);
    assertHasWarningsParse("015_mixin_sameMethod11.ump", 71);
  }
  
  //Issue 682
  @Test
  public void operationNotFound()
  {
    assertHasWarningsParse("1012_operationNotFound1.ump", 1012);
    assertHasWarningsParse("1014_operationNotFound1.ump", 1014);
  }
  //Issue 2023
  @Test 
  public void extraBracketsWarning()
  {
    assertHasWarningsParse("1016_ExtrabracketTest1.ump", 1016);
    assertHasWarningsParse("1016_ExtrabracketTest2.ump", 1016);
    assertHasWarningsParse("1016_ExtrabracketTest3.ump", 1016);
    assertHasWarningsParse("1016_ExtrabracketTest4.ump", 1016);
  }
  @Test
  public void validAssociationsForImmutableClass()
  {
    assertParse("022_mutableToImmutableAssocRight.ump");
    UmpleClass studentClass = model.getUmpleClass("StudentA");
    UmpleClass mentorClass = model.getUmpleClass("MentorA");
    Assert.assertFalse(studentClass.isImmutable());
    Assert.assertTrue(mentorClass.isImmutable());
    Assert.assertFalse(studentClass.getAssociationVariableFor(mentorClass).isImmutable());
    Assert.assertFalse(mentorClass.getAssociationVariableFor(studentClass).isImmutable());

    assertParse("022_mutableToImmutableAssocLeft.ump");
    studentClass = model.getUmpleClass("StudentB");
    mentorClass = model.getUmpleClass("MentorB");
    Assert.assertTrue(studentClass.isImmutable());
    Assert.assertFalse(mentorClass.isImmutable());
    Assert.assertFalse(studentClass.getAssociationVariableFor(mentorClass).isImmutable());
    Assert.assertFalse(mentorClass.getAssociationVariableFor(studentClass).isImmutable());

    assertParse("022_immutableToImmutableAssocRight.ump");
    studentClass = model.getUmpleClass("StudentC");
    mentorClass = model.getUmpleClass("MentorC");
    Assert.assertTrue(studentClass.isImmutable());
    Assert.assertTrue(mentorClass.isImmutable());
    Assert.assertTrue(studentClass.getAssociationVariableFor(mentorClass).isImmutable());
    Assert.assertTrue(mentorClass.getAssociationVariableFor(studentClass).isImmutable());

    assertParse("022_immutableToImmutableAssocLeft.ump");
    studentClass = model.getUmpleClass("StudentD");
    mentorClass = model.getUmpleClass("MentorD");
    Assert.assertTrue(studentClass.isImmutable());
    Assert.assertTrue(mentorClass.isImmutable());
    Assert.assertTrue(studentClass.getAssociationVariableFor(mentorClass).isImmutable());
    Assert.assertTrue(mentorClass.getAssociationVariableFor(studentClass).isImmutable());
  }

  @Test
  public void validAssociationsForImmutableClass_independentlyDefined()
  {
    assertParse("022_mutableToImmutableAssocRightIndependent.ump");
    UmpleClass studentClass = model.getUmpleClass("StudentA");
    UmpleClass mentorClass = model.getUmpleClass("MentorA");
    Assert.assertFalse(studentClass.isImmutable());
    Assert.assertTrue(mentorClass.isImmutable());
    Assert.assertFalse(studentClass.getAssociationVariableFor(mentorClass).isImmutable());
    Assert.assertFalse(mentorClass.getAssociationVariableFor(studentClass).isImmutable());

    assertParse("022_mutableToImmutableAssocLeftIndependent.ump");
    studentClass = model.getUmpleClass("StudentB");
    mentorClass = model.getUmpleClass("MentorB");
    Assert.assertTrue(studentClass.isImmutable());
    Assert.assertFalse(mentorClass.isImmutable());
    Assert.assertFalse(studentClass.getAssociationVariableFor(mentorClass).isImmutable());
    Assert.assertFalse(mentorClass.getAssociationVariableFor(studentClass).isImmutable());

    assertParse("022_immutableToImmutableAssocRightIndependent.ump");
    studentClass = model.getUmpleClass("StudentC");
    mentorClass = model.getUmpleClass("MentorC");
    Assert.assertTrue(studentClass.isImmutable());
    Assert.assertTrue(mentorClass.isImmutable());
    Assert.assertTrue(studentClass.getAssociationVariableFor(mentorClass).isImmutable());
    Assert.assertTrue(mentorClass.getAssociationVariableFor(studentClass).isImmutable());

    assertParse("022_immutableToImmutableAssocLeftIndependent.ump");
    studentClass = model.getUmpleClass("StudentD");
    mentorClass = model.getUmpleClass("MentorD");
    Assert.assertTrue(studentClass.isImmutable());
    Assert.assertTrue(mentorClass.isImmutable());
    Assert.assertTrue(studentClass.getAssociationVariableFor(mentorClass).isImmutable());
    Assert.assertTrue(mentorClass.getAssociationVariableFor(studentClass).isImmutable());
  }

  @Test
  public void invalidAssociationsForImmutableClass()
  {
    assertFailedParse("022_immutableClassBidirectionalAssoc.ump", new Position("022_immutableClassBidirectionalAssoc.ump",4,1,30), 17);
    assertFailedParse("022_immutableToMutableAssocLeft.ump", new Position("022_immutableToMutableAssocLeft.ump",3,1,18), 13);
    assertFailedParse("022_immutableToMutableAssocRight.ump", new Position("022_immutableToMutableAssocRight.ump",4,1,30), 13);

    assertFailedParse("022_immutableClassToAssociationClass.ump", new Position("022_immutableClassToAssociationClass.ump",13,1,106), 13);
  }

  @Test
  public void invalidAssociationsForImmutableClass_independentlyDefined()
  {
    assertFailedParse("022_immutableClassBidirectionAssocIndependent.ump", new Position("022_immutableClassBidirectionAssocIndependent.ump",13,1,78), 17);
    assertFailedParse("022_immutableToMutableAssocLeftIndependent.ump", new Position("022_immutableToMutableAssocLeftIndependent.ump",12,1,66), 13);
    assertFailedParse("022_immutableToMutableAssocRightIndependent.ump", new Position("022_immutableToMutableAssocRightIndependent.ump",12,1,66), 13);
  }

  @Test
  public void associationsForMutableClassesParseSuccessfully()
  {
    assertParse("022_mutableClassesValidAssociations.ump");
  }

  @Test
  public void classCanNotBeChangedToImmutableWithInvalidAssociations()
  {
	  assertFailedParse("022_changeClassToImmutable.ump", new Position("022_changeClassToImmutable.ump",3,1,22), 13);
  }

  @Test
  public void superclassCanNotBeChangedToImmutableWithInvalidAssociationsInSubclass()
  {
    assertFailedParse("022_changeSuperclassToImmutable.ump", new Position("022_changeSuperclassToImmutable.ump",8,5,62), 16);
  }

  @Test
  public void immutableClassMayNotContainStateMachines()
  {
    assertHasWarningsParse("022_stateMachineInImmutableClass.ump", new Position("022_stateMachineInImmutableClass.ump",13,2,128), 15);
  }

  @Test
  public void javaLanguage()
  {
    assertParse("001_javaLanguage.ump");
    Assert.assertEquals("Java", model.getDefaultGenerate());
  }

  @Test
  public void phpLanguage()
  {
    assertParse("001_phpLanguage.ump");
    Assert.assertEquals("Php", model.getDefaultGenerate());
  }

  @Test
  public void rubyLanguage()
  {
    assertParse("001_rubyLanguage.ump");
    Assert.assertEquals("Ruby", model.getDefaultGenerate());
  }

  @Test
  public void otherLanguage()
  {
    assertFailedParse("001_otherLanguage.ump", new Position("001_otherLanguage.ump", 1,0,0));
  }

  @Test
  public void outputLanguagePath()
  {
	assertParse("001_outputLanguage.ump");

    Assert.assertEquals("Ruby", model.getDefaultGenerate());
    Assert.assertEquals("blah/blah/blah", model.getDefaultGeneratePath());

    Assert.assertEquals(false, model.getGenerate(0).getOverride());
    Assert.assertEquals(false, model.getGenerate(0).getOverrideAll());

    // This test is correct, since 'generate's may be re-ordered after
    // token analysis
    Assert.assertEquals(false, model.getGenerate(1).getOverride());
    Assert.assertEquals(false, model.getGenerate(1).getOverrideAll());

    Assert.assertEquals(true, model.getGenerate(2).getOverride());
    Assert.assertEquals(false, model.getGenerate(2).getOverrideAll());
  }

  @Test
  public void outputLanguagePathOverride()
  {
	assertParse("001_outputLanguageOverride.ump");

	 Assert.assertEquals("Java", model.getDefaultGenerate());
	 Assert.assertEquals("3", model.getDefaultGeneratePath());
  }

  @Test
  public void outputLanguagePathOverrideAll()
  {
	assertParse("001_outputLanguageOverrideAll.ump");

	Assert.assertEquals("Java", model.getDefaultGenerate());
	Assert.assertEquals("4", model.getDefaultGeneratePath());
  }
  @Test
  public void namespace()
  {
    assertParse("002_namespace.ump");
    Assert.assertEquals("cruise",model.getDefaultNamespace());

  }

  @Ignore
  @Test
  public void duplicateNamespace()
  {
	  assertHasWarningsParse("002_DuplicateNamespace.ump", new Position("002_duplicateNamespace.ump",5,10,28));
  }

  @Test
  public void invalidNamespace_noName()
  {
    assertFailedParse("002_invalidNamespace_noName.ump", new Position("002_invalidNamespace_noName.ump",1,0,0));
  }

  @Test
  public void redefineNamespace()
  {
    assertHasWarningsParse("002_redefineNamespace.ump",30,0);
    assertHasWarningsParse("002_redefineNamespace.ump",30,1);
    assertNoWarningsParse("002_defaultRedefineNamespace.ump");
  }

  @Test
  public void notUsedNamespace()
  {
    assertHasWarningsParse("002_notUsedNamespace.ump", new Position("002_notUsedNamespace.ump",1,33,33),31);
    assertHasWarningsParse("002_notUsedNamespace2.ump", new Position("002_notUsedNamespace2.ump",1,10,10),31);
    assertHasWarningsParse("002_notUsedNamespace3.ump", new Position("002_notUsedNamespace3.ump",1,10,10),31);
    assertHasWarningsParse("002_notUsedNamespace4.ump", new Position("002_notUsedNamespace4.ump",1,34,34),31);
  }

  @Test
  public void noDefaultNamespace()
  {
    assertHasWarningsParse("002_noDefaultNamespace.ump",42,0);
    assertHasWarningsParse("002_noDefaultNamespace.ump",42,1);
    assertHasWarningsParse("002_noDefaultNamespace.ump",42,2);
  }

  @Test
  public void emptyClass()
  {
    assertParse("003_emptyClass.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    Assert.assertEquals("Student",aClass.getName());
    Assert.assertEquals(false,aClass.getKey().isProvided());
  }

  @Test
  public void multipleExtraCode()
  {
    assertParse("003_multipleExtraCode.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    AssertHelper.assertEqualsSafe("  blahblah"+
        System.getProperty("line.separator") + "  moreblah",aClass.getExtraCode());
  }

  @Test @Ignore
  public void constructorExtraCode()
  {
	//This test no longer makes sense, because the method is parsed as an umple method
    assertParse("003_constructorExtraCode.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
     Assert.assertEquals(" public Student(String x)  {"+
         System.getProperty("line.separator") + "blah();"+
         System.getProperty("line.separator") + "  }",aClass.getExtraCode());
  }

  @Test
  public void innerClass()
  {
    assertParse("003_innerClass.ump");
    UmpleClass person = model.getUmpleClass("Person");
    Assert.assertEquals("Person",person.getName());

    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(person,student.getExtendsClass());
    Assert.assertEquals("Student",student.getName());

  }

  @Test
  public void unknownClass()
  {
    assertFailedParse("003_unknownClass.ump", new Position("003_unknownClass.ump",5,9,27));
  }

  @Test
  public void commentsInClass()
  {
    assertParse("003_commentsInClass.ump");
  }

  @Test
  public void depend()
  {
    assertParse("004_depend.ump");
    UmpleClass aClass = model.getUmpleClass("Student");

    Assert.assertEquals(1,aClass.numberOfDepends());
    Assert.assertEquals("java.util.Map", aClass.getDepend(0).getName());
  }

  @Test
  public void multipleClasses()
  {
    assertParse("004_multipleClasses.ump");
    Assert.assertEquals(2,model.numberOfUmpleClasses());
  }

  @Test
  public void classAndNamespaces()
  {
    assertParse("004_multipleClassesAndNamespaces.ump");

    UmpleClass studentClass = model.getUmpleClass("Student");
    Assert.assertEquals("cruise.util",studentClass.getPackageName());

    UmpleClass mentorClass = model.getUmpleClass("Mentor");
    Assert.assertEquals("cruise.core",mentorClass.getPackageName());

  }

  @Test
  public void validClassName()
  {
    //Test to ensure that the parser will compile Classes with valid Class names.

    assertSimpleParse("042_validClassNameLowerCase.ump");//all lower case name
    assertSimpleParse("042_validClassNameUpperCase.ump");//all upper case name
    assertSimpleParse("042_validClassNameMixedCase.ump");//mixed case name
    assertSimpleParse("042_validClassNameNumber.ump");//name with numbers
    assertSimpleParse("042_validClassNameUnderscore.ump");//name with underscore
    assertSimpleParse("042_validClassNameUnderNum.ump");//name with underscore and numbers
  }

  @Test
  public void invalidClassNameStart()
  {
    //Test to ensure that the parser will not compile Classes with an invalid Class name.
    //Specifically these tests target invalid starting characters.

    assertFailedParse("042_invalidClassNameStartNum.ump", 100);//name starts with a number
    assertFailedParse("042_invalidClassNameStartUnder.ump", 100);//name starts with an underscore
    assertFailedParse("042_invalidClassNameStartExclaim.ump", 100);//name starts with an exclamation mark
    assertFailedParse("042_invalidClassNameStartAmper.ump", 100);//name starts with an ampersand
    assertFailedParse("042_invalidClassNameStartDollar.ump", 100);//name starts with a dollar sign
    assertFailedParse("042_invalidClassNameStartHash.ump", 100);//name starts with a hash sign
  }

  @Test
  public void invalidClassNamePart()
  {
    //Test to ensure that the parser will not compile Classes with an invalid Class name.
    //Specifically these tests target invalid characters in part of the name.

    assertFailedParse("042_invalidClassNamePartQuest.ump", 100);//name contains a question mark
    assertFailedParse("042_invalidClassNamePartExclaim.ump", 100);//name contains an exclamation mark
    assertFailedParse("042_invalidClassNamePartAmper.ump", 100);//name contains an ampersand
    assertFailedParse("042_invalidClassNamePartDollar.ump", 100);//name contains a dollar sign
    assertFailedParse("042_invalidClassNamePartDot.ump", 100);//name contains a period
    assertFailedParse("042_invalidClassNamePartQuote.ump", 100);//name contains quotation marks
  }


  @Test
  public void validInterfaceName()
  {
    //Test to ensure that the parser will compile Interfaces with valid names.

    assertSimpleParse("043_validInterfaceNameLowerCase.ump");//all lower case name
    assertSimpleParse("043_validInterfaceNameUpperCase.ump");//all upper case name
    assertSimpleParse("043_validInterfaceNameMixedCase.ump");//mixed case name
    assertSimpleParse("043_validInterfaceNameNumber.ump");//name with numbers
    assertSimpleParse("043_validInterfaceNameUnderscore.ump");//name with underscore
    assertSimpleParse("043_validInterfaceNameUnderNum.ump");//name with underscore and numbers
  }

  @Test
  public void invalidInterfaceNameStart()
  {
    //Test to ensure that the parser will not compile Interfaces with an invalid name.
    //Specifically these tests target invalid starting characters.

    assertFailedParse("043_invalidInterfaceNameStartNum.ump", 110);//name starts with a number
    assertFailedParse("043_invalidInterfaceNameStartUnder.ump", 110);//name starts with an underscore
    assertFailedParse("043_invalidInterfaceNameStartExclaim.ump", 110);//name starts with an exclamation mark
    assertFailedParse("043_invalidInterfaceNameStartAmper.ump", 110);//name starts with an ampersand
    assertFailedParse("043_invalidInterfaceNameStartDollar.ump", 110);//name starts with a dollar sign
    assertFailedParse("043_invalidInterfaceNameStartHash.ump", 110);//name starts with a hash sign
  }

  @Test
  public void invalidInterfaceNamePart()
  {
    //Test to ensure that the parser will not compile Interfaces with an invalid name.
    //Specifically these tests target invalid characters in part of the name.

    assertFailedParse("043_invalidInterfaceNamePartQuest.ump", 110);//name contains a question mark
    assertFailedParse("043_invalidInterfaceNamePartExclaim.ump", 110);//name contains an exclamation mark
    assertFailedParse("043_invalidInterfaceNamePartAmper.ump", 110);//name contains an ampersand
    assertFailedParse("043_invalidInterfaceNamePartDollar.ump", 110);//name contains a dollar sign
    assertFailedParse("043_invalidInterfaceNamePartDot.ump", 110);//name contains a period
    assertFailedParse("043_invalidInterfaceNamePartQuote.ump", 110);//name contains quotation marks
  }

  @Test
  public void warningClassNameCapitalLetter()
  { // Test to make sure a warning is generated when a class name does not start with a capital letter
    assertHasWarningsParse("043_warningClassNameNotCapital.ump", 101);
  }

  @Test
  public void warningInterfaceNameCapitalLetter()
  { // Test to make sure a warning is generated when an interface name does not start with a capital letter
    assertHasWarningsParse("043_warningInterfaceNameNotCapital.ump", 111);
  }

  @Test
  public void duplicateConstantNameInterface()
  { // Test to make sure that a duplicate constant name in an interface throws a warning
    assertFailedParse("044_duplicateConstantNameInInterface.ump", 112);
  }

  @Test
  public void warningConstantDeprecated()
  { // Ensures that a warning is thrown when deprecated keyword constant is used in an interface
    assertHasWarningsParse("044_constantDeprecatedInterface.ump", 901);
  }

  @Test
  public void warningUninitializedConstInterface()
  { // Ensures that a warning is thrown when a constant isn't initialized in an interface
    assertHasWarningsParse("044_uninitializedConstInterface.ump", 35);
  }

  @Test
  public void warningUninitializedConstClass()
  { // Ensures that a warning is thrown when deprecated keyword constant isn't initialized in a class
    assertHasWarningsParse("044_uninitializedConstClass.ump", 35);
  }

  @Test
  public void warningUninitializedConstObjectInterface()
  { // Ensures an error is thrown when a constant that isn't of a default Umple data type isn't initialized in an interface
    assertFailedParse("044_uninitializedConstObjectInterface.ump", 37);
  }

  @Test
  public void warningUninitializedConstObjectClass()
  { // Ensures an error is thrown when a constant that isn't of a default Umple data type isn't initialized in a class
    assertFailedParse("044_uninitializedConstObjectClass.ump", 37);
  }

  @Test
  public void referencedPackages()
  {
    assertParse("004_referencedPackages.ump");

    UmpleClass studentClass = model.getUmpleClass("Student");
    String[] referenced = studentClass.getNamespaces();
    Assert.assertEquals(1,referenced.length);
    Assert.assertEquals("anotherExample", referenced[0]);

    UmpleClass mentorClass = model.getUmpleClass("Mentor");
    referenced = mentorClass.getNamespaces();
    Assert.assertEquals(1,referenced.length);
    Assert.assertEquals("example", referenced[0]);
  }

  @Test
  public void isA_OnlyOne()
  {
	//ie. isA Y;
    assertParse("007_isA_OnlyOne.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    Assert.assertEquals("Person",aClass.getExtendsClass().getName());
    Assert.assertEquals(false,aClass.isRoot());
  }

  @Test
  public void isA_MultipleTimesInTheSameLine()
  {
	//ie. isA Y, isA Z;
    assertParse("007_isA_MultipleTimesInTheSameLine.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    Assert.assertEquals("Person",aClass.getExtendsClass().getName());
    Assert.assertEquals("Worker",aClass.getParentInterface(0).getName());
    Assert.assertEquals(false,aClass.isRoot());
  }

  @Test
  public void isA_ListForm()
  {
    assertParse("007_isA_ListForm.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    Assert.assertEquals("Person",aClass.getExtendsClass().getName());
    Assert.assertEquals("Worker",aClass.getParentInterface(0).getName());
    Assert.assertEquals(false,aClass.isRoot());
  }

  @Test
  public void implementsInterface()
  {
    assertParse("007_implements.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    Assert.assertEquals("IStudent",aClass.getParentInterface(0).getName());
  }

  @Test
  public void isA_MultipleInterfaces()
  {
    assertParse("007_isAMultipleInterfaces.ump");
    UmpleClass aClass = model.getUmpleClass("Student");

    Assert.assertEquals("IStudent",aClass.getParentInterface(0).getName());
    Assert.assertEquals("IPerson",aClass.getParentInterface(1).getName());
    Assert.assertEquals("IMan",aClass.getParentInterface(2).getName());
  }

  @Test
  public void isA_MultipleInterfacesAndClasses()
  {
    assertParse("007_isAMultipleInterfacesAndClasses.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    // EXTENDS
    Assert.assertEquals("Human",aClass.getExtendsClass().getName());
    // IMPLEMENTS
    Assert.assertEquals("IStudent",aClass.getParentInterface(0).getName());
    Assert.assertEquals("IPerson",aClass.getParentInterface(1).getName());
    Assert.assertEquals("IMan",aClass.getParentInterface(2).getName());
    // Root?
    Assert.assertEquals(false,aClass.isRoot());
  }

  @Test
  public void isA_MultipleInterfacesAndClassesV2()
  {
    assertParse("007_isAMultipleInterfacesAndClassesV2.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    // EXTENDS
    Assert.assertEquals("Human",aClass.getExtendsClass().getName());
    // IMPLEMENTS
    Assert.assertEquals("IStudent",aClass.getParentInterface(0).getName());
    Assert.assertEquals("IPerson",aClass.getParentInterface(1).getName());
    Assert.assertEquals("IMan",aClass.getParentInterface(2).getName());
    // Root?
    Assert.assertEquals(false,aClass.isRoot());
  }

	@Test
  public void multiple_Class_Inheritance()
  {
		assertFailedParse("007_isA_MultipleInher.ump", 34);
  }
	@Test
	  public void Singleton_Class_Extended()
  {
		assertFailedParse("007_singleton_extended.ump", 40);
		assertFailedParse("007_singleton_extended2.ump", 40);
  }
	@Test
  public void singleIsA_MultipleClass_Inheritance()
  {
		assertFailedParse("007_single_isA.ump", 34);
  }

	@Test
  public void multipleIsA_MultipleClass_Inheritance()
  {
		assertFailedParse("007_isA_MultipleInheritance_MultipleIsA.ump", 34);
  }

  @Test
  public void isA_SimpleCycle()
  {
    assertFailedParse("007_isA_SimpleCycle.ump", new Position("007_isA_SimpleCycle.ump",3,6,22));
  }
  
  @Test
  public void isA_SimpleCycle_WithKey()
  {
	  assertFailedParse("007_isA_SimpleCycle_WithKey.ump", new Position("007_isA_SimpleCycle_WithKey.ump",5,6,48));
  }

  @Test
  public void isA_ComplexCycle()
  {
    assertFailedParse("007_isA_ComplexCycle.ump", new Position("007_isA_ComplexCycle.ump",3,6,22));
  }
  
  @Test
  public void isA_ComplexCycle_WithKey()
  {
    assertFailedParse("007_isA_ComplexCycle_WithKey.ump", new Position("007_isA_ComplexCycle_WithKey.ump",4,6,39));
  }

  @Test
  public void is_A_SimpleCycle_Interface()
  {
	  assertFailedParse ("007_isA_SimpleCycle_Interface.ump", 11);
  }

  @Test
  public void is_A_ComplexCycle_Interface()
  {
	  assertFailedParse ("007_isA_ComplexCycle_Interface.ump", 12);
  }


  @Test
  public void isA_Grouped()
  {
    assertParse("007_isAGrouped.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    Assert.assertEquals("Person",aClass.getExtendsClass().getName());
    Assert.assertEquals(false,aClass.isRoot());
  }

  @Test
  public void singleton()
  {
    assertParse("007_singleton.ump");
    UmpleClass aClass = model.getUmpleClass("Airline");
    Assert.assertEquals(true,aClass.getIsSingleton());
  }

  @Test
  public void is_A_NonExistingExtendsClass(){
	assertHasWarningsParse("007_isANonExistingSuperClass.ump", 33);
	assertHasWarningsParse("007_isANonExistingSuperClass2.ump", 33);
	assertHasWarningsParse("007_isANonExistingSuperClass3.ump", 33);
	assertHasWarningsParse("007_isANonExistingSuperClass4.ump", 33);
  }

  @Test
  public void singletonAttributeNotLazy()
  {
	assertHasWarningsParse("007_singletonAttributeNotLazy.ump", new Position("007_singletonAttributeNotLazy.ump",3,1,29));
  }

  @Test
  public void singletonWithConst()
  {
	assertNoWarningsParse("007_singletonWithConst.ump");
  }

  @Test
  public void isAttributeLazyRedundant()
  {
	assertHasWarningsParse("007_isAttributeLazyRedundant.ump", 3);
  }

  @Test
  public void isABlahAttribute()
  {
    assertParse("008_isABlahAttribute.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    Attribute variable = aClass.getAttribute("isActNow");
    Assert.assertEquals("isActNow", variable.getName());
    Assert.assertEquals(false, variable.getIsList());
  }

  @Test
  public void attribute_simple()
  {
    assertParse("008_simpleAttribute.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    Attribute variable = aClass.getAttribute("number");
    Assert.assertEquals("number", variable.getName());
    Assert.assertEquals(false, variable.getIsList());
  }

  @Test
  public void attribute_list()
  {
    assertParse("008_listAttribute.ump");
    UmpleClass aClass = model.getUmpleClass("Token");
    Attribute variable = aClass.getAttribute("name");
    Assert.assertEquals("name", variable.getName());
    Assert.assertEquals("String", variable.getType());
    Assert.assertEquals(true, variable.getIsList());

    Attribute blah = aClass.getAttribute("blah");
    Assert.assertEquals("blah", blah.getName());
    Assert.assertEquals("String", blah.getType());
    Assert.assertEquals(true, blah.getIsList());
  }

  @Test
  public void attribute_derived()
  {
    assertParse("008_derivedAttribute.ump");

    UmpleClass aClass = model.getUmpleClass("Position");
    Attribute variable = aClass.getAttribute("perimeter");
    Assert.assertEquals("perimeter", variable.getName());
    Assert.assertEquals("Integer", variable.getType());
    Assert.assertEquals(false, variable.getIsList());
    Assert.assertEquals("2*l + 2*w",variable.getValue());
    Assert.assertEquals(true, variable.getIsDerived());

    variable = aClass.getAttribute("l");
    Assert.assertEquals("l", variable.getName());
    Assert.assertEquals("Integer", variable.getType());
    Assert.assertEquals(false, variable.getIsList());
    Assert.assertEquals(false, variable.getIsDerived());

  }

  @Test
  public void attribute_defaultedWithoutAValue()
  {
    assertFailedParse("008_defaultWithoutValue.ump", new Position("008_defaultWithoutValue.ump",4,2,19));
  }

  @Test
  public void association_attribute()
  {
    assertParse("008_associationAttribute.ump");
    UmpleClass aClass = model.getUmpleClass("Token");
    Attribute variable = aClass.getAttribute("startPosition");
    Assert.assertEquals("startPosition", variable.getName());
    Assert.assertEquals("Position", variable.getType());
  }

  @Test @Ignore
  public void complexClassWithAssociationsCannotBeAttribute()
  {
    assertFailedParse("008_complexAttribute.ump", new Position(5,2,10));
  }

  @Test
  public void attribute_Type()
  {
    assertParse("008_typeAttribute.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    Attribute variable;

    variable = aClass.getAttribute("name");
    Assert.assertEquals("name", variable.getName());
    Assert.assertEquals("Integer", variable.getType());

    variable = aClass.getAttribute("name2");
    Assert.assertEquals("name2", variable.getName());
    Assert.assertEquals("String", variable.getType());

    variable = aClass.getAttribute("name3");
    Assert.assertEquals("name3", variable.getName());
    Assert.assertEquals("Time", variable.getType());

    variable = aClass.getAttribute("name4");
    Assert.assertEquals("name4", variable.getName());
    Assert.assertEquals("Date", variable.getType());

    variable = aClass.getAttribute("name5");
    Assert.assertEquals("name5", variable.getName());
    Assert.assertEquals("Double", variable.getType());
  }

  @Test
  public void attribute_ContainerType()
  {
    assertHasWarningsParse("276_AttributeTypeAngleBrackets.ump", 46);
  }

  @Test
  public void attribute_Unique()
  {
    assertParse("008_uniqueAttribute.ump");
    Attribute number = model.getUmpleClass("Student").getAttribute("number");
    Assert.assertTrue(number.getIsUnique());
  }

  @Test
  public void attributeConflictImmutableAndAutounique()
  {
    assertFailedParse("008_attributeConflictImmutableAutounique.ump", 38);
  }
  @Test
  public void methodConflictWithAutoGeneratedGetterAndSetterAndNoUserGeneratedMethodBody()
  {
    assertHasWarningsParse("001_methodConflictWithAutoGeneratedGetterAndSetterAndNoUserGeneratedMethodBody.ump", 1009);

    //Issue 567
    assertHasWarningsParse("001_duplicatedGeneratedMethodAndNoUserGeneratedMethodBody.ump", 1009);
  }
  
  @Test
  public void autoGeneratedGetterAndSetter()
  {
    assertHasWarningsParse("001_methodconflictWithAutoGeneratedGetterAndSetterAndHasUserGeneratedMethodBody.ump",1009);

    assertHasWarningsParse("001_duplicatedGeneratedMethodAndHasUserGeneratedMethodBody.ump",1009);
  }

  @Test
  public void attribute_assignedValue()
  {
    assertParse("008_assignedValueAttribute.ump");
    UmpleClass aClass = model.getUmpleClass("Student");
    UmpleVariable variable;

    variable = aClass.getAttribute("s");
    Assert.assertEquals("\"s\"", variable.getValue());

    variable = aClass.getAttribute("s2");
    Assert.assertEquals("\"s2\"", variable.getValue());
  }

  @Test
  public void attribute_autounique()
  {
    assertParse("008_autouniqueAttribute.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    Attribute variable = aClass.getAttribute("id");
    Assert.assertEquals(true,variable.getIsAutounique());
    Assert.assertEquals("Integer",variable.getType());
  }

  @Test
  public void attributeComplexAssigned()
  {
    assertParse("008_complexAssignedAttribute.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    Attribute variable = aClass.getAttribute("t");
    Assert.assertEquals("new Time(\"now\")",variable.getValue());
  }

  @Test @Ignore
  public void attributeFixml()
  {
    assertParse("008_fixmlAttribute.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    Attribute variable = aClass.getAttribute("capacity");
    Assert.assertEquals("\"31\"",variable.getValue());
  }

  @Test
  public void invalidClassKeyword()
  {
	  assertFailedParse("109_badClassKeyWord.ump", 1503);
  }

  @Test
  public void attributeInvalidName()
  {
	  assertFailedParse("008_invalidAttributeName.ump", 130);
	  assertFailedParse("008_attributeNumericalFirstCharacter.ump", 130);
	  assertSimpleParse("008_attributeUnderscoreFirstChar.ump");
  }
  @Test
  public void attributeProperNamingStyle()
  {
	  assertHasWarningsParse("008_attributeUpperFirstChar.ump", 131);
          assertSimpleParse("008_constAttributeUpperFirstChar.ump");
  }
  
  //Issue-322
  @Test
  public void internalConst(){
    assertSimpleParse("008_internalConst.ump");
  }

  @Test
  public void TypeValueMismatchWarning()
  {
    assertHasWarningsParse("008_attributeTypeValueMismatch.ump",141);
    assertHasWarningsParse("008_attributeTypeValueMismatch2.ump",141);
  }

  @Test
  public void attributeLooksLikeAssociation()
  {
	  assertFailedParse("008_attributeContainsDoubleDash.ump", 132);
	  assertFailedParse("008_attributeContainsDoublePeriod.ump", 132);
	  //assertFailedParse("008_attributeContainsStar.ump", 132);
	  //assertFailedParse("008_attributeContainsArrow.ump", 132); // Obslete
  }

  @Test
  public void attributeInvalidTypeName()
  {
	  assertFailedParse("008_attributeInvalidType.ump", 140);
	  assertFailedParse("008_attributeAllNumericType.ump", 140);
  }

  @Test
  // test to make sure none of the attributes in a class share their name with attributes
  // in a superclass.
  public void attributeSharedName()
  {
	  assertHasWarningsParse("429_sharedAttributeName.ump",44);
	  assertHasWarningsParse("429_sharedAttributeName_ML.ump",44);

  	  //Issue 587
  	  assertHasWarningsParse("429_sharedAttributeName_MultCases1.ump", 44);
  	  assertHasWarningsParse("429_sharedAttributeName_WrongTypes.ump", 44);
  	  assertNoWarningsParse("429_sharedAttributeName_Refinements.ump");

  }
  @Test
  public void ReqSameNameCombine1()
  {
	  assertHasWarningsParse("450_ReqSameWarning.ump", 402);
  }
  @Test
  public void ReqSameNameCombine2()
  {
          assertNoWarningsParse("450_ReqSameOneBlank.ump");
  }
  @Test
  public void ReqSameNameCombine3()
  {
          assertNoWarningsParse("450_ReqSameNolang.ump");
  }
  @Test
  public void ReqSameNameCombine4()
  {
          assertNoWarningsParse("450_ReqSameLang.ump");
  }
  
  @Test
  public void ImplementsPrecedeReq1()
  {
	  assertHasWarningsParse("451_ReqMismatch401Warning.ump", 401);
  }
  @Test
  public void ImplementsPrecedeReq2()
  {
  
  	assertHasWarningsParse("451_ReqMismatch401WarningModified.ump", 401);
  }
  @Test
  public void ImplementsPrecedeReq3()
  {
  
  	  assertNoWarningsParse("451_ReqNoWarning.ump");
  }
  @Test
  public void ImplementsPrecedeReq4()
  {
  	  assertNoWarningsParse("451_Req2Combination1.ump");
  }
  @Test
  public void ImplementsPrecedeReq5()
  {
          assertNoWarningsParse("451_Req2Combination2.ump");
  }
  @Test
  public void ImplementsPrecedeReq6()
  {
          assertNoWarningsParse("451_Req2Combination3.ump");
  }
  @Test
  public void ImplementsPrecedeReq7()
  {
          assertNoWarningsParse("451_ReqAssociation.ump");
  }
  @Test
  public void ImplementsPrecedeReq8()
  {
          assertNoWarningsParse("451_ReqClassCombination.ump");
  }
  @Test
  public void ImplementsPrecedeReq9()
  {
          assertNoWarningsParse("451_ReqMixset.ump");
  }
  @Test
  public void ImplementsPrecedeReq10()
  {
          assertNoWarningsParse("451_ReqMixsetCombination1.ump");
  }
  @Test
  public void ImplementsPrecedeReq11()
  {
          assertNoWarningsParse("451_ReqMixsetCombination2.ump");
  }
  @Test
  public void ImplementsPrecedeReq12()
  {
          assertNoWarningsParse("451_ReqMixsetNoUse.ump"); 
  }
  @Test
  public void ImplementsPrecedeReq13()
  {
          assertNoWarningsParse("451_Req2Combination3Modified.ump");
  }
  @Test
  public void ImplementsPrecedeReq14()
  {
          assertNoWarningsParse("451_Req2Combination1Modified.ump");
  }
  @Test
  public void ImplementsPrecedeReq15()
  {
          assertNoWarningsParse("451_ReqAssociationModified.ump");
  }
  @Test
  public void ImplementsPrecedeReq16()
  {
          assertNoWarningsParse("451_ReqMixsetClassOutside.ump");
  }
  @Test
  public void ImplementsPrecedeReq17()
  {
          assertNoWarningsParse("451_ReqMixsetOutputGenerated.ump");
  }

  @Test
  public void associationName()
  {
    assertParse("009_externalNamedAssociation.ump");

    Association as = model.getAssociation(0);
    Assert.assertEquals("Counsellor",as.getName());
  }

  @Test
  public void compositionType() {
	  assertSimpleParse("009_externalNamedComposition.ump");
	  Association as1 = model.getAssociation(0);
	  Assert.assertTrue(as1.getIsLeftComposition() && !as1.getIsRightComposition() && as1.getIsLeftNavigable() && as1.getIsRightNavigable());

	  Association as2 = model.getAssociation(1);
	  Assert.assertTrue(!as2.getIsLeftComposition() && as2.getIsRightComposition() && as2.getIsLeftNavigable() && as2.getIsRightNavigable());

  }

  @Test
  public void singletonToOneAssociation()
  {
	  assertHasWarningsParse("009_singletonToOneAssociation.ump", new Position("009_singletonToOneAssociation.ump",3,1,29));
  }

  @Test
  public void associationWithUnknownClass()
  {
    assertFailedParse("009_associationWithUnknownClass.ump", new Position("009_associationWithUnknownClass.ump",7,15,53));
  }

  @Test
  public void associationWithClassAndInterface(){
	  assertSimpleParse("009_associationWithInterfaceUnidirectional.ump");
	  assertFailedParse("009_associationWithInterfaceBidirectional.ump", 20);
	  assertFailedParse("009_associationNonExistentInterface.ump",5);
  }

  @Test
  public void externalAssociationWithUnknownClass()
  {
    assertFailedParse("009_externalAssociationWithUnknownClass.ump", 31, 0);
    assertFailedParse("009_externalAssociationWithUnknownClass.ump", 5, 1);
  }

  @Test
  public void externalAssociationWithUnknownClassSecondPosition()
  {
     assertFailedParse("009_externalAssociationWithUnknownClassSecond.ump", new Position("009_externalAssociationWithUnknownClassSecond.ump",6,23,58));
  }

  @Test
  public void association()
  {
    assertParse("009_association.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    AssociationVariable variable = aClass.getAssociationVariable("aMentor");
    Assert.assertEquals(0,variable.getMultiplicity().getLowerBound());
    Assert.assertEquals(1,variable.getMultiplicity().getUpperBound());
    Assert.assertEquals("Mentor",variable.getType());
    Assert.assertEquals("aMentor",variable.getName());
    Assert.assertEquals(true,variable.getIsNavigable());

    AssociationVariable relatedVariable = variable.getRelatedAssociation();
    Assert.assertEquals(2,relatedVariable.getMultiplicity().getLowerBound());
    Assert.assertEquals(3,relatedVariable.getMultiplicity().getUpperBound());
    Assert.assertEquals("Student",relatedVariable.getType());
    Assert.assertEquals("students",relatedVariable.getName());
    Assert.assertEquals(true,relatedVariable.getIsNavigable());

    UmpleClass mentorClass = model.getUmpleClass("Mentor");
    Assert.assertEquals(relatedVariable, mentorClass.getAssociationVariable("students"));
    Assert.assertEquals(variable, mentorClass.getAssociationVariable("students").getRelatedAssociation());


    List<Association> iter = model.getAssociations();
    Assert.assertEquals(2,iter.size());
    Association one = iter.get(0);
    Association two = iter.get(1);

    Assert.assertEquals(2,one.getEnd(0).getMultiplicity().getLowerBound());
    Assert.assertEquals(3,one.getEnd(0).getMultiplicity().getUpperBound());
    Assert.assertEquals("students",one.getEnd(0).getRoleName());
    Assert.assertEquals("Student",one.getEnd(0).getClassName());
    Assert.assertEquals("Mentor",one.getEnd(0).getReferenceToClassName());

    Assert.assertEquals(0,one.getEnd(1).getMultiplicity().getLowerBound());
    Assert.assertEquals(1,one.getEnd(1).getMultiplicity().getUpperBound());
    Assert.assertEquals("aMentor",one.getEnd(1).getRoleName());
    Assert.assertEquals("Mentor",one.getEnd(1).getClassName());
    Assert.assertEquals("Student",one.getEnd(1).getReferenceToClassName());

    Assert.assertEquals(0,two.getEnd(0).getMultiplicity().getLowerBound());
    Assert.assertEquals(-1,two.getEnd(0).getMultiplicity().getUpperBound());
    Assert.assertEquals("me",two.getEnd(0).getRoleName());
    Assert.assertEquals("Student",two.getEnd(0).getClassName());
    Assert.assertEquals("Student",two.getEnd(0).getReferenceToClassName());

    Assert.assertEquals(0,two.getEnd(1).getMultiplicity().getLowerBound());
    Assert.assertEquals(-1,two.getEnd(1).getMultiplicity().getUpperBound());
    Assert.assertEquals("them",two.getEnd(1).getRoleName());
    Assert.assertEquals("Student",two.getEnd(1).getClassName());
    Assert.assertEquals("Student",two.getEnd(1).getReferenceToClassName());
  }

  @Test
  public void association_invalidMultiplicityOutOfOrder()
  {
    assertFailedParse("009_association_multiplicityOutOfOrder.ump", new Position("009_association_multiplicityOutOfOrder.ump",4,2,19));
  }

  @Test
  public void invalidMultiplicity()
  {
    assertFailedParse("009_zeroMultiplicity.ump", 4);
  }


  @Test
  public void association_external()
  {
    assertParse("009_externalAssociation.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    AssociationVariable variable = aClass.getAssociationVariable("myMentor");
    Assert.assertEquals(6,variable.getMultiplicity().getLowerBound());
    Assert.assertEquals(9,variable.getMultiplicity().getUpperBound());
    Assert.assertEquals("Mentor",variable.getType());
    Assert.assertEquals("myMentor",variable.getName());
    Assert.assertEquals(true,variable.getIsNavigable());

    AssociationVariable relatedVariable = variable.getRelatedAssociation();
    Assert.assertEquals(4,relatedVariable.getMultiplicity().getLowerBound());
    Assert.assertEquals(5,relatedVariable.getMultiplicity().getUpperBound());
    Assert.assertEquals("Student",relatedVariable.getType());
    Assert.assertEquals("students",relatedVariable.getName());
    Assert.assertEquals(true,relatedVariable.getIsNavigable());

    UmpleClass mentorClass = model.getUmpleClass("Mentor");
    Assert.assertEquals(relatedVariable, mentorClass.getAssociationVariable("students"));
    Assert.assertEquals(variable, mentorClass.getAssociationVariable("students").getRelatedAssociation());

    List<Association> iter = model.getAssociations();
    Assert.assertEquals(2,iter.size());
    Association one = iter.get(0);
    Association two = iter.get(1);

    Assert.assertEquals(4,one.getEnd(0).getMultiplicity().getLowerBound());
    Assert.assertEquals(5,one.getEnd(0).getMultiplicity().getUpperBound());
    Assert.assertEquals("students",one.getEnd(0).getRoleName());
    Assert.assertEquals("Student",one.getEnd(0).getClassName());
    Assert.assertEquals("Mentor",one.getEnd(0).getReferenceToClassName());

    Assert.assertEquals(6,one.getEnd(1).getMultiplicity().getLowerBound());
    Assert.assertEquals(9,one.getEnd(1).getMultiplicity().getUpperBound());
    Assert.assertEquals("myMentor",one.getEnd(1).getRoleName());
    Assert.assertEquals("Mentor",one.getEnd(1).getClassName());
    Assert.assertEquals("Student",one.getEnd(1).getReferenceToClassName());

    Assert.assertEquals(0,two.getEnd(0).getMultiplicity().getLowerBound());
    Assert.assertEquals(-1,two.getEnd(0).getMultiplicity().getUpperBound());
    Assert.assertEquals("me",two.getEnd(0).getRoleName());
    Assert.assertEquals("Student",two.getEnd(0).getClassName());
    Assert.assertEquals("Student",two.getEnd(0).getReferenceToClassName());

    Assert.assertEquals(0,two.getEnd(1).getMultiplicity().getLowerBound());
    Assert.assertEquals(-1,two.getEnd(1).getMultiplicity().getUpperBound());
    Assert.assertEquals("them",two.getEnd(1).getRoleName());
    Assert.assertEquals("Student",two.getEnd(1).getClassName());
    Assert.assertEquals("Student",two.getEnd(1).getReferenceToClassName());
  }

  @Test
  public void oneWayAssociation()
  {
    assertParse("009_oneWayAssociation.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    AssociationVariable variable = aClass.getAssociationVariable("mentor");
    Assert.assertEquals(0,variable.getMultiplicity().getLowerBound());
    Assert.assertEquals(1,variable.getMultiplicity().getUpperBound());
    Assert.assertEquals("Mentor",variable.getType());
    Assert.assertEquals("mentor",variable.getName());
    Assert.assertEquals(true,variable.getIsNavigable());

    AssociationVariable relatedVariable = variable.getRelatedAssociation();
    Assert.assertEquals(0,relatedVariable.getMultiplicity().getLowerBound());
    Assert.assertEquals(1,relatedVariable.getMultiplicity().getUpperBound());
    Assert.assertEquals("Student",relatedVariable.getType());
    Assert.assertEquals("student",relatedVariable.getName());
    Assert.assertEquals(false,relatedVariable.getIsNavigable());

    UmpleClass mentorClass = model.getUmpleClass("Mentor");
    Assert.assertEquals(relatedVariable, mentorClass.getAssociationVariable("student"));
    Assert.assertEquals(variable, mentorClass.getAssociationVariable("student").getRelatedAssociation());

  }

  @Test
  public void otherWayAssociation()
  {
    assertParse("009_otherWayAssociation.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    AssociationVariable variable = aClass.getAssociationVariable("mentor");
    Assert.assertEquals(0,variable.getMultiplicity().getLowerBound());
    Assert.assertEquals(1,variable.getMultiplicity().getUpperBound());
    Assert.assertEquals("Mentor",variable.getType());
    Assert.assertEquals("mentor",variable.getName());
    Assert.assertEquals(false,variable.getIsNavigable());

    AssociationVariable relatedVariable = variable.getRelatedAssociation();
    Assert.assertEquals(0,relatedVariable.getMultiplicity().getLowerBound());
    Assert.assertEquals(1,relatedVariable.getMultiplicity().getUpperBound());
    Assert.assertEquals("Student",relatedVariable.getType());
    Assert.assertEquals("student",relatedVariable.getName());
    Assert.assertEquals(true,relatedVariable.getIsNavigable());

    UmpleClass mentorClass = model.getUmpleClass("Mentor");
    Assert.assertEquals(relatedVariable, mentorClass.getAssociationVariable("student"));
    Assert.assertEquals(variable, mentorClass.getAssociationVariable("student").getRelatedAssociation());

  }

  @Test
  public void association_nonZeroReflexiveAssociation()
  {
    assertFailedParse("009_nonZeroReflexiveAssociation.ump", new Position("009_nonZeroReflexiveAssociation.ump",5,10,28));
  }



  @Test
  public void symmetricReflexiveAssociation()
  {
    assertParse("009_reflexiveSymmetricAssociation.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    AssociationVariable variable = aClass.getAssociationVariable("partner");

    Assert.assertEquals(true,variable.isSymmetricReflexive());
  }

  @Test
  public void multipleSymmetricReflexiveAssociations()
  {
    assertParse("009_multipleSymmetricReflexiveAssociations.ump");
  }

  @Test
  public void symmetricReflexiveAssociationError19()
  {
    assertFailedParse("009_symmetricReflexiveAssociationError19.ump", 19);
  }

  @Test
  public void symmetricReflexiveAssociationError23()
  {
    assertFailedParse("009_symmetricReflexiveAssociationError23.ump", 23);
  }

  @Test
  public void associationByItself()
  {
    assertParse("009_associationByItself.ump");

    List<Association> iter = model.getAssociations();
    Assert.assertEquals(2,iter.size());
    Association one = iter.get(0);
    Association two = iter.get(1);

    Assert.assertEquals(0, one.getEnd(0).getMultiplicity().getLowerBound());
    Assert.assertEquals(1, one.getEnd(0).getMultiplicity().getUpperBound());
    Assert.assertEquals("aStudent", one.getEnd(0).getRoleName());
    Assert.assertEquals("Student", one.getEnd(0).getClassName());
    Assert.assertEquals(0, one.getEnd(1).getMultiplicity().getLowerBound());
    Assert.assertEquals(1, one.getEnd(1).getMultiplicity().getUpperBound());
    Assert.assertEquals("aMentor", one.getEnd(1).getRoleName());
    Assert.assertEquals("Mentor", one.getEnd(1).getClassName());
    Assert.assertEquals(true, one.getIsLeftNavigable());
    Assert.assertEquals(true, one.getIsRightNavigable());

    Assert.assertEquals(0, two.getEnd(0).getMultiplicity().getLowerBound());
    Assert.assertEquals(-1, two.getEnd(0).getMultiplicity().getUpperBound());
    Assert.assertEquals("events", two.getEnd(0).getRoleName());
    Assert.assertEquals("Event", two.getEnd(0).getClassName());
    Assert.assertEquals(0, two.getEnd(1).getMultiplicity().getLowerBound());
    Assert.assertEquals(-1, two.getEnd(1).getMultiplicity().getUpperBound());
    Assert.assertEquals("locations", two.getEnd(1).getRoleName());
    Assert.assertEquals("Location", two.getEnd(1).getClassName());
    Assert.assertEquals(true, two.getIsLeftNavigable());
    Assert.assertEquals(true, two.getIsRightNavigable());

  }

  @Test
  public void reflexiveCasesNoError21()
  {
    assertSimpleParse("009_ReflexiveDirectedManyRightRole.ump");
    assertSimpleParse("009_ReflexiveDirectedZeroOneRightRole.ump");
    assertSimpleParse("009_ReflexiveDirectedZeroOneSeparateAssocRightRole.ump");
    assertSimpleParse("009_ReflexiveNonDirectedManyRightRole.ump");
    assertSimpleParse("009_ReflexiveNonDirectedManySymmetricRightRole.ump");
    assertSimpleParse("009_ReflexiveNonDirectedZeroOneRightRole.ump");
    assertSimpleParse("009_ReflexiveNonDirectedZeroOneSeparateAssocRightRole.ump");
    assertSimpleParse("009_ReflexiveNonDirectedZeroOneSymmetricRightRole.ump");
  }

  @Test
  public void reflexiveAndError21CasesDirected()
  {
    assertFailedParse("009_ReflexiveDirectedManyError21.ump",21);
    assertFailedParse("009_ReflexiveDirectedZeroOneError21.ump",21);
    assertFailedParse("009_ReflexiveDirectedZeroOneReverseError21.ump",21);
    assertFailedParse("009_ReflexiveDirectedZeroOneSeparateAssocError21.ump",21);
  }

  @Test
  public void reflexiveAndError21CasesNonDirected()
  {
    assertFailedParse("009_ReflexiveNonDirectedManyError21.ump",21);
    assertFailedParse("009_ReflexiveNonDirectedManySeparateAssocError21.ump",21);
    assertFailedParse("009_ReflexiveNonDirectedZeroOneError21.ump",21);
    assertFailedParse("009_ReflexiveNonDirectedZeroOneSeparateAssocError21.ump",21);
  }

  @Test
  public void TestReservedRoleNameError32() {
	  assertFailedParse("009_ReflexiveReservedRoleNameError32.ump",32);
  }

  @Test
  public void associationClass2()
  {
    String input = SampleFileWriter.readContent(new File(pathToInput, "010_associationClass2.ump"));
    parser = UmpleParserFactory.create(umpleParserName,true);
    boolean answer = parser.parse("associationClassDefinition", input).getWasSuccess();
    Assert.assertEquals(true,answer);
  }

  @Test
  public void associationClassMultipleDefinitions()
  {
	assertParse("010_associationClassMultipleDefinitions.ump");
	UmpleClass associationClass = model.getUmpleClass("Relationship");
    Coordinate position = new Coordinate(1,2,3,4);

	Assert.assertEquals(position.getX(), associationClass.getCoordinates().getX());
    Assert.assertEquals(position.getY(), associationClass.getCoordinates().getY());
    Assert.assertEquals(position.getWidth(), associationClass.getCoordinates().getWidth());
    Assert.assertEquals(position.getHeight(), associationClass.getCoordinates().getHeight());
  }

  @Test
  public void associationClassAdditionalAssociations()
  {
    assertParse("010_associationClassOtherAssociations.ump");

    UmpleClass votes = model.getUmpleClass("VotesInPoll");
    Assert.assertEquals(3,votes.numberOfAssociationVariables());

  }

  @Test
  public void associationClassMissingLeft()
  {
    assertFailedParse("010_associationClassMissingLeft.ump", new Position("010_associationClassMissingLeft.ump",1,0,0));
  }

  @Test
  public void associationClassMissingRight()
  {
    assertFailedParse("010_associationClassMissingRight.ump", new Position("010_associationClassMissingRight.ump",2,0,1));
  }

  @Test
  public void associationClass()
  {
    assertParse("010_associationClass.ump");

    UmpleClass aClass = model.getUmpleClass("Ticket");

    Assert.assertEquals("example",aClass.getPackageName());
    Assert.assertEquals("Thing", aClass.getExtendsClass().getName());
    Assert.assertTrue(aClass.getExtraCode().contains("public int one() {return 1;}"));
    //Replaced in favor of above line due to // line comments being added:
    //Assert.assertEquals("public int one() {return 1;}",aClass.getExtraCode());
    Assert.assertEquals("name",aClass.getAttribute("name").getName());
    Assert.assertEquals("type",aClass.getAttribute("type").getName());

    AssociationVariable av1 = aClass.getAssociationVariable("event");
    Assert.assertEquals(1,av1.getMultiplicity().getLowerBound());
    Assert.assertEquals(1,av1.getMultiplicity().getUpperBound());
    Assert.assertEquals("event",av1.getName());
    Assert.assertEquals("Event", av1.getType());

    AssociationVariable relatedAv1 = av1.getRelatedAssociation();
    Assert.assertEquals(0,relatedAv1.getMultiplicity().getLowerBound());
    Assert.assertEquals(-1,relatedAv1.getMultiplicity().getUpperBound());
    Assert.assertEquals("tickets",relatedAv1.getName());
    Assert.assertEquals("Ticket", relatedAv1.getType());

    AssociationVariable av2 = aClass.getAssociationVariable("location");
    Assert.assertEquals(1,av2.getMultiplicity().getLowerBound());
    Assert.assertEquals(1,av2.getMultiplicity().getUpperBound());
    Assert.assertEquals("location",av2.getName());
    Assert.assertEquals("Location", av2.getType());

    AssociationVariable relatedAv2 = av2.getRelatedAssociation();
    Assert.assertEquals(0,relatedAv2.getMultiplicity().getLowerBound());
    Assert.assertEquals(-1,relatedAv2.getMultiplicity().getUpperBound());
    Assert.assertEquals("tickets",relatedAv2.getName());
    Assert.assertEquals("Ticket", relatedAv2.getType());

    List<Association> iter = model.getAssociations();
    Assert.assertEquals(2,iter.size());
    
    assertParse("010_associationClassWithMultipleAssocToSameClassOneSetRoleName.ump");
    assertParse("010_associationClassWithMultipleAssocToSameClassWithRoleName.ump");
    
    assertFailedParse("010_associationClassWithMultipleAssocToSameClassWithNOOtherRoleName.ump",19);
    assertFailedParse("010_associationClassWithMultipleAssocToSameClassWithNORoleName.ump",19);
    assertFailedParse("010_associationClassWithMultipleAssocToSameClassWithSingleRoleName.ump",19);
  }

  @Test
  public void associationClassNewSyntax()
  {
    assertParse("010_associationClassNewSyntaxAssociation.ump");
  }

  @Test
  public void associationClassSeveralAssociationsAttributes()
  {
    assertParse("010_associationClassSeveralAssociationsAttributes.ump");
    Assert.assertEquals(6,model.getAssociations().size());
    UmpleClass aClass = model.getUmpleClass("G");
    Assert.assertEquals(6,aClass.numberOfAssociationVariables());
    Assert.assertEquals(5,aClass.numberOfAttributes());
  }

  @Test
  public void AssociationClassCreatesKeyIfMissing()
  {
    assertParse("010_associationClass.ump");

    AssociationClass aClass = (AssociationClass)model.getUmpleClass("Ticket");
    Assert.assertEquals("Ticket", aClass.getName());
    Assert.assertEquals("Event", aClass.getAssociatedTo(0).getEnd(1).getClassName());
    Assert.assertEquals("event", aClass.getAssociatedTo(0).getEnd(1).getRoleName());
    Assert.assertEquals("Location", aClass.getAssociatedTo(1).getEnd(1).getClassName());
    Assert.assertEquals("location", aClass.getAssociatedTo(1).getEnd(1).getRoleName());

    Key key = aClass.getKey();
    Assert.assertEquals(true, key.isProvided());
    Assert.assertEquals(2, key.numberOfMembers());
    Assert.assertEquals("event", key.getMember(0));
    Assert.assertEquals("location", key.getMember(1));
    Assert.assertEquals(true, key.getIsInternal());
  }

  @Test
  public void AssociationClassKeyNoWarnings() {
    assertNoWarningsParse("010_associationClassProvidedCompleteKey.ump");
  }

  @Test
  public void AssociationClassIncompletKeyWarning()
  {
    assertHasWarningsParse("010_associationClassProvidedIncompleteKey.ump", 1011);
  }

  public void associationClassWithMultipleDefinications() {
    assertParse("010_associationClassWithMultipleDefinications.ump");
  }

  @Test
  public void inlineComments()
  {
    assertParse("013_inlineComments.ump");
  }

  @Test
  public void multilineComments()
  {
    assertParse("013_multilineComments.ump");
  }

  @Test
  public void attributesAndAssocations()
  {
    assertParse("012_attributesAndAssociations.ump");
  }

  /* Test to verify the isA relationship between classes and Interfaces*/
  @Test
  public void interfaceImplementation()
  {
	assertParse("014_interface_implementation.ump");

    UmpleClass aClass = model.getUmpleClass("Something");
    Assert.assertEquals("ISomething",aClass.getParentInterface(0).getName());

  }

  /* Test to verify the the methods inside an Interface*/
  @Test
  public void interfaceWithMethodAndParameters()
  {
	assertParse("014_interface_methodAndParam.ump");
  }

  @Test
  public void interfaceWithPosition()
  {
	assertParse("014_interface_position.ump");
  }

  /* Test to verify the the methods WITH NO parameters inside an Interface*/
  @Test
  public void interfaceWithMethodAndNOTParameters()
  {
	assertParse("014_interface_methodNoParam.ump");
  }


  /* Test to verify the the constants inside an Interface*/
  @Test
  public void interfaceWithConstants()
  {
	assertParse("014_interface_constant.ump");
  }

  /* Test to verify all Members (Constants and Methods)  inside an Interface*/
  @Test
  public void interfaceWithMultipleMembers()
  {
    assertParse("014_interface_allMembers.ump");
  }

  @Test
  public void interfaceClassDepend()
  {
    assertParse("014_interfaceDepend.ump");

    UmpleInterface aInterface = model.getUmpleInterface("IMe");
    Assert.assertEquals(1,aInterface.numberOfDepends());
    Assert.assertEquals("java.util.*", aInterface.getDepend(0).getName());
  }

  /* Test to verify extra code inside interfaces*/
  @Test
  public void interfaceWithExtraCode()
  {
    assertParse("014_interface_extracode.ump");
  }


  @Test
  public void interfaceWithSingleIsA()
  {
    assertParse("014_interfaceImplements.ump");
    UmpleInterface child = model.getUmpleInterface("ISomething");
	  Assert.assertEquals("ISuper", child.getExtendsInterface(0).getName());
  }

  @Test
  public void interfaceWithMultipleIsA()
  {
    assertParse("014_interfaceMultipleImplements.ump");
    UmpleInterface child = model.getUmpleInterface("IOther");
	Assert.assertEquals("ISuper", child.getExtendsInterface(0).getName());
	Assert.assertEquals("IOtherSuper", child.getExtendsInterface(1).getName());
  }

  @Test
  public void classWithImplementedMethods()
  {
    assertParse("015_ClassWithImplementedMethods.ump");
  }

  //TODO: Not being parsed by meta model
  @Test @Ignore
  public void classWithMethods()
  {
    assertParse("015_classMethods.ump");

    UmpleClass s = model.getUmpleClass("Student");
    Assert.assertEquals(1,s.numberOfMethods());
    Method m = s.getMethod(0);
    Assert.assertEquals("getCode", m.getName());
    Assert.assertEquals("",s.getExtraCode());
  }

  @Test
  public void mixDifferentFiles()
  {
    assertParse("015_base.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    Assert.assertEquals("Student",aClass.getName());

    aClass = model.getUmpleClass("Mentor");
    Assert.assertEquals("Mentor",aClass.getName());
  }

  @Test
  public void classPosition()
  {
    assertParse("016_classPosition.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    Assert.assertEquals("Student",aClass.getName());
    Assert.assertEquals(new Coordinate(10,20,30,40),aClass.getCoordinates());
  }

  @Test
  public void classPosition_default()
  {
    assertParse("016_defaultClassPosition.ump");

    UmpleClass aClass = model.getUmpleClass("Student");
    Assert.assertEquals("Student",aClass.getName());
    Assert.assertEquals(new Coordinate(10,20,30,40),aClass.getCoordinates());
  }

  @Test
  public void positionAssociation()
  {
    assertParse("016_associationPosition.ump");

    Association assoc = model.getAssociations().get(0);
    Assert.assertEquals("Mentor__Student",assoc.getName());
    Assert.assertEquals(2, assoc.numberOfPositions());
    Assert.assertEquals(new Coordinate(1,2,0,0), assoc.getPosition(0));
    Assert.assertEquals(new Coordinate(3,4,0,0), assoc.getPosition(1));
  }

  @Test @Ignore
  public void positionAssociationClass_Mixin()
  {
    assertParse("016_associationClassMixinPosition.ump");

    Assert.assertEquals(3, model.numberOfUmpleClasses());

    UmpleClass aClass = model.getUmpleClass("Relationship");
    Assert.assertEquals("Relationship",aClass.getName());
    Assert.assertEquals(new Coordinate(10,20,30,40),aClass.getCoordinates());

    // make sure that "isWellDefined" is true
  }

  @Test @Ignore
  public void positionAssociationClass_NoAssociation()
  {
    assertParse("016_associationClassRelationshipNotDefined.ump");

    // fill me in with checks
    // make sure that "isWellDefined" is false
  }

  @Test
  public void positionUnknownAssociation()
  {
    assertParse("016_unknownAssociationPosition.ump");
    Assert.assertEquals(0, model.getAssociations().size());
  }

  @Test
  public void associationClassPosition()
  {
    assertParse("016_associationClassPosition.ump");

    UmpleClass aClass = model.getUmpleClass("Relationship");
    Assert.assertEquals("Relationship",aClass.getName());
    Assert.assertEquals(new Coordinate(10,20,30,40),aClass.getCoordinates());
  }

  @Test
  public void glossary()
  {
    assertParse("017_glossary.ump");
    Glossary g = model.getGlossary();
    Assert.assertEquals("entities",g.getPlural("entity"));
    Assert.assertEquals("entity",g.getSingular("entities"));
  }

  @Test
  public void cannotHaveDuplicateKeys()
  {
    assertParse("018_cannotHaveDuplicateKeys.ump");
    assertHasWarningsParse("018_cannotHaveDuplicateKeys.ump",new Position("018_cannotHaveDuplicateKeys.ump",9,2,62));
  }

  @Test
  public void cannotHaveKeyAndDefaultKey()
  {
    assertHasWarningsParse("018_cannotHaveKeyAndDefaultKey.ump",new Position("018_cannotHaveKeyAndDefaultKey.ump",8,2,55));
  }

  @Test
  public void keyCannotHaveDuplicateAttributes()
  {
    assertFailedParse("018_keyCannotHaveDuplicateAttributes.ump", 26);
  }

  @Test
  public void attributeInKeyNotDefinedInClass()
  {
    assertHasWarningsParse("018_attributeInKeyNotDefinedInClass.ump", 27);
  }

  @Test
  public void inheritedKeys()
  {
    assertParse("018_inheritedKeys.ump");
    assertHasNoWarningsParse("018_inheritedKeys.ump");
    UmpleClass mentor = model.getUmpleClass("Mentor");
    Key key = mentor.getKey();
    Assert.assertEquals(2,key.numberOfMembers());
    Assert.assertEquals("a", key.getMember(0));
    Assert.assertEquals("b", key.getMember(1));
  }

  @Test
  public void key()
  {
    assertParse("018_key.ump");

    UmpleClass student = model.getUmpleClass("Student");
    Key key = student.getKey();
    Assert.assertEquals(true, key.isProvided());
    Assert.assertEquals(2,key.numberOfMembers());
    Assert.assertEquals("id",key.getMember(0));
    Assert.assertEquals("name",key.getMember(1));

    UmpleClass mentor = model.getUmpleClass("Mentor");
    key = mentor.getKey();
    Assert.assertEquals(true, key.isProvided());
    Assert.assertEquals(1,key.numberOfMembers());
    Assert.assertEquals("employeeId",key.getMember(0));

    UmpleClass course = model.getUmpleClass("Course");
    key = course.getKey();
    Assert.assertEquals(true, key.isProvided());
    Assert.assertEquals(0,key.numberOfMembers());
    Assert.assertEquals(true,key.getIsDefault());
  }

  @Test
  public void keyWithInitializedAttribute()
  {
    assertHasWarningsParse("306_keyWithInitializedAttribute.ump", 45);
  }

  @Test
  public void beforeKeyword()
  {
    assertParse("019_before.ump");

    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(1,student.numberOfCodeInjections());

    CodeInjection inject = student.getCodeInjection(0);
    Assert.assertEquals("before",inject.getType());
    Assert.assertEquals("setName",inject.getOperation());
    Assert.assertEquals("doSomething();",inject.getCode());
  }

  @Test
  public void afterKeyword()
  {
    assertParse("019_after.ump");

    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(1,student.numberOfCodeInjections());

    CodeInjection inject = student.getCodeInjection(0);
    Assert.assertEquals("after",inject.getType());
    Assert.assertEquals("getName",inject.getOperation());
    Assert.assertEquals("notReallyPossible();",inject.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelBefore()
  {
    assertSimpleParse("1521_toplevelBefore.ump");
    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(1,student.numberOfCodeInjections());
    CodeInjection inject = student.getCodeInjection(0);
    Assert.assertEquals("before",inject.getType());
    Assert.assertEquals("setName",inject.getOperation());
    Assert.assertEquals("doSomething();",inject.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelAndInclassAspects()
  {
    assertSimpleParse("1521_toplevelAndInclassAspects.ump");
    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(2,student.numberOfCodeInjections());
    CodeInjection inject = student.getCodeInjection(1);
    CodeInjection inject2 = student.getCodeInjection(0);
    Assert.assertEquals("before",inject.getType());
    Assert.assertEquals("setName",inject.getOperation());
    Assert.assertEquals("doSomething();",inject.getCode());
    Assert.assertEquals("after",inject2.getType());
    Assert.assertEquals("setName",inject2.getOperation());
    Assert.assertEquals("//afterCodeInjection();",inject2.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelAspectsForMixset()
  {
    assertSimpleParse("1521_toplevelAspectsForMixset.ump");
    UmpleClass x = model.getUmpleClass("X");
    Assert.assertEquals(1,x.numberOfCodeInjections());
    CodeInjection inject = x.getCodeInjection(0);
    Assert.assertEquals("after",inject.getType());
    Assert.assertEquals("setC",inject.getOperation());
    Assert.assertEquals("//this code will be injected",inject.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelBeforeKeywordAtBegining()
  {
    assertSimpleParse("1521_toplevelBeforeKeywordAtBegining.ump");
    UmpleClass student = model.getUmpleClass("Student");  
    Assert.assertEquals(1,student.numberOfCodeInjections());
    CodeInjection inject = student.getCodeInjection(0);
    Assert.assertEquals("before",inject.getType());
    Assert.assertEquals("setName",inject.getOperation());
    Assert.assertEquals("doSomething();",inject.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelBeforeForMultiClasses()
  {
    assertSimpleParse("1521_toplevelBeforeForMultiClasses.ump");
    UmpleClass student = model.getUmpleClass("Student");
    UmpleClass teacher = model.getUmpleClass("Teacher");
    Assert.assertEquals(1,student.numberOfCodeInjections());
    Assert.assertEquals(1,teacher.numberOfCodeInjections());
    CodeInjection inject = student.getCodeInjection(0);
    CodeInjection inject2 = teacher.getCodeInjection(0);
    Assert.assertEquals("before",inject.getType());
    Assert.assertEquals("setName",inject.getOperation());
    Assert.assertEquals("doSomething();",inject.getCode());
    Assert.assertEquals("before",inject2.getType());
    Assert.assertEquals("setName",inject2.getOperation());
    Assert.assertEquals("doSomething();",inject2.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelAfterAsteriskKeyword()
  {
    assertSimpleParse("1521_toplevelAfterAsteriskKeyword.ump");
    UmpleClass student = model.getUmpleClass("Student");
    UmpleClass teacher = model.getUmpleClass("Teacher");
    UmpleClass employer = model.getUmpleClass("Employer");
    Assert.assertEquals(1,student.numberOfCodeInjections());
    Assert.assertEquals(1,teacher.numberOfCodeInjections());
    Assert.assertEquals(1,employer.numberOfCodeInjections());
    CodeInjection inject = student.getCodeInjection(0);
    CodeInjection inject2 = teacher.getCodeInjection(0);
    CodeInjection inject3 = employer.getCodeInjection(0);
    Assert.assertEquals("after",inject.getType());
    Assert.assertEquals("setName",inject.getOperation());
    Assert.assertEquals("doSomething();",inject.getCode());
    Assert.assertEquals("after",inject2.getType());
    Assert.assertEquals("setName",inject2.getOperation());
    Assert.assertEquals("doSomething();",inject2.getCode());
    Assert.assertEquals("after",inject3.getType());
    Assert.assertEquals("testFunction",inject3.getOperation());
    Assert.assertEquals("doSomething();",inject3.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelInjectMultipleMethods()
  {
    assertSimpleParse("1521_toplevelInjectMultipleMethods.ump");

    UmpleClass a = model.getUmpleClass("A");
    Assert.assertEquals(4,a.numberOfCodeInjections());

    CodeInjection aInject1 = a.getCodeInjection(0);
    Assert.assertEquals("after",aInject1.getType());
    Assert.assertEquals("setX", aInject1.getOperation());
    Assert.assertEquals("//this code will be injected",aInject1.getCode());

    CodeInjection aInject2 = a.getCodeInjection(1);
    Assert.assertEquals("after",aInject2.getType());
    Assert.assertEquals("setY", aInject2.getOperation());
    Assert.assertEquals("//this code will be injected",aInject2.getCode());

    CodeInjection aInject3 = a.getCodeInjection(2);
    Assert.assertEquals("before",aInject3.getType());
    Assert.assertEquals("setX", aInject3.getOperation());
    Assert.assertEquals("//this code will be injected",aInject3.getCode());

    UmpleClass b = model.getUmpleClass("B");
    Assert.assertEquals(4,b.numberOfCodeInjections());

    CodeInjection bInject = b.getCodeInjection(0);
    Assert.assertEquals("after",bInject.getType());
    Assert.assertEquals("setX",bInject.getOperation());
    Assert.assertEquals("//this code will be injected",bInject.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelAfterOnTrait()
  {
    assertSimpleParse("1521_toplevelAfterOnTrait.ump");

    UmpleClass a = model.getUmpleClass("toplevelAfterOnTraitClass");
    Assert.assertEquals(1,a.numberOfCodeInjections());

    CodeInjection aInject = a.getCodeInjection(0);
    Assert.assertEquals("after",aInject.getType());
    Assert.assertEquals("testFunction", aInject.getOperation());
    Assert.assertEquals("//this code will be injected",aInject.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelAfterGlobClassName()
  {
    assertHasWarningsParse("1521_toplevelAfterGlobClassName.ump", 1012);
    assertSimpleParse("1521_toplevelAfterGlobClassName.ump");
    UmpleClass student1 = model.getUmpleClass("Student1");
    UmpleClass student2 = model.getUmpleClass("Student2");
    UmpleClass employer = model.getUmpleClass("Employer");
    Assert.assertEquals(1,student1.numberOfCodeInjections());
    Assert.assertEquals(1,student2.numberOfCodeInjections());
    Assert.assertEquals(0,employer.numberOfCodeInjections());
    CodeInjection inject = student1.getCodeInjection(0);
    CodeInjection inject2 = student2.getCodeInjection(0);
    Assert.assertEquals("after",inject.getType());
    Assert.assertEquals("setName",inject.getOperation());
    Assert.assertEquals("doSomething();",inject.getCode());
    Assert.assertEquals("after",inject2.getType());
    Assert.assertEquals("setName",inject2.getOperation());
    Assert.assertEquals("doSomething();",inject2.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelAfterGlobOperationName()
  {
    assertSimpleParse("1521_toplevelAfterGlobOperationName.ump");
    UmpleClass student1 = model.getUmpleClass("Student1");
    UmpleClass student2 = model.getUmpleClass("Student2");
    UmpleClass employer = model.getUmpleClass("Employer");
    Assert.assertEquals(1,student1.numberOfCodeInjections());
    Assert.assertEquals(1,student2.numberOfCodeInjections());
    Assert.assertEquals(1,employer.numberOfCodeInjections());
    CodeInjection inject = student1.getCodeInjection(0);
    CodeInjection inject2 = student2.getCodeInjection(0);
    CodeInjection inject3 = employer.getCodeInjection(0);
    Assert.assertEquals("after",inject.getType());
    Assert.assertEquals("setName",inject.getOperation());
    Assert.assertEquals("doSomething();",inject.getCode());
    Assert.assertEquals("after",inject2.getType());
    Assert.assertEquals("setName",inject2.getOperation());
    Assert.assertEquals("doSomething();",inject2.getCode());
    Assert.assertEquals("after",inject3.getType());
    Assert.assertEquals("setAge",inject3.getOperation());
    Assert.assertEquals("doSomething();",inject3.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelAfterGlobOperationNameOnTrait()
  {
    assertSimpleParse("1521_toplevelAfterGlobOperationNameOnTrait.ump");
    UmpleClass student1 = model.getUmpleClass("Student1");
    UmpleClass student2 = model.getUmpleClass("Student2");
    UmpleClass employer = model.getUmpleClass("Employer");
    Assert.assertEquals(1,student1.numberOfCodeInjections());
    Assert.assertEquals(2,student2.numberOfCodeInjections());
    Assert.assertEquals(1,employer.numberOfCodeInjections());
    CodeInjection inject = student1.getCodeInjection(0);
    CodeInjection inject2 = student2.getCodeInjection(0);
    CodeInjection inject3 = employer.getCodeInjection(0);
    CodeInjection inject4 = student2.getCodeInjection(1);
    Assert.assertEquals("after",inject.getType());
    Assert.assertEquals("setName",inject.getOperation());
    Assert.assertEquals("doSomething();",inject.getCode());
    Assert.assertEquals("after",inject2.getType());
    Assert.assertEquals("setName",inject2.getOperation());
    Assert.assertEquals("doSomething();",inject2.getCode());
    Assert.assertEquals("after",inject3.getType());
    Assert.assertEquals("setAge",inject3.getOperation());
    Assert.assertEquals("doSomething();",inject3.getCode());
    Assert.assertEquals("after",inject4.getType());
    Assert.assertEquals("setSomething",inject4.getOperation());
    Assert.assertEquals("doSomething();",inject4.getCode());
  }

  // Issue#1521
  @Test
  public void toplevelAround() {
    UmpleFile umpleFile = new UmpleFile(pathToInput,"1521_toplevelAround.ump");
    UmpleModel umodel = new UmpleModel(umpleFile);
    Method aMethod ;
    try{
      umodel.run();
      umodel.generate();
    }
    catch (UmpleCompilerException e)
    {
      if(!e.getMessage().contains("1013")) // ignore warning caused by aspect injection.
      {
        throw e;
      }
    }
    finally 
    {  
      UmpleClass uClass = umodel.getUmpleClass(0);
      aMethod = uClass.getMethod(0);
      String methodBodyCode= aMethod.getMethodBody().getCodeblock().getCode();
      String keyWord = "int x";
      String beforeLabelCode = methodBodyCode.substring(0,methodBodyCode.indexOf(keyWord));
      String afterLabelCode = methodBodyCode.substring(methodBodyCode.indexOf(keyWord));
      Assert.assertEquals(true, methodBodyCode.contains(keyWord));
      //before checks: 
      Assert.assertEquals(true, beforeLabelCode.contains("if (true) {"));
      //after checks:
      Assert.assertEquals(true, afterLabelCode.contains("}"));
      Assert.assertEquals(true, afterLabelCode.contains("code after around."));
      Assert.assertEquals(true, afterLabelCode.contains("Label2:"));
      SampleFileWriter.destroy(pathToInput+"/"+"AroundClass.java");
    }
  }

  // Issue 1488
  @Test
  public void multipleConstraintMethodBody() 
  {
    assertNoWarningsParse("1488_multipleConstraintMethodBody.ump");
  }

  // Issue 1488
  @Test
  public void multipleMethodBodyWarning() 
  {
    assertHasWarningsParse("1488_multipleMethodBodyWarning.ump", 49);
  }
  
  // Issue 1519
  @Test
  public void filterWithAttributeInTrait() 
  {
    assertHasNoWarningsParse("1519_filterWithAttributeInTrait.ump");
    Assert.assertEquals(1, model.numberOfUmpleClasses());
  }

  @Test
  public void multiInject()
  {
    assertSimpleParse("680_injectMultipleMethods.ump");

    UmpleClass a = model.getUmpleClass("A");
    Assert.assertEquals(1,a.numberOfCodeInjections());

    CodeInjection aInject = a.getCodeInjection(0);
    Assert.assertEquals("after",aInject.getType());
    Assert.assertEquals("setX,setY", aInject.getOperation());
    Assert.assertEquals("//this code will be injected",aInject.getCode());

    UmpleClass b = model.getUmpleClass("B");
    Assert.assertEquals(1,b.numberOfCodeInjections());

    CodeInjection bInject = b.getCodeInjection(0);
    Assert.assertEquals("before",bInject.getType());
    Assert.assertEquals("setX,setY",bInject.getOperation());
    Assert.assertEquals("//this code will be injected",bInject.getCode());
  }

  @Test
  public void upperCaseAssociationKey()
  {
	assertSimpleParse("284_keyAssociationUpper.ump");

	UmpleClass A = model.getUmpleClass("A");
	Key key = A.getKey();
	Assert.assertEquals(1,key.numberOfMembers());
	Assert.assertEquals("bbbB", key.getMember(0));
  }


  @Test
  public void enumAttributeEmpty()
  {
    assertParse("020_enumEmpty.ump");

    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(1,student.numberOfStateMachines());
    StateMachine sm = student.getStateMachine(0);
    Assert.assertEquals("Simple",sm.getType());
  }

  @Test
  public void enumShortHandSyntax()
  {
    assertParse("020_enum.ump");
    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(2,student.numberOfStateMachines());
    StateMachine sm = student.getStateMachine(0);
    Assert.assertEquals("Simple",sm.getType());

    Assert.assertEquals(3,sm.numberOfStates());
    Assert.assertEquals("FullTime", sm.getState(0).getName());
    Assert.assertEquals("PartTime", sm.getState(1).getName());
    Assert.assertEquals("MidTime", sm.getState(2).getName());
  }

  @Test
  public void enumLongHandSyntax()
  {
    assertParse("020_enumLongHand.ump");
    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(1,student.numberOfStateMachines());
    StateMachine sm = student.getStateMachine(0);
    Assert.assertEquals("Simple",sm.getType());

    Assert.assertEquals(2,sm.numberOfStates());
    Assert.assertEquals("FullTime", sm.getState(0).getName());
    Assert.assertEquals("PartTime", sm.getState(1).getName());
  }

  @Test
  public void nestedUseStatements()
  {
    assertParse("021_nestedUse.ump");

    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(3,student.numberOfAttributes());
  }

  @Test
  public void immutableOneWayInternalAssociation()
  {
    assertParse("023_immutableInternalAssociation.ump");
    Association as = model.getAssociation(0);
    Assert.assertTrue(as.isImmutable());

    UmpleClass student = model.getUmpleClass("Student");
    AssociationVariable av = student.getAssociationVariable("aMentor");
    Assert.assertTrue(av.isImmutable());
    av = student.getAssociationVariable("them");
    Assert.assertTrue(av.isImmutable());
    av = student.getAssociationVariable("me");
    Assert.assertTrue(av.isImmutable());

    UmpleClass mentor = model.getUmpleClass("Mentor");
    av = mentor.getAssociationVariable("student");
    Assert.assertTrue(av.isImmutable());
  }

  @Test
  public void immutableOtherWayInternalAssociation()
  {
    assertParse("023_immutableInternalOtherWayAssociation.ump");
    Association as = model.getAssociation(0);
    Assert.assertTrue(as.isImmutable());

    UmpleClass student = model.getUmpleClass("Student");
    AssociationVariable av = student.getAssociationVariable("aMentor");
    Assert.assertTrue(av.isImmutable());
    av = student.getAssociationVariable("them");
    Assert.assertTrue(av.isImmutable());
    av = student.getAssociationVariable("me");
    Assert.assertTrue(av.isImmutable());

    UmpleClass mentor = model.getUmpleClass("Mentor");
    av = mentor.getAssociationVariable("student");
    Assert.assertTrue(av.isImmutable());
  }

  @Test
  public void immutableExternalAssociation()
  {
    assertParse("023_immutableExternalAssociation.ump");
    Association as = model.getAssociation(0);
    Assert.assertTrue(as.isImmutable());

    UmpleClass student = model.getUmpleClass("Student");
    AssociationVariable av = student.getAssociationVariable("myMentor");
    Assert.assertTrue(av.isImmutable());
    av = student.getAssociationVariable("them");
    Assert.assertTrue(av.isImmutable());
    av = student.getAssociationVariable("me");
    Assert.assertTrue(av.isImmutable());

    UmpleClass mentor = model.getUmpleClass("Mentor");
    av = mentor.getAssociationVariable("student");
    Assert.assertTrue(av.isImmutable());
  }

  @Test
  public void immutableExternalOtherWayAssociation()
  {
    assertParse("023_immutableExternalOtherWayAssociation.ump");
    Association as = model.getAssociation(0);
    Assert.assertTrue(as.isImmutable());

    UmpleClass student = model.getUmpleClass("Student");
    AssociationVariable av = student.getAssociationVariable("myMentor");
    Assert.assertTrue(av.isImmutable());
    av = student.getAssociationVariable("them");
    Assert.assertTrue(av.isImmutable());
    av = student.getAssociationVariable("me");
    Assert.assertTrue(av.isImmutable());

    UmpleClass mentor = model.getUmpleClass("Mentor");
    av = mentor.getAssociationVariable("student");
    Assert.assertTrue(av.isImmutable());
  }

  @Test
  public void immutableTwoWayAssociationsAreNotAllowed()
  {
    assertFailedParse("023_immutableInternalTwoWayAssociation.ump", new Position("023_immutableInternalTwoWayAssociation.ump",4,2,19), 17);
    assertFailedParse("023_immutableExternalTwoWayAssociation.ump", new Position("023_immutableExternalTwoWayAssociation.ump",10,2,52), 17);
  }

  @Test
  public void immutableAssociationMayNotHaveMutableClassAtDirectedEnd()
  {
    assertFailedParse("023_immutableExternalAssociationInvalid.ump", new Position("023_immutableExternalAssociationInvalid.ump",9,2,51), 13);
    assertFailedParse("023_immutableExternalOtherWayAssociationInvalid.ump", new Position("023_immutableExternalOtherWayAssociationInvalid.ump",9,2,51), 13);
    assertFailedParse("023_immutableExternalReflexiveAssociationInvalid.ump", new Position("023_immutableExternalReflexiveAssociationInvalid.ump",6,2,34), 13);
    assertFailedParse("023_immutableInternalAssociationInvalid.ump", new Position("023_immutableInternalAssociationInvalid.ump",3,2,18), 13);
    assertFailedParse("023_immutableInternalOtherWayAssociationInvalid.ump", new Position("023_immutableInternalOtherWayAssociationInvalid.ump",6,2,35), 13);
    assertFailedParse("023_immutableInternalReflexiveAssociationInvalid.ump", new Position("023_immutableInternalReflexiveAssociationInvalid.ump",3,2,18), 13);
    assertFailedParse("023_immutableInternalReflexiveOtherWayAssociationInvalid.ump", new Position("023_immutableInternalReflexiveOtherWayAssociationInvalid.ump",3,2,18), 13);
  }

  @Test
  public void reflexiveMandatoryAssociationMayNotBeImmutable()
  {
	assertFailedParse("023_immutableReflexiveMandatoryAssociation.ump", 36, 0);
    assertFailedParse("023_immutableReflexiveMandatoryAssociation.ump", new Position("023_immutableReflexiveMandatoryAssociation.ump",8,2,48), 18, 1);
    assertFailedParse("023_immutableReflexiveMandatoryAssociation2.ump", new Position("023_immutableReflexiveMandatoryAssociation2.ump",4,2,31), 18);
    assertFailedParse("023_immutableReflexiveMandatoryOtherWayAssociation.ump", new Position("023_immutableReflexiveMandatoryOtherWayAssociation.ump",8,2,48), 18, 1);
    assertFailedParse("023_immutableReflexiveMandatoryOtherWayAssociation.ump", 36, 0);
    assertFailedParse("023_immutableReflexiveMandatoryOtherWayAssociation2.ump", new Position("023_immutableReflexiveMandatoryOtherWayAssociation2.ump",4,2,31), 18, 1);
    assertFailedParse("023_immutableReflexiveMandatoryOtherWayAssociation2.ump", 36, 0);
  }

  @Test
  public void duplicateAssociationNames()
  {
    assertFailedParse("024_multipleUnnamedAssociationsToSameClass.ump", new Position("024_multipleUnnamedAssociationsToSameClass.ump",5,2,74), 19);
    assertFailedParse("024_multipleAssociationsWithSameName.ump", new Position("024_multipleAssociationsWithSameName.ump",7,2,79), 19);
    assertFailedParse("024_roleNameSameAsClassWithMultiAssocToSameClass.ump", 19);
    assertFailedParse("024_multiAssocToAnotherClassNeedRoleName.ump", 19);
    
    List<ErrorMessage> errorMessage = parseErrorMessage("024_multiAssocToSameClassNeedRoleName.ump");
    Assert.assertEquals("There are multiple associations between class 'B' and class 'A'. Unique role names need to be added at 'B' side to distinguish the different association ends in that class.",errorMessage.get(0).getFormattedMessage());
    errorMessage = parseErrorMessage("024_multiAssocToAnotherClassNeedRoleName.ump");
    Assert.assertEquals("There are multiple associations between class 'A' and class 'B'. Unique role names need to be added at 'A' side to distinguish the different association ends in that class.",errorMessage.get(0).getFormattedMessage());
    errorMessage = parseErrorMessage("024_multiAssocToSameClassWithNoRoleName.ump");
    Assert.assertEquals(1, errorMessage.size());
    
    assertParse("024_multipleUnnamedOneWayAssociationsToSameClass.ump");
    assertParse("024_multiAssocToSameClassWithOneRoleName.ump");
    assertParse("024_multiAssocToSameClassWithMultiRoleName.ump");
    assertParse("024_multiAssocToAnotherClassWithOneRuleName.ump");
  }
  
  @Test
  public void duplicateAssociationNamesClassHierarchy()
  {
	  assertFailedParse("024_roleNameSameSubclassSuperclass.ump", 180);
	  assertFailedParse("024_roleNameSameSubclassSuperclass1.ump", 180);
	  assertFailedParse("024_roleNameSameSubclassSuperclass2.ump", 180);
	  assertFailedParse("024_roleNameSameSubclassSuperclass3.ump", 180);
	  assertFailedParse("024_roleNameSameSubclassSuperclass4.ump", 180);
  }

  @Test
  public void duplicateAttributesNames(){
    assertFailedParse("025_multipleAttributesWithSameName.ump", new Position("025_multipleAttributesWithSameName.ump",3,2,16),22);

  }
  @Test @Ignore
  public void whitespaceCharacter()
  {
	  assertSimpleParse("048_codeWithWhitespaceCharacters.ump");
  }

  @Test
  public void commentsBeforeClasses()
  {
    assertParse("400_commentsBeforeClasses.ump");

    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(1,student.numberOfComments());
    Assert.assertEquals("This is a simple comment",student.getComment(0).getText());
  }

  @Test
  public void test() {
	  assertParse("400_multiCommentsBeforeClassesTest.ump");

	  UmpleClass student = model.getUmpleClass("Student");
	  Assert.assertEquals(2, student.numberOfComments());
	  Assert.assertEquals("This is a simple comment", student.getComment(0).getText());
	  Assert.assertEquals("Multiline comment test", student.getComment(1).getText());
  }

  @Test
  public void commentsBeforeMultipleClasses()
  {
    assertParse("400_commentsBeforeMultipleClasses.ump");

    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(1,student.numberOfComments());
    Assert.assertEquals("This is a simple comment",student.getComment(0).getText());

    UmpleClass mentor = model.getUmpleClass("Mentor");
    Assert.assertEquals(0,mentor.numberOfComments());

    UmpleClass course = model.getUmpleClass("Course");
    Assert.assertEquals(1,course.numberOfComments());
    Assert.assertEquals("This is a course file",course.getComment(0).getText());
  }

  @Test
  public void commentsWayBeforeClass()
  {
    assertParse("400_commentsWayBeforeClass.ump");
    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(0,student.numberOfComments());


  }

  @Test
  public void sameLineComments()
  {
    assertSimpleParse("427_CommentPosition.ump");
	// check that attribute comments are attributing properly.
	UmpleClass Test = model.getUmpleClass("Test");
	Attribute a1 = Test.getAttribute("test");
	Assert.assertEquals(2, a1.numberOfComments());
	Attribute a2 = Test.getAttribute("test2");
	Assert.assertEquals(0, a2.numberOfComments());

	// check that association comments are attributing properly.
	UmpleClass X = model.getUmpleClass("X");
	AssociationVariable av1 = X.getAssociationVariable("test");
	Assert.assertEquals(2, av1.numberOfComments());
	AssociationVariable av2 = X.getAssociationVariable("test2");
	Assert.assertEquals(0, av2.numberOfComments());

  }


  @Test
  public void mixingRegularAndDerivedAttributes_bug201()
  {
    //https://code.google.com/p/umple/issues/detail?id=201
    assertParse("030_mixingRegularAndDerivedAttributes_bug201.ump");

    UmpleClass student = model.getUmpleClass("Student");
    Assert.assertEquals(3,student.numberOfAttributes());

  }

  @Test
  public void debugKeyword()
  {
    assertParse("500_DebugMode.ump");
    Assert.assertEquals(true,model.getDebugMode());
  }

  @Test
  public void filenamePropogation()
  {
	assertParse("020_enumLongHand.ump");
	if(parser.getClass() == UmpleInternalParser.class)
       Assert.assertEquals("020_enumLongHand.ump", ((UmpleInternalParser)parser).getFilename());
  }

  @Test
  public void mixin_namespaces(){
	  assertParse("213_mixin_namespaces_1.ump");
	  Assert.assertEquals("A",parser.getModel().getUmpleClass("X").getPackageName());
	  Assert.assertEquals("B",parser.getModel().getUmpleClass("Y").getPackageName());

	  assertParse("213_mixin_namespaces_2.ump");
	  Assert.assertEquals("B",parser.getModel().getUmpleClass("X").getPackageName());
	  Assert.assertEquals("B",parser.getModel().getUmpleClass("Y").getPackageName());

	  assertHasWarningsParse("213_mixin_namespaces_3.ump",30);
	  Assert.assertEquals("A",parser.getModel().getUmpleClass("X").getPackageName());
	  Assert.assertEquals("B",parser.getModel().getUmpleClass("Y").getPackageName());

  }

  // Test for issue #272
  // Author: Blake Quebec Desloges
  @Test
  public void attributeAndAssociationNameClashingBidirectional(){

	  assertFailedParse("024_bidirectional_many_to_one.ump",23);
	  assertFailedParse("024_bidirectional_many_to_some.ump",23);
	  assertFailedParse("024_bidirectional_many_to_many.ump",23);
	  assertFailedParse("024_bidirectional_some_to_one.ump",23);
	  assertFailedParse("024_bidirectional_some_to_some.ump",23);
	  assertFailedParse("024_bidirectional_some_to_many.ump",23);
	  assertFailedParse("024_bidirectional_one_to_one.ump",23);
	  assertFailedParse("024_bidirectional_one_to_some.ump",23);
	  assertFailedParse("024_bidirectional_one_to_many.ump",23);

  }
  @Test
  public void attributeAndAssociationNameClashingUnidirectional(){

	  assertFailedParse("024_unidirectional_many_to_one.ump",23);
	  assertFailedParse("024_unidirectional_many_to_some.ump",23);
	  assertFailedParse("024_unidirectional_many_to_many.ump",23);
	  assertFailedParse("024_unidirectional_some_to_one.ump",36,0);
	  assertFailedParse("024_unidirectional_some_to_one.ump",23,1);
	  assertFailedParse("024_unidirectional_some_to_some.ump",36,0);
	  assertFailedParse("024_unidirectional_some_to_some.ump",23,1);
	  assertFailedParse("024_unidirectional_some_to_many.ump",36,0);
	  assertFailedParse("024_unidirectional_some_to_many.ump",23,1);
	  assertFailedParse("024_unidirectional_one_to_one.ump",36,0);
	  assertFailedParse("024_unidirectional_one_to_one.ump",23,1);
	  assertFailedParse("024_unidirectional_one_to_some.ump",36,0);
	  assertFailedParse("024_unidirectional_one_to_some.ump",23,1);
	  assertFailedParse("024_unidirectional_one_to_many.ump",36,0);
	  assertFailedParse("024_unidirectional_one_to_many.ump",23,1);

  }
  @Test
  public void attributeAndAssociationNameClashingBackwardsUnidirectional(){

	  assertFailedParse("024_back_unidirectional_many_to_one.ump",23);
	  assertFailedParse("024_back_unidirectional_many_to_some.ump",23);
	  assertFailedParse("024_back_unidirectional_many_to_many.ump",23);
	  assertFailedParse("024_back_unidirectional_some_to_one.ump",36,0);
	  assertFailedParse("024_back_unidirectional_some_to_one.ump",23,1);
	  assertFailedParse("024_back_unidirectional_some_to_some.ump",36,0);
	  assertFailedParse("024_back_unidirectional_some_to_some.ump",23,1);
	  assertFailedParse("024_back_unidirectional_some_to_many.ump",36,0);
	  assertFailedParse("024_back_unidirectional_some_to_many.ump",23,1);
	  assertFailedParse("024_back_unidirectional_one_to_one.ump",36,0);
	  assertFailedParse("024_back_unidirectional_one_to_one.ump",23,1);
	  assertFailedParse("024_back_unidirectional_one_to_some.ump",36,0);
	  assertFailedParse("024_back_unidirectional_one_to_some.ump",23,1);
	  assertFailedParse("024_back_unidirectional_one_to_many.ump",36,0);
	  assertFailedParse("024_back_unidirectional_one_to_many.ump",23,1);

  }
  @Test
  public void attributeAndAssociationNameClashingSeparate(){

  	  assertFailedParse("024_separate_back_unidirectional.ump",36,0);
  	assertFailedParse("024_separate_back_unidirectional.ump",23,1);
	  assertFailedParse("024_separate_bidirectional.ump",23);
	  assertFailedParse("024_separate_unidirectional.ump",36,0);
	  assertFailedParse("024_separate_unidirectional.ump",23,1);

  }


  // Test for issue #354
  // Author: Blake Quebec Desloges
  @Test
  public void stateMachineandAttributeNameClashing(){
  	  assertFailedParse("106_invalidNameStateMachineAndAttribute.ump",52);
  }
  @Test
  public void stateMachineandAssociationNameClashing(){
  	  assertFailedParse("106_invalidNameStateMachineAndAssocRoleName1.ump",52);
  	  assertFailedParse("106_invalidNameStateMachineAndAssocRoleName2.ump",52);
  	  assertFailedParse("106_invalidNameStateMachineAndAssocRoleName3.ump",52);
  	  assertFailedParse("106_invalidNameStateMachineAndAssocRoleName4.ump",52);
  }

  @Test
  public void stateMachineConcurrencyBetweenStates()
  {
	  assertFailedParse("103_Concurrent_FirstStateLevel.ump", 53);
  }

  @Test
  public void externalDefinitionAndClassDefinitionCodeGeneration_externalFirst()
  {
    assertParse("026_externalDefinitionAndClassDefinition_first.ump");

    UmpleClass x = model.getUmpleClass("X");
    Assert.assertEquals(1,x.numberOfAttributes());
  }

   @Test
  public void externalDefinitionAndClassDefinitionCodeGeneration_externalMiddle()
  {
    assertParse("026_externalDefinitionAndClassDefinition_middle.ump");

    UmpleClass x = model.getUmpleClass("X");
    Assert.assertEquals(2,x.numberOfAttributes());
  }

  @Test
  public void externalDefinitionAndClassDefinitionCodeGeneration_externalLast()
  {
    assertParse("026_externalDefinitionAndClassDefinition_last.ump");

    UmpleClass x = model.getUmpleClass("X");
    Assert.assertEquals(1,x.numberOfAttributes());
  }

  @Test
  public void generateSuboption()
  {
	  assertParse("027_generateSuboption.ump");
	  Assert.assertEquals("GvClassDiagram", model.getDefaultGenerate());
	  Assert.assertEquals("hideattributes", model.getGenerate(0).getSuboption(0));
	  Assert.assertEquals("showmethods", model.getGenerate(0).getSuboption(1));
  }

  @Test
  public void generateSuboptionOverride()
  {
	  assertParse("027_generateSuboptionOverride.ump");
	  Assert.assertEquals("GvClassDiagram", model.getDefaultGenerate());
	  Assert.assertEquals(true, model.getGenerate(0).getOverride());
	  Assert.assertEquals("blah/blah/blah", model.getDefaultGeneratePath());
	  Assert.assertEquals("hideattributes", model.getGenerate(0).getSuboption(0));
  }
  
  @Test
  public void graphVizLiteralGuards(){
    assertParse("027_generateSuboptionOverride.ump");
  }

  @Test
  public void methodNameConflictUsingDefaulted()
  {
    assertFailedParse("045_javaDefaultedNameConflict.ump", 48);
    assertFailedParse("045_phpDefaultedNameConflict.ump", 48);
    assertFailedParse("045_rubyDefaultedNameConflict.ump", 48);
  }
  
  @Test
  public void autoGeneratedConstructor()
  {
	  assertSimpleParse("003_autogeneratedConstructor.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  Method autogeneratedConstructor = new Method("public", "X", "public", false);
	  autogeneratedConstructor.addMethodParameter(new MethodParameter("aStr", "String", "", "", false));
	  autogeneratedConstructor.addMethodParameter(new MethodParameter("aD", "Date", "", "", false));
	  
	  Assert.assertTrue(uClass.hasMethod(autogeneratedConstructor));
  }
  
  @Test
  public void autoGeneratedConstructorRemoveAttribute()
  {
	  assertSimpleParse("003_autogeneratedConstructor.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  Method autogeneratedConstructor = new Method("public", "X", "public", false);
	  autogeneratedConstructor.addMethodParameter(new MethodParameter("aStr", "String", "", "", false));
	  autogeneratedConstructor.addMethodParameter(new MethodParameter("aD", "Date", "", "", false));

	  Assert.assertTrue(uClass.hasMethod(autogeneratedConstructor));
	  
	  Attribute att = uClass.getAttribute(2);
	  UmpleClass newClass = new UmpleClass("Test");
	  att.setUmpleClass(newClass);
	  
	  Method autogeneratedConstructorAttRemoved = new Method("public", "X", "public", false);
	  autogeneratedConstructorAttRemoved.addMethodParameter(new MethodParameter("aD", "Date", "", "", false));
	  
	  Assert.assertFalse(uClass.hasMethod(autogeneratedConstructor));
	  Assert.assertTrue(uClass.hasMethod(autogeneratedConstructorAttRemoved));

  }
  
  @Test
  public void autoGeneratedAPIMethods()
  {
	  assertSimpleParse("008_autogeneratedMethodsAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  Assert.assertEquals(uClass.getMethods().size(), 13);
  }
  
  @Test
  public void autoGeneratedGetSetInternalAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsInternalAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  // internal attributes should not have a set or get method.
	  Method internalGet = new Method("", "getInternalAttr", "Boolean", false);
	  Method internalSet = new Method("", "setInternalAttr", "Boolean", false);
	  internalSet.addMethodParameter(new MethodParameter("aInternalAttribute", "Boolean", "", "", false));
	  Assert.assertFalse(uClass.hasMethod(internalGet));
	  Assert.assertFalse(uClass.hasMethod(internalSet));
  }
  
  @Test
  public void autoGeneratedGetSetConstAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsConstAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  // const attributes should not have a set or get method.
	  Method constGet = new Method("", "getMAX", "Integer", false);
	  Method constSet = new Method("", "setMAX", "Boolean", false);
	  constSet.addMethodParameter(new MethodParameter("aMAX", "Integer", "", "", false));
	  Assert.assertFalse(uClass.hasMethod(constGet));
	  Assert.assertFalse(uClass.hasMethod(constSet));
  }
  
  @Test
  public void autoGeneratedGetSetBasicAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsBasicAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  // basic/settable attributes should have both a get and set method.
	  Method settableGet = new Method("", "getD", "Date", false);
	  Method settableSet = new Method("", "setD", "Boolean", false);
	  settableSet.addMethodParameter(new MethodParameter("aD", "Date", "", "", false));
	  Assert.assertTrue(uClass.hasMethod(settableGet));
	  Assert.assertTrue(uClass.hasMethod(settableSet));
  }
  
  @Test
  public void autoGeneratedGetSetImmutableAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsImmutableAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  // immutable attributes should only have a get method generated.
	  Method immutableGet = new Method("", "getStr", "String", false);
	  Method immutableSet = new Method("", "setStr", "Boolean", false);
	  Assert.assertTrue(uClass.hasMethod(immutableGet));
	  Assert.assertFalse(uClass.hasMethod(immutableSet));
  }
  
  @Test
  public void autoGeneratedGetSetLazyAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsLazyAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  // lazy attributes should have both a set and a get method.
	  Method lazyGet = new Method("", "getLDoub", "Double", false);
	  Method lazySet = new Method("", "setLDoub", "Boolean", false);
	  lazySet.addMethodParameter(new MethodParameter("aLDoub", "Double", "", "", false));
	  Assert.assertTrue(uClass.hasMethod(lazyGet));
	  Assert.assertTrue(uClass.hasMethod(lazySet));
  }
  
  @Test
  public void autoGeneratedGetSetInputAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsInputAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  // ivar attributes should have both a set and a get method.
	  Method ivarGet = new Method("", "getIDoub", "Double", false);
	  Method ivarSet = new Method("", "setIDoub", "Boolean", false);
	  ivarSet.addMethodParameter(new MethodParameter("aIDoub", "Double", "", "", false));
	  Assert.assertTrue(uClass.hasMethod(ivarGet));
	  Assert.assertTrue(uClass.hasMethod(ivarSet));
  }
  
  
  @Test
  public void inputModifierCheck()
  {
	  assertSimpleParse("008_autogeneratedMethodsInputAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  //ivar attribute should be qualified as "ivar"
	  Assert.assertEquals(uClass.getAllAttributes().size(), 2);
	  Attribute attr = uClass.getAllAttributes().get(0);
	  Assert.assertTrue( attr.isIsIvar() ); 
	  
	  Attribute nattr = uClass.getAllAttributes().get(1);
	  Assert.assertTrue( !nattr.isIsIvar() ); 
  }
  
  @Test
  public void autoGeneratedGetSetLazyImmutableAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsLazyImmutableAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  // lazy immutable attributes should have both a set and a get method.
	  Method lazyImmutableGet = new Method("", "getStr2", "String", false);
	  Method lazyImmutableSet = new Method("", "setStr2", "Boolean", false);
	  lazyImmutableSet.addMethodParameter(new MethodParameter("aStr2", "String", "", "", false));
	  Assert.assertTrue(uClass.hasMethod(lazyImmutableGet));
	  Assert.assertTrue(uClass.hasMethod(lazyImmutableSet));
  }
  
  @Test
  public void autoGeneratedGetSetAutouniqueAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsAutouniqueAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  //autounique attributes should have a get method that returns an Integer, and no set method.
	  Method autoUniqueGet = new Method("", "getX", "Integer", false);
	  Method autoUniqueSet = new Method("", "setX", "Boolean", false);
	  autoUniqueSet.addMethodParameter(new MethodParameter("aX", "Integer", "", "", false));
	  Assert.assertTrue(uClass.hasMethod(autoUniqueGet));
	  Assert.assertFalse(uClass.hasMethod(autoUniqueSet));
  }
  
  @Test
  public void autoGeneratedGetSetDefaultedAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsDefaultedAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  
	  // defaulted attributes should have a get and set method.
	  Method defaultedGet = new Method("", "getP", "String", false);
	  Method defaultedSet = new Method("", "setP", "Boolean", false);
	  defaultedSet.addMethodParameter(new MethodParameter("aP", "String", "", "", false));
	  Assert.assertTrue(uClass.hasMethod(defaultedGet));
	  Assert.assertTrue(uClass.hasMethod(defaultedSet));
  }

  @Test
  public void removeAllAutogeneratedMethods()
  {
	  assertSimpleParse("008_autogeneratedMethodsAttribute.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  Assert.assertEquals(uClass.getMethods().size(), 13);
	  
	  uClass.removeAllAutoGeneratedMethods();
	  Assert.assertEquals(uClass.getMethods().size(), 0);
  }
  
  @Test
  public void removeAutogeneratedMethodsForAttribute()
  {
	  assertSimpleParse("008_autogeneratedMethodsAttributeRemove.ump");
	  UmpleClass uClass = model.getUmpleClass("X");
	  Assert.assertEquals(6, uClass.getMethods().size());
	  
	  uClass.removeAutoGenerateMethodsForAttribute(uClass.getAttribute("x"));
	  Assert.assertEquals(5, uClass.getMethods().size());
	  
	  uClass.removeAutoGenerateMethodsForAttribute(uClass.getAttribute("str"));
	  Assert.assertEquals(3, uClass.getMethods().size());
  }
  
  @Test
  public void queuedMethods()
  {
    assertHasNoWarningsParse("008_queuedMethodDefinition.ump");
    assertFailedParse("008_nonVoidQueuedMethod.ump", 41);
  }

  // Test for issue 412 by F.K
  @Test
  public void commentInAssociation()
  {
	assertParse("412_association_comment.ump");
  }

  // Ensure error 1007 is returned for unrecognized lines
  // Test for issue 516 by M.K
  @Test
  public void assertSetFailedPosition() throws Exception {
    assertHasWarningsParse("380_noLineEndingClass.ump",1007);
    assertHasWarningsParse("380_noLineEndingTrait.ump",1007);
    assertHasWarningsParse("380_multipleNoLineEndingsClass.ump",1007);
    assertHasWarningsParse("380_multipleNoLineEndingsTrait.ump",1007);
  }
  
  // Issue 1008
  @Test
  public void parseUmpleEnumerationDefinedInClass() {
    assertSimpleParse("050_enumerationDefinedInClass.ump");
    UmpleClass uClass = model.getUmpleClass("Student");
    Assert.assertEquals(3, uClass.getEnums().size());

    Assert.assertEquals("status", uClass.getEnum(0).getName());
    Assert.assertEquals("FullTime", uClass.getEnum(0).getEnumValue(0));
    Assert.assertEquals("PartTime", uClass.getEnum(0).getEnumValue(1));

    Assert.assertEquals("grade", uClass.getEnum(1).getName());
    Assert.assertEquals("High", uClass.getEnum(1).getEnumValue(0));

    Assert.assertEquals("relationshipStatus", uClass.getEnum(2).getName());
    Assert.assertEquals("single", uClass.getEnum(2).getEnumValue(0));
    Assert.assertEquals("married", uClass.getEnum(2).getEnumValue(1));
    Assert.assertEquals("divorced", uClass.getEnum(2).getEnumValue(2));
  }
  
  // Issue 1008
  @Test
  public void parseUmpleEnumerationDefinedAtTopLevel() {
    assertSimpleParse("050_enumerationDefinedAtTopLevel.ump");
    UmpleClass c1 = model.getUmpleClass("C1");
    UmpleClass c2 = model.getUmpleClass("C2");
    Assert.assertEquals(1, model.getEnums().size());
    Assert.assertEquals(0, c1.getEnums().size());
    Assert.assertEquals(0, c2.getEnums().size());
    Assert.assertEquals("Status", model.getEnum(0).getName());
    Assert.assertEquals("married", model.getEnum(0).getEnumValue(0));
    Assert.assertEquals("single", model.getEnum(0).getEnumValue(1));
    Assert.assertEquals("divorced", model.getEnum(0).getEnumValue(2));
  }
  
//Issue 1008
 @Test
 public void parseUmpleEnumerationDefinedAtTopLevelAndInClass() {
   assertSimpleParse("050_enumerationDefinedAtTopLevelAndInClass.ump");
   UmpleClass c1 = model.getUmpleClass("C1");
   UmpleClass c2 = model.getUmpleClass("C2");
   Assert.assertEquals(1, model.getEnums().size());
   Assert.assertEquals(0, c1.getEnums().size());
   Assert.assertEquals(1, c2.getEnums().size());
   Assert.assertEquals("Status", model.getEnum(0).getName());
   Assert.assertEquals("married", model.getEnum(0).getEnumValue(0));
   Assert.assertEquals("single", model.getEnum(0).getEnumValue(1));
   Assert.assertEquals("divorced", model.getEnum(0).getEnumValue(2));
   Assert.assertEquals("Gender", c2.getEnum(0).getName());
   Assert.assertEquals("male", c2.getEnum(0).getEnumValue(0));
   Assert.assertEquals("female", c2.getEnum(0).getEnumValue(1));
 }
 
 // Issue 1008
 @Test
 public void duplicateEnumerationsError() {
   assertFailedParse("050_duplicateEnumerationsError.ump", 95);
 }
 
 //Issue 1008
 @Test
 public void duplicateEnumsInClass() {
  assertFailedParse("050_duplicateEnumsInClass.ump", 95);
 }

 //Issue 1522
 @Test
 public void parseUmpleEnumerationDefinedInAssociationClass () {
    assertSimpleParse("050_enumerationDefinedInAssociationClass.ump");
    UmpleClass uClass = model.getUmpleClass("C");
    Assert.assertEquals(1, uClass.getEnums().size());

    Assert.assertEquals("AttributeName", uClass.getEnum(0).getName());
    Assert.assertEquals("something", uClass.getEnum(0).getEnumValue(0));
 }

 // Issue 1008
 @Test
 public void namingConflictBetweenEnumerationAndClass() {
   assertFailedParse("051_namingConflictBetweenEnumerationAndClass1.ump", 96);
   assertFailedParse("051_namingConflictBetweenEnumerationAndClass2.ump", 96);
   assertFailedParse("051_namingConflictBetweenEnumerationAndClass3.ump", 96);
 }
 
 // Issue 1008
 @Test
 public void namingConflictBetweenEnumerationAndInterface() {
   assertFailedParse("051_namingConflictBetweenEnumerationAndInterface1.ump", 96);
 }
 
 // Issue 1008
 @Test
 public void namingConflictBetweenEnumerationAndTrait() {
   assertFailedParse("051_namingConflictBetweenEnumerationAndTrait1.ump", 96);
 }
 
 // Issue 1008
 @Test
 public void enumerationConflictsWithStateMachine() {
   assertFailedParse("052_enumerationConflictsWithStateMachine1.ump", 97);
   assertFailedParse("052_enumerationConflictsWithStateMachine2.ump", 97);
 }
 
 // Issue 1008
 @Test
 public void methodParameterAmbiguityCausedByEnumeration() {
   assertHasNoWarningsParse("054_methodParameterAmbiguityCausedByEnumeration1.ump");
   assertHasWarningsParse("054_methodParameterAmbiguityCausedByEnumeration2.ump", 102);
   assertHasNoWarningsParse("054_methodParameterAmbiguityCausedByEnumeration3.ump");
 }
 
 // Issue 1008
 @Test
 public void eventParameterAmbiguityCausedByEnumeration() {
   assertHasWarningsParse("055_eventParameterAmbiguityCausedByEnumeration1.ump", 103);
   assertHasNoWarningsParse("055_eventParameterAmbiguityCausedByEnumeration2.ump");
   assertHasNoWarningsParse("055_eventParameterAmbiguityCausedByEnumeration3.ump");
 }
 
 //Issue 1008
 @Test
 public void enumerationInBidirectionalAssoc() {
  assertFailedParse("056_enumerationInBidirectionalAssoc1.ump", 104);
  assertHasNoWarningsParse("056_enumerationInBidirectionalAssoc2.ump");
 }
 
 //Issue 1008
 @Test
 public void enumerationInComposition() {
  assertFailedParse("057_enumerationInComposition1.ump", 105);
  assertFailedParse("057_enumerationInComposition2.ump", 105);
  assertHasNoWarningsParse("057_enumerationInComposition3.ump");
 }

 //Issue 1008
 @Test
 public void enumerationInUnidirectionalAssoc() {
  assertHasWarningsParse("058_enumerationInUnidirectionalAssoc1.ump", 106);
  assertHasWarningsParse("058_enumerationInUnidirectionalAssoc2.ump", 106);
  assertHasNoWarningsParse("058_enumerationInUnidirectionalAssoc3.ump");
 }

  //Issue 211
  @Test
  public void typeIsAccessSpecifier() {
    assertHasWarningsParse("142_typeIsAccessSpecifierPublic.ump", 142);
    assertHasWarningsParse("142_typeIsAccessSpecifierProtected.ump", 142);
    assertHasWarningsParse("142_typeIsAccessSpecifierPrivate.ump", 142);
  }
  
  @Test
  public void multivaluedAttributeAssignment()
  {
    assertFailedParse("008_multivaluedAttributeAssignment1.ump", 81);
    assertFailedParse("008_multivaluedAttributeAssignment2.ump", 81);
  }
  
  
  
  // Issue 1376
  @Test
  public void multivaluedAttributeInitialization()
  {	 
	assertFailedParse("008_multivaluedAttributeInitialization.ump", 83);//Derived variable should not contain list indicator   
  }

  //Issue 1277
  @Test
  public void templateInexistentReference()
  {
    assertFailedParse("028_templateInexistentReference.ump",3504);
    assertFailedParse("028_multipleTemplateInexistentReferences.ump",3504);
  }
  
  //Issue 460
  @Test
  public void nestedGenericTypes()
  {
    assertHasWarningsParse("424_nestedGenerics1.ump", 46);
    assertHasWarningsParse("424_nestedGenerics2.ump", 1007);
  }

  //Issue 546
  @Test
  public void portPrefixAttributeNameAssignment()
  {
    assertHasNoWarningsParse("701_validAttributeName.ump");
  }
 
  //Issue 1351
  @Test
  public void conflictingModifiersForStateDependentMethods() {
    assertHasWarningsParse("106_conflictingMethodModifiers.ump", 82);
  }

  //Issue 775
  @Test
  public void validCodeInjection() {
    assertHasNoWarningsParse("702_validCodeInjection.ump");
  }
  @Test
  public void testSemicolonUnicode()
  {
    UmpleFile uFile = new UmpleFile(pathToInput,"classAttributeContainsSemicolons.ump");
    UmpleModel umodel = new UmpleModel(uFile);
    umodel.run();
    String attributeValue = umodel.getUmpleClass(0).getAttribute(0).getValue().trim();
    Assert.assertTrue(attributeValue.equals("\"int x =10 ; x++ ;\""));	
    SampleFileWriter.destroy(pathToInput+"/"+"AttriWithSemicolons.java");
  }
  public boolean parse(String filename)
  {
    //String input = SampleFileWriter.readContent(new File(pathToInput, filename));
    File file = new File(pathToInput,filename);
    ErrorTypeSingleton.getInstance().reset();
    model = new UmpleModel(new UmpleFile(pathToInput,filename));
    model.setShouldGenerate(false);
    RuleBasedParser rbp = new RuleBasedParser();
    parser = new UmpleInternalParser(umpleParserName,model,rbp);
    ParseResult result = rbp.parse(file);
    model.extractAnalyzersFromParser(rbp);
    model.setLastResult(result);
    System.out.println(rbp.getRootToken());
    boolean answer = result.getWasSuccess();
    if (answer)
    {
      answer = parser.analyze(false).getWasSuccess();
    }
    return answer;
  }

  public boolean parseWarnings(String filename)
  {
    ErrorTypeSingleton.getInstance().reset();
    File file = new File(pathToInput,filename);
    model = new UmpleModel(new UmpleFile(pathToInput,filename));
    model.setShouldGenerate(false);
    RuleBasedParser rbp = new RuleBasedParser();
    parser = new UmpleInternalParser(umpleParserName,model,rbp);
    ParseResult result = rbp.parse(file);
    model.extractAnalyzersFromParser(rbp);
    model.setLastResult(result);
    boolean answer = result.getWasSuccess();
    if (answer)
    {
      answer = parser.analyze(false).getWasSuccess();
    }
    return answer;
  }
  
  public List<ErrorMessage> parseErrorMessage(String filename)
  {
    //String input = SampleFileWriter.readContent(new File(pathToInput, filename));
    File file = new File(pathToInput,filename);
    ErrorTypeSingleton.getInstance().reset();
    model = new UmpleModel(new UmpleFile(pathToInput,filename));
    model.setShouldGenerate(false);
    RuleBasedParser rbp = new RuleBasedParser();
    parser = new UmpleInternalParser(umpleParserName,model,rbp);
    ParseResult result = rbp.parse(file);
    model.extractAnalyzersFromParser(rbp);
    model.setLastResult(result);
    System.out.println(rbp.getRootToken());
    boolean answer = result.getWasSuccess();
    if (answer)
    {
      answer = parser.analyze(false).getWasSuccess();
    }
    return result.getErrorMessages();
  }

  // Assertion case where we expect the parse to succeed - may be overridden
  public void assertParse(String filename)
  {
    Assert.assertEquals(true,parse(filename));
  }

  // Assertion case where we expect the parse to succeed
  public void assertSimpleParse(String filename)
  {
    Assert.assertEquals(true,parse(filename));
  }

  // Assertion for case where we expect parse to fail, and care about the position
  public void assertFailedParse(String filename, Position expectedPosition)
  {
    boolean answer = parse(filename);
    Assert.assertEquals(false, answer);
    if (model.getLastResult().numberOfErrorMessages() != 0)
    {
      Assert.assertEquals(expectedPosition, model.getLastResult().getErrorMessage(0).getPosition());
    }
    else
    {
      Assert.fail("There were no error messages. Was looking at" + expectedPosition + ".");
    }
  }

  // Assertion for case where we expect parse to fail and care about the position and the error
  public void assertFailedParse(String filename, Position expectedPosition, int expectedError)
  {
    assertFailedParse(filename, expectedPosition);
    if (parser.getParseResult().numberOfErrorMessages() != 0)
    {
      Assert.assertEquals(expectedError, parser.getParseResult().getErrorMessage(0).getErrorType().getErrorCode());
    }
    else
    {
      Assert.fail("There were no error messages. Was looking for " + expectedError + "at" + expectedPosition + ".");
    }
  }

  // Assertion for case where we expect parse to fail and care about the position, the error and the error Index per issue347
  public void assertFailedParse(String filename, Position expectedPosition, int expectedError, int expectedErrorIndex)
  {
    assertFailedParse(filename, expectedPosition);
    if (parser.getParseResult().numberOfErrorMessages() != 0)
    {
      Assert.assertEquals(expectedError, parser.getParseResult().getErrorMessage(expectedErrorIndex).getErrorType().getErrorCode());
    }
    else
    {
      Assert.fail("There were no error messages. Was looking for " + expectedError + "at" + expectedErrorIndex + ".");
    }
  }

  // Assertion for case where we expect parse to fail care about the error number but not the position
  public void assertFailedParse(String filename, int expectedError)
  {
    boolean answer = parse(filename);
    Assert.assertEquals(false, answer);
    if (model.getLastResult().numberOfErrorMessages() != 0)
    {
      Assert.assertEquals(expectedError, model.getLastResult().getErrorMessage(0).getErrorType().getErrorCode());
    }
    else
    {
      Assert.fail("There were no error messages. Was looking for " + expectedError + ".");
    }
  }

  // Assertion case where we expect warnings at certain positions but don't care about the warning number
  public void assertHasWarningsParse(String filename, Position expectedPosition)
  {
    boolean answer = parseWarnings(filename);
    Assert.assertEquals(true, answer);
    if (parser.getParseResult().getHasWarnings())
    {
      Position actualPosition = parser.getParseResult().getPosition();
      if (!expectedPosition.equals(actualPosition))
      {
        Assert.fail("Did not fail at " + expectedPosition + " (" + expectedPosition.getOffset() + ")" + " but instead at " + actualPosition + " (" + actualPosition.getOffset() + ")");
      }
    }
    else
    {
      Assert.fail("There were no error messages. Was looking at " + expectedPosition + ".");
    }
  }

  // Assertion for case where we expect parse to fail and care about the error number and error index per issue347
  public void assertFailedParse(String filename, int expectedError, int expectedErrorIndex)
  {
    boolean answer = parse(filename);
    Assert.assertEquals(false, answer);
    if (model.getLastResult().numberOfErrorMessages() != 0)
    {
      Assert.assertEquals(expectedError, model.getLastResult().getErrorMessage(expectedErrorIndex).getErrorType().getErrorCode());
    }
    else
    {
      Assert.fail("There were no error messages. Was looking for " + expectedError + "at" + expectedErrorIndex + ".");
    }
  }

  // Assertion case where we expect warnings and care about the position and the warning number
  public void assertHasWarningsParse(String filename, Position expectedPosition, int expectedError)
  {
    assertHasWarningsParse(filename, expectedPosition);
    if (parser.getParseResult().getHasWarnings())
    {
      Assert.assertEquals(expectedError, parser.getParseResult().getErrorMessage(0).getErrorType().getErrorCode());
    }
    else
    {
      Assert.fail("There were no warnings. Was looking for " + expectedError + "at" + expectedPosition + ".");
    }
  }

  // Assertion case where we expect warnings and care about the  warning number but not the position
  public void assertHasNoWarningsParse(String filename)
  {
    boolean answer = parseWarnings(filename);
    Assert.assertEquals(true, answer);
    if (parser.getParseResult().numberOfErrorMessages() > 0)
    {
      Assert.fail("Expected no warnings, but found " + parser.getParseResult().numberOfErrorMessages() + " warnings.");
    }
  }


  // Assertion case where we expect warnings and care about the  warning number but not the position
  public void assertHasWarningsParse(String filename, int expectedError)
  {
    boolean answer = parseWarnings(filename);
    Assert.assertEquals(true, answer);
    if (parser.getParseResult().getHasWarnings())
    {
      Assert.assertEquals(expectedError, parser.getParseResult().getErrorMessage(0).getErrorType().getErrorCode());
    }
    else
    {
      Assert.fail("There were no warnings. Was looking for " + expectedError + ".");
    }
  }

  //Assertion case where we expect warnings and care about the  warning number but not the position
  public void assertHasWarningsParse(String filename, int expectedError, int expectedErrorIndex)
  {
    boolean answer = parseWarnings(filename);
    Assert.assertEquals(true, answer);
    if (parser.getParseResult().getHasWarnings())
    {
      Assert.assertEquals(expectedError, parser.getParseResult().getErrorMessage(expectedErrorIndex).getErrorType().getErrorCode());
    }
    else
    {
      Assert.fail("There were no warnings. Was looking for " + expectedError + " at " + expectedErrorIndex + ".");
    }
  }

  //Assertion case where we expect no warnings generated
  public void assertNoWarningsParse(String filename)
  {
	boolean answer = parseWarnings(filename);
	Assert.assertEquals(true, answer);
	Assert.assertEquals(true, parser.getParseResult().getErrorMessages().isEmpty());
  }
}

