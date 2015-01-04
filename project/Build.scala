import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {
  val appName         = "cookers"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    // ReactiveMongo dependencies
    "org.reactivemongo" %% "reactivemongo" % "0.9",
    // ReactiveMongo Play plugin dependencies
    "org.reactivemongo" %% "play2-reactivemongo" % "0.9",
    // HTML parser
    "org.jsoup" % "jsoup" % "1.8.1"
  )

  val main = play.Project(appName, appVersion, appDependencies).settings(
  )
}
