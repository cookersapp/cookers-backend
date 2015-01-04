package common

object RegexMatcher {
  // see regex options : http://www.expreg.com/options.php
  private def opt(regex: String): String = "(?:" + regex + ")?"
  val quote = "(?:'|\")"
  val tag = "<[^<>]+>"
  val tagEnd = "</[^<>]+>"
  val tagOpt = opt(tag)
  val tagEndOpt = opt(tagEnd)
  val eol = "[^<]*"

  def simple(content: String, regex: String): List[Option[String]] = {
    val matcher = regex.r.unanchored
    content match {
      case matcher(val1, val2, val3, val4) => List(Utils.toOpt(val1), Utils.toOpt(val2), Utils.toOpt(val3), Utils.toOpt(val4))
      case matcher(val1, val2, val3) => List(Utils.toOpt(val1), Utils.toOpt(val2), Utils.toOpt(val3))
      case matcher(val1, val2) => List(Utils.toOpt(val1), Utils.toOpt(val2))
      case matcher(val1) => List(Utils.toOpt(val1))
      case _ => List(None, None, None, None)
    }
  }

  def multi(content: String, regex: String): List[List[Option[String]]] = {
    val matcher = regex.r.unanchored
    matcher.findAllIn(content).map {
      case matcher(val1, val2, val3, val4) => List(Utils.toOpt(val1), Utils.toOpt(val2), Utils.toOpt(val3), Utils.toOpt(val4))
      case matcher(val1, val2, val3) => List(Utils.toOpt(val1), Utils.toOpt(val2), Utils.toOpt(val3))
      case matcher(val1, val2) => List(Utils.toOpt(val1), Utils.toOpt(val2))
      case matcher(val1) => List(Utils.toOpt(val1))
      case _ => List(None, None, None, None)
    }.toList
  }
}
