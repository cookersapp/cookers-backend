import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {
  val appName         = "cookers"
  val appVersion      = "1.0-SNAPSHOT"

  val mandubianRepo = Seq(
    "mandubian maven bintray" at "http://dl.bintray.com/mandubian/maven"
  )

  val appDependencies = Seq(
    // ReactiveMongo dependencies
    "org.reactivemongo" %% "reactivemongo" % "0.9",
    // ReactiveMongo Play plugin dependencies
    "org.reactivemongo" %% "play2-reactivemongo" % "0.9"
  )

  val main = play.Project(appName, appVersion, appDependencies).settings(
    resolvers ++= mandubianRepo,
    libraryDependencies ++= Seq(
      "com.mandubian"     %% "play-json-zipper"    % "1.2"
    )
  )
}
