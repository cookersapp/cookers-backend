package common

import play.api.Play

object Utils {
  // possible values for env : 'local', 'dev', 'prod', 'undefined'
  def getEnv(): String = {
    val env = Play.current.configuration.getString("application.env")
    env.getOrElse("undefined")
  }

  def isProd(): Boolean = {
    "prod".equals(getEnv())
  }
}