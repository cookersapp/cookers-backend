package models.stats

import play.api.libs.functional.syntax.functionalCanBuildApplicative
import play.api.libs.functional.syntax.toFunctionalBuilderOps

case class UserActivity(
  date: Long,
  total: Int, // nombre d'utilisateurs inscrits sur Cookers
  active: Int, // nombre d'utilisateurs actifs sur Cookers dans la période
  registered: Int, // nombre d'utilisateurs s'étant inscrit sur Cookers dans la période
  recurring: Int, // nombre d'utilisateurs actifs sur Cookers et s'étant inscrit avant la période 
  inactive: Int // nombre d'utilisateurs inscrit mais n'ayant pas utilisé Cookers sur la période
  )

object UserActivity {
  import play.api.libs.json.Json

  implicit val userActivitFormat = Json.format[UserActivity]
}
