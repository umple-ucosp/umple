/*

 Copyright: All contributers to the Umple Project
 
 This file is made available subject to the open source license found at:
 https://umple.org/license

*/

package cruise.umple.compiler;

import org.junit.*;


public class RuleInstanceTest
{
  
  Parser parser;
  
  @Before
  public void setUp()
  {
    parser = new Parser("p");
  }

  @Test
  public void emptyConstructor()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("");
    Assert.assertEquals(0,instance.numberOfRuleParts());
  }
  
  @Test
  public void staticConstructor()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("blah");
    Assert.assertEquals(1,instance.numberOfRuleParts());
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("blah",part.getName());
    Assert.assertEquals("blah",part.getDisplayName());
    Assert.assertEquals("1",part.getMultiplicity());
    Assert.assertEquals(RulePart.Type.Static,part.getType());
  }  
  
  @Test
  public void multiplicityMany()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("blah*");

    Assert.assertEquals(1,instance.numberOfRuleParts());
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("blah*",part.getName());
    Assert.assertEquals("blah*",part.getDisplayName());
    Assert.assertEquals("*",part.getMultiplicity());
    Assert.assertEquals(RulePart.Type.Static,part.getType());
  }   

  @Test
  public void multiplicityOptional()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("blah?");

    Assert.assertEquals(1,instance.numberOfRuleParts());
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("blah?",part.getName());
    Assert.assertEquals("blah?",part.getDisplayName());
    Assert.assertEquals("?",part.getMultiplicity());
    Assert.assertEquals(RulePart.Type.Static,part.getType());
  }   

  @Test
  public void variableConstructor()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[blah]");

    Assert.assertEquals(1,instance.numberOfRuleParts());
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("blah",part.getName());
    Assert.assertEquals("blah",part.getDisplayName());
    Assert.assertEquals("1",part.getMultiplicity());
    Assert.assertEquals(RulePart.Type.Variable,part.getType());
    
  }    
 
  @Test
  public void ruleConstructor()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[[lookupBlah]]");
    
    Assert.assertEquals(1,instance.numberOfRuleParts());
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("lookupBlah",part.getName());
    Assert.assertEquals("lookupBlah",part.getDisplayName());
    Assert.assertEquals("1",part.getMultiplicity());
    Assert.assertEquals(RulePart.Type.Rule,part.getType());
  } 
  
  @Test
  public void multipleRules()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("blah [moreBlah]*");
    Assert.assertEquals(2,instance.numberOfRuleParts());
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("blah",part.getName());
    Assert.assertEquals("blah",part.getDisplayName());
    Assert.assertEquals("1",part.getMultiplicity());
    Assert.assertEquals(RulePart.Type.Static,part.getType());

    part = instance.getRulePart(1);
    Assert.assertEquals("moreBlah",part.getName());
    Assert.assertEquals("moreBlah",part.getDisplayName());
    Assert.assertEquals("*",part.getMultiplicity());
    Assert.assertEquals(RulePart.Type.Variable,part.getType());
  }
  
  @Test
  public void constant()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[=unique]");
    Assert.assertEquals(1,instance.numberOfRuleParts());
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("=unique",part.getName());
    Assert.assertEquals("unique",part.getDisplayName());
    Assert.assertEquals("1",part.getMultiplicity());
    Assert.assertEquals(RulePart.Type.Variable,part.getType());
  }
  
  @Test(expected=IndexOutOfBoundsException.class)
  public void getRulePart_invalid_tooLow()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[unique]");
    Assert.assertEquals(1,instance.numberOfRuleParts());
    
    instance.getRulePart(-1);
  }

  @Test(expected=IndexOutOfBoundsException.class)
  public void getRulePart_invalid_tooHigh()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[unique]");
    Assert.assertEquals(1,instance.numberOfRuleParts());
    
    instance.getRulePart(1);
  }

  @Test
  public void getRulePart_valid()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[a] [b]");
    Assert.assertEquals(2,instance.numberOfRuleParts());
    
    RulePart atLow = instance.getRulePart(0);
    RulePart atHigh = instance.getRulePart(1);
    
    Assert.assertEquals("a",atLow.getName());
    Assert.assertEquals("b",atHigh.getName());
  }
  
  @Test
  public void populateNextIdentifier_staticAndEnum()
  {
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[name] : [=value:a|b] ;");
    Assert.assertEquals(1,instance.getRulePart(0).getNextIdentifiers().length);
    Assert.assertEquals(":",instance.getRulePart(0).getNextIdentifiers()[0]);
    Assert.assertEquals(2,instance.getRulePart(1).getNextIdentifiers().length);
    Assert.assertEquals("a",instance.getRulePart(1).getNextIdentifiers()[0]);
    Assert.assertEquals("b",instance.getRulePart(1).getNextIdentifiers()[1]);
  }
  
  @Test
  public void populateNextIdentifier_optional()
  {
    parser.addRule("json : { [[name_value]] ( , [[name_value]] )* }");
    parser.addRule("name_value : [name] : [value] | [name] : [[json]] ");

    RuleInstance instance;
    
    instance = new RuleInstance(parser);
    instance.configureDefinition("[name] : [[json]]");

    Assert.assertEquals(3,instance.numberOfRuleParts());
    Assert.assertEquals(1,instance.getRulePart(0).getNextIdentifiers().length);
    Assert.assertEquals(":",instance.getRulePart(0).getNextIdentifiers()[0]);
    Assert.assertEquals(1,instance.getRulePart(1).getNextIdentifiers().length);
    Assert.assertEquals("{",instance.getRulePart(1).getNextIdentifiers()[0]);
    Assert.assertEquals(0,instance.getRulePart(2).getNextIdentifiers().length);

    instance = new RuleInstance(parser);
    instance.configureDefinition("{ [[name_value]] [[anonymous::json::1]]* }");

    Assert.assertEquals(4,instance.numberOfRuleParts());
    Assert.assertEquals(0,instance.getRulePart(0).getNextIdentifiers().length);
    Assert.assertEquals(2,instance.getRulePart(1).getNextIdentifiers().length);
    Assert.assertEquals(",",instance.getRulePart(1).getNextIdentifiers()[0]);
    Assert.assertEquals("}",instance.getRulePart(1).getNextIdentifiers()[1]);
    Assert.assertEquals(2,instance.getRulePart(2).getNextIdentifiers().length);
    Assert.assertEquals(",",instance.getRulePart(2).getNextIdentifiers()[0]);
    Assert.assertEquals("}",instance.getRulePart(2).getNextIdentifiers()[1]);
    
  }  

  @Test
  public void optional_getNextIdentifiers()
  {
    parser.addRule("name : [type,name] (= [value])? ;");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[type,name] [[anonymous::name::1]]? ;");
    Assert.assertEquals(2,instance.getRulePart(0).getNextIdentifiers().length);
    Assert.assertEquals("=",instance.getRulePart(0).getNextIdentifiers()[0]);
    Assert.assertEquals(";",instance.getRulePart(0).getNextIdentifiers()[1]);
  }
  
  
  @Test
  public void populateNextIdentifier_variableLookup()
  {
    parser.addRule("program : [[name]] [[value]] ;");
    parser.addRule("name : [first] . [second]");
    parser.addRule("value : = [value]");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[[name]] [[value]] ;");
    
    Assert.assertEquals(1,instance.getRulePart(0).getNextIdentifiers().length);
    Assert.assertEquals("=",instance.getRulePart(0).getNextIdentifiers()[0]);
    Assert.assertEquals(1,instance.getRulePart(1).getNextIdentifiers().length);
    Assert.assertEquals(";",instance.getRulePart(1).getNextIdentifiers()[0]);
    Assert.assertEquals(0,instance.getRulePart(2).getNextIdentifiers().length);
  }  
  
  @Test
  public void populateNextIdentifier_multipleVariableLookup()
  {
    parser.addRule("program : [[name]] [[value]] ;");
    parser.addRule("name : [first] . [second]");
    parser.addRule("value : = [value] | != [value]");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[[name]] [[value]] ;");
   
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals(2,part.getNextIdentifiers().length);
    Assert.assertEquals("=",part.getNextIdentifiers()[0]);
    Assert.assertEquals("!=",part.getNextIdentifiers()[1]);
    
    Assert.assertEquals(1,instance.getRulePart(1).getNextIdentifiers().length);
    Assert.assertEquals(";",instance.getRulePart(1).getNextIdentifiers()[0]);
  }  
  
  @Test
  public void removeRulePart()
  {
    parser.addRule("program : [[name]] [[value]] ;");
    parser.addRule("name : [first] . [second]");
    parser.addRule("value : = [value] | != [value]");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[[name]] [[value]] ;");
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("name",part.getName());
    instance.removeRulePart(part);
    part = instance.getRulePart(0);
    Assert.assertEquals("value",part.getName());
  }  

  @Test
  public void removeOptionalPart()
  {
    parser.addRule("program : [name]? [type]? [value] ;");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[name]? [type]? [value] ;");
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("name",part.getName());
    
    RulePart part2 = instance.getRulePart(1);
    Assert.assertEquals("type",part2.getName());

    RulePart part3 = instance.getRulePart(2);
    Assert.assertEquals("value",part3.getName());

    RulePart part4 = instance.getRulePart(3);
    Assert.assertEquals(";",part4.getName());
    
    Assert.assertEquals(true,instance.removeOptionalPart());
    Assert.assertEquals("type",instance.getRulePart(0).getName());

    Assert.assertEquals(true,instance.removeOptionalPart());
    Assert.assertEquals("value",instance.getRulePart(0).getName());

    Assert.assertEquals(false,instance.removeOptionalPart());
    Assert.assertEquals("value",instance.getRulePart(0).getName());

  }  

  @Test
  public void removeOptionalPart_removeOnlyVariables()
  {
    parser.addRule("program : [name]? [[last]]? [type]? [value] ;");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[name]? [[last]]? [type]? [value] ;");
    
    Assert.assertEquals(true,instance.removeOptionalPart());
    Assert.assertEquals(true,instance.removeOptionalPart());
    Assert.assertEquals("last",instance.getRulePart(0).getName());
    
    Assert.assertEquals(false,instance.removeOptionalPart());
  }  
  
  
  @Test
  public void removeOptionalPart_ignoreMany()
  {
    parser.addRule("program : [[name]]* [value] ;");
    parser.addRule("name : [one] = [two] ;");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[[name]]* [value] ;");
    
    instance.getRulePart(0).setMaximumPartsFound(2);
    Assert.assertEquals(false,instance.removeOptionalPart());
  }  

  @Test
  public void removeRuleUpdateIdentifiers()
  {
    parser.addRule("program : [name] = + [value]");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[name] = + [value]");
    
    RulePart part = instance.getRulePart(0);
    RulePart nextPart = instance.getRulePart(1);
    Assert.assertEquals(1,part.getNextIdentifiers().length);
    Assert.assertEquals("=",part.getNextIdentifiers()[0]);
    
    instance.removeRulePart(nextPart);
    Assert.assertEquals(1,nextPart.getNextIdentifiers().length);
    Assert.assertEquals("+",nextPart.getNextIdentifiers()[0]);
  }  
  
  
  @Test
  public void hasMoreRuleParts()
  {
    parser.addRule("program : [[name]] [[value]] ;");
    parser.addRule("name : [first] . [second]");
    parser.addRule("value : = [value] | != [value]");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[[name]] [[value]] ;");
    
    Assert.assertEquals(true,instance.hasMoreRuleParts());
    instance.nextRulePart();
    Assert.assertEquals(true,instance.hasMoreRuleParts());
    instance.nextRulePart();
    Assert.assertEquals(true,instance.hasMoreRuleParts());
    instance.nextRulePart();
    Assert.assertEquals(false,instance.hasMoreRuleParts());

    instance.resetRulePart();
    Assert.assertEquals(true,instance.hasMoreRuleParts());
  
  }  
  
  @Test
  public void nextRulePart()
  {
    parser.addRule("program : [[name]] [[value]] ;");
    parser.addRule("name : [first] . [second]");
    parser.addRule("value : = [value] | != [value]");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[[name]] [[value]] ;");
    
    Assert.assertEquals(true,instance.hasMoreRuleParts());
    Assert.assertEquals("name",instance.nextRulePart().getName());
    Assert.assertEquals("value",instance.nextRulePart().getName());
    Assert.assertEquals(";",instance.nextRulePart().getName());
    Assert.assertEquals(null,instance.nextRulePart().getName());
    instance.resetRulePart();
    Assert.assertEquals("name",instance.nextRulePart().getName());
  }   
  
  @Test
  public void addStopAtToLastNextIdentifier()
  {
    parser.addRule("program : [name] [value]");
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[name] [value]",";");
    Assert.assertEquals(1,instance.getRulePart(1).getNextIdentifiers().length);
    Assert.assertEquals(";",instance.getRulePart(1).getNextIdentifiers()[0]);
  }   


  @Test
  public void addManyStopAtToLastNextIdentifier()
  {
    parser.addRule("program : [name] [value]");
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[name]] [value]",";",":");
    Assert.assertEquals(2,instance.getRulePart(1).getNextIdentifiers().length);
    Assert.assertEquals(";",instance.getRulePart(1).getNextIdentifiers()[0]);
    Assert.assertEquals(":",instance.getRulePart(1).getNextIdentifiers()[1]);
  }   

  @Test
  public void updateNextIdentifier()
  {
    parser.addRule("program : [name] [value]");
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[name]] [value]");
    instance.addRulePart(new RulePart(";","1"));
    Assert.assertEquals(0,instance.getRulePart(1).getNextIdentifiers().length);
    
    instance.updateNextIdentifier();
    Assert.assertEquals(1,instance.getRulePart(1).getNextIdentifiers().length);
    Assert.assertEquals(";",instance.getRulePart(1).getNextIdentifiers()[0]);
  }  

  @Test
  public void getNextIdentifier_Complex()
  {
    parser.addRule("attribute : [=unique]? [=modifier:immutable|settable|internal|defaulted|const]? [type,name>1,0] (= [value])? ;");
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[=unique]? [=modifier:immutable|settable|internal|defaulted|const]? [type,name>1,0] [[anonymous::attribute::1]]? ;");
    
    RulePart part = instance.getRulePart(2);
    Assert.assertEquals("type,name>1,0",part.getName());
    Assert.assertEquals(2, part.getNextIdentifiers().length);
    Assert.assertEquals("=", part.getNextIdentifiers()[0]);
    Assert.assertEquals(";", part.getNextIdentifiers()[1]);
  }
  
  @Test
  public void getNextIdentifier_EOLs()
  {
    parser.addRule("program- : [[comment]]* [[useStatement]]? [[comment]]*");
    parser.addRule("comment- : [[inlineComment]] | [[multilineComment]]");
    parser.addRule("useStatement- : use [useStatement] ;");
    parser.addRule("inlineComment- : // [*inlineComment] | # [*inlineComment]");
    parser.addRule("multilineComment- : /* [**multilineComment] */");

    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("[[comment]]* [[useStatement]]? [[comment]]*");
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("comment",part.getName());
    Assert.assertEquals(1, part.getNextIdentifiers().length);
    Assert.assertEquals("use", part.getNextIdentifiers()[0]);
  }  

  @Test
  public void getNextIdentifier_Nested()
  {
    parser.addRule("attribute : name [[value]] ;");
    parser.addRule("value : [[start]] . [end]");
    parser.addRule("start : xyz [front]");
    
    RuleInstance instance = new RuleInstance(parser);
    instance.configureDefinition("name [[value]] ;");
    
    RulePart part = instance.getRulePart(0);
    Assert.assertEquals("name",part.getName());
    Assert.assertEquals(1,part.getNextIdentifiers().length);
    Assert.assertEquals("xyz",part.getNextIdentifiers()[0]);
  }

}
