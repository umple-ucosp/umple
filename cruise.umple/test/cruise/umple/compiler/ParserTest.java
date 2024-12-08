/*
 Copyright: All contributers to the Umple Project

 This file is made available subject to the open source license found at:
 https://umple.org/license

*/

package cruise.umple.compiler;



import java.util.ArrayList;



import org.junit.*;



import cruise.umple.util.SampleFileWriter;

import cruise.umple.parser.Token;
import cruise.umple.parser.Position;
import cruise.umple.parser.ParseResult;
import cruise.umple.parser.ErrorMessage;
import cruise.umple.parser.ErrorType;
import cruise.umple.parser.ErrorTypeSingleton;



public class ParserTest

{



  Parser parser;



  @Before

  public void setUp()

  {

    parser = new Parser(null);

  }



  @After

  public void tearDown()

  {

    SampleFileWriter.destroy("grammar01.txt");
    ErrorTypeSingleton.getInstance().reset(); // Reset the singleton for the next user.

  }





  @Test

  public void Name()

  {

    parser = new Parser("program");

    Assert.assertEquals("program", parser.getName());

  }



  @Test

  public void parse_variables()

  {

    parser.addRule("assignmentDefinition : [name] = [value] ;");

    assertParse(false, parser.parse("assignmentDefinition", "should fail = true;"));

  }



  @Test

  public void parse_simple()

  {

    parser.addRule("classDefinition : class");

    assertParse(true, parser.parse("classDefinition", "class"));

  }



  @Test

  public void addRulesInFile_file()

  {

    SampleFileWriter.createFile("grammar01.txt", "program : [name] = [[value]] ;\nvalue : a | b\n");

    Assert.assertEquals(2,parser.addRulesInFile("grammar01.txt"));

    Assert.assertEquals(2,parser.numberOfRules());

    assertParse(true, parser.parse("program", "blah = a;"));

  }



  @Test

  public void addRulesInFile_resource()

  {

    Assert.assertEquals(true,parser.addRulesInFile("/umple_core.grammar") > 0);

  }





  @Test

  public void addRulesInFile_ignoreComments()

  {

    SampleFileWriter.createFile("grammar01.txt", "program : [name] = [value] ;\n //this style\n  # or this style\n");

    Assert.assertEquals(1,parser.addRulesInFile("grammar01.txt"));

    Assert.assertEquals(1,parser.numberOfRules());

    Assert.assertEquals(3,parser.numberOfGrammarRules());

    assertParse(true, parser.parse("program", "blah = abc;"));

  }





  @Test

  public void addRulesInFile_EmptyLinesAddGrammarRulesForDisplay()

  {



    SampleFileWriter.createFile("grammar01.txt", "program : [name] = [[value]] ;\nvalue : a | b\n\n");

    Assert.assertEquals(2,parser.addRulesInFile("grammar01.txt"));

    Assert.assertEquals(2,parser.numberOfRules());

    Assert.assertEquals(3,parser.numberOfGrammarRules());

  }





  @Test

  public void addRulesInFile_unknownFile()

  {

    Assert.assertEquals(0,parser.addRulesInFile("doesNotExist.txt"));

    Assert.assertEquals(0,parser.numberOfRules());

  }





  @Test

  public void parse_tokenizeConstants()

  {

    parser.addRule("program- : p [name] ;");

    ParseResult result = parser.parse("program", "p andrew;");

    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals("[name:andrew]", parser.toString());



    Token root = parser.getRootToken();

    Assert.assertEquals(3, root.numberOfSubTokens());

    Assert.assertEquals("p", root.getSubToken(0).getName());

    Assert.assertEquals("name", root.getSubToken(1).getName());

    Assert.assertEquals(";", root.getSubToken(2).getName());



    Assert.assertEquals("STATIC", root.getSubToken(0).getValue());

    Assert.assertEquals("andrew", root.getSubToken(1).getValue());

    Assert.assertEquals("STATIC", root.getSubToken(2).getValue());

  }



  @Test

  public void nestTokens_simple()

  {

    parser.addRule("attribute : [type] [name] ;");

    assertParse(true, parser.parse("attribute", "String aName; "));



    Assert.assertEquals(1, parser.numberOfTokens());

    Assert.assertEquals(3, parser.getToken(0).numberOfSubTokens());

    Assert.assertEquals("String", parser.getToken(0).getValue("type"));

    Assert.assertEquals("aName", parser.getToken(0).getValue("name"));

    Assert.assertEquals(null, parser.getToken(0).getValue(";"));

  }



  @Test

  public void nestTokens_multiple()

  {

    parser.addRule("attribute : [[type]] : [[value]] ;");

    parser.addRule("type : type [typeName]");

    parser.addRule("value : value [valueName]");

    assertParse(true, parser.parse("attribute", "type String : value abc;"));



    Assert.assertEquals(1, parser.numberOfTokens());

    Assert.assertEquals(4, parser.getToken(0).numberOfSubTokens());

    Assert.assertEquals("type", parser.getToken(0).getSubToken(0).getName());

    Assert.assertEquals(":", parser.getToken(0).getSubToken(1).getName());

    Assert.assertEquals("value", parser.getToken(0).getSubToken(2).getName());

    Assert.assertEquals(";", parser.getToken(0).getSubToken(3).getName());



    Assert.assertEquals(2, parser.getToken(0).getSubToken(0).numberOfSubTokens());

    Assert.assertEquals("type", parser.getToken(0).getSubToken(0).getSubToken(0).getName());

    Assert.assertEquals("STATIC", parser.getToken(0).getSubToken(0).getSubToken(0).getValue());

    Assert.assertEquals("typeName", parser.getToken(0).getSubToken(0).getSubToken(1).getName());

    Assert.assertEquals("String", parser.getToken(0).getSubToken(0).getSubToken(1).getValue());



    Assert.assertEquals(2, parser.getToken(0).getSubToken(2).numberOfSubTokens());

    Assert.assertEquals("value", parser.getToken(0).getSubToken(2).getSubToken(0).getName());

    Assert.assertEquals("STATIC", parser.getToken(0).getSubToken(2).getSubToken(0).getValue());

    Assert.assertEquals("valueName", parser.getToken(0).getSubToken(2).getSubToken(1).getName());

    Assert.assertEquals("abc", parser.getToken(0).getSubToken(2).getSubToken(1).getValue());

  }



