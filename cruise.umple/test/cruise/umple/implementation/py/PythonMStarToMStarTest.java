package cruise.umple.implementation.py;

import org.junit.*;
import cruise.umple.implementation.*;

public class PythonMStarToMStarTest extends MStarToMStarTest
{

  @Before
  public void setUp()
  {
    super.setUp();
    language = "Python";
    languagePath = "py";
  }

  @Test @Ignore
  public void Association(){
    super.Association();
  }

  @Test @Ignore
  public void Association2(){
    super.Association2();
  }
}