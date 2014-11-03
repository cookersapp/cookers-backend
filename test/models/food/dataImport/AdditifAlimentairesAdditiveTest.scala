package models.food.dataImport

object AdditifAlimentairesAdditiveTest {
  def main(args: Array[String]) {
    testGetOrigin()
    println("Tests finished !")
  }

  def testGetOrigin() {
    val simpleOrigins = "<li><div class='legende'>Origine du E131</div><div><div class=\"Origine\" ><img src=\"/ressources-242/images/origines/chi.svg\"> Produit de synthèse</div></div></li>"
    val simpleOriginsRes = Some(List(new AdditifAlimentairesAdditiveOrigin("Produit de synthèse", Some("http://les-additifs-alimentaires.com/ressources-242/images/origines/chi.svg"))))
    if (simpleOriginsRes != AdditifAlimentairesAdditive.getOrigins(simpleOrigins)) { println("Error in simpleOrigins: " + AdditifAlimentairesAdditive.getOrigins(simpleOrigins)) }

    val unknownOrigins = "<li><div class='legende'>Origine du E1413</div><div><div class=\"Origine\" >Origine inconnue</div></div></li>"
    val unknownOriginsRes = Some(List(new AdditifAlimentairesAdditiveOrigin("Origine inconnue", None)))
    if (unknownOriginsRes != AdditifAlimentairesAdditive.getOrigins(unknownOrigins)) { println("Error in unknownOrigins: " + AdditifAlimentairesAdditive.getOrigins(unknownOrigins)) }

    val multiOrigins = "<li><div class='legende'>Origine du E161c</div><div><div class=\"Origine\" ><img  src=\"/ressources-242/images/origines/cow-prob.svg\"> Parfois issu de bovins</div><div class=\"Origine\" ><img  src=\"/ressources-242/images/origines/Oeuf-prob.svg\"> Parfois issu d'oeufs</div></div></li>"
    val multiOriginsRes = Some(List(
      new AdditifAlimentairesAdditiveOrigin("Parfois issu de bovins", Some("http://les-additifs-alimentaires.com/ressources-242/images/origines/cow-prob.svg")),
      new AdditifAlimentairesAdditiveOrigin("Parfois issu d'oeufs", Some("http://les-additifs-alimentaires.com/ressources-242/images/origines/Oeuf-prob.svg"))))
    if (multiOriginsRes != AdditifAlimentairesAdditive.getOrigins(multiOrigins)) { println("Error in multiOrigins: " + AdditifAlimentairesAdditive.getOrigins(multiOrigins)) }
  }
}