  @Test

  public void parse_unableToLocateVariable()

  {

    parser.addRule("namesapce : namespace [namespace] ;");

    assertParse(false, parser.parse("namesapce", "namespace ;"));

    assertParse(false, parser.parse("namesapce", "namespace"));

    assertParse(false, parser.parse("namesapce", "namespace blah ; moreblah"));

  }



  @Test

  public void addCouple()

  {

    Assert.assertEquals(0, parser.numberOfCouples());

    parser.addCouple(new Couple("{", "}"));

    Assert.assertEquals(1, parser.numberOfCouples());

  }



  @Test

  public void keepLooking()

  {

    parser.addCouple(new Couple("{", "}"));

    parser.addRule("program : [**name]");



    ParseResult result = parser.parse("program", "  one\ntwo  ");

    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals("[program][name:one\ntwo]", parser.toString());

  }



  @Test

  public void starParseLooksForUnbalancedCouples()

  {

    parser.addCouple(new Couple("{", "}"));

    parser.addRule("program : { [**name] }");



    ParseResult result = parser.parse("program", "{ what() {return true;} }");

    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals("[program][name:what() {return true;}]", parser.toString());

  }



  @Test

  public void keepWhitespaceForCouples()

  {

    parser.addCouple(new Couple("{", "}"));

    parser.addRule("program : { [**name] }");



    ParseResult result = parser.parse("program", "{ what() \n{return true;\n} }");

    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals("[program][name:what() \n{return true;\n}]", parser.toString());

  }



  @Test

  public void allowUnbalancedIfUnableToContinue()

  {

    parser.addCouple(new Couple("{", "}"));

    parser.addRule("program : { [**name] }");



    ParseResult result = parser.parse("program", "{ what() {return true;}");

    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals("[program][name:what() {return true;]", parser.toString());

  }



  @Test

  public void parse_variable()

  {

    parser.addRule("classDefinition : class [name]");

    assertParse(true, parser.parse("classDefinition", "class Andrew"));



    Assert.assertEquals(1, parser.numberOfTokens());



    Assert.assertEquals("classDefinition", parser.getToken(0).getName());

    Assert.assertEquals("START_TOKEN", parser.getToken(0).getValue());



    Assert.assertEquals("name", parser.getToken(0).getSubToken(1).getName());

    Assert.assertEquals("Andrew", parser.getToken(0).getSubToken(1).getValue());



  }



  @Test

  public void parse_hideTokens()

  {

    parser.addRule("classDefinition- : class [name]");

    assertParse(true, parser.parse("classDefinition", "class Andrew"));



    Assert.assertEquals(2, parser.numberOfTokens());



    Assert.assertEquals("name", parser.getToken(1).getName());

    Assert.assertEquals("Andrew", parser.getToken(1).getValue());

  }



  @Test

  public void parse_multipleVariables()

  {

    parser.addRule("classDefinition- : class [type] [name]");

    assertParse(true, parser.parse("classDefinition", "class public Student"));



    Assert.assertEquals(3, parser.numberOfTokens());



    Assert.assertEquals("type", parser.getToken(1).getName());

    Assert.assertEquals("public", parser.getToken(1).getValue());



    Assert.assertEquals("name", parser.getToken(2).getName());

    Assert.assertEquals("Student", parser.getToken(2).getValue());

  }



  @Test

  public void parse_isOptional_one()

  {

    parser.addRule("classDefinition- : class [type]? [name]");

    assertParse(true, parser.parse("classDefinition", "class public Student"));



    Assert.assertEquals(3, parser.numberOfTokens());



    Assert.assertEquals("type", parser.getToken(1).getName());

    Assert.assertEquals("public", parser.getToken(1).getValue());



    Assert.assertEquals("name", parser.getToken(2).getName());

    Assert.assertEquals("Student", parser.getToken(2).getValue());

  }



  @Test

  public void parse_multipleVariablesAtOnce()

  {

    parser.addRule("classDefinition- : class [type,name]");

    assertParse(true, parser.parse("classDefinition", "class Student"));



    Assert.assertEquals(2, parser.numberOfTokens());

    Assert.assertEquals("type", parser.getToken(1).getName());

    Assert.assertEquals("Student", parser.getToken(1).getValue());

  }



  @Test

  public void parse_reOrderMultipleVariables()

  {

    parser.addRule("classDefinition- : class [type,modifier,name>1,2,0] ;");

    assertParse(true, parser.parse("classDefinition", "class String Student ;"));



    Assert.assertEquals(4, parser.numberOfTokens());

    Assert.assertEquals("class", parser.getToken(0).getName());

    Assert.assertEquals("STATIC", parser.getToken(0).getValue());



    Assert.assertEquals("type", parser.getToken(1).getName());

    Assert.assertEquals("String", parser.getToken(1).getValue());



    Assert.assertEquals("name", parser.getToken(2).getName());

    Assert.assertEquals("Student", parser.getToken(2).getValue());



  }



  @Test

  public void parse_complexVariable()

  {

    parser.addRule("classDefinition- : class [name] = \" [equals] \" ;");

    assertParse(true, parser.parse("classDefinition", "class person=\"andrew\";"));



    Assert.assertEquals(7, parser.numberOfTokens());



    Assert.assertEquals("name", parser.getToken(1).getName());

    Assert.assertEquals("person", parser.getToken(1).getValue());

    Assert.assertEquals("equals", parser.getToken(4).getName());

    Assert.assertEquals("andrew", parser.getToken(4).getValue());

  }



  @Test

  public void parse_includeTheSearchForBrackets()

