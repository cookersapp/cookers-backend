package common

import scala.concurrent._
import ExecutionContext.Implicits.global

import play.api.libs.json._
import play.api.libs.ws._

object Mandrill {
  val supportTeamEmail = "loicknuchel@gmail.com"
  val mandrillUrl = "https://mandrillapp.com/api/1.0"
  val mandrillKey = "__YzrUYwZGkqqSM2pe9XFg"

  /**
   * Send the mandrill welcome email template and return the status.
   * Status should be "sent"
   */
  def sendWelcomeEmail(to: String): Future[String] = {
    val data = Json.obj(
      "key" -> mandrillKey,
      "template_name" -> "welcome",
      "template_content" -> Json.arr(),
      "message" -> Json.obj(
        "to" -> Json.arr(Json.obj("email" -> to)),
        "track_opens" -> true,
        "preserve_recipients" -> true,
        "tags" -> Json.arr("app", "welcome")))

    WS.url(mandrillUrl + "/messages/send-template.json").post(data).map { response =>
      val status = (response.json)(0) \ "status"
      status.as[String]
    }
  }

  /**
   * Send an email to @supportTeamEmail with required params.
   * It's used to submit feedbacks from the mobile app
   */
  def sendFeedback(from: String, content: String, source: String) = {
    val data = Json.obj(
      "key" -> mandrillKey,
      "message" -> Json.obj(
        "subject" -> ("[Cookers] Feedback from " + source),
        "text" -> content,
        "from_email" -> from,
        "to" -> Json.arr(Json.obj("email" -> supportTeamEmail), Json.obj("name" -> "Cookers team")),
        "important" -> false,
        "track_opens" -> true,
        "track_clicks" -> JsNull,
        "preserve_recipients" -> JsNull,
        "tags" -> Json.arr("app", "feedback")))

    WS.url(mandrillUrl + "/messages/send.json").post(data).map { response =>
      val status = (response.json)(0) \ "status"
      status.as[String]
    }
  }
}