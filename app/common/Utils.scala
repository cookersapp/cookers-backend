package common

import play.api.Play

object Utils {
  // Double.NaN => null and cause problems in object serialisations :(
  val NaN = 0

  // possible values for env : 'local', 'dev', 'prod', 'undefined'
  def getEnv(): String = {
    val env = Play.current.configuration.getString("application.env")
    env.getOrElse("undefined")
  }

  def isProd(): Boolean = {
    "prod".equals(getEnv())
  }
}