  {

    parser.addRule("classDefinition- : class [name] { [**content] }");

    assertParse(true, parser.parse("classDefinition", "class Andrew {blah blah2 blah3}"));



    Assert.assertEquals(5, parser.numberOfTokens());



    Assert.assertEquals("name", parser.getToken(1).getName());

    Assert.assertEquals("Andrew", parser.getToken(1).getValue());

    Assert.assertEquals("content", parser.getToken(3).getName());

    Assert.assertEquals("blah blah2 blah3", parser.getToken(3).getValue());

  }



  @Test

  public void parse_nestedRules_fails()

  {

    parser.addRule("classDefinition- : [[classIdentifier]] [name]");

    parser.addRule("classIdentifier- : class");



    assertParse(false, parser.parse("classDefinition", "blah Student"));

  }



  @Test

  public void parse_nestedRules_okay()

  {

    parser.addRule("classDefinition- : [[classIdentifier]] = \" [value] \"");

    parser.addRule("classIdentifier- : class [name]");

    assertParse(true, parser.parse("classDefinition", "class Student = \"andrew\""));



    Assert.assertEquals(6, parser.numberOfTokens());



    Assert.assertEquals("name", parser.getToken(1).getName());

    Assert.assertEquals("Student", parser.getToken(1).getValue());

    Assert.assertEquals("value", parser.getToken(4).getName());

    Assert.assertEquals("andrew", parser.getToken(4).getValue());

  }



  @Test

  public void parse_or_firstOption()

  {

    parser.addRule("classDefinition- : class [className] | interface [interfaceName]");

    assertParse(true, parser.parse("classDefinition", "class Student"));

    Assert.assertEquals(2, parser.numberOfTokens());

    Assert.assertEquals("className", parser.getToken(1).getName());

    Assert.assertEquals("Student", parser.getToken(1).getValue());

  }



  @Test

  public void parse_or_secondOption()

  {

    parser.addRule("classDefinition- : class [className] | interface [interfaceName]");

    assertParse(true, parser.parse("classDefinition", "interface Student"));

    Assert.assertEquals(2, parser.numberOfTokens());

    Assert.assertEquals("interfaceName", parser.getToken(1).getName());

    Assert.assertEquals("Student", parser.getToken(1).getValue());

  }



  @Test

  public void parseRule_multiple_none()

  {

    parser.addRule("program- : [[namespaceDeclaration]]*");

    parser.addRule("namespaceDeclaration- : namespace [namespaceName] ;");



    assertParse(true, parser.parse("program", ""));

    Assert.assertEquals(0, parser.numberOfTokens());

  }



  @Test

  public void parseRule_multiple_one()

  {

    parser.addRule("program- : [[namespaceDeclaration]]*");

    parser.addRule("namespaceDeclaration- : namespace [namespaceName] ;");



    assertParse(true, parser.parse("program", "namespace A;"));

    Assert.assertEquals(3, parser.numberOfTokens());

    Assert.assertEquals("namespaceName", parser.getToken(1).getName());

    Assert.assertEquals("A", parser.getToken(1).getValue());



  }



  @Test

  public void parseRule_multiple_many()

  {

    parser.addRule("program- : [[namespaceDeclaration]]*");

    parser.addRule("namespaceDeclaration- : namespace [namespaceName] ;");



    assertParse(true, parser.parse("program", "namespace A; namespace B;"));

    Assert.assertEquals(6, parser.numberOfTokens());



    Assert.assertEquals("namespaceName", parser.getToken(1).getName());

    Assert.assertEquals("A", parser.getToken(1).getValue());

    Assert.assertEquals("namespaceName", parser.getToken(4).getName());

    Assert.assertEquals("B", parser.getToken(4).getValue());



  }



  @Test

  public void parseInvalid()

  {

    parser.addRule("classDefinition- : class");

    assertParse(false, parser.parse("classDefinition", "blah"));

  }



  @Test

  public void parseUnknown()

  {

    assertParse(false, parser.parse("program", "a long came a spider"));

  }



  @Test

  public void addRuleFromText()

  {

    parser.addRule("program- : class [name] { [content] }");

    Assert.assertEquals(1, parser.numberOfRules());

    Assert.assertEquals("program", parser.getRule(0).getName());

    Assert.assertEquals("class [name] { [content] }", parser.getRule(0).getDefinition(0));

  }



  @Test

  public void getRuleFromName()

  {

    parser.addRule("program- : class [name] { [content] }");

    Assert.assertEquals(1, parser.numberOfRules());

    Assert.assertEquals("program", parser.getRule("program").getName());

    Assert.assertEquals(null, parser.getRule("blah"));

  }



  @Test

  public void addRuleFromText_anonymousRules1()

  {

    parser.addRule("program- : ( yes | oui )* | maybe | ( no | non )?");

    Assert.assertEquals(3, parser.numberOfRules());



    Assert.assertEquals("program", parser.getRule(0).getName());

    Assert.assertEquals("[[anonymous::program::1]]*", parser.getRule(0).getDefinition(0));

    Assert.assertEquals("maybe", parser.getRule(0).getDefinition(1));

    Assert.assertEquals("[[anonymous::program::2]]?", parser.getRule(0).getDefinition(2));



    Assert.assertEquals("anonymous::program::1", parser.getRule(1).getName());

    Assert.assertEquals("yes", parser.getRule(1).getDefinition(0));

    Assert.assertEquals("oui", parser.getRule(1).getDefinition(1));



    Assert.assertEquals("anonymous::program::2", parser.getRule(2).getName());

    Assert.assertEquals("no", parser.getRule(2).getDefinition(0));

    Assert.assertEquals("non", parser.getRule(2).getDefinition(1));



  }



  @Test

  public void addRuleFromOr()

  {

    parser.addRule("program- : class [name] { [content] } | interface [name] { [content] }");

    Assert.assertEquals(1, parser.numberOfRules());

    Assert.assertEquals("program", parser.getRule(0).getName());

    Assert.assertEquals("class [name] { [content] }", parser.getRule(0).getDefinition(0));

    Assert.assertEquals("interface [name] { [content] }", parser.getRule(0).getDefinition(1));

  }



  @Test

  public void parseRule_optional_none()

