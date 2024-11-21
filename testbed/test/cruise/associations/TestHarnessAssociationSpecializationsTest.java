package cruise.associations;

import org.junit.*;

import cruise.associations.specializations.*;


public class TestHarnessAssociationSpecializationsTest
{

  @Test
  public void SpecializationsTest()
  {
  	BigElephant bigElephant = new BigElephant();
  	Assert.assertTrue(bigElephant instanceof Elephant);

  	Snapple snapple = new Snapple();
  	Assert.assertTrue(snapple instanceof Apple);

  	Sun2 sun2 = new Sun2();
  	Assert.assertTrue(sun2 instanceof Sun);

  	Moon2 moon2 = new Moon2();
  	Assert.assertTrue(moon2 instanceof Moon);

  	Rhino rhino = new Rhino();
  	Assert.assertTrue(rhino instanceof Animal);

  	Pine pine = new Pine();
  	Assert.assertTrue(pine instanceof Dilleniidae);

  	Blubber blubber = new Blubber();
  	Assert.assertTrue(blubber instanceof Fat);

  	Whale whale = new Whale();
  	Assert.assertTrue(whale instanceof BigCreature);

  	Repenter repenter = new Repenter();
  	Assert.assertTrue(repenter instanceof Repent);

  	Repenter1 repenter1 = new Repenter1();
  	Assert.assertTrue(repenter1 instanceof Repent1);

  	Serendipity2 serendipity2 = new Serendipity2();
  	Assert.assertTrue(serendipity2 instanceof Serendipity1);

  	Birch birch = new Birch();
  	Assert.assertTrue(birch instanceof Tree);

  	Subba subba = new Subba();
  	Assert.assertTrue(subba instanceof Suppa);

  	Subab subab = new Subab();
  	Assert.assertTrue(subab instanceof Supap);

  	Spammer spammer = new Spammer();
  	Assert.assertTrue(spammer instanceof Spam);

  	Drummer drummer = new Drummer();
  	Assert.assertTrue(drummer instanceof Drama);
  }

}