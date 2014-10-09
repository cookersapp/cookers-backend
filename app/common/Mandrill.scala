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
    val data = JsObject(
      "key" -> JsString(mandrillKey) ::
        "template_name" -> JsString("welcome") ::
        "template_content" -> JsArray() ::
        "message" -> JsObject(
          "to" -> JsArray(JsObject("email" -> JsString(to) :: Nil) :: Nil) ::
            "track_opens" -> JsBoolean(true) ::
            "preserve_recipients" -> JsBoolean(true) ::
            "tags" -> JsArray(JsString("app") :: JsString("welcome") :: Nil) ::
            Nil) ::
          Nil)

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
    val data = JsObject(
      "key" -> JsString(mandrillKey) ::
        "message" -> JsObject(
          "subject" -> JsString("[Cookers] Feedback from " + source) ::
            "text" -> JsString(content) ::
            "from_email" -> JsString(from) ::
            "to" -> JsArray(JsObject("email" -> JsString(supportTeamEmail) :: Nil) :: JsObject("name" -> JsString("Cookers team") :: Nil) :: Nil) ::
            "important" -> JsBoolean(false) ::
            "track_opens" -> JsBoolean(true) ::
            "track_clicks" -> JsNull ::
            "preserve_recipients" -> JsNull ::
            "tags" -> JsArray(JsString("app") :: JsString("feedback") :: Nil) ::
            Nil) ::
          Nil)

    WS.url(mandrillUrl + "/messages/send.json").post(data).map { response =>
      val status = (response.json)(0) \ "status"
      status.as[String]
    }
  }
}