  {

    parser.addRule("program- : [[namespaceDeclaration]]?");

    parser.addRule("namespaceDeclaration- : namespace [namespaceName] ;");



    assertParse(true, parser.parse("program", ""));

    Assert.assertEquals(0, parser.numberOfTokens());

  }



  @Test

  public void parseRule_optional_one()

  {

    parser.addRule("program- : [[namespaceDeclaration]]?");

    parser.addRule("namespaceDeclaration- : namespace [namespaceName] ;");



    assertParse(true, parser.parse("program", "namespace A;"));

    Assert.assertEquals(3, parser.numberOfTokens());



    Assert.assertEquals("namespaceName", parser.getToken(1).getName());

    Assert.assertEquals("A", parser.getToken(1).getValue());

  }



  @Test

  public void parseRule_optional_many()

  {

    parser.addRule("program- : [[namespaceDeclaration]]?");

    parser.addRule("namespaceDeclaration- : namespace [namespaceName] ;");



    assertParse(false, parser.parse("program", "namespace A; namespace B;"));

  }



  @Test

  public void parse_empty()

  {

    parser.addRule("program- : [[item]]*");

    parser.addRule("item- : [[namespace]]");

    parser.addRule("namespace- : namespace [namespaceName];");

    assertParse(true, parser.parse("program", ""));

  }



  @Test

  public void parse_anonymousRule()

  {

    parser.addRule("program- : ( on | off )");



    assertParse(false, parser.parse("program", "blah"));

    parser.reset();



    assertParse(true, parser.parse("program", "on"));

    parser.reset();



    assertParse(true, parser.parse("program", "off"));

    parser.reset();



    assertParse(true, parser.parse("program", "off"));

  }



  @Test

  public void parse_stopWhenRequired()

  {

    parser.addRule("classDefinition- : class { [[attribute]]* } [endingName] ;");

    parser.addRule("attribute- : [name] ;");

    boolean answer = parser.parse("classDefinition", "class { one ; two ; } three ;").getWasSuccess();

    Assert.assertEquals(true, answer);

  }



  @Test

  public void parse_doNotShowPoundRules()

  {

    parser.addRule("program : [[item]]*");

    parser.addRule("item- : [[namespace]] | [[import]]");

    parser.addRule("namespace : namespace [name] ;");

    parser.addRule("import : import [name] ;");

    boolean answer = parser.parse("program", "namespace one; import two;").getWasSuccess();

    Assert.assertEquals(true, answer);

    Assert.assertEquals("[program][namespace][name:one][import][name:two]", parser.toString());

  }



  @Test

  public void addRule_doNotHide()

  {

    parser.addRule("item : itm");

    Rule r = parser.getRule(0);

    Assert.assertEquals(false, r.getShouldHide());

  }



  @Test

  public void addRule_shouldHide()

  {

    parser.addRule("item- : itm");

    Rule r = parser.getRule(0);

    Assert.assertEquals(true, r.getShouldHide());

    Assert.assertEquals("item", r.getName());

  }



  @Test

  public void addRule_hideInnerAnonymousRules()

  {

    parser.addRule("item : ( on | off )");

    Rule r = parser.getRule(1);

    Assert.assertEquals(true, r.getShouldHide());

    Assert.assertEquals("anonymous::item::1", r.getName());

  }



  @Test

  public void inlineConstants()

  {

    parser.addRule("facade : facade [=facade:on|off] ;");

    assertParse(true, parser.parse("facade", "facade on;"));

    assertParse(true, parser.parse("facade", "facade off;"));

    assertParse(false, parser.parse("facade", "facade blah;"));

  }



  @Test

  public void useDisplayName()

  {

    parser.addRule("facade- : facade [=facade:on|off] ;");

    assertParse(true, parser.parse("facade", "facade on;"));

    Assert.assertEquals("[facade:on]", parser.toString());

  }



  @Test

  public void addVariableRule()

  {

    parser.addRule("facade : facade [=facade:on|off] ;");



    Assert.assertEquals(1, parser.numberOfRules());

    Rule r = parser.getRule(0);

    Assert.assertEquals("facade [=facade:on|off] ;", r.getDefinition(0));

  }



  @Test

  public void optionalAnonymous()

  {

    parser.addRule("line : [item] (= [value])? ;");



    assertParse(true, parser.parse("line", "a;"));

    Assert.assertEquals("[line][item:a]", parser.toString());

    parser.reset();



    assertParse(true, parser.parse("line", "a = 'hello';"));

    Assert.assertEquals("[line][item:a][value:'hello']", parser.toString());

  }



  @Test

  public void optionalAnonymousComplex()

  {

    parser.addRule("attribute : [=unique]? [=modifier:immutable|settable|internal|defaulted|const]? [type,name>1,0] (= [value])? ;");

    assertParse(true, parser.parse("attribute", "unique Integer number = 1;"));

    Assert.assertEquals("[attribute][unique:unique][type:Integer][name:number][value:1]", parser.toString());

  }



  @Test

  public void lastPosition_simple()

  {

    parser.addRule("attribute : andrew ;");

    assertParse(new Position(1, 0, 0), parser.parse("attribute", "blah ;"));

    assertParse(new Position(1, 3, 3), parser.parse("attribute", "   blah ;"));

    assertParse(new Position(1, 12, 12), parser.parse("attribute", "  andrew    "));

  }



  @Test

  public void addRuleMultipleEnums()

  {

    parser.addRule("program : [=first:a|b] [=second:d|e]");

    Assert.assertEquals("[=first:a|b] [=second:d|e]", parser.getRule(0).getDefinition(0));

  }



  @Test

  public void parseComplex()

  {

    parser.addRule("inlineAssociation : [[inlineAssociationEnd]] -- [[associationEnd]] ;");

    parser.addRule("inlineAssociationEnd : [[multiplicity]] [name]?");

    parser.addRule("associationEnd : [[multiplicity]] [type,name]");

    parser.addRule("multiplicity- : [=*] | [lowerBound] .. [upperBound]");



    assertParse(true, parser.parse("inlineAssociation", "0..1 -- 0..1 Mentor m;"));

  }



  @Test

  public void stopAtSpaces()

  {

    parser.addRule("program : [name] ;");



    assertParse(false, parser.parse("program", "should fail;"));

    assertParse(false, parser.parse("program", "should fail ;"));

    assertParse(true, parser.parse("program", "pass;"));

  }



  @Test

  public void doNotStopAtSpacesForInnerNames()

  {

    parser.addRule("program : [type,name>1,0] ;");



    assertParse(true, parser.parse("program", "String s;"));

    assertParse(true, parser.parse("program", "s ;"));

    assertParse(false, parser.parse("program", "String s s;"));

  }



  @Test

  public void multiNext()

  {

    parser.addRule("program : a [=arrow:->|--] b ;");

    ParseResult result = parser.parse("program", "a -- b ;");

    Assert.assertEquals(true, result.getWasSuccess());

  }



  @Test

  public void stopAtNewline()

  {

    parser.addRule("program- : ([[comment]] | [[item]])* ");

    parser.addRule("comment- : // [*stuff] ");

    parser.addRule("item- : [name] ;");

    ParseResult result = parser.parse("program", "// this is a comment \n item1; item2; // not item3; \n// this is comment 4");

    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals("[stuff:this is a comment][name:item1][name:item2][stuff:not item3;][stuff:this is comment 4]", parser.toString());

  }



  @Test

  public void optionalVariable()

  {

    parser.addRule("attribute : [type]? [name] (= [**value])? ;");

    ParseResult result = parser.parse("attribute", "name;");

    Assert.assertEquals(true, result.getWasSuccess());

  }



  @Test

  public void optionalStatic()

  {

    parser.addRule("attribute : [=autounique] [name] ; | [=unique]? [=modifier:immutable|settable|internal|defaulted|const]? [type]? [name] (= [**value])? ;");



    ParseResult result = parser.parse("attribute", "number;");

    Assert.assertEquals(true, result.getWasSuccess());

  }



  @Test

  public void optionalRemovalOnlyOnVariables()

  {

    parser.addRule("attribute : [=autounique] [name] ; | [=unique]? [=modifier:immutable|settable|internal|defaulted|const]? [type]? [name] (= [**value])? ;");



    ParseResult result = parser.parse("attribute", "immutable String str;");

    Assert.assertEquals(true, result.getWasSuccess());

  }



  @Test

  public void multiNames()

  {

    parser.addRule("attribute : [=autounique] [name] ; | [=unique]? [=modifier:immutable|settable|internal|defaulted|const]? [type,name>1,0] (= [**value])? ;");



    ParseResult result = parser.parse("attribute", "immutable String str;");

    Assert.assertEquals(true, result.getWasSuccess());

  }



  @Test

  public void endOfLineParsing()

  {

    parser.addRule("program- : [[inlineComment]]* [stuff] [[inlineComment]]*");

    parser.addRule("inlineComment- : // [*inlineComment]");

    ParseResult result = parser.parse("program", "// c 1\n  // c 1\n blah // c 2");

    Assert.assertEquals(true, result.getWasSuccess());



  }



  @Test

  public void stopAtsWhenStartOfOneIsStartOfNextToo()

  {

    parser.addRule("program : [[id]] [[id]]");

    parser.addRule("id : ima [name] ;");



    ParseResult result = parser.parse("program", "ima one; ima two;");

    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals("[program][id][name:one][id][name:two]", parser.toString());

  }



  @Test

  public void addPositionToTokens()

  {

    parser.addRule("program : [name] : [value] ;");



    ParseResult result = parser.parse("program", "   andrew \n  :  3\n;");



    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals(new Position(1, 3, 3), parser.getToken(0).getPosition());

    Assert.assertEquals(new Position(1, 3, 3), parser.getToken(0).getSubToken(0).getPosition());

    Assert.assertEquals(new Position(2, 2, 13), parser.getToken(0).getSubToken(1).getPosition());

    Assert.assertEquals(new Position(2, 5, 16), parser.getToken(0).getSubToken(2).getPosition());

    Assert.assertEquals(new Position(3, 0, 18), parser.getToken(0).getSubToken(3).getPosition());



  }



  @Test

  public void addPositionToTokensForInnerNames()

  {

    parser.addRule("program : [type,name] : [value] ;");



    ParseResult result = parser.parse("program", "  String x \n  :  3\n;");



    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals(new Position(1, 2, 2), parser.getToken(0).getPosition());

    Assert.assertEquals(new Position(1, 2, 2), parser.getToken(0).getSubToken(0).getPosition());

    Assert.assertEquals(new Position(1, 9, 9), parser.getToken(0).getSubToken(1).getPosition());

    Assert.assertEquals(new Position(2, 2, 14), parser.getToken(0).getSubToken(2).getPosition());

    Assert.assertEquals(new Position(2, 5, 17), parser.getToken(0).getSubToken(3).getPosition());

    Assert.assertEquals(new Position(3, 0, 19), parser.getToken(0).getSubToken(4).getPosition());



  }



  @Test

  public void rootPositionIsZeroZero()

  {

    parser.addRule("program : [name] : [value] ;");



    ParseResult result = parser.parse("program", "   andrew \n  :  3\n;");



    Assert.assertEquals(true, result.getWasSuccess());

    Assert.assertEquals(new Position(1, 0, 0), parser.getRootToken().getPosition());

  }



  @Test

  public void doubleRule()

  {

    parser.addRule("associationClassDefinition : association [name] { [[singleAssociationEnd]] [[singleAssociationEnd]] [[extraCode]]? }");

    parser.addRule("singleAssociationEnd : [[multiplicity]] [type,name] ;");

    parser.addRule("multiplicity- : [=bound:*] | [lowerBound] .. [upperBound] | [bound]");

    parser.addRule("extraCode- : [**extraCode]");



    ParseResult result = parser.parse("associationClassDefinition", "association Ticket { * One; * Two;}");

    Assert.assertEquals(true, result.getWasSuccess());

  }



  @Test

  public void stoppingEarly()

  {

    parser.addRule("associationClassDefinition : association [name] { [[attribute]]* [[singleAssociationEnd]] [[singleAssociationEnd]] [[extraCode]]? }");

    parser.addRule("attribute : [type] [name] ;");

    parser.addRule("singleAssociationEnd : [[multiplicity]] [type,name] ;");

    parser.addRule("multiplicity- : [=bound:*] | [lowerBound] .. [upperBound] | [bound]");

    parser.addRule("extraCode- : [**extraCode]");



    ParseResult result = parser.parse("associationClassDefinition", "association Ticket { Integer number; * One; * Two;}");

    Assert.assertEquals(true, result.getWasSuccess());

  }



  @Test

  public void grammarRuluesDelimitConstantRoundBrackets()

  {

    parser.addRule("a : -( [b] -) ;");

    Assert.assertEquals("a : -( [b] -) ;", parser.toGrammarNoStyle());

  }



  @Test

  public void grammarRuluesBasedOnAddRule()

  {

    Assert.assertEquals("", parser.toGrammarNoStyle());

    parser.addRule("a : [b] ;");

    Assert.assertEquals("a : [b] ;", parser.toGrammarNoStyle());



    parser.addGrammarRule("//This is a comment added to the grammar");

    parser.addRule("c : [d] ;");

    Assert.assertEquals("a : [b] ;<br />\n//This is a comment added to the grammar<br />\nc : [d] ;", parser.toGrammarNoStyle());

  }



  @Test

  public void repeatingUnits()

  {

    parser.addRule("json : { } |  { [[name_value]] ( , [[name_value]] )* }");

    parser.addRule("name_value : [name] : [value] ");



    ParseResult result = parser.parse("json", "{ a : 1 , b : 2 , c : 3 }");

    Assert.assertEquals(true, result.getWasSuccess());



    result = parser.parse("json", "{a:1,b:2,c:3}");

    Assert.assertEquals(true, result.getWasSuccess());

  }



  @Test

  public void repeatingUnitsComplex()

  {

    parser.addRule("json : { } | { [[name_value]] ( , [[name_value]] )* }");

    parser.addRule("name_value : [name] : [[json]] | [name] : [value] ");



    ParseResult result;



    result = parser.parse("json", " {a:1,p:{x:1,b:2},c:4}");

    Assert.assertEquals(true, result.getWasSuccess());



  }



  @Test

  public void repeatingUnitsLiveExample()

  {

    parser.addRule("json : { } | { [[name_value]] ( , [[name_value]] )* }");

    parser.addRule("name_value : [name] : [[json]] | [name] : [value] ");



    ParseResult result;



    // result = parser.parse("json",

    // "{f:a,p:{x:1,y:2},l:f,d:{y:9,m:8,d:7},p:q}");

    result = parser.parse("json", "{x:1,x:5,y:{x:7}}");

    Assert.assertEquals(true, result.getWasSuccess());



  }



  @Test

  public void parseSquareBrackets()

  {

    parser.addRule("one : [ blah ]");

    parser.addRule("two : [ [blah] ]");



    ParseResult result;



    result = parser.parse("one", "[blah]");

    Assert.assertEquals(true, result.getWasSuccess());



    result = parser.parse("one", "[ blah  ]");

    Assert.assertEquals(true, result.getWasSuccess());



    result = parser.parse("two", "[ anything  ]");

    Assert.assertEquals(true, result.getWasSuccess());



    result = parser.parse("two", "[ WORK_IT  ]");

    Assert.assertEquals(true, result.getWasSuccess());



  }



  @Test

  public void parseRoundBrackets()

  {

    parser.addRule("one : -( [name] -)");



    ParseResult result;



    result = parser.parse("one", "( blah )");

    Assert.assertEquals(true, result.getWasSuccess());



    result = parser.parse("one", "( moreBlah  )");

    Assert.assertEquals(true, result.getWasSuccess());



  }



  @Test

  public void NextStopsForOptional()

  {

    parser.addRule("program : x [programName] ( requires [[requiresList]]  )? {  }");

    parser.addRule("requiresList : [name] ( , [name] )*");



    ParseResult result;



    result = parser.parse("program", "x stuff requires y{ }");

    Assert.assertEquals(true, result.getWasSuccess());



    result = parser.parse("program", "x stuff requires y, z{ }");

    Assert.assertEquals(true, result.getWasSuccess());



  }



  @Test

  public void parse_parallel_bars()

  {

    parser.addRule("test : [name] -|| [value]");

    assertParse(true, parser.parse("test", "a || b"));

    Assert.assertEquals("[test][name:a][value:b]", parser.toString());

  }

  @Test
  public void parseAlphanumeric()
  {
    parser.addRule("name : [~name] ;");
    assertParse(false, parser.parse("name", "anything=nothing;"));
    assertParse(true, parser.parse("name", "anythingnothing;"));
    assertParse(true, parser.parse("name", "anything_nothing;"));
  }






  @Test

  public void parse_unnamed_constant()

  {

    parser.addRule("test : [name] [=-||] [value]");

    assertParse(true, parser.parse("test", "a || b"));

    assertParse(false, parser.parse("test", "a blah b"));

    Assert.assertEquals("[test][name:a][||:||][value:b]", parser.toString());

  }



  @Test

  public void parse_does_not_support_named_parallel_bars()

  {

    parser.addRule("test : [name] [=concurrent:-||] [value]");

    assertParse(false, parser.parse("test", "a || b"));

  }



  @Test

  public void filenameRetentionTest()

  {

	Parser p = new Parser("filename.ugh", null);

	Assert.assertEquals("filename.ugh", p.getFilename());



	Assert.assertEquals("filename.ugh", p.getRootToken().getPosition().getFilename());

  }



  //Testing for parser issues

  @Test

  public void staticDynamic()

  {

    parser.addRule("rulename : [=static:static] [dynamic]");



    assertParse(false, parser.parse("rulename", "staticBar"));

    assertParse(true, parser.parse("rulename", "static Bar"));

  }





  @Test

  public void positionPropogation()

  {

	parser.setFilename("shoes.omg");

	parser.setRootToken(parser.reset());



	parser.addRule("attribute : [=unique]? [=modifier:immutable|settable|internal|defaulted|const]? [type,name>1,0] (= [value])? ;");

    assertParse(true, parser.parse("attribute", "unique Integer number = 1;"));



    Token t = parser.getRootToken();

    Assert.assertEquals("shoes.omg", t.getPosition().getFilename());



    t.setPosition(new Position(1,1,1));

    Assert.assertEquals("shoes.omg", t.getPosition().getFilename());

  }



  @Test

  public void errorTypeFormat()

  {

	  ErrorType et = new ErrorType(999, 9, "this is an error {0}, {1}", "url");

	  ArrayList<String> l = new ArrayList<String>();



	  l.add("zero");

	  l.add("one");



	  Assert.assertEquals("this is an error zero, one", et.format(l));

	  Assert.assertEquals(999, et.getErrorCode());

	  Assert.assertEquals(9, et.getSeverity());
	  Assert.assertEquals("url", et.getErrorUrl());

  }



  @Test

  public void errorTypeSingleton()

  {

	  ErrorTypeSingleton ets = ErrorTypeSingleton.getInstance();

	  ets.clear();



	  ets.addErrorType(new ErrorType(1001, 10, "This is a test error {0}", "url"));



	  ErrorType et = ets.getErrorTypeForCode(1001);

	  Assert.assertEquals(1001, et.getErrorCode());

	  Assert.assertEquals(10, et.getSeverity());

	  Assert.assertEquals("This is a test error {0}", et.getErrorFormat());



	  et = ets.getErrorTypeForCode(1002);

	  Assert.assertEquals(-1, et.getErrorCode());

  }



  @Test

  public void errorMessage()

  {

	  ErrorTypeSingleton ets = ErrorTypeSingleton.getInstance();

	  ets.clear();



	  ets.addErrorType(new ErrorType(1002, 5, "This is a test error {0}, {1}", "url"));



	  ErrorMessage em = new ErrorMessage(1002, new Position("filename",0,0,0), "zero", "one");

	  Assert.assertEquals("Warning 1002 on line 0 of file \'filename\':\nThis is a test error zero, one", em.toString());


	  ets.addErrorType(new ErrorType(1003, 2, "This is a test error {0}, {1}", "url"));
	  em = new ErrorMessage(1003, new Position("filename",0,0,0), "zero", "one");
  	  Assert.assertEquals("Error 1003 on line 0 of file \'filename\':\nThis is a test error zero, one",em.toString());

  }
  @Test
  public void jsonMessage()
  {

	  ErrorTypeSingleton ets = ErrorTypeSingleton.getInstance();
	  ets.clear();

	  ets.addErrorType(new ErrorType(1002, 5, "Test \"{0}\"", "url"));

	  ParseResult pr = new ParseResult(true);

	  pr.addErrorMessage(new ErrorMessage(1002, new Position("file1",0,0,0), " \\' "));
	  pr.addErrorMessage(new ErrorMessage(1002, new Position("file2",0,0,0), " \" "));

	  Assert.assertEquals("{ \"results\" : [ { \"errorCode\" : \"1002\", \"severity\" : \"5\", \"url\" : \"url\", \"line\" : \"0\", \"filename\" : \"file1\", \"message\" : \"Test \\\' \\\\' \\\'\"},{ \"errorCode\" : \"1002\", \"severity\" : \"5\", \"url\" : \"url\", \"line\" : \"0\", \"filename\" : \"file2\", \"message\" : \"Test \\\' \\\' \\\'\"}]}",pr.toJSON());
  }

  @Test
  public void parseResultSeverity()
  {
	  ErrorTypeSingleton ets = ErrorTypeSingleton.getInstance();
	  ets.clear();

	  ets.addErrorType(new ErrorType(1002, 5, "test1", "url1"));
	  ets.addErrorType(new ErrorType(1003, 1, "test2", "url2"));

	  ErrorMessage em = new ErrorMessage(1002, new Position("",0,0,0));

	  ParseResult pr = new ParseResult(true);

	  pr.addErrorMessage(em);

	  Assert.assertEquals(pr.getHasWarnings(), true);
	  Assert.assertEquals(pr.getWasSuccess(), true);

	  em = new ErrorMessage(1003, new Position("",0,0,0));

	  pr = new ParseResult(true);

	  pr.addErrorMessage(em);

	  Assert.assertEquals(pr.getHasWarnings(), false);
	  Assert.assertEquals(pr.getWasSuccess(), false);
  }

  @Test
  public void staticRuleSpacing()
  {
	  parser.addRule("test_rule1 : a b ;");

	  assertParse(true, parser.parse("test_rule1", "a b ;"));
	  assertParse(true, parser.parse("test_rule1", "a b;"));
	  //assertParse(false, parser.parse("test_rule1", "ab;"));
	  //assertParse(false, parser.parse("test_rule1", "ab ;"));

	  parser.addRule("test_rule2 : d e f");
	  assertParse(true, parser.parse("test_rule2", "d e f"));
	  //assertParse(false, parser.parse("test_rule2", "de f"));
	  //assertParse(false, parser.parse("test_rule2", "d ef"));
	  //assertParse(false, parser.parse("test_rule2", "def"));

  }

  @Test
  public void staticVarRuleSpacing()
  {
	  parser.addRule("test_rule1 : a [var] ;");

	  assertParse(true, parser.parse("test_rule1", "a b ;"));
	  assertParse(true, parser.parse("test_rule1", "a b;"));
	  //assertParse(false, parser.parse("test_rule1", "ab;"));
	  //assertParse(false, parser.parse("test_rule1", "ab ;"));

	  parser.addRule("test_rule2 : d [var] f");
	  assertParse(true, parser.parse("test_rule2", "d e f"));
	  //assertParse(false, parser.parse("test_rule2", "de f"));
	  //assertParse(false, parser.parse("test_rule2", "d ef"));
	  //assertParse(false, parser.parse("test_rule2", "def"));
  }


  @Test
  public void optionalRuleSpacing()
  {
	  parser.addRule("test_rule1 : a [var]? ;");

	  assertParse(true, parser.parse("test_rule1", "a b ;"));
	  assertParse(true, parser.parse("test_rule1", "a b;"));
	  //assertParse(false, parser.parse("test_rule1", "ab;"));
	  //assertParse(false, parser.parse("test_rule1", "ab ;"));

	  assertParse(true, parser.parse("test_rule1", "a ;"));
	  assertParse(true, parser.parse("test_rule1", "a;"));
  }

  @Test
  public void varOptionalRuleSpacing()
  {
	  parser.addRule("test_rule1 : a [var1] [var2]? ;");

	  assertParse(true, parser.parse("test_rule1", "a b c ;"));
	  assertParse(true, parser.parse("test_rule1", "a b c;"));
	  //assertParse(false, parser.parse("test_rule1", "abc;"));
	  //assertParse(false, parser.parse("test_rule1", "ab c;"));
	  //assertParse(false, parser.parse("test_rule1", "a bc;"));

	  assertParse(true, parser.parse("test_rule1", "a b ;"));
	  //assertParse(true, parser.parse("test_rule1", "a b;"));
  }

  @Test
  public void optionalRuleSpacingHardMode()
  {

	  parser.addRule("test : [[test_rule1]] | [[test_rule2]] ");
	  parser.addRule("test_rule1 : a [var1] [var2]? ;");

	  //assertParse(false, parser.parse("test", "a b; b;"));

  }

  @Test
  public void commentEndOfLineTest()
  {
	  parser.addRule("program : [[comment]] [var]");
	  parser.addRule("comment : // [*inlineComment]");
	  assertParse(true, parser.parse("program", "//\nblah"));
  }

  @Test
  public void commentEndOfLineTest2()
  {
	  parser.addRule("program : [[comment]] [var]");
	  parser.addRule("comment : // [*inlineComment]");
	  assertParse(true, parser.parse("program", "//test\nblah"));
  }

  @Test
  public void commentEndOfLineTest3()
  {
	  parser.addRule("program : [[comment]] [var] [[comment]] [var]");
	  parser.addRule("comment : // [*inlineComment]");
	  assertParse(true, parser.parse("program", "//\nfoo\n//\nbar"));
  }

  @Test
  public void longCommentWithSpacesBasic()
  {
	  parser.addRule("program : [[comment]] [var]");
	  parser.addRule("comment : // [*inlineComment]");
	  assertParse(true, parser.parse("program", "// \nfoobar"));
  }

  @Test
  public void longCommentWithSpacesModerate()
  {
	  parser.addRule("program : [[comment]] [var]");
	  parser.addRule("comment : // [*inlineComment]");
	  assertParse(true, parser.parse("program", "//          \nfoobar"));
  }

  @Test
  public void longCommentWithSpacesAdvanced()
  {
	  parser.addRule("program : [[comment]] [var] [[comment]] [var] [[comment]] [var] [[comment]] [var] [[comment]] [var]");
	  parser.addRule("comment : // [*inlineComment]");
	  assertParse(true, parser.parse("program", "// \nfoobar\n//          \nabc\n//  \n123\n//          \nblah\n// \nstudent"));
  }

  @Test
  public void multiLineCommentEndOfLineTest()
  {
	  parser.addRule("program : [[comment]] [var]");
	  parser.addRule("comment : /* [**multilineComment] */");
	  assertParse(true, parser.parse("program", "/**/\nfoobar"));
  }

  @Test
  public void pythonStyleCommentTest()
  {
    Parser parsernew  =  new Parser(null);
    parsernew.addRule("program- : [[comment]]");
    parsernew.addRule("comment- : [[inlineComment]]");
    parsernew.addRule("inlineComment- : # [*inlineComment]");
    assertParse(true, parsernew.parse("program", "#testComment"));
  }

  @Test
  public void multiLineCommentEndOfLineTest2()
  {
	  parser.addRule("program : [[comment]] [var]");
	  parser.addRule("comment : /* [**multilineComment] */");
	  assertParse(true, parser.parse("program", "/*test*/\nfoobar"));
  }

  @Test
  public void multiLineCommentEndOfLineTest3()
  {
	  parser.addRule("program : [[comment]] [var] [[comment]] [var]");
	  parser.addRule("comment : /* [**multilineComment] */");
	  assertParse(true, parser.parse("program", "/**/\nfoo\n/**/\nbar"));
  }

  @Test
  public void multiLineCommentWithSpacesBasic()
  {
	  parser.addRule("program : [[comment]] [var]");
	  parser.addRule("comment : /* [**multilineComment] */");
	  assertParse(true, parser.parse("program", "/* */\nfoo"));
  }

  @Test
  public void multiLineCommentWithSpacesModerate()
  {
	  parser.addRule("program : [[comment]] [var]");
	  parser.addRule("comment : /* [**multilineComment] */");
	  assertParse(true, parser.parse("program", "/*      \n  */\nfoo"));
  }

  @Test
  public void multiLineCommentWithSpacesAdvanced()
  {
	  parser.addRule("program : [[comment]] [var] [[comment]] [var] [[comment]] [var]");
	  parser.addRule("comment : /* [**multilineComment] */");
	  assertParse(true, parser.parse("program", "/**/\nfoo\n/*     \n  */\nbar\n/*\n    \n  *\n*/\nfoobar"));
  }

  @Test
  public void methodComment()
  {
	  parser.addRule("program : [[comment]] [[concreteMethodDeclaration]]");
	  parser.addRule("comment : /* [**multilineComment] */");
	  parser.addRule("concreteMethodDeclaration :  [type] [[methodDeclarator]] { [**code] }");
	  parser.addRule("methodDeclarator : [methodName] OPEN_ROUND_BRACKET CLOSE_ROUND_BRACKET");

	  assertParse(true, parser.parse("program", "/* This is a comment */\nvoid print()\n{\nSystem.out.println(\"derp\");\n}\n"));
  }

  private void assertParse(Position expected, ParseResult result)

  {

    Assert.assertEquals(expected, result.getPosition());

  }



  private void assertParse(boolean expected, ParseResult result)

  {

    Assert.assertEquals(expected, result.getWasSuccess());

  }




}
